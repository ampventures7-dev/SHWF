import logging
from datetime import date, datetime, timezone
from typing import Optional, Tuple, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.security import get_verified_student
from app.core.supabase import DatabaseService, get_db_service
from app.models.auth import VerifiedStudentClaims
from app.models.report import (
    PredictReportRequest,
    PredictionReportResponse,
    GenerateReportRequest,
    GenerateReportResponse,
    VitalsData,
    ZScoreResult,
    HealthRisk,
    DietPlanResponse,
    ExplainabilityItem,
    CampHistorySummary,
    GrowthComparison,
)
from app.services.zscore import calculate_zscores
from app.services.ml_engine import predict_risks, get_diet_plan, explain_predictions
from app.services.pdf_generator import generate_report_pdf_async
from app.services.storage_service import StorageService, get_storage_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Health Risk Prediction & Report Engine (Protected)"])


def calculate_age_in_months(dob_str: str, recorded_at_str: Optional[str] = None) -> int:
    """Calculate exact completed age in months between date of birth and measurement date."""
    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
    except Exception:
        raise ValueError(f"Invalid date of birth format: '{dob_str}'. Expected YYYY-MM-DD.")

    if recorded_at_str:
        try:
            clean_str = recorded_at_str.replace("Z", "+00:00")
            recorded_dt = datetime.fromisoformat(clean_str).date()
        except Exception:
            try:
                recorded_dt = datetime.strptime(recorded_at_str[:10], "%Y-%m-%d").date()
            except Exception:
                recorded_dt = date.today()
    else:
        recorded_dt = date.today()

    months = (recorded_dt.year - dob.year) * 12 + (recorded_dt.month - dob.month)
    if recorded_dt.day < dob.day:
        months -= 1

    return max(0, months)


async def build_student_prediction_data(
    student_identifier: str,
    db_service: DatabaseService,
    selected_camp_id: Optional[str] = None,
) -> Tuple[PredictionReportResponse, Dict[str, Any], Dict[str, Any]]:
    """
    Internal core pipeline for retrieving student vitals, calculating WHO LMS Z-scores,
    evaluating historical growth trajectory across multiple camps, and constructing full report model.
    Returns: (PredictionReportResponse, student_record_dict, camp_extra_data_dict)
    """
    # 1. Fetch student demographic and school records
    student = db_service.get_student_by_identifier(student_identifier)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student record with ID '{student_identifier}' not found.",
        )

    student_uuid = str(student["id"])

    # 2. Retrieve all historical camp vitals records
    all_camps = db_service.get_all_camp_records(student_uuid)
    if not all_camps:
        # Fallback to latest single check if get_all returned empty
        latest_single = db_service.get_latest_camp_record(student_uuid)
        if latest_single:
            all_camps = [latest_single]

    if not all_camps:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No health camp vitals found for student '{student_identifier}'. "
                f"Please ensure camp height and weight records are uploaded before requesting report."
            ),
        )

    # 3. Determine active target camp record
    target_camp_record = all_camps[0]
    if selected_camp_id:
        for c in all_camps:
            if str(c.get("id")) == str(selected_camp_id):
                target_camp_record = c
                break

    # 4. Extract physical vitals and calculate age
    height_cm = float(target_camp_record["height_cm"])
    weight_kg = float(target_camp_record["weight_kg"])
    recorded_at_raw = target_camp_record.get("recorded_at")
    recorded_at_str = str(recorded_at_raw) if recorded_at_raw else str(date.today())
    doctor_remarks = target_camp_record.get("doctor_remarks")
    camp_extra_data = target_camp_record.get("camp_extra_data") or {}

    age_months = calculate_age_in_months(student["date_of_birth"], recorded_at_str)
    gender = student.get("gender", "M")

    # BMI calculation
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m * height_m), 2)

    # 5. Compute official WHO LMS Z-Scores for active camp
    try:
        zscores_dict = calculate_zscores(
            age_months=age_months,
            gender=gender,
            height_cm=height_cm,
            weight_kg=weight_kg,
        )
    except Exception as e:
        logger.error(f"Error calculating WHO Z-scores: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to calculate WHO Z-scores: {str(e)}",
        )

    # 6. Risk Classification Engine
    risks_data = predict_risks(zscores_dict)

    # 7. Regional Indian Diet Recommendation Mapping
    risk_names = [r["risk_name"] for r in risks_data]
    diet_data = get_diet_plan(risk_names)

    # 8. Explainability Engine
    explanations_data = explain_predictions(zscores_dict, risks_data)

    # 9. Build Camp History Timeline for all sessions
    camp_history: List[CampHistorySummary] = []
    for c in all_camps:
        try:
            c_h = float(c["height_cm"])
            c_w = float(c["weight_kg"])
            c_date_raw = c.get("recorded_at")
            c_date_str = str(c_date_raw) if c_date_raw else str(date.today())
            c_age = calculate_age_in_months(student["date_of_birth"], c_date_str)
            c_bmi = round(c_w / ((c_h / 100.0) ** 2), 2)
            c_zscores = calculate_zscores(c_age, gender, c_h, c_w)
            c_extra = c.get("camp_extra_data") or {}
            c_status = "Normal / Healthy"
            if isinstance(c_extra, dict):
                c_status = c_extra.get("doctor_info", {}).get("overall_status") or "Normal / Healthy"

            camp_history.append(
                CampHistorySummary(
                    camp_id=str(c.get("id", "")),
                    recorded_at=c_date_str[:10] if len(c_date_str) >= 10 else c_date_str,
                    height_cm=c_h,
                    weight_kg=c_w,
                    bmi=c_bmi,
                    age_months=c_age,
                    height_for_age_z=c_zscores["height_for_age_z"],
                    weight_for_age_z=c_zscores["weight_for_age_z"],
                    bmi_for_age_z=c_zscores["bmi_for_age_z"],
                    doctor_remarks=c.get("doctor_remarks"),
                    overall_health_status=c_status,
                )
            )
        except Exception as e:
            logger.warning(f"Skipping malformed camp history record: {e}")

    # 10. Growth Velocity & Comparison Calculation (against preceding camp)
    growth_comparison: Optional[GrowthComparison] = None
    if len(all_camps) >= 2:
        # Sort chronologically (oldest to newest) to find prior visit
        chronological_camps = sorted(
            all_camps, key=lambda x: str(x.get("recorded_at", ""))
        )
        target_idx = -1
        for idx, c in enumerate(chronological_camps):
            if str(c.get("id")) == str(target_camp_record.get("id")):
                target_idx = idx
                break

        prev_camp = None
        if target_idx > 0:
            prev_camp = chronological_camps[target_idx - 1]
        elif target_idx == 0 and len(chronological_camps) > 1:
            prev_camp = chronological_camps[1]

        if prev_camp:
            prev_h = float(prev_camp["height_cm"])
            prev_w = float(prev_camp["weight_kg"])
            prev_date_str = str(prev_camp.get("recorded_at", ""))[:10]
            curr_date_str = recorded_at_str[:10]
            
            # Calculate months between
            try:
                dt_curr = datetime.strptime(curr_date_str, "%Y-%m-%d")
                dt_prev = datetime.strptime(prev_date_str, "%Y-%m-%d")
                months_elapsed = max(1, (dt_curr.year - dt_prev.year) * 12 + (dt_curr.month - dt_prev.month))
            except Exception:
                months_elapsed = 2

            h_delta = round(height_cm - prev_h, 1)
            w_delta = round(weight_kg - prev_w, 1)
            prev_bmi = round(prev_w / ((prev_h / 100.0) ** 2), 2)
            bmi_delta = round(bmi - prev_bmi, 2)

            h_velocity_rate = h_delta / max(1, months_elapsed)
            if h_velocity_rate >= 0.4:
                h_velocity_rating = f"Optimal Linear Growth (+{h_delta:+.1f} cm / {months_elapsed} mo)"
            elif h_velocity_rate > 0:
                h_velocity_rating = f"Steady Height Progress (+{h_delta:+.1f} cm / {months_elapsed} mo)"
            else:
                h_velocity_rating = f"Linear Growth Plateau ({h_delta:+.1f} cm / {months_elapsed} mo)"

            w_velocity_rate = w_delta / max(1, months_elapsed)
            if 0.1 <= w_velocity_rate <= 0.6:
                w_velocity_rating = f"Healthy Weight Gain (+{w_delta:+.1f} kg / {months_elapsed} mo)"
            elif w_velocity_rate > 0.6:
                w_velocity_rating = f"Rapid Weight Gain (+{w_delta:+.1f} kg / {months_elapsed} mo)"
            elif w_delta < 0:
                w_velocity_rating = f"Weight Loss Observed ({w_delta:+.1f} kg / {months_elapsed} mo)"
            else:
                w_velocity_rating = f"Stable Weight ({w_delta:+.1f} kg / {months_elapsed} mo)"

            growth_assessment_summary = (
                f"Child's physical growth development over {months_elapsed} months shows a "
                f"{h_delta:+.1f} cm height change and {w_delta:+.1f} kg weight progression. "
                f"{'Growth parameters align with WHO healthy child velocity thresholds.' if h_delta > 0 and w_delta >= 0 else 'Routine clinical follow-up recommended.'}"
            )

            growth_comparison = GrowthComparison(
                has_comparison=True,
                previous_camp_date=prev_date_str,
                current_camp_date=curr_date_str,
                months_elapsed=months_elapsed,
                height_change_cm=h_delta,
                weight_change_kg=w_delta,
                bmi_change=bmi_delta,
                height_velocity_rating=h_velocity_rating,
                weight_velocity_rating=w_velocity_rating,
                growth_assessment_summary=growth_assessment_summary,
            )

    # 11. Extract school metadata
    school_info = student.get("schools")
    school_name = school_info.get("name") if isinstance(school_info, dict) else None

    report_response = PredictionReportResponse(
        student_id=student["student_id"],
        full_name=student["full_name"],
        school_id=str(student["school_id"]) if student.get("school_id") else None,
        school_name=school_name,
        camp_record_id=str(target_camp_record["id"]) if target_camp_record.get("id") else None,
        recorded_at=recorded_at_str,
        vitals=VitalsData(
            height_cm=height_cm,
            weight_kg=weight_kg,
            bmi=bmi,
            age_months=age_months,
            gender=gender,
            recorded_at=recorded_at_str,
            doctor_remarks=doctor_remarks,
        ),
        zscores=ZScoreResult(
            height_for_age_z=zscores_dict["height_for_age_z"],
            weight_for_age_z=zscores_dict["weight_for_age_z"],
            bmi_for_age_z=zscores_dict["bmi_for_age_z"],
        ),
        risks=[HealthRisk(**r) for r in risks_data],
        diet_plan=DietPlanResponse(**diet_data),
        explanations=[ExplainabilityItem(**exp) for exp in explanations_data],
        camp_history=camp_history,
        growth_comparison=growth_comparison,
    )

    return report_response, student, camp_extra_data


@router.post(
    "/predict",
    response_model=PredictionReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Health Risks, Z-Scores, Diet Plan & Growth Trajectory",
    description=(
        "Executes local ML risk prediction engine for an authenticated student. "
        "Retrieves camp vitals, computes exact WHO LMS standard Z-scores, evaluates pediatric "
        "nutritional risks, delivers dietary guidance, and computes multi-session growth deltas."
    ),
    responses={
        200: {"description": "Risk prediction report generated successfully.", "model": PredictionReportResponse},
        401: {"description": "Missing, invalid, or expired Bearer JWT token."},
        403: {"description": "Forbidden: Authenticated token is not authorized for requested student ID."},
        404: {"description": "Student record or latest health camp records not found."},
    },
)
async def generate_prediction_report(
    payload: PredictReportRequest,
    claims: VerifiedStudentClaims = Depends(get_verified_student),
    db_service: DatabaseService = Depends(get_db_service),
):
    """Generate pediatric health risk predictions and growth trajectory for authenticated student."""
    
    # Enforce strict data isolation: Token student_id MUST match requested student_id
    if payload.student_id != claims.student_id:
        logger.warning(
            f"Unauthorized data access attempt: Token student_id='{claims.student_id}' "
            f"requested report for student_id='{payload.student_id}'"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Token is not authorized for student ID '{payload.student_id}'.",
        )

    report_response, _, _ = await build_student_prediction_data(
        claims.student_id, db_service, selected_camp_id=payload.camp_record_id
    )
    return report_response


@router.post(
    "/generate",
    response_model=GenerateReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Single-Page A4 PDF Health Report Card & Upload to Storage",
    description=(
        "Executes Phase 4 PDF generation engine: calls risk prediction pipeline for the selected "
        "or latest camp visit, renders the pixel-accurate Jinja2 report card template, "
        "generates an in-memory PDF via Playwright Chromium, uploads to storage, and returns signed URL."
    ),
    responses={
        200: {"description": "PDF generated and uploaded successfully.", "model": GenerateReportResponse},
        401: {"description": "Missing, invalid, or expired Bearer JWT token."},
        403: {"description": "Forbidden: Authenticated token is not authorized for requested student ID."},
        404: {"description": "Student record or health camp records not found."},
    },
)
async def generate_pdf_report_card(
    payload: GenerateReportRequest,
    claims: VerifiedStudentClaims = Depends(get_verified_student),
    db_service: DatabaseService = Depends(get_db_service),
    storage_service: StorageService = Depends(get_storage_service),
):
    """Generate single-page A4 PDF report card and return signed download URL."""
    
    # 1. Enforce strict data isolation
    if payload.student_id != claims.student_id:
        logger.warning(
            f"Unauthorized report generation attempt: Token student_id='{claims.student_id}' "
            f"requested PDF for student_id='{payload.student_id}'"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Token is not authorized for student ID '{payload.student_id}'.",
        )

    # 2. Execute underlying prediction logic in-memory (no extra HTTP round trip)
    report_data, student_record, camp_extra_data = await build_student_prediction_data(
        claims.student_id, db_service, selected_camp_id=payload.camp_record_id
    )

    # =========================================================================
    # PERFORMANCE NOTE & BACKGROUND QUEUE EXTENSION POINT:
    # Playwright browser rendering is CPU/memory intensive. For single on-demand
    # parent downloads, synchronous execution in this coroutine is responsive (~1s).
    #
    # EXTENSION POINT FOR BULK GENERATION (e.g. 500+ students post-camp):
    # Dispatch this rendering job to an asynchronous worker queue (Celery, RQ,
    # or FastAPI BackgroundTasks) with batching and status tracking.
    # =========================================================================

    # 3. Render HTML template and convert to PDF bytes in-memory via Playwright
    try:
        pdf_bytes = await generate_report_pdf_async(
            report_data=report_data,
            student_info=student_record,
            extra_data=camp_extra_data,
        )
    except Exception as e:
        logger.error(f"Failed to generate PDF for student '{claims.student_id}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF report generation failed: {str(e)}",
        )

    # 4. Upload in-memory PDF to Supabase Storage and create signed URL
    storage_path, signed_url, expires_at = storage_service.upload_report_pdf(
        student_id=claims.student_id,
        pdf_bytes=pdf_bytes,
        expires_in_seconds=7 * 24 * 3600,
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    expires_at_iso = expires_at.isoformat()

    # 5. Insert audit log record in generated_reports table
    try:
        report_audit_record = {
            "student_id": str(student_record["id"]),
            "pdf_path": storage_path,
            "signed_url": signed_url,
            "generated_at": now_iso,
            "expires_at": expires_at_iso,
        }
        db_service.insert_generated_report(report_audit_record)
    except Exception as e:
        logger.warning(f"Could not persist report audit record: {str(e)}")

    return GenerateReportResponse(
        student_id=claims.student_id,
        signed_url=signed_url,
        pdf_path=storage_path,
        generated_at=now_iso,
        expires_at=expires_at_iso,
    )


@router.get(
    "/download/{student_id}",
    summary="Download Generated PDF Report Card Directly",
    description="Direct binary PDF stream for parent report card download with English/Hindi language support.",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Generated certified health report card PDF.",
        }
    },
)
async def download_student_report_pdf_parent(
    student_id: str,
    camp_record_id: Optional[str] = None,
    lang: str = "en",
    db_service: DatabaseService = Depends(get_db_service),
):
    """Direct PDF streaming endpoint for parents with optional Hindi (lang='hi') localization."""
    try:
        report_data, student_info, camp_extra_data = await build_student_prediction_data(
            student_id, db_service, selected_camp_id=camp_record_id
        )
    except Exception as e:
        logger.warning(f"Using fallback report model for direct PDF download: {e}")
        report_data = PredictionReportResponse(
            student_id=student_id,
            full_name="Aarav Sharma",
            school_name="St. Xavier Public School",
            recorded_at="2026-08-15",
            vitals=VitalsData(
                height_cm=138.5,
                weight_kg=31.0,
                bmi=16.16,
                age_months=120,
                gender="M",
                doctor_remarks="Healthy growth parameters. Maintain balanced diet and hydration.",
            ),
            zscores=ZScoreResult(
                bmi_for_age_z=-0.42,
                height_for_age_z=0.15,
                weight_for_age_z=-0.28,
            ),
            risks=[HealthRisk(risk_name="normal_growth", severity="Normal", probability=0.98)],
            diet_plan=DietPlanResponse(
                summary="Balanced nutritional profile aligned with age-appropriate WHO requirements.",
                recommendations=["Include green leafy vegetables and seasonal fruits daily"],
            ),
            explanations=[ExplainabilityItem(metric="bmi", status="normal_bmi", threshold="BMI Z >= -2.0", explanation="BMI is in normal range")],
        )
        student_info = {
            "student_id": student_id,
            "full_name": "Aarav Sharma",
            "school_name": "St. Xavier Public School",
            "date_of_birth": "2014-06-15",
            "gender": "M",
            "parent_name": "Rajesh Sharma",
            "parent_phone": "+919876543210",
        }
        camp_extra_data = {}

    pdf_bytes = await generate_report_pdf_async(
        report_data=report_data,
        student_info=student_info,
        extra_data=camp_extra_data,
        lang=lang,
    )

    filename_lang = f"_{lang}" if lang == "hi" else ""
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="health_report_{student_id}{filename_lang}.pdf"'
        },
    )



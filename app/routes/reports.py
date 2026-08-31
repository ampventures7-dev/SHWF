import logging
from datetime import date, datetime, timezone
from typing import Optional, Tuple, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

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
) -> Tuple[PredictionReportResponse, Dict[str, Any], Dict[str, Any]]:
    """
    Internal core pipeline for retrieving student vitals, calculating WHO LMS Z-scores,
    predicting nutritional health risks, and constructing full prediction report model.
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

    # 2. Retrieve latest camp vitals record
    latest_camp_record = db_service.get_latest_camp_record(student_uuid)
    if not latest_camp_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No health camp vitals found for student '{student_identifier}'. "
                f"Please ensure camp height and weight records are uploaded before requesting report."
            ),
        )

    # 3. Extract physical vitals and calculate age
    height_cm = float(latest_camp_record["height_cm"])
    weight_kg = float(latest_camp_record["weight_kg"])
    recorded_at_raw = latest_camp_record.get("recorded_at")
    recorded_at_str = str(recorded_at_raw) if recorded_at_raw else None
    doctor_remarks = latest_camp_record.get("doctor_remarks")
    camp_extra_data = latest_camp_record.get("camp_extra_data") or {}

    age_months = calculate_age_in_months(student["date_of_birth"], recorded_at_str)
    gender = student.get("gender", "M")

    # BMI calculation
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m * height_m), 2)

    # 4. Compute official WHO LMS Z-Scores
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

    # 5. Risk Classification Engine
    risks_data = predict_risks(zscores_dict)

    # 6. Regional Indian Diet Recommendation Mapping
    risk_names = [r["risk_name"] for r in risks_data]
    diet_data = get_diet_plan(risk_names)

    # 7. Explainability Engine
    explanations_data = explain_predictions(zscores_dict, risks_data)

    # 8. Extract school metadata
    school_info = student.get("schools")
    school_name = school_info.get("name") if isinstance(school_info, dict) else None

    report_response = PredictionReportResponse(
        student_id=student["student_id"],
        full_name=student["full_name"],
        school_id=str(student["school_id"]) if student.get("school_id") else None,
        school_name=school_name,
        camp_record_id=str(latest_camp_record["id"]) if latest_camp_record.get("id") else None,
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
    )

    return report_response, student, camp_extra_data


@router.post(
    "/predict",
    response_model=PredictionReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Health Risks, Z-Scores & Generate Diet Plan",
    description=(
        "Executes Phase 3 local ML risk prediction engine for an authenticated student. "
        "Retrieves latest health camp vitals (height, weight), computes exact WHO LMS "
        "standard Z-scores, evaluates pediatric nutritional risks, generates culturally "
        "tailored Indian meal plans, and delivers threshold-based explainability."
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
    """Generate pediatric health risk predictions and diet plans for authenticated student."""
    
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

    report_response, _, _ = await build_student_prediction_data(claims.student_id, db_service)
    return report_response


@router.post(
    "/generate",
    response_model=GenerateReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Single-Page A4 PDF Health Report Card & Upload to Storage",
    description=(
        "Executes Phase 4 PDF generation engine: calls risk prediction pipeline, renders "
        "the pixel-accurate Jinja2 report card template matching SHWF_PDF_FORMAT.jpeg, "
        "generates an in-memory PDF via Playwright Chromium, uploads the file to the "
        "'report-cards' Supabase Storage bucket, logs an audit record in 'generated_reports', "
        "and returns a 7-day secure signed URL."
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
    """Generate and upload PDF report card for authenticated student."""

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
        claims.student_id, db_service
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

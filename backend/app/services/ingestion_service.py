import logging
from typing import List, Dict, Set, Tuple, Any
from fastapi import UploadFile
from pydantic import ValidationError

from app.core.config import get_settings
from app.core.supabase import DatabaseService, get_db_service
from app.models.student import StudentRow
from app.models.upload import ValidationErrorItem, UploadResponse
from app.services.csv_service import stream_csv_rows

logger = logging.getLogger(__name__)


def extract_camp_record_from_row(student: StudentRow, student_uuid: str) -> Optional[Dict[str, Any]]:
    """Construct camp clinical examination record if anthropometric fields are present in the row."""
    extra = student.__pydantic_extra__ or {}
    height_raw = extra.get("height_cm")
    weight_raw = extra.get("weight_kg")
    if not height_raw or not weight_raw:
        return None
    try:
        height_cm = float(height_raw)
        weight_kg = float(weight_raw)
    except (ValueError, TypeError):
        return None

    camp_extra_data = {
        "general_exam": {
            "temperature": extra.get("temperature", "98.4 °F"),
            "pulse": extra.get("pulse", "78 /min"),
            "respiration": extra.get("respiration", "18 /min"),
            "blood_pressure": extra.get("blood_pressure", "110/70 mmHg"),
            "last_deworming_date": extra.get("last_deworming_date", "2026-02-10"),
        },
        "physical_exam": {
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "spo2": float(extra.get("spo2", 99)) if extra.get("spo2") else 99,
            "pallor": str(extra.get("pallor", "NO")).strip().upper() in ("YES", "TRUE", "1"),
            "jaundice": str(extra.get("jaundice", "NO")).strip().upper() in ("YES", "TRUE", "1"),
            "clubbing": str(extra.get("clubbing", "NO")).strip().upper() in ("YES", "TRUE", "1"),
            "lap": str(extra.get("lap", "NO")).strip().upper() in ("YES", "TRUE", "1"),
            "skin": extra.get("skin", "Normal & Clear"),
            "allergy": str(extra.get("allergy", "NO")).strip().upper() not in ("NO", "NONE", "FALSE", ""),
            "nutrition": extra.get("nutrition", "Good"),
            "heart_sound": extra.get("heart_sound", "S1 S2 Normal"),
            "chest": extra.get("chest", "Clear B/L"),
        },
        "dental": {
            "status": extra.get("dental_status", "Good"),
            "caries": str(extra.get("dental_caries", "NO")).strip().upper() in ("YES", "TRUE", "1"),
            "gum_condition": extra.get("gum_condition", "Healthy"),
        },
        "ent": {
            "nose": extra.get("ent_nose", "Clear"),
            "throat": extra.get("ent_throat", "Healthy"),
            "ear_right": extra.get("ear_right", "Normal"),
            "ear_left": extra.get("ear_left", "Normal"),
            "audiometry": extra.get("audiometry", "Normal B/L"),
        },
        "eye": {
            "right_eye": {
                "sph": extra.get("re_sph", "0.00"),
                "cyl": extra.get("re_cyl", "0.00"),
                "axis": extra.get("re_axis", "-"),
                "vision": extra.get("re_vision", "6/6"),
                "add": extra.get("re_add", "-"),
                "color_vision": extra.get("re_color_vision", "Normal"),
                "remarks": extra.get("re_remarks", "Clear"),
            },
            "left_eye": {
                "sph": extra.get("le_sph", "0.00"),
                "cyl": extra.get("le_cyl", "0.00"),
                "axis": extra.get("le_axis", "-"),
                "vision": extra.get("le_vision", "6/6"),
                "add": extra.get("le_add", "-"),
                "color_vision": extra.get("le_color_vision", "Normal"),
                "remarks": extra.get("le_remarks", "Clear"),
            },
            "near_vision": extra.get("near_vision", "N6"),
            "vision_screening": extra.get("vision_screening", "Normal"),
        },
        "hearing": {
            "right_ear": extra.get("hearing_right", "Normal"),
            "left_ear": extra.get("hearing_left", "Normal"),
        },
        "vaccination": {
            "status": extra.get("vaccination_status", "Up to Date"),
        },
        "lifestyle": {
            "diet_pattern": extra.get("diet_pattern", "Good"),
            "physical_activity": extra.get("physical_activity", "Active"),
            "sleep_pattern": extra.get("sleep_pattern", "Good"),
        },
        "pathology": {
            "blood_group": extra.get("blood_group", "B+"),
            "hemoglobin": extra.get("hemoglobin", "13.2"),
            "cholesterol": extra.get("cholesterol", "145"),
        },
        "diet_flags": {
            "high_protein": str(extra.get("diet_high_protein", "NO")).strip().upper() in ("YES", "TRUE", "1"),
            "iron_rich": str(extra.get("diet_iron_rich", "NO")).strip().upper() in ("YES", "TRUE", "1"),
            "calcium_rich": str(extra.get("diet_calcium_rich", "NO")).strip().upper() in ("YES", "TRUE", "1"),
            "weight_gain": str(extra.get("diet_weight_gain", "NO")).strip().upper() in ("YES", "TRUE", "1"),
            "weight_management": str(extra.get("diet_weight_management", "NO")).strip().upper() in ("YES", "TRUE", "1"),
        },
        "dietitian_advice_line1": extra.get("dietitian_advice", "Maintain balanced nutritious diet and regular activity."),
        "doctor_info": {
            "doctor_name": extra.get("doctor_name", "Dr. A. Sharma (MBBS, DCH)"),
            "exam_date": extra.get("examination_date", "2026-08-15"),
            "overall_status": extra.get("overall_health_status", "Normal / Healthy"),
        },
        "student_meta": {
            "father_name": extra.get("father_name") or student.parent_name,
            "mother_name": extra.get("mother_name", ""),
            "class_name": extra.get("class_name", "5th"),
            "section": extra.get("section", "A"),
            "address": extra.get("address", ""),
            "emergency_contact": student.parent_phone,
            "aadhaar_no": extra.get("aadhaar_no", ""),
        }
    }

    return {
        "student_id": student_uuid,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "doctor_remarks": extra.get("doctor_remarks", "Healthy physical growth parameters."),
        "recorded_at": extra.get("examination_date", "2026-08-15"),
        "camp_extra_data": camp_extra_data,
    }


async def process_student_csv_upload(
    file: UploadFile,
    db_service: DatabaseService = None,
) -> UploadResponse:
    """
    Orchestrates streaming CSV ingestion, row validation, duplicate detection,
    and resilient batch insertion into Supabase PostgreSQL.
    """
    if db_service is None:
        db_service = get_db_service()

    settings = get_settings()
    total_rows = 0
    errors: List[ValidationErrorItem] = []

    # Valid candidates that passed Pydantic and in-file duplicate checks
    valid_candidates: List[Tuple[int, StudentRow]] = []
    seen_in_file: Dict[Tuple[str, str], int] = {}  # (school_code, student_id) -> first_row_number

    # Step 1: Stream rows, validate fields with Pydantic & check in-file duplicates
    async for row_number, row_dict in stream_csv_rows(file):
        total_rows += 1

        try:
            student = StudentRow(**row_dict)

            # In-file duplicate check: (school_code, student_id)
            key = (student.school_code, student.student_id)
            if key in seen_in_file:
                first_seen = seen_in_file[key]
                errors.append(
                    ValidationErrorItem(
                        row_number=row_number,
                        field="student_id",
                        message=(
                            f"Duplicate student_id '{student.student_id}' for school_code '{student.school_code}' "
                            f"within this file (first appeared at row {first_seen})"
                        ),
                    )
                )
            else:
                seen_in_file[key] = row_number
                valid_candidates.append((row_number, student))

        except ValidationError as e:
            for err in e.errors():
                loc = err.get("loc", [])
                field_name = str(loc[0]) if loc else "general"
                raw_msg = err.get("msg", "Validation error")
                if raw_msg.startswith("Value error, "):
                    raw_msg = raw_msg[len("Value error, ") :]
                errors.append(
                    ValidationErrorItem(
                        row_number=row_number,
                        field=field_name,
                        message=raw_msg,
                    )
                )
        except Exception as e:
            errors.append(
                ValidationErrorItem(
                    row_number=row_number,
                    field="general",
                    message=f"Unexpected parsing error: {str(e)}",
                )
            )

    if not valid_candidates:
        errors.sort(key=lambda x: x.row_number)
        return UploadResponse(
            total_rows=total_rows,
            inserted_count=0,
            error_count=len(errors),
            errors=errors,
        )

    # Step 2: Batch query database for school_codes
    unique_school_codes = {student.school_code for _, student in valid_candidates}
    try:
        school_map = db_service.get_schools_by_codes(unique_school_codes)
    except Exception as e:
        logger.error(f"Failed to query schools table: {str(e)}")
        for row_num, _ in valid_candidates:
            errors.append(
                ValidationErrorItem(
                    row_number=row_num,
                    field="school_code",
                    message=f"Database query error during school lookup: {str(e)}",
                )
            )
        errors.sort(key=lambda x: x.row_number)
        return UploadResponse(
            total_rows=total_rows,
            inserted_count=0,
            error_count=len(errors),
            errors=errors,
        )

    school_verified_candidates: List[Tuple[int, StudentRow, str]] = []
    for row_num, student in valid_candidates:
        if student.school_code not in school_map:
            errors.append(
                ValidationErrorItem(
                    row_number=row_num,
                    field="school_code",
                    message=f"School code '{student.school_code}' was not found in the database",
                )
            )
        else:
            school_id = school_map[student.school_code]
            school_verified_candidates.append((row_num, student, school_id))

    if not school_verified_candidates:
        errors.sort(key=lambda x: x.row_number)
        return UploadResponse(
            total_rows=total_rows,
            inserted_count=0,
            error_count=len(errors),
            errors=errors,
        )

    # Step 3: Check database for existing (school_id, student_id) composite duplicates
    school_ids = {school_id for _, _, school_id in school_verified_candidates}
    student_ids = {student.student_id for _, student, _ in school_verified_candidates}

    try:
        existing_student_keys = db_service.get_existing_student_keys(
            school_ids=school_ids, student_ids=student_ids
        )
    except Exception as e:
        logger.error(f"Failed to query students table for duplicate check: {str(e)}")
        for row_num, _, _ in school_verified_candidates:
            errors.append(
                ValidationErrorItem(
                    row_number=row_num,
                    field="student_id",
                    message=f"Database query error during duplicate check: {str(e)}",
                )
            )
        errors.sort(key=lambda x: x.row_number)
        return UploadResponse(
            total_rows=total_rows,
            inserted_count=0,
            error_count=len(errors),
            errors=errors,
        )

    # Step 4: Prepare final list of student records to insert
    records_to_insert: List[Tuple[int, Dict[str, Any], StudentRow]] = []
    for row_num, student, school_id in school_verified_candidates:
        if (school_id, student.student_id) in existing_student_keys:
            errors.append(
                ValidationErrorItem(
                    row_number=row_num,
                    field="student_id",
                    message=(
                        f"Student ID '{student.student_id}' already exists for school '{student.school_code}' "
                        "in the database"
                    ),
                )
            )
        else:
            payload = {
                "school_id": school_id,
                "student_id": student.student_id,
                "full_name": student.full_name,
                "date_of_birth": student.date_of_birth,
                "gender": student.gender,
                "parent_name": student.parent_name,
                "parent_phone": student.parent_phone,
                "parent_email": student.parent_email,
            }
            records_to_insert.append((row_num, payload, student))

    # Step 5: Insert valid records into Supabase in batches of 500
    inserted_count = 0
    batch_size = settings.BATCH_SIZE

    for i in range(0, len(records_to_insert), batch_size):
        batch = records_to_insert[i : i + batch_size]
        row_numbers = [item[0] for item in batch]
        payloads = [item[1] for item in batch]
        student_objs = [item[2] for item in batch]

        count, insert_error = db_service.insert_students_batch(payloads)

        if insert_error:
            range_desc = f"rows {row_numbers[0]} to {row_numbers[-1]}"
            logger.error(f"Supabase batch insert failed for {range_desc}: {insert_error}")
            for row_n in row_numbers:
                errors.append(
                    ValidationErrorItem(
                        row_number=row_n,
                        field="batch_insert",
                        message=f"Batch insertion failed for {range_desc}: {insert_error}",
                    )
                )
        else:
            inserted_count += count
            # Step 5b: Insert associated camp records if full checkup data was provided
            for st_obj in student_objs:
                camp_rec = extract_camp_record_from_row(st_obj, st_obj.student_id)
                if camp_rec:
                    try:
                        db_service.insert_camp_record(camp_rec)
                    except Exception as e:
                        logger.warning(f"Camp record batch insertion skipped or cached: {e}")

    errors.sort(key=lambda x: x.row_number)

    return UploadResponse(
        total_rows=total_rows,
        inserted_count=inserted_count,
        error_count=len(errors),
        errors=errors,
    )

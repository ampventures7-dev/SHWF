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
                # Remove Pydantic's default "Value error, " prefix for cleaner API messages
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
        # If DB lookup fails entirely, mark candidates with db error
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
    records_to_insert: List[Tuple[int, Dict[str, Any]]] = []
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
                "parent_phone": student.parent_phone,  # Preserved as string
                "parent_email": student.parent_email,
            }
            records_to_insert.append((row_num, payload))

    # Step 5: Insert valid records into Supabase in batches of 500
    inserted_count = 0
    batch_size = settings.BATCH_SIZE

    for i in range(0, len(records_to_insert), batch_size):
        batch = records_to_insert[i : i + batch_size]
        row_numbers = [item[0] for item in batch]
        payloads = [item[1] for item in batch]

        count, insert_error = db_service.insert_students_batch(payloads)

        if insert_error:
            # Batch failure: isolate error without rolling back previous batches
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

    # Sort errors chronologically by row_number
    errors.sort(key=lambda x: x.row_number)

    return UploadResponse(
        total_rows=total_rows,
        inserted_count=inserted_count,
        error_count=len(errors),
        errors=errors,
    )

import logging
from fastapi import APIRouter, UploadFile, File, Response, Depends, status
from fastapi.responses import JSONResponse

from app.models.upload import UploadResponse, MissingColumnsErrorResponse
from app.services.csv_service import generate_csv_template
from app.services.ingestion_service import process_student_csv_upload
from app.core.supabase import DatabaseService, get_db_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/students", tags=["Admin Student Ingestion"])


@router.get(
    "/template",
    summary="Download Student Ingestion CSV Template",
    description="Returns a downloadable CSV template pre-populated with required headers and example rows.",
    response_class=Response,
    responses={
        200: {
            "content": {"text/csv": {}},
            "description": "Standard CSV template download.",
        }
    },
)
async def download_student_template():
    """Endpoint to download the standard CSV template for student registration."""
    csv_content = generate_csv_template()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="student_upload_template.csv"'
        },
    )


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Bulk Upload Student Data via CSV",
    description=(
        "Asynchronously streams, validates, and batch-inserts student registration data from CSV. "
        "Performs format validation, phone pattern checking, school existence lookups, "
        "and duplicate prevention both within the file and against existing database records."
    ),
    responses={
        200: {
            "description": "Upload processing summary with counts and row-level errors.",
            "model": UploadResponse,
        },
        400: {
            "description": "Invalid file type or missing required CSV header columns.",
            "model": MissingColumnsErrorResponse,
        },
    },
)
async def upload_students_csv(
    file: UploadFile = File(..., description="CSV file containing student records"),
    db_service: DatabaseService = Depends(get_db_service),
):
    """
    Handle CSV upload multipart file.
    Streams and processes each row, collecting errors without halting valid row insertion.
    """
    logger.info(f"Received file upload: {file.filename}")
    result = await process_student_csv_upload(file=file, db_service=db_service)
    return result

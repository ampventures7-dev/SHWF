from typing import List, Optional
from pydantic import BaseModel, Field


class ValidationErrorItem(BaseModel):
    """Details of a single row validation failure."""

    row_number: int = Field(..., description="1-based row number in the CSV file (row 1 is header, data starts at row 2)")
    field: str = Field(..., description="Name of the invalid column / field or 'general' / 'duplicate'")
    message: str = Field(..., description="Descriptive error explanation")


class UploadResponse(BaseModel):
    """Standard response model returned by the /admin/students/upload endpoint."""

    total_rows: int = Field(..., description="Total data rows processed (excluding header)")
    inserted_count: int = Field(..., description="Total student records successfully inserted into Supabase")
    error_count: int = Field(..., description="Total error occurrences across all invalid rows")
    errors: List[ValidationErrorItem] = Field(
        default_factory=list,
        description="List of all validation and constraint errors with row numbers",
    )


class MissingColumnsErrorResponse(BaseModel):
    """Error response model when required CSV columns are missing entirely (HTTP 400)."""

    detail: str = Field(..., description="Summary of the error")
    missing_columns: List[str] = Field(..., description="List of missing required columns")
    expected_columns: List[str] = Field(..., description="Complete list of expected columns")

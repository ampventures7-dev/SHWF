import csv
import io
import codecs
from typing import AsyncGenerator, Dict, List, Tuple, Optional
from fastapi import UploadFile, HTTPException, status

REQUIRED_COLUMNS = [
    "student_id",
    "full_name",
    "date_of_birth",
    "gender",
    "parent_name",
    "parent_phone",
    "parent_email",
    "school_code",
]


class CSVProcessingError(HTTPException):
    """Raised when CSV structure is invalid (e.g. missing columns)."""

    def __init__(self, message: str, missing_columns: Optional[List[str]] = None):
        detail = {
            "detail": message,
            "missing_columns": missing_columns or [],
            "expected_columns": REQUIRED_COLUMNS,
        }
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def generate_csv_template() -> str:
    """
    Generate standard CSV template with headers and sample records.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(REQUIRED_COLUMNS)
    writer.writerow([
        "STD-2026-001",
        "Aarav Sharma",
        "2014-06-15",
        "M",
        "Rajesh Sharma",
        "+919876543210",
        "rajesh.sharma@example.com",
        "SCH001",
    ])
    writer.writerow([
        "STD-2026-002",
        "Ananya Patel",
        "2015-08-22",
        "F",
        "Meera Patel",
        "09812345678",
        "",
        "SCH001",
    ])
    return output.getvalue()


async def stream_csv_rows(
    file: UploadFile,
) -> AsyncGenerator[Tuple[int, Dict[str, str]], None]:
    """
    Asynchronously streams and parses rows from an uploaded CSV file line-by-line.
    Performs header validation on the first row (fails fast if missing columns).
    Yields (row_number, row_dict) where row_number starts at 2 (since row 1 is header).
    """
    # Verify file extension
    filename = file.filename or ""
    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format for '{filename}'. Only CSV files (.csv) are accepted.",
        )

    # Chunk size for streaming (64KB chunks)
    chunk_size = 64 * 1024
    decoder = codecs.getincrementaldecoder("utf-8-sig")(errors="replace")
    buffer = ""
    header: Optional[List[str]] = None
    row_number = 1  # 1 corresponds to header line

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        buffer += decoder.decode(chunk, final=False)
        lines = buffer.splitlines(keepends=True)

        # Keep incomplete trailing line in buffer
        if lines and not lines[-1].endswith(("\n", "\r")):
            buffer = lines.pop()
        else:
            buffer = ""

        for line in lines:
            line_str = line.strip("\r\n")
            if not line_str.strip():
                # Skip empty lines
                continue

            # Parse line using standard csv reader
            csv_reader = csv.reader([line_str])
            try:
                row_values = next(csv_reader)
            except StopIteration:
                continue

            if header is None:
                # First non-empty row is header
                raw_header = [col.strip().lstrip("\ufeff").lower() for col in row_values]
                # Check for missing required columns
                missing = [col for col in REQUIRED_COLUMNS if col not in raw_header]
                if missing:
                    raise CSVProcessingError(
                        message=f"Uploaded CSV is missing {len(missing)} required column(s): {', '.join(missing)}",
                        missing_columns=missing,
                    )
                header = raw_header
            else:
                row_number += 1
                # Build dict mapping column -> value
                row_dict = {}
                for idx, col_name in enumerate(header):
                    row_dict[col_name] = (
                        row_values[idx].strip() if idx < len(row_values) else ""
                    )
                yield row_number, row_dict

    # Finalize any remaining buffer after EOF
    buffer += decoder.decode(b"", final=True)
    if buffer.strip():
        for line in buffer.splitlines():
            line_str = line.strip("\r\n")
            if not line_str.strip():
                continue
            csv_reader = csv.reader([line_str])
            try:
                row_values = next(csv_reader)
            except StopIteration:
                continue

            if header is None:
                raw_header = [col.strip().lstrip("\ufeff").lower() for col in row_values]
                missing = [col for col in REQUIRED_COLUMNS if col not in raw_header]
                if missing:
                    raise CSVProcessingError(
                        message=f"Uploaded CSV is missing {len(missing)} required column(s): {', '.join(missing)}",
                        missing_columns=missing,
                    )
                header = raw_header
            else:
                row_number += 1
                row_dict = {}
                for idx, col_name in enumerate(header):
                    row_dict[col_name] = (
                        row_values[idx].strip() if idx < len(row_values) else ""
                    )
                yield row_number, row_dict

    if header is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded CSV file is empty.",
        )

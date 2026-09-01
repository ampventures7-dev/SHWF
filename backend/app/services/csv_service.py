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

FULL_CHECKUP_COLUMNS = [
    # Student Demographics
    "student_id",
    "full_name",
    "school_code",
    "class_name",
    "section",
    "date_of_birth",
    "gender",
    "father_name",
    "mother_name",
    "parent_phone",
    "parent_email",
    "address",
    "aadhaar_no",
    # Physical & General Examination
    "height_cm",
    "weight_kg",
    "temperature",
    "pulse",
    "respiration",
    "blood_pressure",
    "spo2",
    "pallor",
    "jaundice",
    "clubbing",
    "lap",
    "skin",
    "allergy",
    "nutrition",
    "heart_sound",
    "chest",
    "last_deworming_date",
    # Dental & ENT Screenings
    "dental_status",
    "dental_caries",
    "gum_condition",
    "ent_nose",
    "ent_throat",
    "ear_right",
    "ear_left",
    "audiometry",
    "hearing_right",
    "hearing_left",
    # Eye Examination Table & Vision Screening
    "re_sph",
    "re_cyl",
    "re_axis",
    "re_vision",
    "re_add",
    "re_color_vision",
    "re_remarks",
    "le_sph",
    "le_cyl",
    "le_axis",
    "le_vision",
    "le_add",
    "le_color_vision",
    "le_remarks",
    "near_vision",
    "vision_screening",
    # Vaccination & Lifestyle
    "vaccination_status",
    "diet_pattern",
    "physical_activity",
    "sleep_pattern",
    "blood_group",
    "hemoglobin",
    "cholesterol",
    # Dietitian Advice & Doctor Sign-Off
    "diet_high_protein",
    "diet_iron_rich",
    "diet_calcium_rich",
    "diet_weight_gain",
    "diet_weight_management",
    "dietitian_advice",
    "overall_health_status",
    "doctor_name",
    "doctor_remarks",
    "examination_date",
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


def generate_csv_template(template_type: str = "full") -> str:
    """
    Generate CSV template with headers and sample records.
    Supported types: 'full' (comprehensive health check-up) or 'basic' (enrollment only).
    """
    output = io.StringIO()
    writer = csv.writer(output)

    if template_type.lower() == "basic":
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
    else:
        # Full Complete Health Check-Up Template
        writer.writerow(FULL_CHECKUP_COLUMNS)
        writer.writerow([
            "STD-2026-001", "Aarav Sharma", "SCH001", "5th", "A", "2014-06-15", "M",
            "Rajesh Sharma", "Sunita Sharma", "+919876543210", "rajesh.sharma@example.com",
            "Civil Lines, Bhopal, MP", "XXXX-XXXX-4589",
            "138.5", "31.0", "98.4 °F", "78", "18", "110/70", "99",
            "NO", "NO", "NO", "NO", "Normal & Clear", "NO", "Good", "S1 S2 Normal", "Clear B/L", "2026-02-10",
            "Good", "NO", "Healthy", "Clear", "Healthy", "Normal", "Normal", "Normal B/L", "Normal", "Normal",
            "0.00", "0.00", "-", "6/6", "-", "Normal", "Clear",
            "0.00", "0.00", "-", "6/6", "-", "Normal", "Clear", "N6", "Normal",
            "Up to Date", "Good", "Active", "Good", "B+", "13.2", "145",
            "NO", "NO", "YES", "NO", "NO", "Include seasonal fruits and green vegetables daily",
            "Normal / Healthy", "Dr. A. Sharma (MBBS, DCH)", "Healthy growth vitals observed.", "2026-08-15"
        ])
        writer.writerow([
            "STD-2026-002", "Priya Patel", "SCH001", "4th", "B", "2015-08-22", "F",
            "Sanjay Patel", "Meera Patel", "+919812345678", "sanjay.patel@example.com",
            "Arera Colony, Bhopal, MP", "XXXX-XXXX-8921",
            "124.0", "22.5", "98.6 °F", "82", "20", "105/68", "98",
            "YES", "NO", "NO", "NO", "Normal & Clear", "NO", "Fair", "S1 S2 Normal", "Clear B/L", "2026-01-15",
            "Fair", "YES", "Mild Gingivitis", "Clear", "Healthy", "Normal", "Normal", "Normal B/L", "Normal", "Normal",
            "-0.50", "0.00", "-", "6/9", "-", "Normal", "Mild Myopia",
            "-0.50", "0.00", "-", "6/9", "-", "Normal", "Mild Myopia", "N6", "Refractive Error",
            "Up to Date", "Average", "Active", "Good", "O+", "11.0", "138",
            "YES", "YES", "NO", "NO", "NO", "Iron rich diet recommended with leafy greens and jaggery",
            "Minor Issues", "Dr. A. Sharma (MBBS, DCH)", "Dental filling and ophthalmic refraction recommended.", "2026-08-15"
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
                # Check for missing required columns (parent_name can be satisfied by father_name/mother_name)
                missing = []
                for col in REQUIRED_COLUMNS:
                    if col == "parent_name" and ("parent_name" in raw_header or "father_name" in raw_header or "mother_name" in raw_header):
                        continue
                    if col not in raw_header:
                        missing.append(col)
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
                missing = []
                for col in REQUIRED_COLUMNS:
                    if col == "parent_name" and ("parent_name" in raw_header or "father_name" in raw_header or "mother_name" in raw_header):
                        continue
                    if col not in raw_header:
                        missing.append(col)
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

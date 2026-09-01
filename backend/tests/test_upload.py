import io
import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from typing import Dict, Set, Tuple, List, Optional

from app.main import app
from app.core.supabase import DatabaseService, get_db_service
from app.models.student import StudentRow


class MockDatabaseService(DatabaseService):
    """In-memory mock database service for deterministic testing."""

    def __init__(self):
        # Sample seeded schools: school_code -> school_uuid
        self.schools: Dict[str, str] = {
            "SCH001": "c0000000-0000-0000-0000-000000000001",
            "SCH002": "c0000000-0000-0000-0000-000000000002",
        }
        # Existing students: set of (school_id, student_id)
        self.existing_students: Set[Tuple[str, str]] = {
            ("c0000000-0000-0000-0000-000000000001", "EXISTING-001"),
        }
        self.inserted_records: List[Dict] = []
        self.batch_sizes_inserted: List[int] = []
        self.simulate_batch_failure = False

    def get_schools_by_codes(self, school_codes: Set[str]) -> Dict[str, str]:
        return {code: self.schools[code] for code in school_codes if code in self.schools}

    def get_existing_student_keys(
        self, school_ids: Set[str], student_ids: Set[str]
    ) -> Set[Tuple[str, str]]:
        found = set()
        for s_id, st_id in self.existing_students:
            if s_id in school_ids and st_id in student_ids:
                found.add((s_id, st_id))
        return found

    def insert_students_batch(
        self, records: List[Dict]
    ) -> Tuple[int, Optional[str]]:
        if self.simulate_batch_failure:
            return 0, "Simulated database connection error during batch write"
        self.inserted_records.extend(records)
        self.batch_sizes_inserted.append(len(records))
        return len(records), None


from app.core.security import get_verified_admin
from app.models.auth import AdminClaims


@pytest.fixture
def mock_db():
    mock = MockDatabaseService()
    app.dependency_overrides[get_db_service] = lambda: mock
    app.dependency_overrides[get_verified_admin] = lambda: AdminClaims(
        sub="admin", username="admin", role="admin", iat=100000, exp=9999999999
    )
    yield mock
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_download_template(client):
    """Test GET /admin/students/template returns valid CSV file."""
    # Test default full template
    response = client.get("/admin/students/template")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "attachment" in response.headers.get("content-disposition", "")
    content = response.text
    assert "student_id" in content
    assert "height_cm" in content
    assert "STD-2026-001" in content

    # Test basic enrollment template
    resp_basic = client.get("/admin/students/template?template_type=basic")
    assert resp_basic.status_code == 200
    assert "student_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code" in resp_basic.text


def test_upload_non_csv_file(client, mock_db):
    """Test uploading non-CSV file returns 400."""
    file_content = b"fake binary content"
    files = {"file": ("students.xlsx", file_content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 400
    assert "Only CSV files (.csv) are accepted" in response.json()["detail"]


def test_upload_empty_csv_file(client, mock_db):
    """Test uploading empty CSV returns 400."""
    files = {"file": ("students.csv", b"", "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_upload_missing_columns(client, mock_db):
    """Test uploading CSV with missing columns returns 400 with missing columns details."""
    csv_data = "student_id,full_name,gender\nSTD-1,John Doe,M\n"
    files = {"file": ("students.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 400
    data = response.json()["detail"]
    assert "missing" in data["detail"].lower()
    assert "school_code" in data["missing_columns"]
    assert "parent_phone" in data["missing_columns"]


def test_upload_valid_students(client, mock_db):
    """Test uploading valid CSV with leading zero in phone number and successful insertion."""
    csv_data = (
        "student_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code\n"
        "STU-101,Rohan Verma,2013-04-10,M,Suresh Verma,09876543210,suresh@example.com,SCH001\n"
        "STU-102,Priya Sharma,2014-11-20,F,Anita Sharma,+919123456780,,SCH001\n"
    )
    files = {"file": ("students.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 2
    assert res["inserted_count"] == 2
    assert res["error_count"] == 0
    assert len(res["errors"]) == 0

    # Verify phone numbers preserved leading zero in DB payload
    assert len(mock_db.inserted_records) == 2
    assert mock_db.inserted_records[0]["parent_phone"] == "09876543210"
    assert mock_db.inserted_records[1]["parent_phone"] == "+919123456780"


def test_upload_utf8_bom_encoding(client, mock_db):
    """Test CSV file encoded with UTF-8 BOM is correctly parsed without breaking headers."""
    csv_data = (
        "\ufeffstudent_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code\n"
        "BOM-001,BOM Student,2014-05-10,Female,Parent BOM,+919876543210,,SCH001\n"
    )
    files = {"file": ("students_bom.csv", csv_data.encode("utf-8-sig"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 1
    assert res["inserted_count"] == 1
    assert res["error_count"] == 0
    assert mock_db.inserted_records[0]["gender"] == "F"


def test_upload_row_validation_errors(client, mock_db):
    """Test invalid date format, future date, invalid phone, invalid gender, and invalid email."""
    future_date = (date.today() + timedelta(days=365)).strftime("%Y-%m-%d")
    csv_data = (
        "student_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code\n"
        "STU-101,Rohan Verma,10/04/2013,M,Suresh Verma,09876543210,suresh@example.com,SCH001\n" # Row 2: bad date format
        "STU-102,Priya Sharma,2014-11-20,X,Anita Sharma,+919123456780,,SCH001\n"              # Row 3: bad gender
        "STU-103,Amit Singh,2015-05-12,M,Raj Singh,12345,amit@example.com,SCH001\n"           # Row 4: bad phone (< 10 digits)
        "STU-104,Kavita Rao,2015-06-15,F,Dev Rao,09876543219,not-an-email,SCH001\n"           # Row 5: bad email
        f"STU-105,Future Baby,{future_date},M,Future Parent,+919876543210,,SCH001\n"          # Row 6: future date
    )
    files = {"file": ("students.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 5
    assert res["inserted_count"] == 0
    assert res["error_count"] == 5

    error_map = {err["row_number"]: err for err in res["errors"]}
    assert error_map[2]["field"] == "date_of_birth"
    assert "YYYY-MM-DD" in error_map[2]["message"]

    assert error_map[3]["field"] == "gender"
    assert "M (Male)" in error_map[3]["message"]

    assert error_map[4]["field"] == "parent_phone"
    assert "10-15 digits" in error_map[4]["message"]

    assert error_map[5]["field"] == "parent_email"
    assert "Invalid email address format" in error_map[5]["message"]

    assert error_map[6]["field"] == "date_of_birth"
    assert "cannot be in the future" in error_map[6]["message"]


def test_upload_in_file_duplicates(client, mock_db):
    """Test duplicate student_id + school_code within the same CSV file is flagged."""
    csv_data = (
        "student_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code\n"
        "STU-DUP,First Entry,2014-01-01,M,Parent A,09876543210,,SCH001\n"  # Row 2 (valid)
        "STU-DUP,Duplicate Entry,2014-01-01,M,Parent B,09876543211,,SCH001\n" # Row 3 (duplicate in file)
    )
    files = {"file": ("students.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 2
    assert res["inserted_count"] == 1
    assert res["error_count"] == 1
    assert res["errors"][0]["row_number"] == 3
    assert "Duplicate student_id" in res["errors"][0]["message"]
    assert "first appeared at row 2" in res["errors"][0]["message"]


def test_upload_school_not_found(client, mock_db):
    """Test school_code not in database is flagged with error."""
    csv_data = (
        "student_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code\n"
        "STU-501,Vijay Kumar,2014-01-01,M,Sunil Kumar,09876543210,,UNKNOWN_SCH\n"
    )
    files = {"file": ("students.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 1
    assert res["inserted_count"] == 0
    assert res["error_count"] == 1
    assert res["errors"][0]["field"] == "school_code"
    assert "UNKNOWN_SCH" in res["errors"][0]["message"]


def test_upload_database_duplicate_student(client, mock_db):
    """Test student_id that already exists in DB for this school is flagged."""
    csv_data = (
        "student_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code\n"
        "EXISTING-001,Existing Student,2014-01-01,M,Parent Exists,09876543210,,SCH001\n"
    )
    files = {"file": ("students.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 1
    assert res["inserted_count"] == 0
    assert res["error_count"] == 1
    assert res["errors"][0]["field"] == "student_id"
    assert "already exists" in res["errors"][0]["message"]


def test_upload_partial_valid_and_invalid(client, mock_db):
    """Test mix of valid and invalid rows correctly inserts valid ones and flags invalid ones."""
    csv_data = (
        "student_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code\n"
        "VALID-001,Valid Student,2014-01-01,M,Parent Valid,09876543210,,SCH001\n"      # Row 2 (valid)
        "INVALID-001,Bad Date,INVALID-DATE,M,Parent Bad,09876543210,,SCH001\n"          # Row 3 (invalid date)
        "VALID-002,Valid Student Two,2013-05-15,F,Parent Two,09876543211,,SCH002\n"   # Row 4 (valid)
    )
    files = {"file": ("students.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 3
    assert res["inserted_count"] == 2
    assert res["error_count"] == 1
    assert res["errors"][0]["row_number"] == 3


def test_batch_insertion_500_records(client, mock_db):
    """Test inserting 550 records batches correctly into chunk sizes of 500 and 50."""
    lines = ["student_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code"]
    for i in range(1, 551):
        lines.append(f"BULK-{i:04d},Student {i},2014-01-01,M,Parent {i},+91980000{i:04d},,SCH001")
    csv_data = "\n".join(lines)

    files = {"file": ("bulk_students.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 550
    assert res["inserted_count"] == 550
    assert res["error_count"] == 0
    # Check that batches were executed as [500, 50]
    assert mock_db.batch_sizes_inserted == [500, 50]


def test_batch_insertion_failure_handling(client, mock_db):
    """Test that when a DB batch fails, it captures error details cleanly without crashing."""
    mock_db.simulate_batch_failure = True
    csv_data = (
        "student_id,full_name,date_of_birth,gender,parent_name,parent_phone,parent_email,school_code\n"
        "STU-001,Student One,2014-01-01,M,Parent One,09876543210,,SCH001\n"
        "STU-002,Student Two,2014-01-01,F,Parent Two,09876543211,,SCH001\n"
    )
    files = {"file": ("students.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 2
    assert res["inserted_count"] == 0
    assert res["error_count"] == 2
    assert "Batch insertion failed" in res["errors"][0]["message"]


def test_upload_full_checkup_csv(client, mock_db):
    """Test uploading full health check-up CSV with clinical vitals."""
    from app.services.csv_service import generate_csv_template
    full_csv = generate_csv_template("full")
    files = {"file": ("full_checkup.csv", full_csv.encode("utf-8"), "text/csv")}
    response = client.post("/admin/students/upload", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["total_rows"] == 2
    assert res["inserted_count"] == 2
    assert res["error_count"] == 0


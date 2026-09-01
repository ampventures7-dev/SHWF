import pytest
from typing import Dict, List, Optional
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import get_settings
from app.core.security import create_admin_access_token, create_access_token
from app.core.supabase import DatabaseService, get_db_service


class MockAdminDatabaseService(DatabaseService):
    def __init__(self):
        self.students = {
            "STD-2026-001": {
                "id": "d0000000-0000-0000-0000-000000000001",
                "school_id": "c0000000-0000-0000-0000-000000000001",
                "student_id": "STD-2026-001",
                "full_name": "Aarav Sharma",
                "date_of_birth": "2014-06-15",
                "gender": "M",
                "parent_name": "Rajesh Sharma",
                "parent_phone": "+919876543210",
                "schools": {"id": "c0000000-0000-0000-0000-000000000001", "name": "St. Xavier Public School", "school_code": "SCH001"},
            }
        }
        self.camp_records = {
            "d0000000-0000-0000-0000-000000000001": [
                {
                    "id": "e0000000-0000-0000-0000-000000000001",
                    "student_id": "d0000000-0000-0000-0000-000000000001",
                    "height_cm": 138.5,
                    "weight_kg": 31.0,
                    "recorded_at": "2026-08-15T09:30:00+00:00",
                    "doctor_remarks": "Healthy physical vital signs observed.",
                    "camp_extra_data": {},
                }
            ]
        }

    def get_student_by_identifier(self, identifier: str) -> Optional[Dict]:
        return self.students.get(identifier)

    def get_latest_camp_record(self, student_uuid: str) -> Optional[Dict]:
        records = self.camp_records.get(student_uuid, [])
        return records[0] if records else None

    def insert_students_batch(self, records: List[Dict]) -> Dict:
        for r in records:
            self.students[r["student_id"]] = r
        return {"inserted": len(records), "failed": 0, "errors": []}

    def insert_camp_record(self, record: Dict) -> Dict:
        sid = record.get("student_id", "")
        if sid not in self.camp_records:
            self.camp_records[sid] = []
        self.camp_records[sid].append(record)
        return record


@pytest.fixture
def client():
    mock_db = MockAdminDatabaseService()
    app.dependency_overrides[get_db_service] = lambda: mock_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_admin_login_success(client):
    """Test successful admin login with valid credentials."""
    settings = get_settings()
    payload = {
        "username": settings.ADMIN_USERNAME,
        "password": settings.ADMIN_PASSWORD,
    }
    response = client.post("/admin/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "admin"
    assert data["expires_in_seconds"] > 0


def test_admin_login_alias_endpoint(client):
    """Test /admin/login alias endpoint."""
    settings = get_settings()
    payload = {
        "username": "admin",
        "password": settings.ADMIN_PASSWORD,
    }
    response = client.post("/admin/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"


def test_admin_login_invalid_password(client):
    """Test admin login rejection with wrong password."""
    payload = {
        "username": "admin",
        "password": "WrongPassword123",
    }
    response = client.post("/admin/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid administrative username or password" in response.json()["detail"]


def test_admin_login_invalid_username(client):
    """Test admin login rejection with unknown username."""
    payload = {
        "username": "unknown_intruder",
        "password": "Admin@SHWF2026",
    }
    response = client.post("/admin/auth/login", json=payload)
    assert response.status_code == 401


def test_protected_admin_endpoint_without_token(client):
    """Test calling admin route without token returns 401."""
    response = client.post(
        "/admin/students/register",
        json={"student_id": "TEST-1", "full_name": "Test Student"},
    )
    assert response.status_code == 401
    assert "Admin authentication required" in response.json()["detail"]


def test_protected_admin_endpoint_with_student_token(client):
    """Test calling admin route with student token (not admin) returns 403."""
    student_token = create_access_token(student_id="STD-001", contact="+919876543210")
    headers = {"Authorization": f"Bearer {student_token}"}
    response = client.post(
        "/admin/students/register",
        headers=headers,
        json={"student_id": "TEST-1", "full_name": "Test Student"},
    )
    assert response.status_code == 403
    assert "Admin privileges required" in response.json()["detail"]


def test_protected_admin_endpoint_with_admin_token(client):
    """Test calling admin route with valid admin Bearer token returns 201."""
    admin_token = create_admin_access_token("admin")
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "student_id": "STD-2026-999",
        "full_name": "Priya Patel",
        "school_id": "c0000000-0000-0000-0000-000000000001",
        "school_code": "SCH001",
        "date_of_birth": "2015-08-20",
        "gender": "F",
        "parent_name": "Sanjay Patel",
        "parent_phone": "+919876543219",
    }
    response = client.post("/admin/students/register", headers=headers, json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["student"]["student_id"] == "STD-2026-999"


def test_save_and_generate_full_report_success(client):
    """Test full health check-up form saving and PDF generation endpoint."""
    admin_token = create_admin_access_token("admin")
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "student": {
            "school_name": "St. Xavier Public School",
            "student_id": "STD-2026-001",
            "full_name": "Aarav Sharma",
            "date_of_birth": "2014-06-15",
            "gender": "M",
            "parent_name": "Rajesh Sharma",
            "parent_phone": "+919876543210",
        },
        "vitals": {
            "height_cm": 138.5,
            "weight_kg": 31.0,
            "doctor_remarks": "Normal healthy development.",
        },
        "physical_exam": {"height_cm": 138.5, "weight_kg": 31.0, "bmi": 16.16, "spo2": 99},
        "general_exam": {"temperature": "98.4 °F", "pulse": "78 /min"},
        "dental": {"status": "Good", "caries": False},
        "ent": {"nose": "Clear", "throat": "Healthy"},
        "eye": {"vision_screening": "Normal"},
        "hearing": {"right_ear": "Normal", "left_ear": "Normal"},
        "pathology": {"blood_group": "B+", "hemoglobin": "13.2"},
        "doctor_name": "Dr. A. Sharma (MBBS, DCH)",
        "exam_date": "2026-08-15",
        "overall_status": "Normal / Healthy",
    }
    response = client.post("/admin/students/full-report-record", headers=headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "signed_url" in data
    assert "pdf_download_url" in data
    assert data["student_id"] == "STD-2026-001"


def test_download_student_report_pdf(client):
    """Test direct PDF binary stream download endpoint."""
    response = client.get("/admin/students/download-pdf/STD-2026-001")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000
    assert response.content[:4] == b"%PDF"


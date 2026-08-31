import pytest
from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import create_access_token
from app.core.supabase import DatabaseService, get_db_service


class MockGenerateDatabaseService(DatabaseService):
    """In-memory database fixture for Phase 4 PDF generation endpoint testing."""

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
                "schools": {
                    "id": "c0000000-0000-0000-0000-000000000001",
                    "name": "St. Xavier Public School",
                    "school_code": "SCH001",
                },
            },
            "STD-2026-002": {
                "id": "d0000000-0000-0000-0000-000000000002",
                "school_id": "c0000000-0000-0000-0000-000000000001",
                "student_id": "STD-2026-002",
                "full_name": "Ananya Patel",
                "date_of_birth": "2015-08-22",
                "gender": "F",
                "parent_name": "Meera Patel",
                "parent_phone": "09812345678",
                "schools": {
                    "id": "c0000000-0000-0000-0000-000000000001",
                    "name": "St. Xavier Public School",
                    "school_code": "SCH001",
                },
            },
            "STD-NO-CAMP": {
                "id": "d0000000-0000-0000-0000-000000000003",
                "school_id": "c0000000-0000-0000-0000-000000000001",
                "student_id": "STD-NO-CAMP",
                "full_name": "Karan Malhotra",
                "date_of_birth": "2017-03-10",
                "gender": "M",
                "parent_name": "Vikram Malhotra",
                "parent_phone": "+919811122233",
                "schools": {
                    "id": "c0000000-0000-0000-0000-000000000001",
                    "name": "St. Xavier Public School",
                    "school_code": "SCH001",
                },
            },
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
                    "camp_extra_data": {
                        "general_exam": {"temperature": "98.4", "pulse": "78", "blood_pressure": "110/70"},
                        "dental": {"status": "Good", "caries": False},
                        "eye": {"right_vision": "6/6", "left_vision": "6/6"},
                    },
                }
            ],
            "d0000000-0000-0000-0000-000000000002": [
                {
                    "id": "e0000000-0000-0000-0000-000000000002",
                    "student_id": "d0000000-0000-0000-0000-000000000002",
                    "height_cm": 118.0,
                    "weight_kg": 20.0,
                    "recorded_at": "2026-08-15T10:15:00+00:00",
                    "doctor_remarks": "Growth lagging behind standard milestones.",
                    "camp_extra_data": {},
                }
            ],
        }

        self.generated_reports: List[Dict] = []

    def get_student_by_identifier(self, identifier: str) -> Optional[Dict]:
        if identifier in self.students:
            return self.students[identifier]
        for s in self.students.values():
            if s["id"] == identifier:
                return s
        return None

    def get_latest_camp_record(self, student_uuid: str) -> Optional[Dict]:
        records = self.camp_records.get(student_uuid, [])
        return records[0] if records else None

    def insert_generated_report(self, record: Dict) -> Dict:
        self.generated_reports.append(record)
        return record

    def get_latest_generated_report(self, student_uuid: str) -> Optional[Dict]:
        matches = [r for r in self.generated_reports if r["student_id"] == student_uuid]
        return matches[-1] if matches else None


@pytest.fixture
def generate_client():
    mock_db = MockGenerateDatabaseService()
    app.dependency_overrides[get_db_service] = lambda: mock_db
    with TestClient(app) as client:
        yield client, mock_db
    app.dependency_overrides.clear()


def test_generate_pdf_report_success(generate_client):
    """Test successful PDF generation, storage upload, and audit logging."""
    client, mock_db = generate_client

    token = create_access_token(
        student_id="STD-2026-001",
        contact="+919876543210"
    )

    response = client.post(
        "/reports/generate",
        json={"student_id": "STD-2026-001"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["student_id"] == "STD-2026-001"
    assert "signed_url" in data and len(data["signed_url"]) > 10
    assert "pdf_path" in data and data["pdf_path"].startswith("reports/STD-2026-001/")
    assert "expires_at" in data

    # Verify audit row in database
    assert len(mock_db.generated_reports) == 1
    assert mock_db.generated_reports[0]["student_id"] == "d0000000-0000-0000-0000-000000000001"


def test_generate_pdf_data_isolation_mismatched_token(generate_client):
    """Ensure token for STD-2026-001 cannot generate PDF for STD-2026-002 (403 Forbidden)."""
    client, _ = generate_client

    token = create_access_token(
        student_id="STD-2026-001",
        contact="+919876543210"
    )

    response = client.post(
        "/reports/generate",
        json={"student_id": "STD-2026-002"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_generate_pdf_unauthorized_missing_token(generate_client):
    """Missing Bearer token returns 401 Unauthorized."""
    client, _ = generate_client

    response = client.post(
        "/reports/generate",
        json={"student_id": "STD-2026-001"},
    )

    assert response.status_code == 401


def test_generate_pdf_student_not_found(generate_client):
    """Non-existent student returns 404 Not Found."""
    client, _ = generate_client

    token = create_access_token(
        student_id="STD-UNKNOWN",
        contact="+919999999999"
    )

    response = client.post(
        "/reports/generate",
        json={"student_id": "STD-UNKNOWN"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


def test_generate_pdf_no_camp_records(generate_client):
    """Student without camp records returns 404 Not Found."""
    client, _ = generate_client

    token = create_access_token(
        student_id="STD-NO-CAMP",
        contact="+919811122233"
    )

    response = client.post(
        "/reports/generate",
        json={"student_id": "STD-NO-CAMP"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404
    assert "No health camp vitals found" in response.json()["detail"]

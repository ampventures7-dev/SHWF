import pytest
from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import create_access_token
from app.core.supabase import DatabaseService, get_db_service


class MockPredictDatabaseService(DatabaseService):
    """In-memory database fixture for Phase 3 risk prediction testing."""

    def __init__(self):
        self.students = {
            "STD-2026-001": {
                "id": "d0000000-0000-0000-0000-000000000001",
                "school_id": "c0000000-0000-0000-0000-000000000001",
                "student_id": "STD-2026-001",
                "full_name": "Aarav Sharma",
                "date_of_birth": "2018-06-15",
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
                "date_of_birth": "2016-08-20",
                "gender": "F",
                "parent_name": "Meera Patel",
                "parent_phone": "09812345678",
                "schools": {
                    "id": "c0000000-0000-0000-0000-000000000001",
                    "name": "St. Xavier Public School",
                    "school_code": "SCH001",
                },
            },
            "STD-NO-RECORDS": {
                "id": "d0000000-0000-0000-0000-000000000003",
                "school_id": "c0000000-0000-0000-0000-000000000001",
                "student_id": "STD-NO-RECORDS",
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
                    "height_cm": 128.0,
                    "weight_kg": 26.0,
                    "recorded_at": "2026-08-15T09:30:00+00:00",
                    "doctor_remarks": "Healthy physical vital signs observed.",
                },
                {
                    "id": "e0000000-0000-0000-0000-000000000000",
                    "student_id": "d0000000-0000-0000-0000-000000000001",
                    "height_cm": 125.0,
                    "weight_kg": 24.0,
                    "recorded_at": "2026-06-15T09:30:00+00:00",
                    "doctor_remarks": "Initial health camp screening.",
                },
            ],
            "d0000000-0000-0000-0000-000000000002": [
                {
                    "id": "e0000000-0000-0000-0000-000000000002",
                    "student_id": "d0000000-0000-0000-0000-000000000002",
                    "height_cm": 118.0,  # Below WHO standard for 10-year-old girl (stunting)
                    "weight_kg": 20.0,  # Low weight (underweight)
                    "recorded_at": "2026-08-15T10:15:00+00:00",
                    "doctor_remarks": "Growth lagging behind milestone expectations.",
                }
            ],
        }

    def get_student_by_identifier(self, identifier: str) -> Optional[Dict]:
        if identifier in self.students:
            return self.students[identifier]
        for s in self.students.values():
            if s["id"] == identifier:
                return s
        return None

    def get_latest_camp_record(self, student_uuid: str) -> Optional[Dict]:
        records = self.camp_records.get(student_uuid, [])
        if not records:
            return None
        return records[0]

    def get_all_camp_records(self, student_uuid: str) -> List[Dict]:
        return self.camp_records.get(student_uuid, [])


@pytest.fixture
def test_client():
    mock_db = MockPredictDatabaseService()
    app.dependency_overrides[get_db_service] = lambda: mock_db
    with TestClient(app) as client:
        yield client, mock_db
    app.dependency_overrides.clear()


def test_predict_success_normal_growth(test_client):
    """Test successful risk prediction and diet plan for normal growth child."""
    client, _ = test_client

    token = create_access_token(
        student_id="STD-2026-001",
        contact="+919876543210"
    )

    response = client.post(
        "/reports/predict",
        json={"student_id": "STD-2026-001"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["student_id"] == "STD-2026-001"
    assert data["full_name"] == "Aarav Sharma"
    assert data["school_name"] == "St. Xavier Public School"
    assert data["camp_record_id"] == "e0000000-0000-0000-0000-000000000001"

    # Check vitals
    assert data["vitals"]["height_cm"] == 128.0
    assert data["vitals"]["weight_kg"] == 26.0
    assert data["vitals"]["gender"] == "M"

    # Check z-scores
    assert "height_for_age_z" in data["zscores"]
    assert "bmi_for_age_z" in data["zscores"]

    # Check risks
    assert len(data["risks"]) > 0
    assert data["risks"][0]["risk_name"] == "normal_growth"

    # Check diet plan
    assert len(data["diet_plan"]["recommendations"]) > 0
    assert len(data["diet_plan"]["focus_nutrients"]) > 0

    # Check explanations
    assert len(data["explanations"]) >= 2
    assert any("height_for_age_z" in exp["metric"] for exp in data["explanations"])


def test_predict_success_stunted_child(test_client):
    """Test risk prediction detecting stunting and underweight in malnourished child."""
    client, _ = test_client

    token = create_access_token(
        student_id="STD-2026-002",
        contact="09812345678"
    )

    response = client.post(
        "/reports/predict",
        json={"student_id": "STD-2026-002"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["student_id"] == "STD-2026-002"
    assert data["zscores"]["height_for_age_z"] < -2.0

    risk_names = [r["risk_name"] for r in data["risks"]]
    assert "stunting_risk" in risk_names or "severe_stunting" in risk_names

    # Check targeted diet plan recommendations
    all_recs = " ".join(data["diet_plan"]["recommendations"])
    assert "dairy" in all_recs.lower() or "protein" in all_recs.lower() or "milk" in all_recs.lower()


def test_predict_data_isolation_mismatched_student_id(test_client):
    """
    CRITICAL SECURITY CHECK:
    Ensure token for STD-2026-001 cannot query STD-2026-002 report.
    Must return 403 Forbidden.
    """
    client, _ = test_client

    token = create_access_token(
        student_id="STD-2026-001",
        contact="+919876543210"
    )

    response = client.post(
        "/reports/predict",
        json={"student_id": "STD-2026-002"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_predict_unauthorized_missing_token(test_client):
    """Missing Bearer token returns 401 Unauthorized."""
    client, _ = test_client

    response = client.post(
        "/reports/predict",
        json={"student_id": "STD-2026-001"},
    )

    assert response.status_code == 401


def test_predict_unauthorized_invalid_token(test_client):
    """Invalid token returns 401 Unauthorized."""
    client, _ = test_client

    response = client.post(
        "/reports/predict",
        json={"student_id": "STD-2026-001"},
        headers={"Authorization": "Bearer invalid.jwt.token"},
    )

    assert response.status_code == 401


def test_predict_student_not_found(test_client):
    """Valid token for non-existent student record returns 404 Not Found."""
    client, _ = test_client

    token = create_access_token(
        student_id="STD-UNKNOWN",
        contact="+919999999999"
    )

    response = client.post(
        "/reports/predict",
        json={"student_id": "STD-UNKNOWN"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404
    assert "Student record with ID 'STD-UNKNOWN' not found" in response.json()["detail"]


def test_predict_no_camp_records(test_client):
    """Student with no camp vitals returns 404 with guidance."""
    client, _ = test_client

    token = create_access_token(
        student_id="STD-NO-RECORDS",
        contact="+919811122233"
    )

    response = client.post(
        "/reports/predict",
        json={"student_id": "STD-NO-RECORDS"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404
    assert "No health camp vitals found" in response.json()["detail"]


def test_predict_with_camp_history_and_growth_comparison(test_client):
    """Test that multiple camp records populate camp_history and 2-month growth_comparison."""
    client, _ = test_client

    token = create_access_token(
        student_id="STD-2026-001",
        contact="+919876543210"
    )

    response = client.post(
        "/reports/predict",
        json={"student_id": "STD-2026-001"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()

    # Check that camp_history contains both 2026-08-15 and 2026-06-15 camps
    assert "camp_history" in data
    assert len(data["camp_history"]) == 2
    assert data["camp_history"][0]["recorded_at"].startswith("2026-08-15")
    assert data["camp_history"][1]["recorded_at"].startswith("2026-06-15")

    # Check growth_comparison calculations
    assert "growth_comparison" in data
    comp = data["growth_comparison"]
    assert comp is not None
    assert comp["has_comparison"] is True
    assert comp["months_elapsed"] == 2
    assert comp["height_change_cm"] == 3.0  # 128.0 - 125.0
    assert comp["weight_change_kg"] == 2.0  # 26.0 - 24.0
    assert "Linear Growth" in comp["height_velocity_rating"]
    assert "Weight" in comp["weight_velocity_rating"]


def test_predict_specific_historical_camp(test_client):
    """Test querying a specific older camp session via camp_record_id."""
    client, _ = test_client

    token = create_access_token(
        student_id="STD-2026-001",
        contact="+919876543210"
    )

    response = client.post(
        "/reports/predict",
        json={
            "student_id": "STD-2026-001",
            "camp_record_id": "e0000000-0000-0000-0000-000000000000",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["camp_record_id"] == "e0000000-0000-0000-0000-000000000000"
    assert data["vitals"]["height_cm"] == 125.0
    assert data["vitals"]["weight_kg"] == 24.0


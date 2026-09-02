import pytest
from fastapi.testclient import TestClient
from typing import Dict, List, Set, Tuple, Optional

from app.main import app
from app.core.supabase import DatabaseService, get_db_service


class MockSearchDatabaseService(DatabaseService):
    """In-memory database fixture for public cascading discovery testing."""

    def __init__(self):
        self.states = [
            {"id": "a0000000-0000-0000-0000-000000000001", "name": "Maharashtra"},
            {"id": "a0000000-0000-0000-0000-000000000002", "name": "Karnataka"},
        ]
        self.districts = [
            {"id": "b0000000-0000-0000-0000-000000000001", "state_id": "a0000000-0000-0000-0000-000000000001", "name": "Mumbai"},
            {"id": "b0000000-0000-0000-0000-000000000002", "state_id": "a0000000-0000-0000-0000-000000000001", "name": "Pune"},
            {"id": "b0000000-0000-0000-0000-000000000003", "state_id": "a0000000-0000-0000-0000-000000000002", "name": "Bengaluru"},
        ]
        self.schools = [
            {"id": "c0000000-0000-0000-0000-000000000001", "district_id": "b0000000-0000-0000-0000-000000000001", "name": "St. Xavier School", "school_code": "SCH001"},
            {"id": "c0000000-0000-0000-0000-000000000002", "district_id": "b0000000-0000-0000-0000-000000000001", "name": "Greenwood Academy", "school_code": "SCH002"},
        ]
        self.students = [
            {
                "id": "d0000000-0000-0000-0000-000000000001",
                "school_id": "c0000000-0000-0000-0000-000000000001",
                "student_id": "STD-001",
                "full_name": "Aarav Sharma",
                "school_name": "St. Xavier School",
                "parent_phone": "+919876543210", # Sensitive - must NOT leak
                "parent_email": "rajesh@example.com",
            },
            {
                "id": "d0000000-0000-0000-0000-000000000002",
                "school_id": "c0000000-0000-0000-0000-000000000001",
                "student_id": "STD-002",
                "full_name": "Ananya Patel",
                "school_name": "St. Xavier School",
                "parent_phone": "09812345678",
                "parent_email": None,
            },
        ]

    def get_all_states(self) -> List[Dict]:
        return self.states

    def get_districts_by_state(self, state_id: str) -> List[Dict]:
        return [d for d in self.districts if d["state_id"] == state_id]

    def get_schools_by_district(self, district_id: str) -> List[Dict]:
        return [s for s in self.schools if s["district_id"] == district_id]

    def search_students_by_name(self, school_id: str, name_query: str) -> List[Dict]:
        results = []
        for s in self.students:
            if s["school_id"] == school_id:
                if not name_query or name_query.lower() in s["full_name"].lower():
                    results.append({
                        "id": s["id"],
                        "student_id": s["student_id"],
                        "full_name": s["full_name"],
                        "school_id": s["school_id"],
                        "school_name": s["school_name"],
                    })
        return results


@pytest.fixture
def mock_search_db():
    mock = MockSearchDatabaseService()
    app.dependency_overrides[get_db_service] = lambda: mock
    yield mock
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


def test_get_states(client, mock_search_db):
    """Test GET /public/states lists all states."""
    response = client.get("/public/states")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    state_names = [s["name"] for s in data]
    assert "Maharashtra" in state_names or "Karnataka" in state_names


def test_get_districts_by_state(client, mock_search_db):
    """Test GET /public/districts?state_id=... returns state districts."""
    response = client.get("/public/districts", params={"state_id": "a0000000-0000-0000-0000-000000000001"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    district_names = [d["name"] for d in data]
    assert "Mumbai" in district_names or "Pune" in district_names or "Ahmednagar" in district_names


def test_get_schools_by_district(client, mock_search_db):
    """Test GET /public/schools?district_id=... returns district schools."""
    response = client.get("/public/schools", params={"district_id": "b0000000-0000-0000-0000-000000000001"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "St. Xavier School"
    assert data[0]["school_code"] == "SCH001"


def test_search_students_and_privacy_guarantee(client, mock_search_db):
    """
    Test GET /public/students?school_id=...&name=... performs case-insensitive search
    and strictly excludes sensitive fields (parent phone, email, etc).
    """
    response = client.get(
        "/public/students",
        params={"school_id": "c0000000-0000-0000-0000-000000000001", "name": "aarav"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    student = data[0]
    assert student["student_id"] == "STD-001"
    assert student["full_name"] == "Aarav Sharma"
    assert student["school_name"] == "St. Xavier School"

    # Privacy verification: sensitive fields must NOT be in JSON payload
    assert "parent_phone" not in student
    assert "parent_email" not in student
    assert "date_of_birth" not in student


def test_search_students_empty_query(client, mock_search_db):
    """Test searching with empty query returns all students in that school."""
    response = client.get(
        "/public/students",
        params={"school_id": "c0000000-0000-0000-0000-000000000001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

import pytest
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import get_settings
from app.core.security import hash_otp, create_access_token
from app.core.supabase import DatabaseService, get_db_service
from app.services.msg91_service import MSG91Service, get_msg91_service


class MockAuthDatabaseService(DatabaseService):
    """In-memory database fixture for OTP and security authentication testing."""

    def __init__(self):
        self.students = {
            "STD-001": {
                "id": "d0000000-0000-0000-0000-000000000001",
                "student_id": "STD-001",
                "full_name": "Aarav Sharma",
                "parent_phone": "+919876543210",
                "parent_email": "rajesh.sharma@example.com",
            },
            "STD-002": {
                "id": "d0000000-0000-0000-0000-000000000002",
                "student_id": "STD-002",
                "full_name": "Ananya Patel",
                "parent_phone": "09812345678",
                "parent_email": None,
            },
        }
        self.otp_requests: List[Dict] = []
        self.next_otp_id = 1

    def get_student_parent_contact(self, student_id: str) -> Optional[Dict]:
        return self.students.get(student_id)

    def count_recent_otp_requests(self, contact: str, since_iso: str) -> int:
        since_dt = datetime.fromisoformat(since_iso)
        count = 0
        for req in self.otp_requests:
            if req["contact"] == contact:
                created_dt = req["created_at"]
                if created_dt >= since_dt:
                    count += 1
        return count

    def create_otp_request(
        self, student_id: str, contact: str, hashed_otp: str, expires_at_iso: str
    ) -> Dict:
        record = {
            "id": f"otp-uuid-{self.next_otp_id}",
            "student_id": student_id,
            "contact": contact,
            "otp_code": hashed_otp,
            "expires_at": expires_at_iso,
            "verified": False,
            "attempt_count": 0,
            "created_at": datetime.now(timezone.utc),
        }
        self.next_otp_id += 1
        self.otp_requests.append(record)
        return record

    def get_latest_active_otp_request(
        self, student_id: str, contact: str
    ) -> Optional[Dict]:
        matches = [
            r
            for r in self.otp_requests
            if r["student_id"] == student_id
            and r["contact"] == contact
            and not r["verified"]
        ]
        if matches:
            return matches[-1]
        return None

    def increment_otp_attempts(self, otp_id: str, current_count: int) -> int:
        for r in self.otp_requests:
            if r["id"] == otp_id:
                r["attempt_count"] = current_count + 1
                return r["attempt_count"]
        return current_count + 1

    def mark_otp_verified(self, otp_id: str) -> bool:
        for r in self.otp_requests:
            if r["id"] == otp_id:
                r["verified"] = True
                return True
        return False


class MockMSG91Service(MSG91Service):
    """Mock MSG91 dispatcher recording sent messages without external HTTP calls."""

    def __init__(self):
        super().__init__()
        self.sent_dispatches: List[Dict] = []

    async def send_otp(self, contact: str, otp_code: str) -> bool:
        self.sent_dispatches.append({"contact": contact, "otp_code": otp_code})
        return True


@pytest.fixture
def mock_auth_db():
    mock_db = MockAuthDatabaseService()
    app.dependency_overrides[get_db_service] = lambda: mock_db
    yield mock_db
    app.dependency_overrides.clear()


@pytest.fixture
def mock_msg91():
    mock_msg = MockMSG91Service()
    app.dependency_overrides[get_msg91_service] = lambda: mock_msg
    yield mock_msg


@pytest.fixture
def client():
    return TestClient(app)


# ============================================================================
# 1. OTP REQUEST TESTS
# ============================================================================

def test_otp_request_success(client, mock_auth_db, mock_msg91):
    """Test OTP request for registered student with matching phone number."""
    response = client.post(
        "/auth/otp/request",
        json={"student_id": "STD-001", "contact": "+919876543210"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "OTP has been sent" in data["message"]

    # Verify that an OTP was stored (hashed) and dispatched
    assert len(mock_auth_db.otp_requests) == 1
    otp_record = mock_auth_db.otp_requests[0]
    assert otp_record["student_id"] == "STD-001"
    assert otp_record["contact"] == "+919876543210"
    assert otp_record["otp_code"].startswith("$2b$") # bcrypt hashed
    assert len(mock_msg91.sent_dispatches) == 1


def test_otp_request_email_success(client, mock_auth_db, mock_msg91):
    """Test OTP request matching parent email."""
    response = client.post(
        "/auth/otp/request",
        json={"student_id": "STD-001", "contact": "rajesh.sharma@example.com"},
    )
    assert response.status_code == 200
    assert len(mock_auth_db.otp_requests) == 1


def test_otp_request_anti_enumeration_unknown_student(client, mock_auth_db, mock_msg91):
    """
    Test requesting OTP for non-existent student returns identical generic message
    without leaking student non-existence.
    """
    response = client.post(
        "/auth/otp/request",
        json={"student_id": "UNKNOWN-999", "contact": "+919876543210"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "OTP has been sent" in data["message"]
    # No OTP should be stored or dispatched
    assert len(mock_auth_db.otp_requests) == 0
    assert len(mock_msg91.sent_dispatches) == 0


def test_otp_request_anti_enumeration_mismatched_contact(client, mock_auth_db, mock_msg91):
    """
    Test requesting OTP for valid student with WRONG contact returns identical message.
    """
    response = client.post(
        "/auth/otp/request",
        json={"student_id": "STD-001", "contact": "+919999999999"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "OTP has been sent" in data["message"]
    assert len(mock_auth_db.otp_requests) == 0
    assert len(mock_msg91.sent_dispatches) == 0


def test_otp_request_rate_limiting(client, mock_auth_db, mock_msg91):
    """Test rate limiting: 4th request within 15 minutes triggers HTTP 429."""
    contact = "+919876543210"
    for _ in range(3):
        res = client.post(
            "/auth/otp/request",
            json={"student_id": "STD-001", "contact": contact},
        )
        assert res.status_code == 200

    # 4th request must be rejected with 429
    res_4th = client.post(
        "/auth/otp/request",
        json={"student_id": "STD-001", "contact": contact},
    )
    assert res_4th.status_code == 429
    assert "Too many OTP requests" in res_4th.json()["detail"]


# ============================================================================
# 2. OTP VERIFICATION & JWT TOKEN TESTS
# ============================================================================

def test_otp_verify_success(client, mock_auth_db, mock_msg91):
    """Test successful OTP verification returns scoped JWT token."""
    # 1. Request OTP
    client.post(
        "/auth/otp/request",
        json={"student_id": "STD-001", "contact": "+919876543210"},
    )
    sent_otp = mock_msg91.sent_dispatches[0]["otp_code"]

    # 2. Verify with correct OTP
    res = client.post(
        "/auth/otp/verify",
        json={
            "student_id": "STD-001",
            "contact": "+919876543210",
            "otp_code": sent_otp,
        },
    )
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["student_id"] == "STD-001"
    assert token_data["expires_in_seconds"] == 1800 # 30 min default

    # Verify OTP is marked verified in DB
    assert mock_auth_db.otp_requests[0]["verified"] is True


def test_otp_verify_invalid_code_increments_attempt(client, mock_auth_db, mock_msg91):
    """Test verification with incorrect code returns 400 and increments attempt count."""
    client.post(
        "/auth/otp/request",
        json={"student_id": "STD-001", "contact": "+919876543210"},
    )

    res = client.post(
        "/auth/otp/verify",
        json={
            "student_id": "STD-001",
            "contact": "+919876543210",
            "otp_code": "000000", # Wrong code
        },
    )
    assert res.status_code == 400
    assert "Invalid or expired OTP" in res.json()["detail"]
    assert mock_auth_db.otp_requests[0]["attempt_count"] == 1


def test_otp_verify_lockout_after_5_attempts(client, mock_auth_db, mock_msg91):
    """Test OTP lockout after 5 failed attempts rejects subsequent checks."""
    client.post(
        "/auth/otp/request",
        json={"student_id": "STD-001", "contact": "+919876543210"},
    )
    correct_otp = mock_msg91.sent_dispatches[0]["otp_code"]

    # Fail 5 times
    for _ in range(5):
        res = client.post(
            "/auth/otp/verify",
            json={
                "student_id": "STD-001",
                "contact": "+919876543210",
                "otp_code": "111111",
            },
        )
        assert res.status_code == 400

    assert mock_auth_db.otp_requests[0]["attempt_count"] >= 5

    # 6th attempt with CORRECT OTP must still be rejected due to lockout
    res_locked = client.post(
        "/auth/otp/verify",
        json={
            "student_id": "STD-001",
            "contact": "+919876543210",
            "otp_code": correct_otp,
        },
    )
    assert res_locked.status_code == 400
    assert "Invalid or expired OTP" in res_locked.json()["detail"]


def test_otp_verify_expired_otp(client, mock_auth_db, mock_msg91):
    """Test expired OTP is rejected."""
    # Insert an expired OTP manually
    expired_time = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()
    mock_auth_db.create_otp_request(
        student_id="STD-001",
        contact="+919876543210",
        hashed_otp=hash_otp("123456"),
        expires_at_iso=expired_time,
    )

    res = client.post(
        "/auth/otp/verify",
        json={
            "student_id": "STD-001",
            "contact": "+919876543210",
            "otp_code": "123456",
        },
    )
    assert res.status_code == 400
    assert "Invalid or expired OTP" in res.json()["detail"]


# ============================================================================
# 3. DATA ISOLATION & JWT ACCESS CONTROL TESTS
# ============================================================================

def test_protected_endpoint_without_token(client):
    """Test accessing protected student endpoint without Bearer token returns 401."""
    res = client.get("/student/access-check")
    assert res.status_code == 401
    assert "Authentication required" in res.json()["detail"]


def test_protected_endpoint_with_invalid_token(client):
    """Test accessing protected endpoint with forged/tampered token returns 401."""
    headers = {"Authorization": "Bearer fake.tampered.token"}
    res = client.get("/student/access-check", headers=headers)
    assert res.status_code == 401
    assert "Invalid authentication token" in res.json()["detail"]


def test_protected_endpoint_with_valid_jwt(client):
    """Test accessing protected endpoint with valid JWT returns student claims."""
    token = create_access_token(
        student_id="STD-2026-001", contact="+919876543210"
    )
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/student/access-check", headers=headers)
    assert res.status_code == 200
    claims = res.json()
    assert claims["student_id"] == "STD-2026-001"
    assert claims["contact"] == "+919876543210"
    assert claims["sub"] == "STD-2026-001"


def test_protected_endpoint_with_expired_jwt(client):
    """Test accessing protected endpoint with expired JWT returns 401."""
    token = create_access_token(
        student_id="STD-001",
        contact="+919876543210",
        expires_delta=timedelta(seconds=-10), # Expired 10s ago
    )
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/student/access-check", headers=headers)
    assert res.status_code == 401
    assert "expired" in res.json()["detail"].lower()

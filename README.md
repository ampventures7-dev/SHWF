# Student Health Report Card Platform - Phase 1 & Phase 2 Backend

A secure, high-performance backend platform for NGO school health camps built with **FastAPI**, **Supabase (PostgreSQL)**, **Pydantic v2**, **Bcrypt**, **PyJWT**, and **MSG91**.

---

## 📌 Architecture & Scope

The Student Health Report Card Platform consists of 5 modular phases:
1. **Phase 1: Admin & Health Camp Data Ingestion (Implemented)** — Hierarchical relational schema, CSV template download, async streaming upload, Pydantic validation, duplicate checks, and resilient 500-record batch insertion.
2. **Phase 2: Parent Search & Secure Access Control (Implemented)** — Cascading discovery (State &rarr; District &rarr; School &rarr; Student) with strict non-sensitive field filtering, anti-enumeration bcrypt-hashed OTP verification via MSG91, sliding rate limits, attempt lockout, and JWT-isolated student data access control.
3. **Phase 3: Local ML Prediction Engine (Upcoming)** — WHO Z-score calculations and Scikit-Learn Random Forest risk predictions with explainability (SHAP).
4. **Phase 4: Dynamic PDF Report Card Generation (Upcoming)** — HTML/Jinja2 + WeasyPrint generating 2-page branded report cards uploaded to Supabase Storage.
5. **Phase 5: Automated WhatsApp Delivery Pipeline (Upcoming)** — n8n webhook workflow triggering Meta WhatsApp Cloud API for direct delivery to parents.

---

## 🗄️ Relational Database Schema

The database schema enforces a strict hierarchy: **State > District > School > Student > OTP Requests**.

```
states (id, name)
   │
   └── districts (id, state_id, name)
         │
         └── schools (id, district_id, name, school_code [UNIQUE])
               │
               └── students (id, school_id, student_id, full_name, date_of_birth, gender,
                             parent_name, parent_phone, parent_email, created_at)
                   [UNIQUE(school_id, student_id)]

otp_requests (id, student_id, contact, otp_code [bcrypt hash], expires_at, verified, attempt_count, created_at)
```

### Key Schema Characteristics:
- **Zero-Knowledge OTP Storage**: `otp_code` is strictly stored as a bcrypt hash. Plaintext OTPs are NEVER written to the database or logged in application logs.
- **Phone Number Preservation**: `parent_phone` is stored as `TEXT` to preserve leading zeros (`098...`) and international country codes (`+91...`).
- **Composite Uniqueness**: Composite unique constraint on `(school_id, student_id)` ensures student IDs are unique per school.
- **Performance Indexes**: Indexes on `(student_id, contact, created_at DESC)`, `(contact, created_at DESC)`, `school_id`, `student_id`, and `school_code`.
- **Scheduled Cleanup Concept**: Expired OTP rows can be pruned via scheduled cron:
  ```sql
  DELETE FROM otp_requests WHERE expires_at < now() - INTERVAL '24 hours';
  ```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Python 3.10+ (Tested with Python 3.14)
- A Supabase Project (Cloud or Local)
- MSG91 Account (for live SMS dispatch; local stub mode is automatically enabled if credentials are not set)

### 2. Navigate to Backend & Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Apply Supabase Database Schema
1. Open your [Supabase Project Dashboard](https://app.supabase.com).
2. Navigate to the **SQL Editor**.
3. Copy and run the contents of [`backend/sql/schema.sql`](./backend/sql/schema.sql).
4. *(Optional for testing)* Copy and run [`backend/sql/seed.sql`](./backend/sql/seed.sql) to populate sample States, Districts, Schools, and Students (`STD-2026-001`, `STD-2026-002`, `STD-2026-003`).

### 4. Configure Environment Variables
Inside the `backend/` directory, copy `.env.example` to `.env` and configure your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Supabase Configuration
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_KEY=<your-supabase-service-role-or-anon-key>

# Application Settings
APP_ENV=development
DEBUG=True
PORT=8001
BATCH_SIZE=500

# Phase 2: JWT Security & Data Isolation
JWT_SECRET=change-this-to-a-very-secure-random-32-character-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=30

# Phase 2: OTP Verification & Rate Limiting Rules
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RATE_LIMIT_MAX_REQUESTS=3
OTP_RATE_LIMIT_WINDOW_MINUTES=15

# Phase 2: MSG91 SMS Provider Credentials
MSG91_AUTH_KEY=your_msg91_auth_key_here
MSG91_SENDER_ID=SHWFPL
MSG91_TEMPLATE_ID=your_msg91_dlt_template_id_here
```

---

## 🏃 Running the Application Locally

Navigate into the `backend/` folder and start the FastAPI development server:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

- **Interactive Swagger Documentation**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **ReDoc Documentation**: [http://localhost:8001/redoc](http://localhost:8001/redoc)
- **Health Check Endpoint**: [http://localhost:8001/health](http://localhost:8001/health)

---

## 📋 API Endpoints Reference

### 🌐 1. Public Cascading Discovery (No Auth Required)
Public browsing endpoints return **only non-sensitive fields** (`student_id`, `full_name`, `school_name`). Dates of birth, parent contacts, and health data are withheld.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/public/states` | `GET` | List all states |
| `/public/districts?state_id=...` | `GET` | List districts belonging to a state |
| `/public/schools?district_id=...` | `GET` | List schools belonging to a district |
| `/public/students?school_id=...&name=...` | `GET` | Search students within a school by partial case-insensitive name match |

#### Example Response: `GET /public/students?school_id=...&name=Aarav`
```json
[
  {
    "id": "d0000000-0000-0000-0000-000000000001",
    "student_id": "STD-2026-001",
    "full_name": "Aarav Sharma",
    "school_id": "c0000000-0000-0000-0000-000000000001",
    "school_name": "St. Xavier Public School"
  }
]
```

---

### 🔐 2. Parent OTP Authentication

#### A. Request OTP (`POST /auth/otp/request`)
- **Body**:
  ```json
  {
    "student_id": "STD-2026-001",
    "contact": "+919876543210"
  }
  ```
- **Security Features**:
  1. **Anti-Enumeration Defense**: Returns identical generic confirmation message whether the student exists or the contact matches, preventing phone enumeration.
  2. **Timing Equalization**: Executes a dummy bcrypt check when no student match is found to eliminate timing side-channels.
  3. **Rate Limiting**: Sliding window allows max 3 OTP requests per contact per 15 minutes (`HTTP 429` if exceeded).
  4. **Plaintext Protection**: Generated 6-digit OTP is bcrypt-hashed before database storage and dispatched via MSG91. Plaintext OTP is never logged.

#### B. Verify OTP (`POST /auth/otp/verify`)
- **Body**:
  ```json
  {
    "student_id": "STD-2026-001",
    "contact": "+919876543210",
    "otp_code": "123456"
  }
  ```
- **Security Features**:
  1. **Attempt Lockout**: Tracks `attempt_count`. After 5 failed attempts, the OTP record is locked out permanently.
  2. **Expiration Enforcement**: Rejects OTPs older than 5 minutes.
  3. **One-Time Consumption**: Successfully verified OTPs are marked `verified=true` and cannot be reused.
  4. **JWT Token Issuance**: On success, returns a signed 30-minute JWT bearer token containing `student_id` and `contact` claims.

#### Example Token Response (`200 OK`):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in_seconds": 1800,
  "student_id": "STD-2026-001"
}
```

---

### 🛡️ 3. Data Isolation Middleware (`get_verified_student`)

All medical and protected endpoints in later phases depend on the `get_verified_student` dependency:

```python
@router.get("/medical-records")
async def get_records(claims: VerifiedStudentClaims = Depends(get_verified_student)):
    # Database query strictly uses claims.student_id from the verified JWT
    # Client cannot manipulate URLs or query params to view another student's data
    return fetch_student_medical_records(claims.student_id)
```

- **Demonstration Endpoint**: `GET /student/access-check`
  - Requires header: `Authorization: Bearer <access_token>`
  - Returns decoded verified claims.

---

### 📥 4. Admin CSV Ingestion (Phase 1)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/admin/students/template` | `GET` | Download standard CSV upload template |
| `/admin/students/upload` | `POST` | Asynchronous multipart CSV bulk upload (500-record batch chunking, Pydantic validation) |

---

## 🧪 Running Automated Tests

Run the complete test suite (65 unit & integration tests across all phases) with `pytest` inside the `backend/` directory:

```bash
cd backend
python -m pytest tests/ -v
```

### Test Coverage Summary:
- **`tests/test_public_search.py`**: State, district, school listing, student partial name queries, and strict non-sensitive field privacy assertions.
- **`tests/test_auth_otp.py`**: OTP generation, anti-enumeration behavior, contact validation, 15-min rate limiting (429), attempt lockout (5 tries), OTP expiration, JWT signature verification, expired token rejection, and data isolation dependency.
- **`tests/test_upload.py`**: CSV validation, header missing checks, date formats, phone number zero preservation, duplicate checks, and batch insertion resilience.

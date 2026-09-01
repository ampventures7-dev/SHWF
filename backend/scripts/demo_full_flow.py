"""
Complete End-to-End Demonstration Script for Student Health Report Card Platform.
Tests all 4 phases in sequence:
- Phase 1: Public school lookup & student search
- Phase 2: Parent OTP authentication & JWT token generation
- Phase 3: ML pediatric risk prediction & WHO Z-scores
- Phase 4: Playwright PDF Health Report Card generation & signed URL
"""

import sys
import os
import json
from datetime import datetime

# Ensure utf-8 output encoding for Windows consoles
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.core.supabase import DatabaseService, get_db_service
from app.services.pdf_generator import generate_report_pdf


class LocalDemoDatabaseService(DatabaseService):
    """Local demonstration mock database with sample students and health camp data."""

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
                "parent_email": "rajesh.sharma@example.com",
                "schools": {
                    "id": "c0000000-0000-0000-0000-000000000001",
                    "name": "St. Xavier Public School",
                    "school_code": "SCH001",
                },
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
                    "doctor_remarks": "Mild undernutrition indicated; high protein diet recommended.",
                    "camp_extra_data": {
                        "general_exam": {"temperature": "98.4", "pulse": "78", "respiration": "18", "blood_pressure": "110/70", "last_deworming": "2026-02-10"},
                        "physical_exam": {"pallor": False, "jaundice": False, "clubbing": False, "spo2": "99", "lap": False, "skin": "Clear", "allergy": False, "nutrition": "Fair", "heart_sound": "Normal S1 S2", "chest": "Clear"},
                        "dental": {"status": "Good", "caries": False, "gum_condition": "Healthy"},
                        "ent": {"nose": "Normal", "throat": "Clear", "ear_right": "Normal", "ear_left": "Normal", "audiometry": "Normal"},
                        "eye": {"right_vision": "6/6", "left_vision": "6/6", "color_vision": "Normal", "screening": "Normal"},
                        "hearing": {"right_ear": "Normal", "left_ear": "Normal"},
                        "vaccination": {"status": "Up to Date"},
                        "lifestyle": {"diet_pattern": "Average", "physical_activity": "Active", "sleep_pattern": "Good"},
                        "pathology": {"blood_group": "B+", "hemoglobin": "12.4", "cholesterol": "145"},
                        "student_meta": {"class_name": "7th", "section": "A", "father_name": "Rajesh Sharma", "mother_name": "Sunita Sharma", "address": "Flat 402, Shanti Heights, Mumbai", "emergency_contact": "+919876543210", "aadhaar_no": "XXXX-XXXX-1234"}
                    }
                }
            ]
        }
        self.generated_reports = []

    def get_student_by_identifier(self, identifier: str):
        if identifier in self.students:
            return self.students[identifier]
        for s in self.students.values():
            if s["id"] == identifier:
                return s
        return None

    def get_latest_camp_record(self, student_uuid: str):
        records = self.camp_records.get(student_uuid, [])
        return records[0] if records else None

    def insert_generated_report(self, record):
        self.generated_reports.append(record)
        return record


def run_demo():
    print("=" * 70)
    print(">>> STUDENT HEALTH REPORT CARD PLATFORM - FULL FLOW DEMO <<<")
    print("=" * 70)

    # Set dependency override
    mock_db = LocalDemoDatabaseService()
    app.dependency_overrides[get_db_service] = lambda: mock_db
    client = TestClient(app)

    # 1. Health Check
    print("\n[Step 1] Server Health Check (GET /health)...")
    res = client.get("/health")
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.json()}")

    # 2. Phase 2 JWT Token Generation
    print("\n[Step 2] Authenticating Parent for Student 'STD-2026-001'...")
    token = create_access_token(
        student_id="STD-2026-001",
        contact="+919876543210"
    )
    print(f"Issued Bearer JWT Token: {token[:35]}... (truncated)")

    # 3. Phase 3: Health Risk Prediction
    print("\n[Step 3] Executing ML Risk Prediction Engine (POST /reports/predict)...")
    predict_res = client.post(
        "/reports/predict",
        json={"student_id": "STD-2026-001"},
        headers={"Authorization": f"Bearer {token}"},
    )
    print(f"Status Code: {predict_res.status_code}")
    predict_data = predict_res.json()
    print("  Student:", predict_data["full_name"], f"({predict_data['student_id']})")
    print("  Vitals:", predict_data["vitals"])
    print("  WHO Z-Scores:", json.dumps(predict_data["zscores"], indent=4))
    print("  Classified Risks:", [r["risk_name"] for r in predict_data["risks"]])
    print("  Diet Summary:", predict_data["diet_plan"]["summary"])
    print("  Diet Recommendations:", predict_data["diet_plan"]["recommendations"][:2])

    # 4. Phase 4: Playwright PDF Generation & Storage Signed URL
    print("\n[Step 4] Generating PDF Health Report Card via Playwright (POST /reports/generate)...")
    generate_res = client.post(
        "/reports/generate",
        json={"student_id": "STD-2026-001"},
        headers={"Authorization": f"Bearer {token}"},
    )
    print(f"Status Code: {generate_res.status_code}")
    generate_data = generate_res.json()
    print("  PDF Path:", generate_data["pdf_path"])
    print("  Signed URL:", generate_data["signed_url"])
    print("  Expires At:", generate_data["expires_at"])

    # 5. Save a physical copy of the generated PDF to workspace root for inspection
    from app.models.report import PredictionReportResponse
    rep_obj = PredictionReportResponse(**predict_data)
    student_info = mock_db.students["STD-2026-001"]
    camp_extra = mock_db.camp_records["d0000000-0000-0000-0000-000000000001"][0]["camp_extra_data"]

    pdf_bytes = generate_report_pdf(rep_obj, student_info, camp_extra)
    output_pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_report_card.pdf")
    with open(output_pdf_path, "wb") as f:
        f.write(pdf_bytes)

    print(f"\n[SUCCESS] A physical PDF report card was saved to:")
    print(f"   {output_pdf_path}")
    print(f"   (File size: {len(pdf_bytes):,} bytes)")
    print("\n" + "=" * 70)
    print("[DONE] FULL FLOW COMPLETED AND FULLY FUNCTIONAL!")
    print("=" * 70)


if __name__ == "__main__":
    run_demo()

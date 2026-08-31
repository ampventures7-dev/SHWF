import pytest
from app.models.report import (
    PredictionReportResponse,
    VitalsData,
    ZScoreResult,
    HealthRisk,
    DietPlanResponse,
    ExplainabilityItem,
)
from app.services.pdf_generator import (
    prepare_template_context,
    render_report_html,
    generate_report_pdf_async,
)


@pytest.fixture
def sample_prediction_report():
    return PredictionReportResponse(
        student_id="STD-2026-001",
        full_name="Aarav Sharma",
        school_id="c0000000-0000-0000-0000-000000000001",
        school_name="St. Xavier Public School",
        camp_record_id="e0000000-0000-0000-0000-000000000001",
        recorded_at="2026-08-15T09:30:00+00:00",
        vitals=VitalsData(
            height_cm=138.5,
            weight_kg=31.0,
            bmi=16.16,
            age_months=122,
            gender="M",
            recorded_at="2026-08-15T09:30:00+00:00",
            doctor_remarks="Mild undernutrition indicated; recommended high protein diet.",
        ),
        zscores=ZScoreResult(
            height_for_age_z=-0.45,
            weight_for_age_z=None,
            bmi_for_age_z=-0.82,
        ),
        risks=[
            HealthRisk(risk_name="normal_growth", severity="low", probability=0.95),
        ],
        diet_plan=DietPlanResponse(
            summary="Balanced dietary pattern recommended.",
            categories=["Balanced Growth"],
            recommendations=["Include daily whole pulses and milk."],
            focus_nutrients=["Protein", "Calcium"],
        ),
        explanations=[
            ExplainabilityItem(
                metric="height_for_age_z",
                value=-0.45,
                status="normal_height",
                threshold="HAZ >= -2.0",
                explanation="Height is within standard growth milestones.",
            )
        ],
    )


@pytest.fixture
def sample_student_info():
    return {
        "id": "d0000000-0000-0000-0000-000000000001",
        "student_id": "STD-2026-001",
        "full_name": "Aarav Sharma",
        "date_of_birth": "2014-06-15",
        "gender": "M",
        "parent_name": "Rajesh Sharma",
        "parent_phone": "+919876543210",
        "schools": {"name": "St. Xavier Public School"},
    }


def test_prepare_template_context(sample_prediction_report, sample_student_info):
    """Test data formatting and flag mapping for Jinja2 template context."""
    context = prepare_template_context(
        report_data=sample_prediction_report,
        student_info=sample_student_info,
        extra_data={},
    )

    assert context["student"]["full_name"] == "Aarav Sharma"
    assert context["student"]["student_id"] == "STD-2026-001"
    assert context["vitals"]["height_cm"] == 138.5
    assert context["status_flags"]["normal"] is True
    assert context["status_flags"]["specialist"] is False


def test_render_report_html(sample_prediction_report, sample_student_info):
    """Test HTML generation containing all necessary medical report card sections."""
    html = render_report_html(
        report_data=sample_prediction_report,
        student_info=sample_student_info,
        extra_data={},
    )

    assert "<!DOCTYPE html>" in html
    assert "Student Complete Health Check-Up Report" in html
    assert "Smart" in html and "Health" in html
    assert "Aarav Sharma" in html
    assert "STD-2026-001" in html
    assert "Physical Examination" in html
    assert "General Examination" in html
    assert "Eye Examination" in html
    assert "Hearing Screening" in html
    assert "Dietitian Recommendation" in html
    assert "Pathology Test Report" in html
    assert "www.smarthealthyindia.com" in html


@pytest.mark.asyncio
async def test_generate_report_pdf_async(sample_prediction_report, sample_student_info):
    """Test end-to-end PDF byte generation using Playwright."""
    pdf_bytes = await generate_report_pdf_async(
        report_data=sample_prediction_report,
        student_info=sample_student_info,
        extra_data={},
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    # Standard PDF header magic bytes
    assert pdf_bytes.startswith(b"%PDF-")

import os
import logging
from typing import Dict, Optional, Any
from jinja2 import Environment, FileSystemLoader, select_autoescape
from playwright.async_api import async_playwright
from playwright.sync_api import sync_playwright

from app.models.report import PredictionReportResponse

logger = logging.getLogger(__name__)

TEMPLATES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates"
)

_jinja_env: Optional[Environment] = None


def get_jinja_env() -> Environment:
    """Initialize and return Jinja2 environment configured for report templates."""
    global _jinja_env
    if _jinja_env is None:
        if not os.path.exists(TEMPLATES_DIR):
            raise FileNotFoundError(f"Templates directory not found at: {TEMPLATES_DIR}")
        _jinja_env = Environment(
            loader=FileSystemLoader(TEMPLATES_DIR),
            autoescape=select_autoescape(["html", "xml"]),
        )
    return _jinja_env


def prepare_template_context(
    report_data: PredictionReportResponse,
    student_info: Dict[str, Any],
    extra_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Format, normalize, and map all report card data and dynamic flags from
    Phase 3 risk analysis into the Jinja2 template context.
    """
    extra = extra_data or {}
    general_exam = extra.get("general_exam", {})
    physical_exam = extra.get("physical_exam", {})
    dental_exam = extra.get("dental", {})
    ent_exam = extra.get("ent", {})
    eye_exam = extra.get("eye", {})
    hearing_exam = extra.get("hearing", {})
    vaccination_info = extra.get("vaccination", {})
    lifestyle_info = extra.get("lifestyle", {})
    pathology_info = extra.get("pathology", {})
    student_meta = extra.get("student_meta", {})

    # Extract risk names and severities
    risk_names = [r.risk_name for r in report_data.risks]
    severities = [r.severity.lower() for r in report_data.risks]

    # Map Dietitian Recommendations checkboxes based on Phase 3 risks
    has_stunting = any(r in ("stunting_risk", "severe_stunting") for r in risk_names)
    has_underweight = any(r in ("underweight_risk", "severe_underweight") for r in risk_names)
    has_thinness = any(r in ("thinness_risk", "severe_thinness") for r in risk_names)
    has_overweight = any(r in ("overweight_risk", "obesity_risk") for r in risk_names)

    diet_high_protein = has_stunting or has_thinness
    diet_iron_rich = has_underweight or physical_exam.get("pallor", False)
    diet_calcium_rich = has_stunting
    diet_weight_gain = has_underweight or has_thinness
    diet_weight_management = has_overweight
    diet_others = not (diet_high_protein or diet_iron_rich or diet_calcium_rich or diet_weight_gain or diet_weight_management)

    diet_flags = {
        "high_protein": diet_high_protein,
        "iron_rich": diet_iron_rich,
        "calcium_rich": diet_calcium_rich,
        "weight_gain": diet_weight_gain,
        "weight_management": diet_weight_management,
        "others": diet_others,
        "others_text": "Balanced Maintenance Nutrition" if diet_others else "N/A",
    }

    # Map Overall Health Status based on highest severity
    status_flags = {
        "normal": False,
        "minor": False,
        "needs_followup": False,
        "specialist": False,
    }

    if "critical" in severities:
        status_flags["specialist"] = True
    elif "high" in severities:
        status_flags["needs_followup"] = True
    elif "moderate" in severities:
        status_flags["minor"] = True
    else:
        status_flags["normal"] = True

    # Format advice lines from Phase 3 explanations
    advice_lines = [exp.explanation for exp in report_data.explanations if exp.status not in ("normal_height", "normal_weight", "normal_bmi")]
    if not advice_lines and report_data.diet_plan.recommendations:
        advice_lines = report_data.diet_plan.recommendations[:2]

    advice_line1 = advice_lines[0] if len(advice_lines) > 0 else "Maintain daily balanced diet with dairy, pulses, and vegetables."
    advice_line2 = advice_lines[1] if len(advice_lines) > 1 else "Continue routine physical activities and regular health follow-up."

    # Format student data
    age_yrs = report_data.vitals.age_months // 12
    age_mos = report_data.vitals.age_months % 12
    age_display = f"{age_yrs} Yrs {age_mos} M" if age_yrs > 0 else f"{age_mos} Months"

    merged_student = {
        "school_name": report_data.school_name or student_info.get("schools", {}).get("name") if isinstance(student_info.get("schools"), dict) else student_info.get("school_name", "N/A"),
        "full_name": report_data.full_name or student_info.get("full_name", "N/A"),
        "student_id": report_data.student_id or student_info.get("student_id", "N/A"),
        "date_of_birth": student_info.get("date_of_birth", "N/A"),
        "gender": report_data.vitals.gender or student_info.get("gender", "M"),
        "father_name": student_meta.get("father_name") or student_info.get("parent_name", "N/A"),
        "mother_name": student_meta.get("mother_name", "N/A"),
        "class_name": student_meta.get("class_name", "N/A"),
        "section": student_meta.get("section", "N/A"),
        "address": student_meta.get("address", "N/A"),
        "parent_phone": student_info.get("parent_phone", "N/A"),
        "emergency_contact": student_meta.get("emergency_contact") or student_info.get("parent_phone", "N/A"),
        "aadhaar_no": student_meta.get("aadhaar_no", "N/A"),
        "age_display": age_display,
    }

    recorded_date = report_data.recorded_at[:10] if report_data.recorded_at else "N/A"

    # Allow explicit overrides from form if provided by Admin
    if extra.get("diet_flags"):
        diet_flags.update(extra.get("diet_flags"))
    if extra.get("status_flags"):
        status_flags.update(extra.get("status_flags"))

    doctor_info = extra.get("doctor_info", {})
    doctor_name = doctor_info.get("doctor_name") or "Dr. A. Sharma (MBBS, DCH)"
    exam_date = doctor_info.get("exam_date") or recorded_date

    return {
        "student": merged_student,
        "vitals": report_data.vitals.model_dump(),
        "zscores": report_data.zscores.model_dump(),
        "risks": [r.model_dump() for r in report_data.risks],
        "diet_plan": report_data.diet_plan.model_dump(),
        "explanations": [e.model_dump() for e in report_data.explanations],
        "physical": physical_exam,
        "general": general_exam,
        "dental": dental_exam,
        "ent": ent_exam,
        "eye": eye_exam,
        "hearing": hearing_exam,
        "vaccination": vaccination_info,
        "lifestyle": lifestyle_info,
        "pathology": pathology_info,
        "diet_flags": diet_flags,
        "status_flags": status_flags,
        "dietitian_advice_line1": extra.get("dietitian_advice_line1") or advice_line1,
        "dietitian_advice_line2": extra.get("dietitian_advice_line2") or advice_line2,
        "doctor_remarks": report_data.vitals.doctor_remarks or "No active specialist referral required at this stage.",
        "clinical_opinion_line1": extra.get("clinical_opinion_line1") or "Overall physical growth parameters and nutritional vitals evaluated against WHO standards.",
        "clinical_opinion_line2": extra.get("clinical_opinion_line2") or "Adhere to the recommended dietary modifications and hydration guidelines.",
        "doctor_name": doctor_name,
        "recorded_date": exam_date,
    }


def render_report_html(
    report_data: PredictionReportResponse,
    student_info: Dict[str, Any],
    extra_data: Optional[Dict[str, Any]] = None,
) -> str:
    """Render the Jinja2 HTML report template with student and clinical data."""
    try:
        env = get_jinja_env()
        template = env.get_template("report_card.html")
        context = prepare_template_context(report_data, student_info, extra_data)
        return template.render(**context)
    except Exception as e:
        logger.error(f"Error rendering report card template: {str(e)}")
        raise RuntimeError(f"Report card template rendering failed: {str(e)}") from e


async def generate_report_pdf_async(
    report_data: PredictionReportResponse,
    student_info: Dict[str, Any],
    extra_data: Optional[Dict[str, Any]] = None,
) -> bytes:
    """
    Asynchronously generate in-memory PDF report card bytes via Playwright Chromium.
    Does NOT write files to local disk, ensuring stateless serverless execution.
    """
    html_content = render_report_html(report_data, student_info, extra_data)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
            )
            page = await browser.new_page()
            await page.set_content(html_content, wait_until="load")
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"},
            )
            await browser.close()
            if pdf_bytes and len(pdf_bytes) > 1000:
                return pdf_bytes
    except Exception as e:
        logger.warning(f"Async Playwright PDF generation issue: {str(e)}. Retrying via sync runner...")

    # Fallback to sync playwright in executor thread
    import asyncio
    return await asyncio.to_thread(generate_report_pdf, report_data, student_info, extra_data)


def generate_report_pdf(
    report_data: PredictionReportResponse,
    student_info: Dict[str, Any],
    extra_data: Optional[Dict[str, Any]] = None,
) -> bytes:
    """
    Synchronous interface for Playwright in-memory PDF report card generation.
    """
    html_content = render_report_html(report_data, student_info, extra_data)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
        )
        page = browser.new_page()
        page.set_content(html_content, wait_until="load")
        pdf_bytes = page.pdf(
            format="A4",
            print_background=True,
            margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"},
        )
        browser.close()
        return pdf_bytes

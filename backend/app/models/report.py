from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class PredictReportRequest(BaseModel):
    """Request body payload for triggering ML health risk prediction for a student."""
    student_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Unique student identifier (must match authenticated JWT claim)"
    )
    camp_record_id: Optional[str] = Field(
        default=None,
        description="Optional UUID of a specific historical camp record. If omitted, uses latest camp."
    )

    @field_validator("student_id")
    @classmethod
    def strip_student_id(cls, v: str) -> str:
        return v.strip()


class VitalsData(BaseModel):
    """Physical anthropometric vitals and demographic attributes."""
    height_cm: float = Field(..., description="Height in centimeters")
    weight_kg: float = Field(..., description="Weight in kilograms")
    bmi: float = Field(..., description="Calculated Body Mass Index (kg/m²)")
    age_months: int = Field(..., description="Calculated age in completed months")
    gender: str = Field(..., description="Normalized gender (M/F/O)")
    recorded_at: Optional[str] = Field(default=None, description="ISO timestamp when vitals were measured")
    doctor_remarks: Optional[str] = Field(default=None, description="Clinical notes or observations from attending doctor")


class ZScoreResult(BaseModel):
    """WHO LMS standard Z-scores calculated against official WHO reference datasets."""
    height_for_age_z: float = Field(..., description="Height-for-age Z-score (HAZ)")
    weight_for_age_z: Optional[float] = Field(
        default=None,
        description="Weight-for-age Z-score (WAZ) - available for children up to 120 months / 10 years"
    )
    bmi_for_age_z: float = Field(..., description="BMI-for-age Z-score (BAZ)")


class HealthRisk(BaseModel):
    """Identified pediatric health risk, severity level, and predicted probability score."""
    risk_name: str = Field(..., description="Identifier of the risk condition (e.g., stunting_risk, thinness_risk)")
    severity: str = Field(..., description="Risk severity tier: low, moderate, high, or critical")
    probability: float = Field(..., description="Confidence / predicted probability score between 0.0 and 1.0")


class DietPlanResponse(BaseModel):
    """Consolidated, deduplicated regional Indian dietary guidance."""
    summary: str = Field(..., description="Executive dietary overview and guidance")
    categories: List[str] = Field(default_factory=list, description="Targeted health and nutritional goal categories")
    recommendations: List[str] = Field(default_factory=list, description="Actionable, culturally relevant food recommendations")
    focus_nutrients: List[str] = Field(default_factory=list, description="Priority vitamins, minerals, and macronutrients")


class ExplainabilityItem(BaseModel):
    """Explainability record explaining threshold crossings and clinical reasoning."""
    metric: str = Field(..., description="Anthropometric metric name (e.g., height_for_age_z, bmi_for_age_z)")
    value: Optional[float] = Field(default=None, description="Calculated metric value")
    status: str = Field(..., description="Clinical status or classification category")
    threshold: str = Field(..., description="WHO standard reference threshold evaluated against")
    explanation: str = Field(..., description="Human-readable clinical explanation of the prediction")


class CampHistorySummary(BaseModel):
    """Summary of a past camp examination session for timeline and growth comparisons."""
    camp_id: str = Field(..., description="UUID of the camp record")
    recorded_at: str = Field(..., description="Date/timestamp when the health camp occurred")
    height_cm: float = Field(..., description="Recorded height in cm")
    weight_kg: float = Field(..., description="Recorded weight in kg")
    bmi: float = Field(..., description="Body Mass Index in kg/m²")
    age_months: int = Field(..., description="Age in months at time of camp")
    height_for_age_z: float = Field(..., description="WHO Height-for-age Z-Score")
    weight_for_age_z: Optional[float] = Field(default=None, description="WHO Weight-for-age Z-Score")
    bmi_for_age_z: float = Field(..., description="WHO BMI-for-age Z-Score")
    doctor_remarks: Optional[str] = Field(default=None, description="Attending physician notes")
    overall_health_status: Optional[str] = Field(default="Normal / Healthy", description="General condition")


class GrowthComparison(BaseModel):
    """Comparative pediatric growth trajectory analysis between consecutive camp visits."""
    has_comparison: bool = Field(default=True, description="Whether previous comparison data is available")
    previous_camp_date: Optional[str] = Field(default=None, description="Date of comparison previous camp")
    current_camp_date: str = Field(..., description="Date of active camp")
    months_elapsed: int = Field(..., description="Months elapsed between camp sessions")
    height_change_cm: float = Field(..., description="Delta change in height (+/- cm)")
    weight_change_kg: float = Field(..., description="Delta change in weight (+/- kg)")
    bmi_change: float = Field(..., description="Delta change in BMI (+/- kg/m²)")
    height_velocity_rating: str = Field(..., description="Pediatric height velocity status")
    weight_velocity_rating: str = Field(..., description="Pediatric weight progression rating")
    growth_assessment_summary: str = Field(..., description="Executive growth velocity interpretation")


class ImmunizationItem(BaseModel):
    """Pediatric immunization record & booster recommendation based on IAP schedule."""
    vaccine_name: str = Field(..., description="Vaccine name (e.g. Tdap Booster, MMR Dose 2, HPV)")
    target_age: str = Field(..., description="Recommended age window (e.g. 10-12 Years, 4-6 Years)")
    dose: str = Field(..., description="Dose number or booster identifier")
    status: str = Field(..., description="Immunization status: Completed, Due Soon, Overdue, Recommended")
    description: str = Field(..., description="Clinical purpose in English")
    description_hi: str = Field(..., description="Clinical purpose in Hindi")


class PreventiveRecall(BaseModel):
    """Preventive recall schedule for dental, vision, and routine pediatric follow-ups."""
    checkup_type: str = Field(..., description="Type of checkup: Dental Routine Recall, Vision Refraction, Pediatric Exam")
    last_exam_date: str = Field(..., description="Date of last recorded evaluation")
    next_due_date: str = Field(..., description="Scheduled next recall due date (e.g. 6 months interval)")
    interval_months: int = Field(default=6, description="Recall interval in months")
    status: str = Field(..., description="Recall status: Due Soon, Scheduled, Up to Date, Completed")
    advice: str = Field(..., description="Preventive clinical instructions in English")
    advice_hi: str = Field(..., description="Preventive clinical instructions in Hindi")


class ForecastMilestone(BaseModel):
    """Projected anthropometric and developmental milestone for 6 or 12 month horizons."""
    horizon: str = Field(..., description="Forecast timeline horizon: '6 Months' or '12 Months'")
    projected_height_cm: float = Field(..., description="Predicted height in cm")
    projected_weight_kg: float = Field(..., description="Predicted weight in kg")
    projected_bmi: float = Field(..., description="Predicted BMI in kg/m²")
    projected_haz: float = Field(..., description="Projected Height-for-Age Z-Score")
    projected_waz: Optional[float] = Field(default=None, description="Projected Weight-for-Age Z-Score")
    projected_baz: float = Field(..., description="Projected BMI-for-Age Z-Score")
    monthly_height_velocity_cm: float = Field(..., description="Projected monthly height increment in cm/month")
    milestone_status: str = Field(..., description="Expected milestone category in English")
    milestone_status_hi: str = Field(..., description="Expected milestone category in Hindi")
    interpretation: str = Field(..., description="Actionable clinical forecast interpretation in English")
    interpretation_hi: str = Field(..., description="Actionable clinical forecast interpretation in Hindi")


class GrowthForecast(BaseModel):
    """Complete 6 & 12-month AI pediatric growth projection and catch-up trajectory."""
    current_height_cm: float = Field(..., description="Baseline height in cm")
    current_weight_kg: float = Field(..., description="Baseline weight in kg")
    catch_up_recommended: bool = Field(default=False, description="Whether accelerated nutritional catch-up is required")
    target_catch_up_velocity_cm_yr: float = Field(default=6.0, description="Target height velocity in cm/year for normal/catch-up trajectory")
    six_month_forecast: ForecastMilestone = Field(..., description="6-month projected milestone")
    twelve_month_forecast: ForecastMilestone = Field(..., description="12-month projected milestone")
    nutritional_milestone_guidance: str = Field(..., description="Specific dietary advice to achieve milestone targets (EN)")
    nutritional_milestone_guidance_hi: str = Field(..., description="Specific dietary advice to achieve milestone targets (HI)")


class PredictionReportResponse(BaseModel):
    """Full health risk prediction, dietary recommendation report, and multi-session growth trajectory."""
    student_id: str = Field(..., description="Authenticated student identification number")
    full_name: str = Field(..., description="Student full name")
    school_id: Optional[str] = Field(default=None, description="School UUID")
    school_name: Optional[str] = Field(default=None, description="School name")
    camp_record_id: Optional[str] = Field(default=None, description="UUID of the referenced camp vitals record")
    recorded_at: Optional[str] = Field(default=None, description="ISO timestamp when vitals were recorded")
    vitals: VitalsData = Field(..., description="Student physical vitals and age")
    zscores: ZScoreResult = Field(..., description="WHO LMS-standard Z-scores")
    risks: List[HealthRisk] = Field(default_factory=list, description="Identified health risks and confidence scores")
    diet_plan: DietPlanResponse = Field(..., description="Targeted regional Indian diet plan")
    explanations: List[ExplainabilityItem] = Field(default_factory=list, description="Prediction explainability and threshold logic")
    camp_history: List[CampHistorySummary] = Field(default_factory=list, description="List of all recorded camp visits")
    growth_comparison: Optional[GrowthComparison] = Field(default=None, description="Growth delta comparison against previous camp")
    qr_code_data_uri: Optional[str] = Field(default=None, description="Base64 embedded scannable QR code data URI")
    student_deep_link: Optional[str] = Field(default=None, description="Direct URL deep-link to student health portal")
    immunizations: List[ImmunizationItem] = Field(default_factory=list, description="IAP pediatric immunization schedule & status")
    preventive_recalls: List[PreventiveRecall] = Field(default_factory=list, description="6-month dental and vision recall schedule")
    growth_forecast: Optional[GrowthForecast] = Field(default=None, description="AI 6 & 12-month pediatric growth projection")



class GenerateReportRequest(BaseModel):
    """Request payload for generating and uploading a PDF health report card."""
    student_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Unique student identifier (must match authenticated JWT claim)"
    )
    camp_record_id: Optional[str] = Field(
        default=None,
        description="Optional UUID of a specific historical camp record for PDF generation"
    )

    @field_validator("student_id")
    @classmethod
    def strip_student_id(cls, v: str) -> str:
        return v.strip()


class GenerateReportResponse(BaseModel):
    """Response returned upon successful PDF generation, storage upload, and audit logging."""
    student_id: str = Field(..., description="Authenticated student identifier")
    signed_url: str = Field(..., description="Secure signed URL for viewing/downloading the PDF report")
    pdf_path: str = Field(..., description="Storage object path in the report-cards bucket")
    generated_at: str = Field(..., description="ISO timestamp when the PDF was generated")
    expires_at: str = Field(..., description="ISO timestamp when the signed URL expires")


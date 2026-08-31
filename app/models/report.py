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


class PredictionReportResponse(BaseModel):
    """Full health risk prediction and dietary recommendation report."""
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


class GenerateReportRequest(BaseModel):
    """Request payload for generating and uploading a PDF health report card."""
    student_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Unique student identifier (must match authenticated JWT claim)"
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


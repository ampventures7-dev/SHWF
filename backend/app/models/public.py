from typing import List, Optional
from pydantic import BaseModel, Field


class StateResponse(BaseModel):
    """Public state summary."""
    id: str = Field(..., description="Unique state identifier (UUID)")
    name: str = Field(..., description="State name")


class DistrictResponse(BaseModel):
    """Public district summary."""
    id: str = Field(..., description="Unique district identifier (UUID)")
    state_id: str = Field(..., description="Parent state identifier (UUID)")
    name: str = Field(..., description="District name")


class SchoolResponse(BaseModel):
    """Public school summary."""
    id: str = Field(..., description="Unique school identifier (UUID)")
    district_id: str = Field(..., description="Parent district identifier (UUID)")
    name: str = Field(..., description="School name")
    school_code: str = Field(..., description="Unique school code")


class PublicStudentResponse(BaseModel):
    """
    Public student search result.
    Strictly excludes sensitive fields like parent_phone, parent_email, date_of_birth, or medical data.
    """
    id: str = Field(..., description="Unique internal student record identifier (UUID)")
    student_id: str = Field(..., description="School-assigned student roll / identification number")
    full_name: str = Field(..., description="Student full name")
    school_id: str = Field(..., description="School identifier (UUID)")
    school_name: Optional[str] = Field(None, description="School name")


class EnquiryRequest(BaseModel):
    """Model for public follow-up contact and school camp enquiries."""
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of enquirer")
    mobile: str = Field(..., min_length=10, max_length=15, description="Mobile contact number")
    persona: Optional[str] = Field("other", description="Role/Persona of enquirer (principal, parent, doctor, csr, other)")
    reason: str = Field(..., description="Primary reason for enquiry")
    organization_or_city: Optional[str] = Field(None, max_length=150, description="School, institution, or city name")
    source: str = Field(..., description="How they heard about SHWF")
    message: Optional[str] = Field(None, max_length=1000, description="Optional brief notes or query")


class EnquiryResponse(BaseModel):
    """Response returned upon successful enquiry submission."""
    success: bool = Field(True, description="Submission status")
    message: str = Field("Enquiry received successfully. Our team will contact you within 24 hours.", description="User confirmation message")
    message_hi: str = Field("पूछताछ सफलतापूर्वक दर्ज की गई। हमारी टीम 24 घंटे के भीतर आपसे संपर्क करेगी।", description="Hindi confirmation message")


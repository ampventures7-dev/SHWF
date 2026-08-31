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

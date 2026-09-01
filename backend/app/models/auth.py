from typing import Optional
from pydantic import BaseModel, Field, field_validator


class OTPRequestPayload(BaseModel):
    """Payload for requesting an OTP."""
    student_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="School-assigned student roll / identification number"
    )
    contact: str = Field(
        ...,
        min_length=3,
        max_length=120,
        description="Registered parent phone number or email"
    )

    @field_validator("student_id", "contact")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()


class OTPRequestResponse(BaseModel):
    """
    Standard response returned upon OTP generation.
    Returns generic message regardless of lookup match to prevent enumeration attacks.
    """
    message: str = Field(
        default="If the details provided match our registered records, a 6-digit OTP has been sent.",
        description="User-facing status message"
    )
    status: str = Field(default="queued", description="Status code")


class OTPVerifyPayload(BaseModel):
    """Payload for verifying an OTP and obtaining an access token."""
    student_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="School-assigned student roll / identification number"
    )
    contact: str = Field(
        ...,
        min_length=3,
        max_length=120,
        description="Registered parent phone number or email"
    )
    otp_code: str = Field(
        ...,
        min_length=4,
        max_length=8,
        description="6-digit numeric OTP received via SMS/MSG91"
    )

    @field_validator("student_id", "contact", "otp_code")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()


class TokenResponse(BaseModel):
    """Access token response issued upon successful OTP verification."""
    access_token: str = Field(..., description="JWT Bearer token for accessing verified student data")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in_seconds: int = Field(..., description="Token validity duration in seconds")
    student_id: str = Field(..., description="Authenticated student identification number")


class VerifiedStudentClaims(BaseModel):
    """Decoded JWT claims payload representing the authenticated student."""
    student_id: str = Field(..., description="Authenticated student identifier")
    contact: str = Field(..., description="Verified parent contact")
    sub: str = Field(..., description="Subject identifier (student_id)")
    role: str = Field(default="student", description="Authorization role")
    iat: int = Field(..., description="Issued at timestamp")
    exp: int = Field(..., description="Expiration timestamp")


class AdminLoginPayload(BaseModel):
    """Payload for administrator password login."""
    username: str = Field(..., min_length=3, max_length=128, description="Admin username or email")
    password: str = Field(..., min_length=4, max_length=128, description="Admin password")

    @field_validator("username")
    @classmethod
    def normalize_username(cls, v: str) -> str:
        return v.strip().lower()


class AdminTokenResponse(BaseModel):
    """Access token response issued upon successful admin authentication."""
    access_token: str = Field(..., description="JWT Bearer token with admin authorization")
    token_type: str = Field(default="bearer", description="Token type")
    role: str = Field(default="admin", description="User role")
    expires_in_seconds: int = Field(..., description="Token validity duration in seconds")
    username: str = Field(..., description="Authenticated admin username")


class AdminClaims(BaseModel):
    """Decoded JWT claims payload for authenticated administrators."""
    sub: str = Field(..., description="Subject identifier (username)")
    username: str = Field(..., description="Admin username")
    role: str = Field(default="admin", description="Admin role")
    iat: int = Field(..., description="Issued at timestamp")
    exp: int = Field(..., description="Expiration timestamp")

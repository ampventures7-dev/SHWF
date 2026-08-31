import re
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, EmailStr


PHONE_REGEX = re.compile(r"^\+?[0-9]{10,15}$")
DATE_REGEX = re.compile(r"^\d{4}-\d{2}-\d{2}$")
VALID_GENDERS = {"M", "F", "O"}
GENDER_MAP = {
    "M": "M",
    "MALE": "M",
    "F": "F",
    "FEMALE": "F",
    "O": "O",
    "OTHER": "O",
}


class StudentRow(BaseModel):
    """
    Validation model for a single row in the CSV upload.
    Ensures strict typing, format validation, and string preservation for IDs and phone numbers.
    """

    student_id: str = Field(..., description="Unique student ID within the school")
    full_name: str = Field(..., description="Student full name")
    date_of_birth: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    gender: str = Field(..., description="Gender: M, F, or O")
    parent_name: str = Field(..., description="Parent / Guardian full name")
    parent_phone: str = Field(
        ...,
        description="Parent phone number with optional + prefix (10-15 digits), preserved as text",
    )
    parent_email: Optional[str] = Field(
        default=None, description="Optional parent email address"
    )
    school_code: str = Field(
        ..., description="Unique code of the school where student is enrolled"
    )

    @field_validator("student_id", mode="before")
    @classmethod
    def validate_student_id(cls, v):
        if v is None or not str(v).strip():
            raise ValueError("Student ID is required and cannot be empty")
        return str(v).strip()

    @field_validator("full_name", mode="before")
    @classmethod
    def validate_full_name(cls, v):
        if v is None or not str(v).strip():
            raise ValueError("Full name is required and cannot be empty")
        return str(v).strip()

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def validate_date_of_birth(cls, v):
        if v is None or not str(v).strip():
            raise ValueError("Date of birth is required")
        v_str = str(v).strip()
        if not DATE_REGEX.match(v_str):
            raise ValueError(
                f"Date of birth '{v_str}' is invalid. Must strictly match YYYY-MM-DD format (e.g. 2012-05-14)"
            )
        try:
            parsed_date = datetime.strptime(v_str, "%Y-%m-%d").date()
            if parsed_date > date.today():
                raise ValueError(
                    f"Date of birth '{v_str}' cannot be in the future"
                )
            return v_str
        except ValueError as e:
            if "cannot be in the future" in str(e):
                raise
            raise ValueError(
                f"Date of birth '{v_str}' is not a valid calendar date"
            )

    @field_validator("gender", mode="before")
    @classmethod
    def validate_gender(cls, v):
        if v is None or not str(v).strip():
            raise ValueError("Gender is required (M, F, or O)")
        normalized = str(v).strip().upper()
        if normalized in GENDER_MAP:
            return GENDER_MAP[normalized]
        raise ValueError(
            f"Invalid gender '{v}'. Must be one of: M (Male), F (Female), O (Other)"
        )

    @field_validator("parent_name", mode="before")
    @classmethod
    def validate_parent_name(cls, v):
        if v is None or not str(v).strip():
            raise ValueError("Parent name is required and cannot be empty")
        return str(v).strip()

    @field_validator("parent_phone", mode="before")
    @classmethod
    def validate_parent_phone(cls, v):
        if v is None or not str(v).strip():
            raise ValueError("Parent phone is required")
        # Strict string check - preserve leading zero and country code
        phone_str = str(v).strip()
        # Remove spaces or dashes if common, but ensure clean pattern
        cleaned_phone = phone_str.replace(" ", "").replace("-", "")
        if not PHONE_REGEX.match(cleaned_phone):
            raise ValueError(
                f"Invalid phone number '{phone_str}'. Must be 10-15 digits with optional '+' prefix (e.g. +919876543210 or 09876543210)"
            )
        return cleaned_phone

    @field_validator("parent_email", mode="before")
    @classmethod
    def validate_parent_email(cls, v):
        if v is None:
            return None
        email_str = str(v).strip()
        if not email_str:
            return None
        # Basic email syntax validator
        email_pattern = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
        if not email_pattern.match(email_str):
            raise ValueError(f"Invalid email address format: '{email_str}'")
        return email_str.lower()

    @field_validator("school_code", mode="before")
    @classmethod
    def validate_school_code(cls, v):
        if v is None or not str(v).strip():
            raise ValueError("School code is required and cannot be empty")
        return str(v).strip()

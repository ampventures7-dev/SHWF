import logging
from fastapi import APIRouter, Depends, status

from app.core.supabase import DatabaseService, get_db_service
from app.models.auth import (
    OTPRequestPayload,
    OTPRequestResponse,
    OTPVerifyPayload,
    TokenResponse,
)
from app.services.msg91_service import MSG91Service, get_msg91_service
from app.services.otp_service import process_otp_request, process_otp_verification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Parent OTP Authentication"])


@router.post(
    "/otp/request",
    response_model=OTPRequestResponse,
    status_code=status.HTTP_200_OK,
    summary="Request a 6-Digit OTP for Parent Verification",
    description=(
        "Verifies that the provided student ID and parent contact match registered records. "
        "Generates a 6-digit numeric OTP, bcrypt-hashes it for database storage, enforces a "
        "rate limit of 3 requests per 15 minutes, and dispatches the OTP via MSG91 SMS. "
        "Always returns a generic confirmation message to eliminate enumeration risks."
    ),
    responses={
        200: {"description": "OTP request processed successfully.", "model": OTPRequestResponse},
        429: {"description": "Rate limit exceeded (maximum 3 requests per 15 minutes)."},
    },
)
@router.post("/request-otp", include_in_schema=False)
async def request_otp(
    payload: OTPRequestPayload,
    db_service: DatabaseService = Depends(get_db_service),
    msg91_service: MSG91Service = Depends(get_msg91_service),
):
    """Request an OTP for parent authentication."""
    return await process_otp_request(
        student_id=payload.student_id,
        contact=payload.contact,
        db_service=db_service,
        msg91_service=msg91_service,
    )


@router.post(
    "/otp/verify",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify OTP and Receive Scoped JWT Token",
    description=(
        "Validates the submitted OTP code against the latest bcrypt hash in Supabase. "
        "Enforces max 5 attempt lockout and expiration checks. On success, marks the OTP "
        "as verified and issues a 30-minute scoped JWT token required for student data access."
    ),
    responses={
        200: {"description": "OTP verified; JWT token issued.", "model": TokenResponse},
        400: {"description": "Invalid, expired, or locked-out OTP."},
    },
)
@router.post("/verify-otp", include_in_schema=False)
async def verify_otp(
    payload: OTPVerifyPayload,
    db_service: DatabaseService = Depends(get_db_service),
):
    """Verify OTP code and retrieve access token."""
    return await process_otp_verification(
        student_id=payload.student_id,
        contact=payload.contact,
        otp_code=payload.otp_code,
        db_service=db_service,
    )


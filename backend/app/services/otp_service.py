import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, status

from app.core.config import get_settings
from app.core.security import hash_otp, verify_otp_hash, create_access_token
from app.core.supabase import DatabaseService
from app.models.auth import OTPRequestResponse, TokenResponse
from app.services.msg91_service import MSG91Service, mask_contact

logger = logging.getLogger(__name__)


def generate_secure_otp() -> str:
    """Generate a cryptographically secure 6-digit numeric OTP."""
    code = secrets.randbelow(1_000_000)
    return f"{code:06d}"


def normalize_contact(contact: str) -> str:
    """Normalize phone/email string for exact matching."""
    cleaned = contact.strip()
    if "@" in cleaned:
        return cleaned.lower()
    return cleaned


async def process_otp_request(
    student_id: str,
    contact: str,
    db_service: DatabaseService,
    msg91_service: MSG91Service,
) -> OTPRequestResponse:
    """
    Handle OTP generation and dispatch with rate limiting and timing/enumeration defenses.
    """
    settings = get_settings()
    cleaned_contact = normalize_contact(contact)
    student_id_clean = student_id.strip()

    # 1. Enforce Rate Limiting (max 3 requests per contact in 15 minutes)
    window_start = datetime.now(timezone.utc) - timedelta(
        minutes=settings.OTP_RATE_LIMIT_WINDOW_MINUTES
    )
    recent_count = db_service.count_recent_otp_requests(
        contact=cleaned_contact, since_iso=window_start.isoformat()
    )
    if recent_count >= settings.OTP_RATE_LIMIT_MAX_REQUESTS:
        logger.warning(
            f"Rate limit exceeded for contact {mask_contact(cleaned_contact)}: "
            f"{recent_count} requests in {settings.OTP_RATE_LIMIT_WINDOW_MINUTES} min"
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Too many OTP requests. Please wait "
                f"{settings.OTP_RATE_LIMIT_WINDOW_MINUTES} minutes before requesting another OTP."
            ),
        )

    # 2. Look up student in database
    student_record = db_service.get_student_parent_contact(student_id_clean)

    match_found = False
    if student_record:
        registered_phone = normalize_contact(student_record.get("parent_phone") or "")
        registered_email = normalize_contact(student_record.get("parent_email") or "")
        if (
            cleaned_contact == registered_phone
            or (registered_email and cleaned_contact == registered_email)
        ):
            match_found = True

    # 3. Anti-Enumeration Defense
    # If no match, run a dummy bcrypt hash to equalize execution timing
    if not match_found:
        _ = hash_otp("000000")
        logger.info(
            f"OTP request rejected silently for unverified/mismatched student {student_id_clean}"
        )
        return OTPRequestResponse()

    # 4. Generate, hash, and persist OTP
    otp_code = generate_secure_otp()
    hashed_otp = hash_otp(otp_code)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.OTP_EXPIRY_MINUTES
    )

    db_service.create_otp_request(
        student_id=student_id_clean,
        contact=cleaned_contact,
        hashed_otp=hashed_otp,
        expires_at_iso=expires_at.isoformat(),
    )

    # 5. Dispatch via MSG91 SMS
    # Plaintext OTP is passed only into the transient MSG91 dispatcher and NEVER logged
    await msg91_service.send_otp(contact=cleaned_contact, otp_code=otp_code)

    return OTPRequestResponse()


async def process_otp_verification(
    student_id: str,
    contact: str,
    otp_code: str,
    db_service: DatabaseService,
) -> TokenResponse:
    """
    Validate supplied OTP against the bcrypt hash in Supabase, track attempts,
    and return a scoped JWT access token upon success.
    """
    settings = get_settings()
    cleaned_contact = normalize_contact(contact)
    student_id_clean = student_id.strip()
    otp_code_clean = otp_code.strip()

    # Generic error to prevent leaking detailed verification state
    generic_error = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid or expired OTP.",
    )

    # 1. Fetch latest active OTP request for student + contact
    active_otp = db_service.get_latest_active_otp_request(
        student_id=student_id_clean, contact=cleaned_contact
    )

    if not active_otp:
        # Run dummy hash check for timing consistency
        _ = verify_otp_hash(otp_code_clean, "$2b$10$dummyhashforantiemumeration00000000000000000000000")
        raise generic_error

    otp_id = str(active_otp["id"])
    attempt_count = active_otp.get("attempt_count", 0)
    stored_hash = active_otp.get("otp_code", "")
    expires_at_raw = active_otp.get("expires_at")

    # 2. Check if already locked out due to max attempts
    if attempt_count >= settings.OTP_MAX_ATTEMPTS:
        logger.warning(
            f"OTP row {otp_id} is locked out ({attempt_count} failed attempts)."
        )
        raise generic_error

    # 3. Check expiration
    if expires_at_raw:
        if isinstance(expires_at_raw, str):
            # Parse ISO timestamp (handling 'Z' or offset)
            expires_at = datetime.fromisoformat(expires_at_raw.replace("Z", "+00:00"))
        else:
            expires_at = expires_at_raw

        if datetime.now(timezone.utc) > expires_at:
            logger.info(f"OTP row {otp_id} has expired.")
            raise generic_error

    # 4. Increment attempt count
    _ = db_service.increment_otp_attempts(otp_id=otp_id, current_count=attempt_count)

    # 5. Verify bcrypt hash
    is_valid = verify_otp_hash(otp_code_clean, stored_hash)
    if not is_valid:
        logger.warning(
            f"Failed OTP attempt on row {otp_id} for student {student_id_clean}"
        )
        raise generic_error

    # 6. Mark OTP as verified so it cannot be reused
    db_service.mark_otp_verified(otp_id=otp_id)

    # 7. Issue JWT scoped to student_id and contact
    access_token = create_access_token(
        student_id=student_id_clean,
        contact=cleaned_contact,
        expires_delta=timedelta(minutes=settings.JWT_EXPIRY_MINUTES),
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_seconds=settings.JWT_EXPIRY_MINUTES * 60,
        student_id=student_id_clean,
    )

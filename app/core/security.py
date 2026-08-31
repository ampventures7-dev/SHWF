import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings
from app.models.auth import VerifiedStudentClaims

logger = logging.getLogger(__name__)

security_scheme = HTTPBearer(auto_error=False)


def hash_otp(otp_code: str) -> str:
    """Hash a numeric OTP code using bcrypt before database storage."""
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(otp_code.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    """Verify that a plain OTP code matches the stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_otp.encode("utf-8"), hashed_otp.encode("utf-8"))
    except Exception as e:
        logger.warning(f"Error checking OTP hash: {str(e)}")
        return False


def create_access_token(
    student_id: str,
    contact: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Generate a signed JWT access token containing authenticated student claims."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)

    payload = {
        "sub": student_id,
        "student_id": student_id,
        "contact": contact,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    return token


def decode_access_token(token: str) -> VerifiedStudentClaims:
    """
    Decode and validate a JWT access token.
    Raises HTTPException(401) on invalid signature, malformed token, or expired token.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return VerifiedStudentClaims(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired. Please verify your OTP again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.PyJWTError, Exception) as e:
        logger.warning(f"Failed to validate JWT token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token or signature.",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_verified_student(
    auth_header: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
) -> VerifiedStudentClaims:
    """
    FastAPI dependency for strictly isolated student data access.
    Extracts Bearer token from Authorization header and verifies claims.
    Any downstream endpoint MUST query the database solely using claims.student_id.
    """
    if auth_header is None or not auth_header.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    claims = decode_access_token(auth_header.credentials)
    return claims

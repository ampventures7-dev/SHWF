import logging
from fastapi import APIRouter, Depends, status

from app.core.security import get_verified_student
from app.models.auth import VerifiedStudentClaims

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/student", tags=["Verified Student Data (Protected)"])


@router.get(
    "/access-check",
    response_model=VerifiedStudentClaims,
    status_code=status.HTTP_200_OK,
    summary="Data Isolation & Token Verification Check",
    description=(
        "Demonstrates secure data isolation enforced by the `get_verified_student` dependency. "
        "Extracts and validates the JWT claims from the Authorization Bearer header. "
        "Guarantees that downstream medical endpoints will query data strictly using the "
        "authenticated student_id in the token claims, preventing client manipulation."
    ),
    responses={
        200: {"description": "Token valid; verified claims returned."},
        401: {"description": "Missing, expired, or invalid Bearer token."},
    },
)
async def check_student_access(
    claims: VerifiedStudentClaims = Depends(get_verified_student),
):
    """Protected endpoint validating student session and data isolation."""
    return claims

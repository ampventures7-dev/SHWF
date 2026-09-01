import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status

from app.core.supabase import DatabaseService, get_db_service
from app.models.public import (
    StateResponse,
    DistrictResponse,
    SchoolResponse,
    PublicStudentResponse,
    EnquiryRequest,
    EnquiryResponse,
)

from app.services.public_search_service import (
    list_all_states,
    list_districts_by_state,
    list_schools_by_district,
    search_students_in_school,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/public", tags=["Public Cascading Discovery"])


@router.get(
    "/states",
    response_model=List[StateResponse],
    status_code=status.HTTP_200_OK,
    summary="List All States",
    description="Returns all registered states for the top-level cascading dropdown.",
)
async def get_states(
    db_service: DatabaseService = Depends(get_db_service),
):
    """List all states."""
    return list_all_states(db_service=db_service)


@router.get(
    "/districts",
    response_model=List[DistrictResponse],
    status_code=status.HTTP_200_OK,
    summary="List Districts by State",
    description="Returns all districts belonging to the selected state.",
)
async def get_districts(
    state_id: str = Query(..., description="UUID of the parent state"),
    db_service: DatabaseService = Depends(get_db_service),
):
    """List districts filtered by state_id."""
    return list_districts_by_state(state_id=state_id, db_service=db_service)


@router.get(
    "/schools",
    response_model=List[SchoolResponse],
    status_code=status.HTTP_200_OK,
    summary="List Schools by District",
    description="Returns all schools belonging to the selected district.",
)
async def get_schools(
    district_id: str = Query(..., description="UUID of the parent district"),
    db_service: DatabaseService = Depends(get_db_service),
):
    """List schools filtered by district_id."""
    return list_schools_by_district(district_id=district_id, db_service=db_service)


@router.get(
    "/students",
    response_model=List[PublicStudentResponse],
    status_code=status.HTTP_200_OK,
    summary="Search Students within a School",
    description=(
        "Search students by partial case-insensitive name match within a specific school. "
        "Strictly returns non-sensitive fields only (student_id, full_name, school_name). "
        "Sensitive information (contact, date of birth, medical data) is strictly withheld."
    ),
)
async def search_students(
    school_id: str = Query(..., description="UUID of the school to search within"),
    name: Optional[str] = Query(
        "", description="Partial or full student name query (case-insensitive)"
    ),
    db_service: DatabaseService = Depends(get_db_service),
):
    """Search students within a school."""
    return search_students_in_school(
        school_id=school_id, name_query=name or "", db_service=db_service
    )


@router.post(
    "/enquiry",
    response_model=EnquiryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Follow-Up & School Camp Enquiry",
    description="Submit an enquiry for organizing school health camps, report card consultations, or partnerships.",
)
async def submit_enquiry(
    payload: EnquiryRequest,
    db_service: DatabaseService = Depends(get_db_service),
):
    """Capture public follow-up lead / school camp enquiry."""
    logger.info("New public enquiry received from %s (%s) for reason: %s", payload.full_name, payload.mobile, payload.reason)
    
    # Try persisting to Supabase enquiries table if configured
    try:
        if db_service.supabase:
            db_service.supabase.table("enquiries").insert({
                "full_name": payload.full_name,
                "mobile": payload.mobile,
                "persona": payload.persona,
                "reason": payload.reason,
                "organization_or_city": payload.organization_or_city,
                "source": payload.source,
                "message": payload.message,
            }).execute()
    except Exception as e:
        logger.warning("Supabase enquiries table logging skipped: %s", str(e))

    return EnquiryResponse(
        success=True,
        message="Thank you! Your enquiry has been received. Our medical coordination team will contact you within 24 hours.",
        message_hi="धन्यवाद! आपकी पूछताछ प्राप्त हो गई है। हमारी मेडिकल टीम 24 घंटे के भीतर आपसे संपर्क करेगी।"
    )


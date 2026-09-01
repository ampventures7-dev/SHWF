import logging
from typing import List
from app.core.supabase import DatabaseService
from app.models.public import StateResponse, DistrictResponse, SchoolResponse, PublicStudentResponse
from app.data.india_geo import (
    get_all_india_states,
    get_india_districts_by_state,
    get_mock_schools_for_district,
    get_mock_students_for_school,
)

logger = logging.getLogger(__name__)


def list_all_states(db_service: DatabaseService) -> List[StateResponse]:
    """Retrieve all states for cascading dropdown."""
    try:
        raw_data = db_service.get_all_states()
        if raw_data and len(raw_data) > 0:
            return [StateResponse(id=str(row["id"]), name=row["name"]) for row in raw_data]
    except Exception as e:
        logger.warning(f"Failed to fetch states from database, using all-India geo data: {e}")

    # Fallback to comprehensive all-India 28 states + 8 UTs
    all_states = get_all_india_states()
    return [StateResponse(id=str(s["id"]), name=s["name"]) for s in all_states]


def list_districts_by_state(state_id: str, db_service: DatabaseService) -> List[DistrictResponse]:
    """Retrieve all districts within a state."""
    try:
        raw_data = db_service.get_districts_by_state(state_id=state_id)
        if raw_data and len(raw_data) > 0:
            return [
                DistrictResponse(
                    id=str(row["id"]),
                    state_id=str(row["state_id"]),
                    name=row["name"]
                )
                for row in raw_data
            ]
    except Exception as e:
        logger.warning(f"Failed to fetch districts from database for state {state_id}: {e}")

    # Fallback to complete state districts
    districts = get_india_districts_by_state(state_id)
    return [
        DistrictResponse(
            id=str(d["id"]),
            state_id=str(d["state_id"]),
            name=d["name"]
        )
        for d in districts
    ]


def list_schools_by_district(district_id: str, db_service: DatabaseService) -> List[SchoolResponse]:
    """Retrieve all schools within a district."""
    try:
        raw_data = db_service.get_schools_by_district(district_id=district_id)
        if raw_data and len(raw_data) > 0:
            return [
                SchoolResponse(
                    id=str(row["id"]),
                    district_id=str(row["district_id"]),
                    name=row["name"],
                    school_code=row["school_code"]
                )
                for row in raw_data
            ]
    except Exception as e:
        logger.warning(f"Failed to fetch schools from database for district {district_id}: {e}")

    # Fallback to partner schools
    schools = get_mock_schools_for_district(district_id)
    return [
        SchoolResponse(
            id=str(sc["id"]),
            district_id=str(sc["district_id"]),
            name=sc["name"],
            school_code=sc["school_code"]
        )
        for sc in schools
    ]


def search_students_in_school(
    school_id: str, name_query: str, db_service: DatabaseService
) -> List[PublicStudentResponse]:
    """
    Search students by name within a school.
    Guarantees that sensitive data (parent contact, DOB, health records) is not exposed.
    """
    try:
        raw_data = db_service.search_students_by_name(school_id=school_id, name_query=name_query)
        if raw_data and len(raw_data) > 0:
            return [
                PublicStudentResponse(
                    id=str(row["id"]),
                    student_id=row["student_id"],
                    full_name=row["full_name"],
                    school_id=str(row["school_id"]),
                    school_name=row.get("school_name"),
                )
                for row in raw_data
            ]
    except Exception as e:
        logger.warning(f"Failed to search students in database for school {school_id}: {e}")

    # Fallback to sample students
    sample_students = get_mock_students_for_school(school_id, name_query)
    return [
        PublicStudentResponse(
            id=str(row["id"]),
            student_id=row["student_id"],
            full_name=row["full_name"],
            school_id=str(row["school_id"]),
            school_name=row.get("school_name", "Partner School"),
        )
        for row in sample_students
    ]

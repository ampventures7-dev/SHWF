import logging
from typing import List
from app.core.supabase import DatabaseService
from app.models.public import StateResponse, DistrictResponse, SchoolResponse, PublicStudentResponse

logger = logging.getLogger(__name__)


def list_all_states(db_service: DatabaseService) -> List[StateResponse]:
    """Retrieve all states for cascading dropdown."""
    raw_data = db_service.get_all_states()
    return [StateResponse(id=str(row["id"]), name=row["name"]) for row in raw_data]


def list_districts_by_state(state_id: str, db_service: DatabaseService) -> List[DistrictResponse]:
    """Retrieve all districts within a state."""
    raw_data = db_service.get_districts_by_state(state_id=state_id)
    return [
        DistrictResponse(
            id=str(row["id"]),
            state_id=str(row["state_id"]),
            name=row["name"]
        )
        for row in raw_data
    ]


def list_schools_by_district(district_id: str, db_service: DatabaseService) -> List[SchoolResponse]:
    """Retrieve all schools within a district."""
    raw_data = db_service.get_schools_by_district(district_id=district_id)
    return [
        SchoolResponse(
            id=str(row["id"]),
            district_id=str(row["district_id"]),
            name=row["name"],
            school_code=row["school_code"]
        )
        for row in raw_data
    ]


def search_students_in_school(
    school_id: str, name_query: str, db_service: DatabaseService
) -> List[PublicStudentResponse]:
    """
    Search students by name within a school.
    Guarantees that sensitive data (parent contact, DOB, health records) is not exposed.
    """
    raw_data = db_service.search_students_by_name(school_id=school_id, name_query=name_query)
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

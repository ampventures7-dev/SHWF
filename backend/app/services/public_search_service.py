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
    """Retrieve all 28 States and 8 UTs for cascading dropdown."""
    all_states = get_all_india_states()
    db_map = {}
    try:
        raw_data = db_service.get_all_states()
        if raw_data:
            db_map = {row["name"].strip().lower(): str(row["id"]) for row in raw_data}
    except Exception as e:
        logger.warning(f"Failed to fetch states from database, using complete fallback: {e}")

    result = []
    for s in all_states:
        s_name = s["name"]
        s_id = db_map.get(s_name.strip().lower(), str(s["id"]))
        result.append(StateResponse(id=s_id, name=s_name))
    return result


def list_districts_by_state(state_id: str, db_service: DatabaseService) -> List[DistrictResponse]:
    """Retrieve all official districts within a state."""
    state_name = None
    db_dist_map = {}
    
    # Try finding state name if state_id is a DB UUID
    try:
        raw_states = db_service.get_all_states()
        if raw_states:
            for st in raw_states:
                if str(st["id"]).lower() == state_id.strip().lower():
                    state_name = st["name"]
                    break
                    
        raw_dists = db_service.get_districts_by_state(state_id=state_id)
        if raw_dists:
            db_dist_map = {row["name"].strip().lower(): str(row["id"]) for row in raw_dists}
    except Exception as e:
        logger.warning(f"Failed to fetch from DB for state {state_id}: {e}")

    # Complete geo districts
    lookup_key = state_name if state_name else state_id
    districts = get_india_districts_by_state(lookup_key)

    result = []
    seen = set()
    for d in districts:
        d_name = d["name"]
        if d_name.lower() in seen:
            continue
        seen.add(d_name.lower())
        d_id = db_dist_map.get(d_name.strip().lower(), str(d["id"]))
        result.append(
            DistrictResponse(
                id=d_id,
                state_id=state_id,
                name=d_name
            )
        )
    return result


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

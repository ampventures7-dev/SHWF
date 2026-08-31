import logging
from typing import Optional, Dict, List, Set, Tuple
from supabase import create_client, Client
from app.core.config import get_settings

logger = logging.getLogger(__name__)


def get_supabase_client() -> Optional[Client]:
    """
    Initialize and return the Supabase client.
    Returns None if credentials are not configured.
    """
    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.warning("SUPABASE_URL or SUPABASE_KEY not configured in environment.")
        return None
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        raise


class DatabaseService:
    """
    Database interface interacting with Supabase Postgres.
    Provides methods for school lookup, duplicate verification, and batch inserts.
    """

    def __init__(self, client: Optional[Client] = None):
        self._client = client

    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        if self._client is None:
            raise ValueError(
                "Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_KEY."
            )
        return self._client

    def get_schools_by_codes(self, school_codes: Set[str]) -> Dict[str, str]:
        """
        Query schools table for matching school_codes.
        Returns a dictionary mapping: { school_code: school_id (UUID string) }
        """
        if not school_codes:
            return {}

        codes_list = list(school_codes)
        # Query in chunks if there are many unique codes
        school_map = {}
        chunk_size = 200

        for i in range(0, len(codes_list), chunk_size):
            chunk = codes_list[i : i + chunk_size]
            response = (
                self.client.table("schools")
                .select("id, school_code")
                .in_("school_code", chunk)
                .execute()
            )
            if response.data:
                for row in response.data:
                    school_map[row["school_code"]] = row["id"]

        return school_map

    def get_existing_student_keys(
        self, school_ids: Set[str], student_ids: Set[str]
    ) -> Set[Tuple[str, str]]:
        """
        Check existing (school_id, student_id) composite keys in the database.
        Returns a set of tuples: {(school_id, student_id)}
        """
        if not school_ids or not student_ids:
            return set()

        school_list = list(school_ids)
        student_list = list(student_ids)

        existing_keys: Set[Tuple[str, str]] = set()

        # Query in chunks to prevent query length limits
        chunk_size = 200
        for i in range(0, len(school_list), chunk_size):
            school_chunk = school_list[i : i + chunk_size]
            for j in range(0, len(student_list), chunk_size):
                student_chunk = student_list[j : j + chunk_size]

                response = (
                    self.client.table("students")
                    .select("school_id, student_id")
                    .in_("school_id", school_chunk)
                    .in_("student_id", student_chunk)
                    .execute()
                )

                if response.data:
                    for row in response.data:
                        existing_keys.add((str(row["school_id"]), str(row["student_id"])))

        return existing_keys

    def insert_students_batch(
        self, records: List[Dict]
    ) -> Tuple[int, Optional[str]]:
        """
        Insert a batch of student records into Supabase.
        Returns (inserted_count, error_message)
        """
        if not records:
            return 0, None

        try:
            response = self.client.table("students").insert(records).execute()
            # If response data exists, count returned rows
            count = len(response.data) if response.data else len(records)
            return count, None
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error inserting student batch: {error_msg}")
            return 0, error_msg

    # =========================================================================
    # Phase 2: Cascading Public Search Database Queries
    # =========================================================================

    def get_all_states(self) -> List[Dict]:
        """Fetch all states ordered alphabetically by name."""
        response = self.client.table("states").select("id, name").order("name").execute()
        return response.data or []

    def get_districts_by_state(self, state_id: str) -> List[Dict]:
        """Fetch districts belonging to a specific state ordered by name."""
        response = (
            self.client.table("districts")
            .select("id, state_id, name")
            .eq("state_id", state_id)
            .order("name")
            .execute()
        )
        return response.data or []

    def get_schools_by_district(self, district_id: str) -> List[Dict]:
        """Fetch schools belonging to a specific district ordered by name."""
        response = (
            self.client.table("schools")
            .select("id, district_id, name, school_code")
            .eq("district_id", district_id)
            .order("name")
            .execute()
        )
        return response.data or []

    def search_students_by_name(self, school_id: str, name_query: str) -> List[Dict]:
        """
        Search students in a school by partial case-insensitive name match.
        Strictly selects ONLY non-sensitive public fields: id, student_id, full_name, school_id.
        """
        query = (
            self.client.table("students")
            .select("id, student_id, full_name, school_id, schools(name)")
            .eq("school_id", school_id)
        )
        if name_query:
            query = query.ilike("full_name", f"%{name_query}%")

        response = query.order("full_name").execute()
        results = []
        if response.data:
            for item in response.data:
                school_data = item.get("schools")
                school_name = school_data.get("name") if isinstance(school_data, dict) else None
                results.append({
                    "id": str(item["id"]),
                    "student_id": item["student_id"],
                    "full_name": item["full_name"],
                    "school_id": str(item["school_id"]),
                    "school_name": school_name,
                })
        return results

    # =========================================================================
    # Phase 2: OTP Authentication & Parent Verification Database Queries
    # =========================================================================

    def get_student_parent_contact(self, student_id: str) -> Optional[Dict]:
        """
        Fetch registered contact details for a student ID.
        Used solely for internal OTP verification.
        """
        response = (
            self.client.table("students")
            .select("id, student_id, parent_phone, parent_email")
            .eq("student_id", student_id)
            .limit(1)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None

    def count_recent_otp_requests(self, contact: str, since_iso: str) -> int:
        """Count OTP requests sent to a contact within the sliding rate limit window."""
        response = (
            self.client.table("otp_requests")
            .select("id", count="exact")
            .eq("contact", contact)
            .gte("created_at", since_iso)
            .execute()
        )
        if hasattr(response, "count") and response.count is not None:
            return response.count
        return len(response.data) if response.data else 0

    def create_otp_request(
        self, student_id: str, contact: str, hashed_otp: str, expires_at_iso: str
    ) -> Dict:
        """Insert a newly generated bcrypt-hashed OTP record."""
        record = {
            "student_id": student_id,
            "contact": contact,
            "otp_code": hashed_otp,
            "expires_at": expires_at_iso,
            "verified": False,
            "attempt_count": 0,
        }
        response = self.client.table("otp_requests").insert(record).execute()
        return response.data[0] if response.data else record

    def get_latest_active_otp_request(
        self, student_id: str, contact: str
    ) -> Optional[Dict]:
        """Find the most recent unverified OTP request for this student + contact."""
        response = (
            self.client.table("otp_requests")
            .select("*")
            .eq("student_id", student_id)
            .eq("contact", contact)
            .eq("verified", False)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None

    def increment_otp_attempts(self, otp_id: str, current_count: int) -> int:
        """Increment the attempt counter for an OTP request."""
        new_count = current_count + 1
        self.client.table("otp_requests").update({"attempt_count": new_count}).eq(
            "id", otp_id
        ).execute()
        return new_count

    def mark_otp_verified(self, otp_id: str) -> bool:
        """Mark an OTP request as successfully verified."""
        self.client.table("otp_requests").update({"verified": True}).eq(
            "id", otp_id
        ).execute()
        return True

    # =========================================================================
    # Phase 3: Camp Records & Health Risk Medical Data Queries
    # =========================================================================

    def get_student_by_identifier(self, identifier: str) -> Optional[Dict]:
        """
        Fetch full student details by either text student_id (e.g. 'STD-2026-001')
        or primary key UUID. Includes joined school details.
        """
        if not identifier:
            return None

        # Query by string student_id first
        response = (
            self.client.table("students")
            .select("id, school_id, student_id, full_name, date_of_birth, gender, parent_name, parent_phone, parent_email, created_at, schools(id, name, school_code)")
            .eq("student_id", identifier)
            .limit(1)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]

        # If not found, try querying by primary key UUID
        try:
            uuid_response = (
                self.client.table("students")
                .select("id, school_id, student_id, full_name, date_of_birth, gender, parent_name, parent_phone, parent_email, created_at, schools(id, name, school_code)")
                .eq("id", identifier)
                .limit(1)
                .execute()
            )
            if uuid_response.data and len(uuid_response.data) > 0:
                return uuid_response.data[0]
        except Exception:
            pass

        return None

    def get_latest_camp_record(self, student_uuid: str) -> Optional[Dict]:
        """
        Retrieve the most recent health camp vitals record for a student UUID.
        """
        if not student_uuid:
            return None

        response = (
            self.client.table("camp_records")
            .select("*")
            .eq("student_id", student_uuid)
            .order("recorded_at", desc=True)
            .limit(1)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None

    def get_all_camp_records(self, student_uuid: str) -> List[Dict]:
        """Retrieve all historical camp records for a student UUID ordered by date."""
        if not student_uuid:
            return []

        response = (
            self.client.table("camp_records")
            .select("*")
            .eq("student_id", student_uuid)
            .order("recorded_at", desc=True)
            .execute()
        )
        return response.data or []

    def insert_camp_record(self, record: Dict) -> Dict:
        """Insert a new health camp medical record into the database."""
        response = self.client.table("camp_records").insert(record).execute()
        return response.data[0] if response.data else record

    # =========================================================================
    # Phase 4: Generated Reports & PDF Audit Trail Queries
    # =========================================================================

    def insert_generated_report(self, record: Dict) -> Dict:
        """Insert an audit log entry for a newly generated PDF health report card."""
        response = self.client.table("generated_reports").insert(record).execute()
        return response.data[0] if response.data else record

    def get_latest_generated_report(self, student_uuid: str) -> Optional[Dict]:
        """Fetch the most recently generated report record for a student."""
        if not student_uuid:
            return None
        response = (
            self.client.table("generated_reports")
            .select("*")
            .eq("student_id", student_uuid)
            .order("generated_at", desc=True)
            .limit(1)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None

    def get_student_reports(self, student_uuid: str) -> List[Dict]:
        """Fetch all generated report history records for a student."""
        if not student_uuid:
            return []
        response = (
            self.client.table("generated_reports")
            .select("*")
            .eq("student_id", student_uuid)
            .order("generated_at", desc=True)
            .execute()
        )
        return response.data or []


_db_service: Optional[DatabaseService] = None


def get_db_service() -> DatabaseService:
    """Dependency provider for DatabaseService."""
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
    return _db_service


def set_db_service(service: DatabaseService) -> None:
    """Override database service (useful for testing)."""
    global _db_service
    _db_service = service



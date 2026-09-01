import pytest
from datetime import datetime, timezone
from app.services.storage_service import StorageService, REPORT_CARDS_BUCKET


def test_upload_report_pdf_offline_fallback():
    """Test PDF upload path structure and signed URL calculation."""
    storage_service = StorageService(db_service=None)
    dummy_pdf_bytes = b"%PDF-1.4 sample pdf content"

    path, signed_url, expires_at = storage_service.upload_report_pdf(
        student_id="STD-2026-001",
        pdf_bytes=dummy_pdf_bytes,
        expires_in_seconds=7 * 24 * 3600,
    )

    assert path.startswith("reports/STD-2026-001/")
    assert path.endswith(".pdf")
    assert REPORT_CARDS_BUCKET in signed_url
    assert expires_at > datetime.now(timezone.utc)

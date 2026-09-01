from fastapi import APIRouter
from app.core.config import get_settings
from app.core.supabase import get_supabase_client

router = APIRouter(tags=["Health & System"])


@router.get("/health", summary="Health Check")
async def health_check():
    """Verify application health and database connection configuration status."""
    settings = get_settings()
    supabase_configured = bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)

    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "supabase_configured": supabase_configured,
    }

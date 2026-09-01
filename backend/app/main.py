from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.public import router as public_router
from app.routes.reports import router as reports_router
from app.routes.student import router as student_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "API for Student Health Report Card Platform (Phase 1: Admin Data Ingestion, "
        "Phase 2: Parent Search & OTP Auth, Phase 3: ML Health Risk Prediction Engine). "
        "Calculates exact WHO LMS Z-scores, assesses nutritional risks, suggests regional "
        "Indian meal plans, and delivers threshold-based explainability."
    ),
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health_router)
app.include_router(public_router)
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(reports_router)
app.include_router(admin_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected server error occurred: {str(exc)}"},
    )

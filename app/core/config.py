import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings loaded from environment or .env file."""

    APP_NAME: str = "Student Health Report Card Platform - Data Ingestion"
    APP_ENV: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8001

    # Supabase Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # Ingestion Configuration
    BATCH_SIZE: int = 500

    # JWT & Auth Configuration
    JWT_SECRET: str = "super-secret-dev-key-change-in-production-min-32-chars-long"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 30

    # OTP Configuration
    OTP_EXPIRY_MINUTES: int = 5
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RATE_LIMIT_MAX_REQUESTS: int = 3
    OTP_RATE_LIMIT_WINDOW_MINUTES: int = 15

    # MSG91 Configuration
    MSG91_AUTH_KEY: Optional[str] = None
    MSG91_SENDER_ID: Optional[str] = "SHWFPL"
    MSG91_TEMPLATE_ID: Optional[str] = None
    MSG91_OTP_EXPIRY: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()

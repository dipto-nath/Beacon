"""
Application configuration using Pydantic Settings.
All settings loaded from environment variables with validation.
"""
from functools import lru_cache
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── Environment ──────────────────────────────────────────────
    ENVIRONMENT: str = Field(default="development", pattern="^(development|staging|production)$")
    DEBUG: bool = False

    # ─── Database ─────────────────────────────────────────────────
    DATABASE_URL: str
    DATABASE_URL_SYNC: Optional[str] = None

    @field_validator("DATABASE_URL_SYNC", mode="before")
    @classmethod
    def _sync_url(cls, v: Optional[str], info) -> str:
        if v:
            return v
        # Derive sync URL from async URL
        async_url = info.data.get("DATABASE_URL", "")
        return async_url.replace("postgresql+asyncpg://", "postgresql://")

    # ─── Redis ────────────────────────────────────────────────────
    REDIS_URL: Optional[str] = None

    # ─── JWT Authentication ───────────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def _validate_secret(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters")
        return v

    # ─── Field Encryption ─────────────────────────────────────────
    FIELD_ENCRYPTION_KEY: str

    @field_validator("FIELD_ENCRYPTION_KEY")
    @classmethod
    def _validate_encryption_key(cls, v: str) -> str:
        import base64
        try:
            decoded = base64.b64decode(v)
            if len(decoded) != 32:
                raise ValueError
        except Exception:
            raise ValueError("FIELD_ENCRYPTION_KEY must be base64-encoded 32 bytes")
        return v

    # ─── OpenAI ───────────────────────────────────────────────────
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"

    # ─── Email (SendGrid) ─────────────────────────────────────────
    SENDGRID_API_KEY: Optional[str] = None
    EMAIL_FROM: str = "no-reply@beacon.ashford.ac.uk"
    EMAIL_FROM_NAME: str = "Beacon Wellbeing"

    # ─── SAML SSO ─────────────────────────────────────────────────
    SAML_IDP_METADATA_URL: Optional[str] = None
    SAML_SP_ENTITY_ID: Optional[str] = None
    SAML_SP_ACS_URL: Optional[str] = None
    SAML_SP_SLS_URL: Optional[str] = None
    SAML_CERT_PATH: Optional[str] = None
    SAML_KEY_PATH: Optional[str] = None

    # ─── Privacy & Escalation ─────────────────────────────────────
    K_ANONYMITY_THRESHOLD: int = 10
    ESCALATION_THRESHOLD_SINGLE: float = 0.75
    ESCALATION_THRESHOLD_CONSECUTIVE: float = 0.60
    CONSECUTIVE_DAYS_FOR_ESCALATION: int = 3

    # ─── CORS ─────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # ─── Rate Limiting ────────────────────────────────────────────
    RATE_LIMIT_LOGIN: int = 5
    RATE_LIMIT_LOGIN_WINDOW: int = 900
    RATE_LIMIT_CHECK_IN: int = 10
    RATE_LIMIT_CHECK_IN_WINDOW: int = 60
    RATE_LIMIT_API: int = 100
    RATE_LIMIT_API_WINDOW: int = 60

    # ─── Celery ───────────────────────────────────────────────────
    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None
    CELERY_TASK_SERIALIZER: str = "json"
    CELERY_RESULT_SERIALIZER: str = "json"
    CELERY_ACCEPT_CONTENT: str = "json"
    CELERY_TIMEZONE: str = "UTC"
    CELERY_BEAT_SCHEDULE_FILE: str = "./celerybeat-schedule"

    # ─── File Storage ─────────────────────────────────────────────
    STORAGE_TYPE: str = Field(default="local", pattern="^(local|s3)$")
    STORAGE_LOCAL_PATH: str = "./storage/exports"
    AWS_S3_BUCKET: Optional[str] = None
    AWS_REGION: str = "eu-west-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None

    # ─── Logging ──────────────────────────────────────────────────
    LOG_LEVEL: str = Field(default="INFO", pattern="^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$")
    LOG_FORMAT: str = Field(default="json", pattern="^(json|console)$")

    # ─── Derived Properties ───────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance for dependency injection."""
    return Settings()


settings = get_settings()
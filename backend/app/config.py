"""Application configuration from environment variables."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App Configuration
    env: str = Field(default="development", description="Environment: development, staging, production")
    app_name: str = Field(default="guardrails-platform", description="Application name")
    app_url: str = Field(default="http://localhost:8000", description="Application URL")
    port: int = Field(default=8000, ge=1, le=65535, description="Server port")

    # Security
    jwt_secret: str = Field(..., min_length=32, description="JWT signing secret (min 32 chars)")
    session_secret: str = Field(..., min_length=32, description="Session secret (min 32 chars)")
    cors_origins: str = Field(
        default="http://localhost:5173",
        description="Comma-separated list of allowed CORS origins",
    )
    csrf_enabled: bool = Field(default=True, description="Enable CSRF protection")
    cookie_secure: bool = Field(default=False, description="Secure cookies (HTTPS only)")
    hsts_enabled: bool = Field(default=False, description="Enable HSTS header")

    # Database
    database_url: str = Field(..., description="PostgreSQL connection URL")
    db_pool_size: int = Field(default=10, ge=1, le=100, description="Database pool size")
    db_max_overflow: int = Field(default=20, ge=0, description="Database max overflow")
    db_statement_timeout: int = Field(
        default=30, ge=1, description="Database statement timeout in seconds"
    )

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")
    redis_password: str = Field(default="", description="Redis password")

    # Observability
    log_level: str = Field(default="INFO", description="Logging level")
    otel_enabled: bool = Field(default=True, description="Enable OpenTelemetry")
    otel_exporter_otlp_endpoint: str = Field(
        default="http://localhost:4317", description="OTLP exporter endpoint"
    )
    otel_service_name: str = Field(
        default="guardrails-platform", description="OpenTelemetry service name"
    )

    # Rate Limits
    rate_limit_requests_per_minute: int = Field(
        default=100, ge=1, description="Requests per minute limit"
    )
    rate_limit_requests_per_hour: int = Field(
        default=1000, ge=1, description="Requests per hour limit"
    )
    rate_limit_requests_per_day: int = Field(
        default=10000, ge=1, description="Requests per day limit"
    )

    # Feature Flags
    feature_ml_detection: bool = Field(default=False, description="Enable ML-based detection")
    feature_streaming: bool = Field(default=True, description="Enable streaming responses")
    feature_proxy_enabled: bool = Field(default=True, description="Enable proxy service")

    @field_validator("cors_origins")
    @classmethod
    def parse_cors_origins(cls, v: str) -> List[str]:
        """Parse comma-separated CORS origins."""
        return [origin.strip() for origin in v.split(",") if origin.strip()]

    @field_validator("env")
    @classmethod
    def validate_env(cls, v: str) -> str:
        """Validate environment value."""
        allowed = {"development", "staging", "production"}
        if v.lower() not in allowed:
            raise ValueError(f"env must be one of {allowed}")
        return v.lower()

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level."""
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in allowed:
            raise ValueError(f"log_level must be one of {allowed}")
        return v.upper()

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.env == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.env == "development"


# Global settings instance
settings = Settings()


"""Application and environment models."""

from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import Column, String, DateTime, ForeignKey, ARRAY, JSON, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class App(Base):
    """Registered application model."""

    __tablename__ = "apps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False)
    description = Column(String)
    owners = Column(ARRAY(UUID), default=[])
    settings = Column(JSON, default={}, server_default="{}")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="apps")
    environments = relationship("Environment", back_populates="app", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("org_id", "slug", name="uq_apps_org_slug"),
    )


class Environment(Base):
    """Environment model (dev, staging, prod)."""

    __tablename__ = "environments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    app_id = Column(UUID(as_uuid=True), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(50), nullable=False)  # dev, staging, prod
    is_production = Column(Boolean, default=False, server_default="false")
    settings = Column(JSON, default={}, server_default="{}")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")

    # Relationships
    app = relationship("App", back_populates="environments")

    __table_args__ = (
        UniqueConstraint("app_id", "name", name="uq_environments_app_name"),
    )


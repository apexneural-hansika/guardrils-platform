"""Incident management models."""

from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    ARRAY,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from app.models.base import Base

# Enum
incident_status_enum = ENUM(
    "open",
    "investigating",
    "resolved",
    "false_positive",
    name="incident_status",
    create_type=True,
)


class Incident(Base):
    """Incident model."""

    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    # Grouping
    title = Column(String(255), nullable=False)
    description = Column(String)
    violation_ids = Column(ARRAY(UUID), nullable=False)
    
    # Status
    status = Column(incident_status_enum, default="open", server_default="open")
    severity = Column(String(20), nullable=False)
    
    # Assignment
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Resolution
    resolved_at = Column(DateTime(timezone=True))
    resolution_notes = Column(String)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    notes = relationship("IncidentNote", back_populates="incident", cascade="all, delete-orphan")


class IncidentNote(Base):
    """Incident note/comment model."""

    __tablename__ = "incident_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")

    # Relationships
    incident = relationship("Incident", back_populates="notes")


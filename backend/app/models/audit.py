"""Audit and tracing models."""

from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Integer,
    Float,
    JSON,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship
from app.models.base import Base
from app.models.policy import policy_scope_enum


class Request(Base):
    """Request audit log model (append-only)."""

    __tablename__ = "requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    trace_id = Column(String(64), unique=True, nullable=False)
    
    # Context
    org_id = Column(UUID(as_uuid=True), nullable=False)
    app_id = Column(UUID(as_uuid=True), nullable=False)
    env_id = Column(UUID(as_uuid=True))
    user_id = Column(String(255))  # External user ID
    session_id = Column(String(255))
    
    # Request details
    scope = Column(policy_scope_enum, nullable=False)
    input_hash = Column(String(64))  # Hash of input content
    input_preview = Column(String(500))  # First 500 chars (for search)
    token_count = Column(Integer)
    model = Column(String(100))
    
    # Metadata (using name="metadata" to keep DB column name, but Python attr is request_metadata)
    request_metadata = Column("metadata", JSON, default={}, server_default="{}")
    ip_address = Column(INET)
    user_agent = Column(String)
    
    # Timing
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")

    # Relationships
    decisions = relationship("Decision", back_populates="request", cascade="all, delete-orphan")
    violations = relationship("Violation", back_populates="request", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_requests_created_at", "created_at"),
        Index("idx_requests_app_env", "app_id", "env_id", "created_at"),
        Index("idx_requests_user", "org_id", "user_id", "created_at"),
    )


class Decision(Base):
    """Decision model (what action was taken)."""

    __tablename__ = "decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("requests.id", ondelete="CASCADE"), nullable=False)
    trace_id = Column(String(64), nullable=False)
    
    # Policy applied
    policy_id = Column(UUID(as_uuid=True), ForeignKey("policies.id"))
    policy_version_id = Column(UUID(as_uuid=True), ForeignKey("policy_versions.id"))
    policy_version_hash = Column(String(64))  # Snapshot for audit
    
    # Decision
    action = Column(String(20), nullable=False)  # allow, block, redact, etc.
    reason = Column(String)
    confidence = Column(Float)
    
    # Timing
    latency_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")

    # Relationships
    request = relationship("Request", back_populates="decisions")

    __table_args__ = (
        Index("idx_decisions_trace", "trace_id"),
    )


class Violation(Base):
    """Violation model (when checks fail)."""

    __tablename__ = "violations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("requests.id", ondelete="CASCADE"), nullable=False)
    trace_id = Column(String(64), nullable=False)
    
    # Check details
    check_name = Column(String(100), nullable=False)
    check_version = Column(String(20))
    
    # Violation details
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    category = Column(String(50))  # pii, security, quality, cost
    message = Column(String)
    evidence = Column(JSON, nullable=False)  # What was found
    
    # Location
    location_start = Column(Integer)
    location_end = Column(Integer)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")

    # Relationships
    request = relationship("Request", back_populates="violations")

    __table_args__ = (
        Index("idx_violations_severity", "severity", "created_at"),
        Index("idx_violations_check", "check_name", "created_at"),
    )


"""Policy and policy version models."""

from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    ARRAY,
    JSON,
    Integer,
    Boolean,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from app.models.base import Base

# Enums
policy_status_enum = ENUM(
    "draft",
    "active",
    "deprecated",
    "archived",
    name="policy_status",
    create_type=True,
)

policy_scope_enum = ENUM(
    "llm.input",
    "llm.output",
    "tool.call",
    "tool.result",
    "data.access",
    "all",
    name="policy_scope",
    create_type=True,
)


class Policy(Base):
    """Policy model."""

    __tablename__ = "policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False)
    description = Column(String)
    scope = Column(policy_scope_enum, nullable=False)
    status = Column(policy_status_enum, default="draft", server_default="draft")
    tags = Column(ARRAY(String), default=[])
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="policies")
    versions = relationship("PolicyVersion", back_populates="policy", cascade="all, delete-orphan")
    assignments = relationship("PolicyAssignment", back_populates="policy", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("org_id", "slug", name="uq_policies_org_slug"),
    )


class PolicyVersion(Base):
    """Policy version model (immutable)."""

    __tablename__ = "policy_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    policy_id = Column(UUID(as_uuid=True), ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, nullable=False)
    content_yaml = Column(String, nullable=False)  # Original YAML
    content_json = Column(JSON, nullable=False)  # Compiled JSON
    content_hash = Column(String(64), nullable=False)  # SHA-256 for audit
    changelog = Column(String)
    is_published = Column(Boolean, default=False, server_default="false")
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")

    # Relationships
    policy = relationship("Policy", back_populates="versions")

    __table_args__ = (
        UniqueConstraint("policy_id", "version", name="uq_policy_versions_policy_version"),
        Index("idx_policy_versions_published", "policy_id", "is_published", postgresql_where=(is_published == True)),
    )


class PolicyAssignment(Base):
    """Policy assignment model (which policies apply where)."""

    __tablename__ = "policy_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    policy_id = Column(UUID(as_uuid=True), ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    policy_version_id = Column(UUID(as_uuid=True), ForeignKey("policy_versions.id"))
    target_type = Column(String(20), nullable=False)  # org, app, env, team
    target_id = Column(UUID(as_uuid=True), nullable=False)
    priority = Column(Integer, default=100, server_default="100")  # Lower = higher priority
    enabled = Column(Boolean, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default="NOW()")
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    policy = relationship("Policy", back_populates="assignments")

    __table_args__ = (
        UniqueConstraint("policy_id", "target_type", "target_id", name="uq_policy_assignments"),
        Index("idx_policy_assignments_target", "target_type", "target_id", "enabled"),
    )


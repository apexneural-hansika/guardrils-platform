"""Audit log schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class RequestResponse(BaseModel):
    """Request audit log response."""

    id: UUID
    trace_id: str
    org_id: UUID
    app_id: UUID
    env_id: Optional[UUID]
    user_id: Optional[str]
    session_id: Optional[str]
    scope: str
    input_preview: Optional[str]
    model: Optional[str]
    token_count: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class DecisionResponse(BaseModel):
    """Decision response."""

    id: UUID
    request_id: UUID
    trace_id: str
    policy_id: Optional[UUID]
    action: str
    reason: Optional[str]
    confidence: Optional[float]
    latency_ms: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class ViolationResponse(BaseModel):
    """Violation response."""

    id: UUID
    request_id: UUID
    trace_id: str
    check_name: str
    check_version: Optional[str]
    severity: str
    category: Optional[str]
    message: Optional[str]
    evidence: dict
    location_start: Optional[int]
    location_end: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class RequestDetailResponse(BaseModel):
    """Detailed request response with decisions and violations."""

    request: RequestResponse
    decisions: List[DecisionResponse]
    violations: List[ViolationResponse]


class AuditQueryParams(BaseModel):
    """Query parameters for audit log search."""

    app_id: Optional[UUID] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    scope: Optional[str] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)


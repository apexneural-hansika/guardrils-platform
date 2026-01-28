"""Audit log API endpoints - Admin Only."""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.core.auth import get_current_org_id
from app.services.audit_service import AuditService
from app.schemas.audit import (
    RequestResponse,
    RequestDetailResponse,
    DecisionResponse,
    ViolationResponse,
)

router = APIRouter(
    prefix="/audit",
    tags=["Admin API - Audit Logs"],
    responses={
        401: {"description": "Unauthorized - Authentication required"},
        403: {"description": "Forbidden - Insufficient permissions"},
        404: {"description": "Not found - Resource does not exist"},
    },
)


def get_audit_service(db: AsyncSession = Depends(get_db)) -> AuditService:
    """Dependency to get audit service."""
    return AuditService(db)


@router.get(
    "/requests",
    response_model=list[RequestResponse],
    summary="List audit requests",
    description="""
    **Admin Endpoint** - Query audit log requests.
    
    Returns paginated list of requests with optional filters:
    - Filter by application, user, session
    - Filter by date range
    - Filter by scope (llm.input, llm.output, etc.)
    
    **Required:** Admin authentication for the organization.
    """,
)
async def list_requests(
    org_id: UUID = Query(..., description="Organization ID"),
    app_id: Optional[UUID] = Query(None, description="Filter by application"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    session_id: Optional[str] = Query(None, description="Filter by session ID"),
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    scope: Optional[str] = Query(None, description="Filter by scope"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_org_id: UUID = Depends(get_current_org_id),
    service: AuditService = Depends(get_audit_service),
):
    """List audit requests with filters."""
    # Verify org access (current_org_id already validated by get_current_org_id dependency)
    if current_org_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not have permission to access this organization"
        )

    # Parse dates
    from datetime import datetime
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None

    requests = await service.list_requests(
        org_id=org_id,
        app_id=app_id,
        user_id=user_id,
        session_id=session_id,
        start_date=start,
        end_date=end,
        scope=scope,
        skip=skip,
        limit=limit,
    )

    return requests


@router.get(
    "/requests/{trace_id}",
    response_model=RequestDetailResponse,
    summary="Get request by trace ID",
    description="""
    **Admin Endpoint** - Get detailed request information by trace ID.
    
    Returns full request details including:
    - Request metadata
    - All policy decisions
    - All violations detected
    
    **Required:** Admin authentication for the organization.
    """,
)
async def get_request(
    trace_id: str,
    org_id: UUID = Query(..., description="Organization ID"),
    current_org_id: UUID = Depends(get_current_org_id),
    service: AuditService = Depends(get_audit_service),
):
    """Get request by trace ID."""
    # Verify org access (current_org_id already validated by get_current_org_id dependency)
    if current_org_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not have permission to access this organization"
        )

    request = await service.get_request_by_trace_id(trace_id, org_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    return RequestDetailResponse(
        request=RequestResponse.model_validate(request),
        decisions=[DecisionResponse.model_validate(d) for d in request.decisions],
        violations=[ViolationResponse.model_validate(v) for v in request.violations],
    )


@router.get(
    "/sessions/{session_id}",
    response_model=list[RequestDetailResponse],
    summary="Get session requests",
    description="""
    **Admin Endpoint** - Get all requests for a session.
    
    Returns all requests in a conversation/session with full details.
    Useful for debugging user interactions or compliance audits.
    
    **Required:** Admin authentication for the organization.
    """,
)
async def get_session_requests(
    session_id: str,
    org_id: UUID = Query(..., description="Organization ID"),
    current_org_id: UUID = Depends(get_current_org_id),
    service: AuditService = Depends(get_audit_service),
):
    """Get all requests for a session."""
    # Verify org access (current_org_id already validated by get_current_org_id dependency)
    if current_org_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not have permission to access this organization"
        )

    requests = await service.get_session_requests(session_id, org_id)

    return [
        RequestDetailResponse(
            request=RequestResponse.model_validate(r),
            decisions=[DecisionResponse.model_validate(d) for d in r.decisions],
            violations=[ViolationResponse.model_validate(v) for v in r.violations],
        )
        for r in requests
    ]


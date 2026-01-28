"""Audit service for logging and querying audit trails."""

from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import selectinload
from app.models.audit import Request, Decision, Violation
from app.schemas.gateway import EvaluateResponse, PolicyDecision


class AuditService:
    """Service for managing audit logs."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_request(
        self,
        trace_id: str,
        org_id: UUID,
        app_id: UUID,
        scope: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        env_id: Optional[UUID] = None,
        input_text: Optional[str] = None,
        model: Optional[str] = None,
        token_count: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> Request:
        """
        Log a request to the audit trail.

        Args:
            trace_id: Unique trace ID
            org_id: Organization ID
            app_id: Application ID
            scope: Policy scope
            user_id: Optional user ID
            session_id: Optional session ID
            env_id: Optional environment ID
            input_text: Input content (will be hashed)
            model: LLM model name
            token_count: Token count
            ip_address: Client IP address
            user_agent: User agent string
            metadata: Additional metadata

        Returns:
            Created Request object
        """
        import hashlib

        # Hash input for privacy
        input_hash = None
        input_preview = None
        if input_text:
            input_hash = hashlib.sha256(input_text.encode()).hexdigest()
            input_preview = input_text[:500]  # First 500 chars for search

        request = Request(
            trace_id=trace_id,
            org_id=org_id,
            app_id=app_id,
            env_id=env_id,
            user_id=user_id,
            session_id=session_id,
            scope=scope,
            input_hash=input_hash,
            input_preview=input_preview,
            model=model,
            token_count=token_count,
            ip_address=ip_address,
            user_agent=user_agent,
            request_metadata=metadata or {},
        )

        self.db.add(request)
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def log_decision(
        self,
        request_id: UUID,
        trace_id: str,
        action: str,
        reason: str,
        policy_id: Optional[UUID] = None,
        policy_version_id: Optional[UUID] = None,
        policy_version_hash: Optional[str] = None,
        confidence: Optional[float] = None,
        latency_ms: Optional[int] = None,
    ) -> Decision:
        """
        Log a policy decision.

        Args:
            request_id: Request ID
            trace_id: Trace ID
            action: Action taken (allow, block, etc.)
            reason: Reason for decision
            policy_id: Policy ID
            policy_version_id: Policy version ID
            policy_version_hash: Policy version hash
            confidence: Confidence score
            latency_ms: Decision latency

        Returns:
            Created Decision object
        """
        decision = Decision(
            request_id=request_id,
            trace_id=trace_id,
            policy_id=policy_id,
            policy_version_id=policy_version_id,
            policy_version_hash=policy_version_hash,
            action=action,
            reason=reason,
            confidence=confidence,
            latency_ms=latency_ms,
        )

        self.db.add(decision)
        await self.db.commit()
        await self.db.refresh(decision)
        return decision

    async def log_violation(
        self,
        request_id: UUID,
        trace_id: str,
        check_name: str,
        severity: str,
        message: str,
        evidence: dict,
        check_version: Optional[str] = None,
        category: Optional[str] = None,
        location_start: Optional[int] = None,
        location_end: Optional[int] = None,
    ) -> Violation:
        """
        Log a policy violation.

        Args:
            request_id: Request ID
            trace_id: Trace ID
            check_name: Check name
            severity: Severity level (low, medium, high, critical)
            message: Violation message
            evidence: Evidence data
            check_version: Check version
            category: Violation category
            location_start: Start position in content
            location_end: End position in content

        Returns:
            Created Violation object
        """
        violation = Violation(
            request_id=request_id,
            trace_id=trace_id,
            check_name=check_name,
            check_version=check_version,
            severity=severity,
            category=category,
            message=message,
            evidence=evidence,
            location_start=location_start,
            location_end=location_end,
        )

        self.db.add(violation)
        await self.db.commit()
        await self.db.refresh(violation)
        return violation

    async def get_request_by_trace_id(
        self, trace_id: str, org_id: UUID
    ) -> Optional[Request]:
        """
        Get request by trace ID (with authorization check).

        Args:
            trace_id: Trace ID
            org_id: Organization ID (for authorization)

        Returns:
            Request object if found and authorized
        """
        result = await self.db.execute(
            select(Request)
            .where(and_(Request.trace_id == trace_id, Request.org_id == org_id))
            .options(selectinload(Request.decisions), selectinload(Request.violations))
        )
        return result.scalar_one_or_none()

    async def list_requests(
        self,
        org_id: UUID,
        app_id: Optional[UUID] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        scope: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Request]:
        """
        List requests with filters.

        Args:
            org_id: Organization ID
            app_id: Optional application filter
            user_id: Optional user filter
            session_id: Optional session filter
            start_date: Optional start date
            end_date: Optional end date
            scope: Optional scope filter
            skip: Pagination offset
            limit: Pagination limit

        Returns:
            List of Request objects
        """
        query = select(Request).where(Request.org_id == org_id)

        if app_id:
            query = query.where(Request.app_id == app_id)
        if user_id:
            query = query.where(Request.user_id == user_id)
        if session_id:
            query = query.where(Request.session_id == session_id)
        if start_date:
            query = query.where(Request.created_at >= start_date)
        if end_date:
            query = query.where(Request.created_at <= end_date)
        if scope:
            query = query.where(Request.scope == scope)

        query = query.order_by(desc(Request.created_at)).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_session_requests(
        self, session_id: str, org_id: UUID
    ) -> List[Request]:
        """
        Get all requests for a session.

        Args:
            session_id: Session ID
            org_id: Organization ID

        Returns:
            List of Request objects
        """
        result = await self.db.execute(
            select(Request)
            .where(and_(Request.session_id == session_id, Request.org_id == org_id))
            .order_by(desc(Request.created_at))
            .options(selectinload(Request.decisions), selectinload(Request.violations))
        )
        return list(result.scalars().all())


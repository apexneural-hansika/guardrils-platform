"""Gateway API endpoints - For SDK/User Integration."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.gateway import (
    EvaluateRequest,
    EvaluateResponse,
    InterceptRequest,
    InterceptResponse,
)
from app.services.gateway_service import GatewayService
from app.services.audit_service import AuditService
from app.core.rate_limiter import check_rate_limit_dependency
from app.core.auth import get_current_org_id
from app.dependencies import get_db
from app.models.app import App
from sqlalchemy import select
from uuid import UUID

router = APIRouter(
    prefix="/gateway",
    tags=["User API - SDK Integration"],
    responses={
        400: {"description": "Bad request - Invalid input"},
        401: {"description": "Unauthorized - Invalid or missing API key"},
        403: {"description": "Forbidden - Request blocked by policy"},
        429: {"description": "Too many requests - Rate limit exceeded"},
    },
)


async def get_gateway_service(
    db: AsyncSession = Depends(get_db),
) -> GatewayService:
    """Dependency to get gateway service instance with audit logging."""
    audit_service = AuditService(db)
    return GatewayService(db=db, audit_service=audit_service)


@router.post(
    "/evaluate",
    response_model=EvaluateResponse,
    summary="Evaluate content against policies",
    description="""
    **User Endpoint** - For SDK integration and custom implementations.
    
    Evaluates content (text, messages, tool calls) against applicable policies
    without executing the actual LLM/tool call.
    
    **Use Cases:**
    - Pre-flight checks before LLM calls
    - Post-processing validation
    - Custom integration workflows
    
    **Authentication:** Requires `X-API-Key` header with valid API key.
    
    **Returns:** Policy decision (allow, block, redact, rewrite) with detailed reasoning.
    """,
)
async def evaluate(
    request: EvaluateRequest,
    http_request: Request,
    gateway: GatewayService = Depends(get_gateway_service),
    org_id: UUID = Depends(get_current_org_id),
) -> EvaluateResponse:
    """
    Evaluate content against applicable policies.

    Returns decision without executing the actual LLM/tool call.
    Use this for pre-flight checks or custom integration.
    """
    # Check rate limit
    await check_rate_limit_dependency(http_request)
    
    # Get client IP and user agent
    client_ip = http_request.client.host if http_request.client else None
    user_agent = http_request.headers.get("User-Agent")
    
    return await gateway.evaluate(
        request,
        org_id=org_id,
        ip_address=client_ip,
        user_agent=user_agent,
    )


@router.post(
    "/intercept",
    response_model=InterceptResponse,
    summary="Full LLM call interception",
    description="""
    **User Endpoint** - For SDK integration (recommended).
    
    Complete interception flow that:
    1. Evaluates input policies
    2. Executes the LLM call (if allowed)
    3. Evaluates output policies
    4. Returns (possibly modified) response
    
    **Use Cases:**
    - SDK `wrap()` method implementation
    - Proxy service integration
    - Automatic policy enforcement
    
    **Authentication:** Requires `X-API-Key` header with valid API key.
    
    **Returns:** Complete interception result with input/output decisions and final response.
    """,
)
async def intercept(
    request: InterceptRequest,
    http_request: Request,
    gateway: GatewayService = Depends(get_gateway_service),
    org_id: UUID = Depends(get_current_org_id),
) -> InterceptResponse:
    """
    Full interception flow:
    1. Evaluate input policies
    2. Execute the call (if allowed)
    3. Evaluate output policies
    4. Return (possibly modified) response

    Use this for SDK/proxy integration.
    """
    # Check rate limit
    await check_rate_limit_dependency(http_request)
    
    # Get client IP and user agent
    client_ip = http_request.client.host if http_request.client else None
    user_agent = http_request.headers.get("User-Agent")
    
    return await gateway.intercept(
        request,
        org_id=org_id,
        ip_address=client_ip,
        user_agent=user_agent,
    )


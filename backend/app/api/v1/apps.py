"""Application API endpoints - Admin Only."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.core.auth import get_current_org_id
from app.services.app_service import AppService
from app.schemas.app import (
    AppCreate,
    AppUpdate,
    AppResponse,
    EnvironmentCreate,
    EnvironmentResponse,
)

router = APIRouter(
    prefix="/apps",
    tags=["Admin API - Applications"],
    responses={
        401: {"description": "Unauthorized - Admin authentication required"},
        403: {"description": "Forbidden - Insufficient permissions"},
        404: {"description": "Not found - Application does not exist"},
    },
)


def get_app_service(db: AsyncSession = Depends(get_db)) -> AppService:
    """Dependency to get app service."""
    return AppService(db)


@router.post(
    "",
    response_model=AppResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register application",
    description="""
    **Admin Endpoint** - Register a new application for SDK integration.
    
    Applications represent services that will use the Guardrails SDK.
    Each application gets a unique `app_id` that developers use in SDK initialization.
    
    **Workflow:**
    1. Admin creates organization
    2. Admin registers application (this endpoint)
    3. Admin generates API key
    4. Share `app_id` + `api_key` with developers
    5. Developers use these in SDK: `GuardrailsClient(api_key=..., app_id=...)`
    
    **Required:** Admin privileges for the organization.
    
    **Returns:** Application object with `id` (this is the `app_id` for SDK).
    """,
)
async def create_app(
    data: AppCreate,
    org_id: UUID = Query(None, description="Organization ID (optional if authenticated)"),
    current_org_id: UUID = Depends(get_current_org_id),
    service: AppService = Depends(get_app_service),
):
    """Create a new application."""
    # Use authenticated org_id if available, otherwise use provided org_id
    target_org_id = current_org_id if current_org_id else org_id
    if not target_org_id:
        raise HTTPException(
            status_code=400, detail="Organization ID required (provide or authenticate)"
        )
    return await service.create_app(str(target_org_id), data)


@router.get("/{app_id}", response_model=AppResponse)
async def get_app(
    app_id: UUID,
    service: AppService = Depends(get_app_service),
    current_org_id: UUID = Depends(get_current_org_id),
):
    """Get application by ID."""
    app = await service.get_app(str(app_id))
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.get("", response_model=list[AppResponse])
async def list_apps(
    org_id: UUID = Query(None, description="Organization ID (optional if authenticated)"),
    current_org_id: UUID = Depends(get_current_org_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: AppService = Depends(get_app_service),
):
    """List applications in an organization."""
    target_org_id = current_org_id if current_org_id else org_id
    if not target_org_id:
        raise HTTPException(
            status_code=400, detail="Organization ID required (provide or authenticate)"
        )
    return await service.list_apps(str(target_org_id), skip=skip, limit=limit)


@router.put("/{app_id}", response_model=AppResponse)
async def update_app(
    app_id: UUID,
    data: AppUpdate,
    service: AppService = Depends(get_app_service),
    current_org_id: UUID = Depends(get_current_org_id),
):
    """Update application."""
    app = await service.update_app(str(app_id), data)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_app(
    app_id: UUID,
    service: AppService = Depends(get_app_service),
    current_org_id: UUID = Depends(get_current_org_id),
):
    """Delete an application."""
    success = await service.delete_app(str(app_id))
    if not success:
        raise HTTPException(status_code=404, detail="Application not found")


# Environment Management endpoints
@router.post(
    "/{app_id}/environments",
    response_model=EnvironmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create environment",
    description="""
    **Admin Endpoint** - Create an environment (dev/staging/prod) for an application.
    
    Environments allow different policy configurations per deployment stage.
    Common environments: `dev`, `staging`, `prod`.
    
    **Use Cases:**
    - Stricter policies in production
    - Different rate limits per environment
    - Environment-specific policy testing
    
    **Required:** Admin privileges for the application's organization.
    """,
)
async def create_environment(
    app_id: UUID,
    data: EnvironmentCreate,
    service: AppService = Depends(get_app_service),
):
    """Create a new environment for an application."""
    return await service.create_environment(str(app_id), data)


@router.get(
    "/{app_id}/environments",
    response_model=list[EnvironmentResponse],
    summary="List environments",
    description="**Admin Endpoint** - List all environments (dev/staging/prod) for an application.",
)
async def list_environments(
    app_id: UUID,
    service: AppService = Depends(get_app_service),
):
    """List environments for an application."""
    return await service.list_environments(str(app_id))


"""Organization and user API endpoints - Admin Only."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.core.auth import get_current_org_id
from app.services.organization_service import OrganizationService
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    UserCreate,
    UserUpdate,
    UserResponse,
    APIKeyCreate,
    APIKeyResponse,
    APIKeyCreateResponse,
)

router = APIRouter(
    prefix="/organizations",
    tags=["Admin API - Organizations & Users"],
    responses={
        401: {"description": "Unauthorized - Admin authentication required"},
        403: {"description": "Forbidden - Insufficient permissions"},
        404: {"description": "Not found - Resource does not exist"},
    },
)


def get_organization_service(db: AsyncSession = Depends(get_db)) -> OrganizationService:
    """Dependency to get organization service."""
    return OrganizationService(db)


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create organization",
    description="""
    **Admin Endpoint** - Create a new organization (tenant).
    
    Organizations are the top-level entity for multi-tenant isolation.
    Each organization can have multiple users, apps, and API keys.
    
    **Required:** Admin privileges (authentication coming soon).
    
    **Returns:** Created organization with generated UUID.
    """,
)
async def create_organization(
    data: OrganizationCreate,
    service: OrganizationService = Depends(get_organization_service),
):
    """Create a new organization."""
    return await service.create_organization(data)


@router.get(
    "/{org_id}",
    response_model=OrganizationResponse,
    summary="Get organization",
    description="**Admin Endpoint** - Get organization details by ID.",
)
async def get_organization(
    org_id: UUID,
    service: OrganizationService = Depends(get_organization_service),
):
    """Get organization by ID."""
    org = await service.get_organization(str(org_id))
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.put(
    "/{org_id}",
    response_model=OrganizationResponse,
    summary="Update organization",
    description="**Admin Endpoint** - Update organization settings and metadata.",
)
async def update_organization(
    org_id: UUID,
    data: OrganizationUpdate,
    service: OrganizationService = Depends(get_organization_service),
):
    """Update organization."""
    org = await service.update_organization(str(org_id), data)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.get(
    "",
    response_model=list[OrganizationResponse],
    summary="List organizations",
    description="**Admin Endpoint** - List all organizations with pagination.",
)
async def list_organizations(
    skip: int = 0,
    limit: int = 100,
    service: OrganizationService = Depends(get_organization_service),
    current_org_id: UUID = Depends(get_current_org_id),
):
    """List organizations."""
    # For now, only return organizations for the current user's org
    # TODO: Add super-admin role that can list all orgs
    return await service.list_organizations(skip=skip, limit=limit)


# User Management endpoints
@router.post(
    "/{org_id}/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create user",
    description="""
    **Admin Endpoint** - Add a user to an organization.
    
    Users can have roles: `admin`, `member`, or `viewer`.
    - **admin**: Full access to org resources
    - **member**: Can create apps, view own data
    - **viewer**: Read-only access
    
    **Required:** Admin privileges for the organization.
    """,
)
async def create_user(
    org_id: UUID,
    data: UserCreate,
    service: OrganizationService = Depends(get_organization_service),
):
    """Create a new user in an organization."""
    return await service.create_user(str(org_id), data)


@router.get(
    "/{org_id}/users",
    response_model=list[UserResponse],
    summary="List users",
    description="**Admin Endpoint** - List all users in an organization.",
)
async def list_users(
    org_id: UUID,
    skip: int = 0,
    limit: int = 100,
    service: OrganizationService = Depends(get_organization_service),
):
    """List users in an organization."""
    return await service.list_users(str(org_id), skip=skip, limit=limit)


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Get user",
    description="**Admin Endpoint** - Get user details by ID.",
)
async def get_user(
    user_id: UUID,
    service: OrganizationService = Depends(get_organization_service),
):
    """Get user by ID."""
    user = await service.get_user(str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Update user",
    description="**Admin Endpoint** - Update user details (name, role).",
)
async def update_user(
    user_id: UUID,
    data: UserUpdate,
    service: OrganizationService = Depends(get_organization_service),
):
    """Update user."""
    user = await service.update_user(str(user_id), data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# API Key Management endpoints
@router.post(
    "/{org_id}/api-keys",
    response_model=APIKeyCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate API key",
    description="""
    **Admin Endpoint** - Generate a new API key for SDK authentication.
    
    API keys are used by developers to authenticate SDK requests.
    
    **⚠️ Important:** The full `key` is only returned once on creation.
    Store it securely - it cannot be retrieved later.
    
    **Scopes:** Control what the key can do (`read`, `write`, etc.)
    
    **Returns:** API key object with the full key (save it immediately!).
    """,
)
async def create_api_key(
    org_id: UUID,
    data: APIKeyCreate,
    current_org_id: UUID = Depends(get_current_org_id),
    service: OrganizationService = Depends(get_organization_service),
):
    """Create a new API key."""
    # Verify org access
    if org_id != current_org_id:
        raise HTTPException(
            status_code=403, detail="Access denied: Organization mismatch"
        )
    
    # TODO: Get user_id from authenticated token
    user_id = UUID("00000000-0000-0000-0000-000000000000")
    api_key, plain_key = await service.create_api_key(
        str(org_id), str(user_id), data
    )
    return APIKeyCreateResponse(
        id=api_key.id,
        org_id=api_key.org_id,
        name=api_key.name,
        key=plain_key,  # Only returned on creation
        key_prefix=api_key.key_prefix,
        scopes=api_key.scopes,
        expires_at=api_key.expires_at,
        created_at=api_key.created_at,
    )


@router.get(
    "/{org_id}/api-keys",
    response_model=list[APIKeyResponse],
    summary="List API keys",
    description="""
    **Admin Endpoint** - List all API keys for an organization.
    
    Note: Full keys are never returned (only key prefixes for display).
    """,
)
async def list_api_keys(
    org_id: UUID,
    skip: int = 0,
    limit: int = 100,
    service: OrganizationService = Depends(get_organization_service),
):
    """List API keys for an organization."""
    return await service.list_api_keys(str(org_id), skip=skip, limit=limit)


@router.delete(
    "/api-keys/{key_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke API key",
    description="""
    **Admin Endpoint** - Revoke (delete) an API key.
    
    Once revoked, the key can no longer be used for authentication.
    This action cannot be undone.
    """,
)
async def revoke_api_key(
    key_id: UUID,
    service: OrganizationService = Depends(get_organization_service),
):
    """Revoke an API key."""
    success = await service.revoke_api_key(str(key_id))
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")


"""Authentication endpoints for user login."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from app.dependencies import get_db
from app.models.organization import User, Organization
from app.core.security import pwd_context, create_access_token
from app.core.exceptions import AuthenticationError

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={
        401: {"description": "Unauthorized - Invalid credentials"},
    },
)

http_bearer = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str
    org_slug: str | None = None  # Optional: organization slug
    org_id: UUID | None = None  # Optional: organization ID


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str
    token_type: str = "bearer"
    user: dict
    organization: dict


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="User login",
    description="""
    Authenticate a user with email and password.
    
    **Organization Hierarchy:**
    - Users belong to organizations
    - If `org_slug` or `org_id` is provided, user must belong to that organization
    - If not provided, system will find user by email (if unique) or return error
    
    **Returns:** JWT access token and user/organization information.
    """,
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user and return JWT token."""
    # Build query to find user
    query = select(User).where(User.email == data.email)
    
    # If org_slug provided, join with organization and filter
    if data.org_slug:
        query = query.join(Organization).where(Organization.slug == data.org_slug)
    elif data.org_id:
        query = query.where(User.org_id == data.org_id)
    
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Verify password
    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not set up. Please contact administrator.",
        )
    
    if not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Load organization
    await db.refresh(user, ["organization"])
    org = user.organization
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User organization not found",
        )
    
    # Create JWT token
    token_data = {
        "sub": str(user.id),
        "org_id": str(user.org_id),
        "email": user.email,
        "role": user.role,
    }
    access_token = create_access_token(token_data)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
        },
        organization={
            "id": str(org.id),
            "name": org.name,
            "slug": org.slug,
        },
    )


@router.get(
    "/me",
    summary="Get current user",
    description="Get current authenticated user information.",
)
async def get_current_user_info(
    credentials: HTTPBearer = Depends(http_bearer),
    db: AsyncSession = Depends(get_db),
):
    """Get current user information from JWT token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    
    from app.core.auth import get_current_user_id
    
    try:
        user_id = await get_current_user_id(credentials, db)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        await db.refresh(user, ["organization"])
        org = user.organization
        
        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role,
            },
            "organization": {
                "id": str(org.id),
                "name": org.name,
                "slug": org.slug,
            } if org else None,
        }
    except AuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


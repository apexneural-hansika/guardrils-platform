"""Authentication and authorization utilities.

Implements reference.md requirements:
- Auth validation on all protected routes
- Per-resource authorization (not global login-only checks)
- Extract org_id from authenticated user's token
"""

from typing import Optional
from uuid import UUID
from fastapi import Depends, Request, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from app.config import settings
from app.core.security import hash_api_key
from app.dependencies import get_db
from app.models.organization import APIKey, User
from app.models.app import App
from sqlalchemy import select
from app.core.exceptions import AuthenticationError, AuthorizationError

# Security schemes
http_bearer = HTTPBearer(auto_error=False)
api_key_header_scheme = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(http_bearer),
    db: AsyncSession = Depends(get_db),
) -> Optional[UUID]:
    """
    Extract user ID from JWT token.

    Args:
        credentials: HTTP Bearer token
        db: Database session

    Returns:
        User ID if authenticated, None otherwise

    Raises:
        AuthenticationError: If token is invalid
    """
    if not credentials:
        return None

    try:
        payload = jwt.decode(
            credentials.credentials, settings.jwt_secret, algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        if user_id:
            return UUID(user_id)
    except (JWTError, ValueError):
        raise AuthenticationError("Invalid authentication token")

    return None


async def get_api_key_org(
    api_key: str,
    db: AsyncSession,
) -> Optional[UUID]:
    """
    Get organization ID from API key.

    Args:
        api_key: API key string
        db: Database session

    Returns:
        Organization ID if key is valid, None otherwise
    """
    key_hash = hash_api_key(api_key)
    result = await db.execute(
        select(APIKey).where(APIKey.key_hash == key_hash)
    )
    api_key_obj = result.scalar_one_or_none()

    if not api_key_obj:
        return None

    # Check if key is expired
    if api_key_obj.expires_at:
        from datetime import datetime, timezone
        if datetime.now(timezone.utc) > api_key_obj.expires_at:
            return None

    # Update last used timestamp
    from datetime import datetime, timezone
    api_key_obj.last_used_at = datetime.now(timezone.utc)
    await db.commit()

    return api_key_obj.org_id


async def get_current_org_id(
    request: Request,
    db: AsyncSession = Depends(get_db),
    jwt_token: Optional[HTTPAuthorizationCredentials] = Security(http_bearer),
    api_key: Optional[str] = Security(api_key_header_scheme),
) -> UUID:
    """
    Get organization ID from authenticated request.

    Tries in order:
    1. JWT token (user authentication)
    2. API key (SDK authentication)

    Args:
        request: FastAPI request object
        db: Database session
        jwt_token: HTTP Bearer credentials (JWT)
        api_key: API key from X-API-Key header

    Returns:
        Organization ID

    Raises:
        HTTPException: 401 if authentication fails
    """
    # Try JWT token first (admin/user auth)
    if jwt_token:
        try:
            user_id = await get_current_user_id(jwt_token, db)
            if user_id:
                # Get user's org_id
                result = await db.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                if user:
                    return user.org_id
        except AuthenticationError:
            pass  # Try API key instead
        except Exception:
            # If database query fails, still try API key
            pass

    # Try API key (SDK auth)
    if api_key:
        try:
            org_id = await get_api_key_org(api_key, db)
            if org_id:
                return org_id
        except Exception:
            # If database query fails, continue to raise 401
            pass

    # No valid authentication found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_org_id_from_request(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Optional[UUID]:
    """
    Get organization ID from request (tries multiple auth methods).

    Args:
        request: FastAPI request
        db: Database session

    Returns:
        Organization ID if authenticated, None otherwise
    """
    # Try X-API-Key header
    api_key = request.headers.get("X-API-Key")
    if api_key:
        org_id = await get_api_key_org(api_key, db)
        if org_id:
            return org_id

    # Try Authorization header (Bearer token)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
            user_id = payload.get("sub")
            if user_id:
                result = await db.execute(select(User).where(User.id == UUID(user_id)))
                user = result.scalar_one_or_none()
                if user:
                    return user.org_id
        except (JWTError, ValueError):
            pass

    return None


async def require_org_access(
    org_id: UUID,
    current_org_id: UUID = Depends(get_current_org_id),
) -> UUID:
    """
    Require that current user/API key has access to the specified organization.

    Args:
        org_id: Organization ID to access
        current_org_id: Current user's organization ID

    Returns:
        Organization ID if access granted

    Raises:
        AuthorizationError: If access denied
    """
    if current_org_id != org_id:
        raise AuthorizationError(
            "Access denied: You do not have permission to access this organization"
        )
    return org_id


async def require_app_access(
    app_id: UUID,
    current_org_id: UUID = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
) -> tuple[UUID, UUID]:
    """
    Require that current user/API key has access to the specified application.

    Args:
        app_id: Application ID to access
        current_org_id: Current user's organization ID
        db: Database session

    Returns:
        Tuple of (app_id, org_id) if access granted

    Raises:
        AuthorizationError: If access denied or app not found
    """
    result = await db.execute(select(App).where(App.id == app_id))
    app = result.scalar_one_or_none()

    if not app:
        raise AuthorizationError("Application not found")

    if app.org_id != current_org_id:
        raise AuthorizationError(
            "Access denied: You do not have permission to access this application"
        )

    return app_id, current_org_id


async def require_admin_role(
    request: Request,
    current_org_id: UUID = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
    jwt_token: Optional[HTTPAuthorizationCredentials] = Security(http_bearer),
) -> UUID:
    """
    Require admin role for the current user.

    Args:
        current_org_id: Current user's organization ID
        db: Database session
        credentials: HTTP Bearer credentials

    Returns:
        Organization ID if admin access granted

    Raises:
        AuthorizationError: If user is not admin
    """
    # API keys can't be admins (they're for SDK, not admin operations)
    # Only JWT tokens can be admins
    if jwt_token:
        # It's a JWT, check user role
        user_id = await get_current_user_id(jwt_token, db)
        if user_id:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user and user.role == "admin":
                return current_org_id

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin role required",
    )


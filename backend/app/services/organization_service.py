"""Organization and user service."""

from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.organization import Organization, User, APIKey
from app.core.security import hash_api_key, generate_api_key, pwd_context
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    UserCreate,
    UserUpdate,
    APIKeyCreate,
)


class OrganizationService:
    """Service for managing organizations, users, and API keys."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_organization(self, data: OrganizationCreate) -> Organization:
        """Create a new organization."""
        # Generate slug if not provided
        slug = data.slug or data.name.lower().replace(" ", "-")[:100]

        org = Organization(
            name=data.name,
            slug=slug,
            settings={},
        )
        self.db.add(org)
        await self.db.commit()
        await self.db.refresh(org)
        return org

    async def get_organization(self, org_id: str) -> Organization | None:
        """Get organization by ID."""
        result = await self.db.execute(
            select(Organization).where(Organization.id == org_id)
        )
        return result.scalar_one_or_none()

    async def update_organization(
        self, org_id: str, data: OrganizationUpdate
    ) -> Organization | None:
        """Update organization."""
        org = await self.get_organization(org_id)
        if not org:
            return None

        if data.name is not None:
            org.name = data.name
        if data.settings is not None:
            org.settings = data.settings

        await self.db.commit()
        await self.db.refresh(org)
        return org

    async def list_organizations(self, skip: int = 0, limit: int = 100):
        """List organizations."""
        result = await self.db.execute(
            select(Organization).offset(skip).limit(limit)
        )
        return result.scalars().all()

    # User methods
    async def create_user(self, org_id: str, data: UserCreate) -> User:
        """Create a new user."""
        password_hash = None
        if data.password:
            password_hash = pwd_context.hash(data.password)
        
        user = User(
            org_id=org_id,
            email=data.email,
            name=data.name,
            password_hash=password_hash,
            role=data.role,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_user(self, user_id: str) -> User | None:
        """Get user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def list_users(self, org_id: str, skip: int = 0, limit: int = 100):
        """List users in an organization."""
        result = await self.db.execute(
            select(User).where(User.org_id == org_id).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update_user(self, user_id: str, data: UserUpdate) -> User | None:
        """Update user."""
        user = await self.get_user(user_id)
        if not user:
            return None

        if data.name is not None:
            user.name = data.name
        if data.role is not None:
            user.role = data.role

        await self.db.commit()
        await self.db.refresh(user)
        return user

    # API Key methods
    async def create_api_key(
        self, org_id: str, user_id: str, data: APIKeyCreate
    ) -> tuple[APIKey, str]:
        """Create a new API key. Returns (APIKey, plain_key)."""
        plain_key, key_prefix = generate_api_key()
        key_hash = hash_api_key(plain_key)

        api_key = APIKey(
            org_id=org_id,
            name=data.name,
            key_hash=key_hash,
            key_prefix=key_prefix,
            scopes=data.scopes,
            expires_at=data.expires_at,
            created_by=user_id,
        )
        self.db.add(api_key)
        await self.db.commit()
        await self.db.refresh(api_key)
        return api_key, plain_key

    async def list_api_keys(self, org_id: str, skip: int = 0, limit: int = 100):
        """List API keys for an organization."""
        result = await self.db.execute(
            select(APIKey)
            .where(APIKey.org_id == org_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def revoke_api_key(self, key_id: str) -> bool:
        """Revoke an API key by deleting it."""
        result = await self.db.execute(
            select(APIKey).where(APIKey.id == key_id)
        )
        api_key = result.scalar_one_or_none()
        if not api_key:
            return False

        await self.db.delete(api_key)
        await self.db.commit()
        return True


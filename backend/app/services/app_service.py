"""Application service."""

from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.app import App, Environment
from app.schemas.app import AppCreate, AppUpdate, EnvironmentCreate


class AppService:
    """Service for managing applications and environments."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_app(self, org_id: str, data: AppCreate) -> App:
        """Create a new application."""
        # Generate slug if not provided
        slug = data.slug or data.name.lower().replace(" ", "-")[:100]

        app = App(
            org_id=org_id,
            name=data.name,
            slug=slug,
            description=data.description,
            settings=data.settings or {},
        )
        self.db.add(app)
        await self.db.commit()
        await self.db.refresh(app)
        return app

    async def get_app(self, app_id: str) -> App | None:
        """Get application by ID."""
        result = await self.db.execute(select(App).where(App.id == app_id))
        return result.scalar_one_or_none()

    async def list_apps(self, org_id: str, skip: int = 0, limit: int = 100):
        """List applications in an organization."""
        result = await self.db.execute(
            select(App).where(App.org_id == org_id).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update_app(self, app_id: str, data: AppUpdate) -> App | None:
        """Update application."""
        app = await self.get_app(app_id)
        if not app:
            return None

        if data.name is not None:
            app.name = data.name
        if data.description is not None:
            app.description = data.description
        if data.settings is not None:
            app.settings = data.settings

        await self.db.commit()
        await self.db.refresh(app)
        return app

    async def delete_app(self, app_id: str) -> bool:
        """Delete an application."""
        app = await self.get_app(app_id)
        if not app:
            return False

        await self.db.delete(app)
        await self.db.commit()
        return True

    # Environment methods
    async def create_environment(
        self, app_id: str, data: EnvironmentCreate
    ) -> Environment:
        """Create a new environment."""
        env = Environment(
            app_id=app_id,
            name=data.name,
            is_production=data.is_production,
            settings=data.settings or {},
        )
        self.db.add(env)
        await self.db.commit()
        await self.db.refresh(env)
        return env

    async def list_environments(self, app_id: str):
        """List environments for an application."""
        result = await self.db.execute(
            select(Environment).where(Environment.app_id == app_id)
        )
        return result.scalars().all()


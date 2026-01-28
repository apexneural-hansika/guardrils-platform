"""Application schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class AppCreate(BaseModel):
    """Schema for creating an application."""

    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    settings: Optional[dict] = None


class AppUpdate(BaseModel):
    """Schema for updating an application."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    settings: Optional[dict] = None


class AppResponse(BaseModel):
    """Schema for application response."""

    id: UUID
    org_id: UUID
    name: str
    slug: str
    description: Optional[str]
    owners: list[UUID]
    settings: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnvironmentCreate(BaseModel):
    """Schema for creating an environment."""

    name: str = Field(..., pattern="^(dev|staging|prod)$")
    is_production: bool = False
    settings: Optional[dict] = None


class EnvironmentResponse(BaseModel):
    """Schema for environment response."""

    id: UUID
    app_id: UUID
    name: str
    is_production: bool
    settings: dict
    created_at: datetime

    class Config:
        from_attributes = True


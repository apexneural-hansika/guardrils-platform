"""Organization and user schemas."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


# Organization Schemas
class OrganizationCreate(BaseModel):
    """Schema for creating an organization."""

    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    settings: Optional[dict] = None


class OrganizationResponse(BaseModel):
    """Schema for organization response."""

    id: UUID
    name: str
    slug: str
    settings: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# User Schemas
class UserCreate(BaseModel):
    """Schema for creating a user."""

    email: EmailStr
    name: Optional[str] = Field(None, max_length=255)
    password: Optional[str] = Field(None, min_length=8)  # Optional for backward compatibility
    role: str = Field("member", pattern="^(admin|member|viewer)$")


class UserUpdate(BaseModel):
    """Schema for updating a user."""

    name: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, pattern="^(admin|member|viewer)$")


class UserResponse(BaseModel):
    """Schema for user response."""

    id: UUID
    org_id: UUID
    email: str
    name: Optional[str]
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# API Key Schemas
class APIKeyCreate(BaseModel):
    """Schema for creating an API key."""

    name: str = Field(..., min_length=1, max_length=255)
    scopes: list[str] = Field(default_factory=lambda: ["read", "write"])
    expires_at: Optional[datetime] = None


class APIKeyResponse(BaseModel):
    """Schema for API key response (without the actual key)."""

    id: UUID
    org_id: UUID
    name: str
    key_prefix: str
    scopes: list[str]
    last_used_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class APIKeyCreateResponse(BaseModel):
    """Schema for API key creation response (includes the key once)."""

    id: UUID
    org_id: UUID
    name: str
    key: str  # Only returned on creation
    key_prefix: str
    scopes: list[str]
    expires_at: Optional[datetime]
    created_at: datetime


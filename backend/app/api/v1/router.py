"""Main v1 API router.

Organized by endpoint type:
- User API: SDK integration endpoints (gateway)
- Admin API: Platform management (organizations, apps, users, API keys)
- System: Health checks and monitoring
"""

from fastapi import APIRouter
from app.api import health
from app.api.v1 import gateway, organizations, apps, auth

router = APIRouter(prefix="/v1")

# System endpoints (health, monitoring)
router.include_router(health.router)

# Authentication endpoints
router.include_router(auth.router)

# User API endpoints (SDK integration)
router.include_router(gateway.router)

# Admin API endpoints (platform management)
router.include_router(organizations.router)
router.include_router(apps.router)

# Import and include audit router
from app.api.v1 import audit

router.include_router(audit.router)

# TODO: Add other routers as they are implemented
# router.include_router(policies.router)  # Admin API


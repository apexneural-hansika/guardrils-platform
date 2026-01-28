"""Health check endpoints - System Monitoring."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from app.dependencies import get_db, get_redis

router = APIRouter(
    tags=["System - Health & Monitoring"],
    responses={
        200: {"description": "Service is healthy"},
        503: {"description": "Service is unhealthy"},
    },
)


@router.get(
    "/health",
    summary="Basic health check",
    description="""
    **System Endpoint** - Basic service health check.
    
    Returns service status. No authentication required.
    Use this for load balancer health checks.
    """,
)
async def health_check():
    """Basic health check."""
    return {"status": "healthy"}


@router.get(
    "/health/db",
    summary="Database connectivity check",
    description="""
    **System Endpoint** - Check database connectivity.
    
    Verifies that the application can connect to PostgreSQL.
    Returns unhealthy status if connection fails.
    """,
)
async def db_health_check(db: AsyncSession = Depends(get_db)):
    """Database health check."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


@router.get(
    "/health/redis",
    summary="Redis connectivity check",
    description="""
    **System Endpoint** - Check Redis connectivity.
    
    Verifies that the application can connect to Redis.
    Returns unhealthy status if connection fails.
    """,
)
async def redis_health_check(redis: Redis = Depends(get_redis)):
    """Redis health check."""
    try:
        await redis.ping()
        return {"status": "healthy", "redis": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "redis": "disconnected", "error": str(e)}


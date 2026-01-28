"""Rate limiting middleware and utilities.

Implements reference.md requirements:
- Rate limiting per-IP and per-user
- Configurable limits via environment variables
"""

import time
from typing import Optional
from fastapi import Request, HTTPException, status, Depends
from redis.asyncio import Redis
from app.config import settings
from app.dependencies import get_redis


class RateLimiter:
    """Rate limiter using Redis for distributed rate limiting."""

    def __init__(self, redis: Redis):
        """
        Initialize rate limiter.

        Args:
            redis: Redis client instance
        """
        self.redis = redis

    async def check_rate_limit(
        self,
        key: str,
        limit: int,
        window_seconds: int,
    ) -> tuple[bool, Optional[int]]:
        """
        Check if request is within rate limit.

        Args:
            key: Rate limit key (e.g., "ip:127.0.0.1" or "user:user-123")
            limit: Maximum requests allowed
            window_seconds: Time window in seconds

        Returns:
            Tuple of (allowed, retry_after_seconds)
            - allowed: True if request is allowed
            - retry_after_seconds: Seconds to wait before retry (None if allowed)
        """
        now = int(time.time())
        window_start = now - (now % window_seconds)
        redis_key = f"rate_limit:{key}:{window_start}"

        # Increment counter
        count = await self.redis.incr(redis_key)
        await self.redis.expire(redis_key, window_seconds)

        if count > limit:
            # Calculate retry after
            retry_after = window_seconds - (now % window_seconds)
            return False, retry_after

        return True, None

    async def check_multi_tier(
        self,
        ip_key: str,
        user_key: Optional[str] = None,
    ) -> tuple[bool, Optional[int], Optional[str]]:
        """
        Check rate limits for both IP and user (if provided).

        Args:
            ip_key: IP-based rate limit key
            user_key: Optional user-based rate limit key

        Returns:
            Tuple of (allowed, retry_after_seconds, tier_name)
            - allowed: True if request is allowed
            - retry_after_seconds: Seconds to wait before retry
            - tier_name: Which tier was hit ("ip" or "user")
        """
        # Check per-minute limit
        allowed, retry_after = await self.check_rate_limit(
            f"{ip_key}:minute",
            settings.rate_limit_requests_per_minute,
            60,
        )
        if not allowed:
            return False, retry_after, "ip"

        # Check per-hour limit
        allowed, retry_after = await self.check_rate_limit(
            f"{ip_key}:hour",
            settings.rate_limit_requests_per_hour,
            3600,
        )
        if not allowed:
            return False, retry_after, "ip"

        # Check per-day limit
        allowed, retry_after = await self.check_rate_limit(
            f"{ip_key}:day",
            settings.rate_limit_requests_per_day,
            86400,
        )
        if not allowed:
            return False, retry_after, "ip"

        # Check user limits if user_key provided
        if user_key:
            # User limits are typically more restrictive
            user_minute_limit = settings.rate_limit_requests_per_minute
            user_hour_limit = settings.rate_limit_requests_per_hour

            allowed, retry_after = await self.check_rate_limit(
                f"{user_key}:minute",
                user_minute_limit,
                60,
            )
            if not allowed:
                return False, retry_after, "user"

            allowed, retry_after = await self.check_rate_limit(
                f"{user_key}:hour",
                user_hour_limit,
                3600,
            )
            if not allowed:
                return False, retry_after, "user"

        return True, None, None


async def get_rate_limiter() -> RateLimiter:
    """Dependency to get rate limiter instance."""
    redis = await get_redis()
    return RateLimiter(redis)


class RateLimitMiddleware:
    """Middleware to enforce rate limiting on requests."""

    def __init__(self, rate_limiter: RateLimiter):
        """
        Initialize rate limit middleware.

        Args:
            rate_limiter: Rate limiter instance
        """
        self.rate_limiter = rate_limiter

    async def __call__(self, request: Request, call_next):
        """
        Process request with rate limiting.

        Args:
            request: FastAPI request
            call_next: Next middleware/route handler

        Returns:
            Response

        Raises:
            HTTPException: 429 if rate limit exceeded
        """
        # Skip rate limiting for health checks
        if request.url.path.startswith("/health") or request.url.path == "/":
            return await call_next(request)

        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        ip_key = f"ip:{client_ip}"

        # Try to get user ID from request (if authenticated)
        user_key = None
        # TODO: Extract from auth token when implemented
        # user_id = get_user_id_from_request(request)
        # if user_id:
        #     user_key = f"user:{user_id}"

        # Check rate limits
        allowed, retry_after, tier = await self.rate_limiter.check_multi_tier(
            ip_key, user_key
        )

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "tier": tier,
                    "retry_after": retry_after,
                    "message": f"Rate limit exceeded. Try again in {retry_after} seconds.",
                },
                headers={"Retry-After": str(retry_after) if retry_after else "60"},
            )

        # Add rate limit headers to response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit-Minute"] = str(
            settings.rate_limit_requests_per_minute
        )
        response.headers["X-RateLimit-Limit-Hour"] = str(
            settings.rate_limit_requests_per_hour
        )
        response.headers["X-RateLimit-Limit-Day"] = str(
            settings.rate_limit_requests_per_day
        )

        return response


async def check_rate_limit_dependency(
    request: Request,
) -> None:
    """
    Dependency to check rate limits on protected endpoints.

    Args:
        request: FastAPI request

    Raises:
        HTTPException: 429 if rate limit exceeded
    """
    # Skip rate limiting for health checks
    if request.url.path.startswith("/health") or request.url.path == "/":
        return

    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    ip_key = f"ip:{client_ip}"

    # Try to get user ID from request (if authenticated)
    user_key = None
    # TODO: Extract user_id from token when full auth is implemented

    # Get rate limiter
    redis = await get_redis()
    rate_limiter = RateLimiter(redis)

    # Check rate limits
    allowed, retry_after, tier = await rate_limiter.check_multi_tier(
        ip_key, user_key
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "tier": tier,
                "retry_after": retry_after,
                "message": f"Rate limit exceeded. Try again in {retry_after} seconds.",
            },
            headers={"Retry-After": str(retry_after) if retry_after else "60"},
        )


"""Request middleware: logging, CORS, correlation IDs, rate limiting."""

import time
import uuid
from typing import Callable
from fastapi import Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings
from app.core.rate_limiter import get_rate_limiter


class CorrelationIDMiddleware(BaseHTTPMiddleware):
    """Add correlation ID to requests for tracing."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Add correlation ID header if not present."""
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        
        request.state.correlation_id = correlation_id
        
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log request details for observability."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log request start and completion."""
        start_time = time.perf_counter()
        correlation_id = getattr(request.state, "correlation_id", "unknown")
        
        # Log request start
        print(
            f"[{correlation_id}] {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )
        
        try:
            response = await call_next(request)
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            
            # Log request completion
            print(
                f"[{correlation_id}] {request.method} {request.url.path} "
                f"-> {response.status_code} ({elapsed_ms}ms)"
            )
            
            response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
            return response
            
        except Exception as e:
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            print(
                f"[{correlation_id}] {request.method} {request.url.path} "
                f"-> ERROR ({elapsed_ms}ms): {str(e)}"
            )
            raise


def setup_cors(app) -> None:
    """Configure CORS middleware."""
    # Restrict methods and headers for security
    allowed_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    allowed_headers = [
        "Content-Type",
        "Authorization",
        "X-API-Key",
        "X-Correlation-ID",
        "X-Guardrails-Trace-Id",
    ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=allowed_methods,
        allow_headers=allowed_headers,
        expose_headers=["X-Correlation-ID", "X-Response-Time-Ms", "X-Guardrails-Trace-Id"],
    )


async def setup_rate_limit_middleware(request: Request, call_next: Callable) -> Response:
    """Rate limiting middleware wrapper."""
    from app.dependencies import get_redis
    from app.core.rate_limiter import RateLimiter

    redis = await get_redis()
    rate_limiter = RateLimiter(redis)
    middleware = RateLimitMiddleware(rate_limiter)
    return await middleware(request, call_next)


def setup_middleware(app) -> None:
    """Set up all middleware."""
    app.add_middleware(CorrelationIDMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    # Rate limiting is added as a dependency, not middleware (to access Redis)
    # It will be enforced per-endpoint using dependencies
    setup_cors(app)


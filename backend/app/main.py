"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.config import settings
from app.core.exceptions import GuardrailsError, AuthenticationError, AuthorizationError
from app.core.middleware import setup_middleware
from app.core.telemetry import setup_telemetry
from app.dependencies import close_redis
from app.api.v1.router import router as v1_router
from fastapi import status


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print(f"Starting {settings.app_name} in {settings.env} mode")
    yield
    # Shutdown
    await close_redis()
    print("Shutting down...")


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="""
    **Guardrails Platform** - Policy enforcement and audit platform for AI applications.
    
    ## API Organization
    
    The API is organized into three main groups:
    
    ### 🔵 User API - SDK Integration
    Endpoints for developers integrating the Guardrails SDK:
    - `/v1/gateway/evaluate` - Evaluate content against policies
    - `/v1/gateway/intercept` - Full LLM call interception
    
    ### 🔴 Admin API - Platform Management
    Endpoints for platform administrators:
    - `/v1/organizations/*` - Manage organizations, users, API keys
    - `/v1/apps/*` - Register applications and environments
    
    ### 🟢 System - Health & Monitoring
    System endpoints for monitoring:
    - `/v1/health/*` - Health checks for service, database, Redis
    
    ## Authentication
    
    - **User API**: Requires `X-API-Key` header with valid API key
    - **Admin API**: Requires admin authentication (coming soon)
    - **System**: No authentication required
    
    ## Quick Start
    
    1. **Admin**: Create organization → Register app → Generate API key
    2. **Developer**: Use API key + app ID in SDK initialization
    3. **Developer**: Call `client.wrap()` to protect LLM calls
    
    See `/docs` for detailed API documentation.
    """,
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    openapi_tags=[
        {
            "name": "User API - SDK Integration",
            "description": "Endpoints for SDK integration. Used by developers to evaluate content and intercept LLM calls.",
        },
        {
            "name": "Admin API - Organizations & Users",
            "description": "Manage organizations, users, and API keys. Admin-only endpoints.",
        },
        {
            "name": "Admin API - Applications",
            "description": "Register applications and manage environments. Admin-only endpoints.",
        },
        {
            "name": "System - Health & Monitoring",
            "description": "System health checks and monitoring endpoints.",
        },
    ],
)


# Set up middleware
setup_middleware(app)

# Set up telemetry
setup_telemetry(app)

# Include API routers
app.include_router(v1_router)


# Global exception handlers
# Note: HTTPException is handled by FastAPI automatically, so we don't need a handler for it
@app.exception_handler(AuthenticationError)
async def authentication_exception_handler(request: Request, exc: AuthenticationError):
    """Handle authentication errors with 401 status."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(AuthorizationError)
async def authorization_exception_handler(request: Request, exc: AuthorizationError):
    """Handle authorization errors with 403 status."""
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


@app.exception_handler(GuardrailsError)
async def guardrails_exception_handler(request: Request, exc: GuardrailsError):
    """Handle other Guardrails custom exceptions."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "environment": settings.env,
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs" if settings.is_development else None,
    }


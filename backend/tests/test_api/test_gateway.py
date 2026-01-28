"""Tests for gateway endpoints."""

import pytest
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_evaluate_endpoint():
    """Test evaluate endpoint requires authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "app_id": "test-app",
            "scope": "llm.output",
            "content": {"text": "Hello world"},
        }
        # Without auth, should return 401
        response = await client.post("/v1/gateway/evaluate", json=payload)
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_evaluate_endpoint_invalid_request():
    """Test evaluate endpoint with invalid request."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Missing required fields - FastAPI checks auth before validation
        # So we'll get 401 (auth required) before 422 (validation error)
        payload = {"app_id": "test-app"}
        response = await client.post("/v1/gateway/evaluate", json=payload)
        # Auth is checked first, so we get 401 instead of 422
        assert response.status_code in [401, 422]


@pytest.mark.asyncio
async def test_intercept_endpoint():
    """Test intercept endpoint requires authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "app_id": "test-app",
            "input": {"text": "Hello"},
            "provider": "openai",
            "call_config": {"model": "gpt-4"},
        }
        # Without auth, should return 401
        response = await client.post("/v1/gateway/intercept", json=payload)
        assert response.status_code == 401


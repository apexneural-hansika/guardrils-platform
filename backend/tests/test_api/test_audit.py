"""Audit log API tests."""

import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import status
from app.main import app


@pytest.mark.asyncio
async def test_audit_list_requests_requires_auth():
    """Test audit list requests requires authentication."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/v1/audit/requests?org_id=test-org")
        assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_audit_get_request_requires_auth():
    """Test audit get request requires authentication."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/v1/audit/requests/test-trace-id?org_id=test-org")
        assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_audit_list_requests_with_filters():
    """Test audit list requests with filters."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # This would require actual authentication and data
        # Placeholder for integration test
        pass


@pytest.mark.asyncio
async def test_audit_session_requests():
    """Test audit session requests endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/v1/audit/sessions/test-session?org_id=test-org")
        assert response.status_code in [401, 403, 404]


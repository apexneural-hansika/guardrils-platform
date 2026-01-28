"""Integration tests against live backend API."""

import pytest
import httpx
from guardrails_sdk import GuardrailsClient, AsyncGuardrailsClient


# Test configuration - update these for your environment
TEST_BASE_URL = "http://localhost:8000"
TEST_API_KEY = "test-api-key"  # Update with actual API key when auth is implemented
TEST_APP_ID = "test-app-id"  # Update with actual app ID when apps are implemented


@pytest.fixture
def client():
    """Create a test client pointing to local backend."""
    return GuardrailsClient(
        api_key=TEST_API_KEY,
        app_id=TEST_APP_ID,
        base_url=TEST_BASE_URL,
        timeout=10.0,
    )


@pytest.fixture
async def async_client():
    """Create an async test client pointing to local backend."""
    async with AsyncGuardrailsClient(
        api_key=TEST_API_KEY,
        app_id=TEST_APP_ID,
        base_url=TEST_BASE_URL,
        timeout=10.0,
    ) as client:
        yield client


@pytest.mark.integration
def test_backend_health_check():
    """Test that backend is running and accessible."""
    response = httpx.get(f"{TEST_BASE_URL}/health", timeout=5.0)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"


@pytest.mark.integration
def test_backend_root_endpoint():
    """Test root endpoint."""
    response = httpx.get(f"{TEST_BASE_URL}/", timeout=5.0)
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data


@pytest.mark.integration
def test_v1_health_endpoint():
    """Test v1 health endpoint."""
    response = httpx.get(f"{TEST_BASE_URL}/v1/health", timeout=5.0)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.integration
def test_v1_health_db_endpoint():
    """Test v1 database health endpoint."""
    response = httpx.get(f"{TEST_BASE_URL}/v1/health/db", timeout=5.0)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    # Database might be connected or disconnected depending on setup
    assert data["status"] in ["healthy", "unhealthy"]


@pytest.mark.integration
def test_v1_health_redis_endpoint():
    """Test v1 Redis health endpoint."""
    response = httpx.get(f"{TEST_BASE_URL}/v1/health/redis", timeout=5.0)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    # Redis might be connected or disconnected depending on setup
    assert data["status"] in ["healthy", "unhealthy"]


@pytest.mark.integration
@pytest.mark.skip(reason="Gateway endpoint not yet implemented")
def test_evaluate_endpoint_integration(client):
    """Test evaluate endpoint with real backend."""
    # This will work once /v1/gateway/evaluate is implemented
    result = client.evaluate(
        text="Hello world",
        scope="llm.output",
    )
    assert result is not None
    assert hasattr(result, "action")
    assert hasattr(result, "trace_id")


@pytest.mark.integration
@pytest.mark.skip(reason="Gateway endpoint not yet implemented")
@pytest.mark.asyncio
async def test_evaluate_endpoint_integration_async(async_client):
    """Test evaluate endpoint with real backend (async)."""
    # This will work once /v1/gateway/evaluate is implemented
    result = await async_client.evaluate(
        text="Hello world",
        scope="llm.output",
    )
    assert result is not None
    assert hasattr(result, "action")
    assert hasattr(result, "trace_id")


@pytest.mark.integration
def test_client_connection_error():
    """Test client handles connection errors gracefully."""
    client = GuardrailsClient(
        api_key="test-key",
        app_id="test-app",
        base_url="http://localhost:9999",  # Non-existent server
        timeout=1.0,
    )
    
    with pytest.raises(Exception):  # Should raise NetworkError or similar
        client.evaluate(text="test", scope="llm.output")


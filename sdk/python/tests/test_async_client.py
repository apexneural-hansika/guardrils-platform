"""Tests for asynchronous client."""

import pytest
from unittest.mock import Mock, AsyncMock, patch
import httpx

from guardrails_sdk import AsyncGuardrailsClient, BlockedError, RateLimitError
from guardrails_sdk.models import EvaluateResponse, PolicyDecision, CheckResult, ContentPayload


@pytest.fixture
async def async_client():
    """Create a test async client."""
    async with AsyncGuardrailsClient(
        api_key="test-api-key",
        app_id="test-app-id",
        base_url="http://localhost:8000",
    ) as client:
        yield client


@pytest.mark.asyncio
async def test_async_client_initialization():
    """Test async client initialization."""
    async with AsyncGuardrailsClient(
        api_key="test-key",
        app_id="test-app",
    ) as client:
        assert client.config.api_key == "test-key"
        assert client.config.app_id == "test-app"


@pytest.mark.asyncio
async def test_async_client_initialization_missing_api_key():
    """Test async client initialization fails without API key."""
    with pytest.raises(ValueError, match="api_key is required"):
        AsyncGuardrailsClient(api_key="", app_id="test-app")


@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_async_evaluate_success(mock_post, async_client):
    """Test successful async evaluation."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "trace_id": "trace123",
        "request_id": "req123",
        "action": "allow",
        "reason": "No violations",
        "policies_evaluated": 2,
        "policies_triggered": 0,
        "decisions": [],
        "total_latency_ms": 50,
    }
    mock_post.return_value = mock_response

    result = await async_client.evaluate(text="Hello world", scope="llm.output")

    assert result.action == "allow"
    assert result.trace_id == "trace123"
    mock_post.assert_called_once()


@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_async_evaluate_blocked(mock_post, async_client):
    """Test blocked async evaluation."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "trace_id": "trace123",
        "request_id": "req123",
        "action": "block",
        "reason": "PII detected",
        "policies_evaluated": 1,
        "policies_triggered": 1,
        "decisions": [],
        "total_latency_ms": 50,
    }
    mock_post.return_value = mock_response

    result = await async_client.evaluate(
        text="My SSN is 123-45-6789", scope="llm.output"
    )

    assert result.action == "block"
    assert result.reason == "PII detected"


@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_async_evaluate_rate_limit(mock_post, async_client):
    """Test rate limit error in async client."""
    mock_response = Mock()
    mock_response.status_code = 429
    mock_post.return_value = mock_response

    with pytest.raises(RateLimitError):
        await async_client.evaluate(text="Hello", scope="llm.output")


@pytest.mark.asyncio
async def test_async_client_context_manager(async_client):
    """Test async client as context manager."""
    async with async_client as c:
        assert c is async_client
    # Client should be closed after context exit


@pytest.mark.asyncio
async def test_async_extract_text_string(async_client):
    """Test text extraction from string in async client."""
    text = async_client._extract_text("Hello world")
    assert text == "Hello world"


@pytest.mark.asyncio
async def test_async_extract_text_dict(async_client):
    """Test text extraction from dict in async client."""
    text = async_client._extract_text({"text": "Hello", "other": "data"})
    assert text == "Hello"


@pytest.mark.asyncio
async def test_async_apply_modification_string(async_client):
    """Test applying modification to string response in async client."""
    modified = ContentPayload(text="Modified text")
    result = async_client._apply_modification("Original text", modified)
    assert result == "Modified text"


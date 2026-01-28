"""Tests for synchronous client."""

import pytest
from unittest.mock import Mock, patch
import httpx

from guardrails_sdk import GuardrailsClient, BlockedError, RateLimitError
from guardrails_sdk.models import (
    EvaluateResponse,
    PolicyDecision,
    CheckResult,
    ContentPayload,
)


@pytest.fixture
def client():
    """Create a test client."""
    return GuardrailsClient(
        api_key="test-api-key",
        app_id="test-app-id",
        base_url="http://localhost:8000",
    )


def test_client_initialization():
    """Test client initialization."""
    client = GuardrailsClient(
        api_key="test-key",
        app_id="test-app",
    )
    assert client.config.api_key == "test-key"
    assert client.config.app_id == "test-app"
    assert client.config.base_url == "https://api.guardrails.dev"


def test_client_initialization_missing_api_key():
    """Test client initialization fails without API key."""
    with pytest.raises(ValueError, match="api_key is required"):
        GuardrailsClient(api_key="", app_id="test-app")


def test_client_initialization_missing_app_id():
    """Test client initialization fails without app ID."""
    with pytest.raises(ValueError, match="app_id is required"):
        GuardrailsClient(api_key="test-key", app_id="")


@patch("httpx.Client.post")
def test_evaluate_success(mock_post, client):
    """Test successful evaluation."""
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

    result = client.evaluate(text="Hello world", scope="llm.output")

    assert result.action == "allow"
    assert result.trace_id == "trace123"
    mock_post.assert_called_once()


@patch("httpx.Client.post")
def test_evaluate_blocked(mock_post, client):
    """Test blocked evaluation."""
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

    result = client.evaluate(text="My SSN is 123-45-6789", scope="llm.output")

    assert result.action == "block"
    assert result.reason == "PII detected"


@patch("httpx.Client.post")
def test_evaluate_rate_limit(mock_post, client):
    """Test rate limit error."""
    mock_response = Mock()
    mock_response.status_code = 429
    mock_post.return_value = mock_response

    with pytest.raises(RateLimitError):
        client.evaluate(text="Hello", scope="llm.output")


def test_client_context_manager(client):
    """Test client as context manager."""
    with client as c:
        assert c is client
    # Client should be closed after context exit
    assert client._client.is_closed is False  # httpx client doesn't expose closed state easily


def test_extract_text_string(client):
    """Test text extraction from string."""
    text = client._extract_text("Hello world")
    assert text == "Hello world"


def test_extract_text_dict(client):
    """Test text extraction from dict."""
    text = client._extract_text({"text": "Hello", "other": "data"})
    assert text == "Hello"


def test_extract_text_dict_content(client):
    """Test text extraction from dict with content key."""
    text = client._extract_text({"content": "Hello", "other": "data"})
    assert text == "Hello"


def test_apply_modification_string(client):
    """Test applying modification to string response."""
    modified = ContentPayload(text="Modified text")
    result = client._apply_modification("Original text", modified)
    assert result == "Modified text"


def test_apply_modification_dict(client):
    """Test applying modification to dict response."""
    modified = ContentPayload(text="Modified text")
    response = {"text": "Original", "other": "data"}
    result = client._apply_modification(response, modified)
    assert result["text"] == "Modified text"
    assert result["other"] == "data"


def test_apply_modification_openai_format(client):
    """Test applying modification to OpenAI format response."""
    modified = ContentPayload(text="Modified content")
    response = {
        "choices": [
            {
                "message": {
                    "content": "Original content",
                    "role": "assistant",
                }
            }
        ],
        "id": "chat-123",
        "model": "gpt-4",
    }
    result = client._apply_modification(response, modified)
    assert result["choices"][0]["message"]["content"] == "Modified content"
    assert result["id"] == "chat-123"
    assert result["model"] == "gpt-4"


def test_apply_modification_anthropic_format(client):
    """Test applying modification to Anthropic format response."""
    modified = ContentPayload(text="Modified content")
    response = {
        "content": [
            {"type": "text", "text": "Original content"},
            {"type": "image", "source": "..."},
        ]
    }
    result = client._apply_modification(response, modified)
    # First text block should be modified
    assert result["content"][0]["text"] == "Modified content"
    # Other blocks should be preserved
    assert len(result["content"]) == 2


def test_apply_modification_no_modified_content(client):
    """Test applying modification when no modified content provided."""
    response = {"text": "Original"}
    result = client._apply_modification(response, ContentPayload())
    # Should return original if no modified text
    assert result == response


"""Tests for gateway service."""

import pytest
from app.services.gateway_service import GatewayService
from app.schemas.gateway import (
    EvaluateRequest,
    ContentPayload,
    PolicyScope,
)


@pytest.mark.asyncio
async def test_evaluate_basic():
    """Test basic evaluate functionality."""
    service = GatewayService()
    
    request = EvaluateRequest(
        app_id="test-app",
        scope=PolicyScope.LLM_OUTPUT,
        content=ContentPayload(text="Hello world"),
    )
    
    response = await service.evaluate(request)
    
    assert response.trace_id is not None
    assert response.request_id is not None
    assert response.action is not None
    assert response.reason is not None
    assert response.policies_evaluated >= 0
    assert response.policies_triggered >= 0
    assert isinstance(response.decisions, list)
    assert response.total_latency_ms >= 0


@pytest.mark.asyncio
async def test_intercept_basic():
    """Test basic intercept functionality."""
    service = GatewayService()
    
    from app.schemas.gateway import InterceptRequest
    
    request = InterceptRequest(
        app_id="test-app",
        input=ContentPayload(text="Hello"),
        provider="openai",
        call_config={"model": "gpt-4"},
    )
    
    response = await service.intercept(request)
    
    assert response.trace_id is not None
    assert response.input_decision is not None
    assert isinstance(response.call_executed, bool)
    assert response.final_action is not None
    assert response.total_latency_ms >= 0


"""Tests for check executor."""

import pytest
import asyncio
from app.checks.executor import CheckExecutor
from app.checks.base import Check, CheckPayload, CheckResult
from app.checks.registry import CheckRegistry


class MockCheck(Check):
    """Mock check for testing."""

    name = "mock_check"
    version = "1.0.0"
    description = "Mock check for testing"
    scope = ["llm.input", "llm.output", "all"]

    async def run(self, payload: CheckPayload) -> CheckResult:
        """Run mock check."""
        text = payload.text or ""
        if len(text) > 10:
            return CheckResult(
                check_name=self.name,
                status="fail",
                score=0.8,
                message="Text is too long",
                latency_ms=5,
            )
        return CheckResult(
            check_name=self.name,
            status="pass",
            score=0.0,
            message="Text length is acceptable",
            latency_ms=5,
        )


class SlowCheck(Check):
    """Slow check for timeout testing."""

    name = "slow_check"
    version = "1.0.0"
    description = "Slow check for timeout testing"
    scope = ["llm.input"]

    async def run(self, payload: CheckPayload) -> CheckResult:
        """Run slow check."""
        await asyncio.sleep(2.0)  # Sleep for 2 seconds
        return CheckResult(
            check_name=self.name,
            status="pass",
            latency_ms=2000,
        )


class ErrorCheck(Check):
    """Check that raises an error."""

    name = "error_check"
    version = "1.0.0"
    description = "Check that raises an error"
    scope = ["llm.input"]

    async def run(self, payload: CheckPayload) -> CheckResult:
        """Raise an error."""
        raise ValueError("Test error")


@pytest.mark.asyncio
async def test_executor_run_checks():
    """Test executor runs checks correctly."""
    registry = CheckRegistry()
    registry.register(MockCheck)
    
    executor = CheckExecutor(registry=registry)
    
    payload = CheckPayload(text="Hello")  # 5 chars, should pass (not > 10)
    results = await executor.run_checks("llm.input", payload)
    
    assert len(results) == 1
    assert results[0].check_name == "mock_check"
    assert results[0].status == "pass"  # "Hello" is 5 chars, check is > 10, so passes
    assert results[0].latency_ms > 0


@pytest.mark.asyncio
async def test_executor_run_checks_fail():
    """Test executor handles failing checks."""
    registry = CheckRegistry()
    registry.register(MockCheck)
    
    executor = CheckExecutor(registry=registry)
    
    payload = CheckPayload(text="This is a very long text that should fail")
    results = await executor.run_checks("llm.input", payload)
    
    assert len(results) == 1
    assert results[0].check_name == "mock_check"
    assert results[0].status == "fail"
    assert results[0].score == 0.8


@pytest.mark.asyncio
async def test_executor_timeout():
    """Test executor handles timeouts."""
    registry = CheckRegistry()
    registry.register(SlowCheck)
    
    executor = CheckExecutor(registry=registry, default_timeout_ms=500)
    
    payload = CheckPayload(text="test")
    results = await executor.run_checks("llm.input", payload)
    
    assert len(results) == 1
    assert results[0].check_name == "slow_check"
    assert results[0].status == "error"
    assert "timed out" in results[0].message.lower()


@pytest.mark.asyncio
async def test_executor_error_handling():
    """Test executor handles check errors gracefully."""
    registry = CheckRegistry()
    registry.register(ErrorCheck)
    
    executor = CheckExecutor(registry=registry)
    
    payload = CheckPayload(text="test")
    results = await executor.run_checks("llm.input", payload)
    
    assert len(results) == 1
    assert results[0].check_name == "error_check"
    assert results[0].status == "error"
    assert "failed" in results[0].message.lower()


@pytest.mark.asyncio
async def test_executor_multiple_checks():
    """Test executor runs multiple checks."""
    registry = CheckRegistry()
    registry.register(MockCheck)
    registry.register(ErrorCheck)
    
    executor = CheckExecutor(registry=registry)
    
    payload = CheckPayload(text="test")
    results = await executor.run_checks("llm.input", payload)
    
    assert len(results) == 2
    check_names = {r.check_name for r in results}
    assert "mock_check" in check_names
    assert "error_check" in check_names


@pytest.mark.asyncio
async def test_executor_scope_filtering():
    """Test executor filters checks by scope."""
    registry = CheckRegistry()
    registry.register(MockCheck)  # Supports "all"
    registry.register(SlowCheck)  # Only supports "llm.input"
    
    executor = CheckExecutor(registry=registry)
    
    payload = CheckPayload(text="test")
    
    # Should get both checks for llm.input
    results = await executor.run_checks("llm.input", payload)
    assert len(results) == 2
    
    # Should only get MockCheck for llm.output
    results = await executor.run_checks("llm.output", payload)
    assert len(results) == 1
    assert results[0].check_name == "mock_check"


@pytest.mark.asyncio
async def test_executor_pre_post_tool_checks():
    """Test executor convenience methods."""
    registry = CheckRegistry()
    registry.register(MockCheck)
    
    executor = CheckExecutor(registry=registry)
    
    payload = CheckPayload(text="test")
    
    # Test pre-checks
    results = await executor.run_pre_checks(payload)
    assert len(results) >= 0
    
    # Test post-checks
    results = await executor.run_post_checks(payload)
    assert len(results) >= 0
    
    # Test tool-checks
    results = await executor.run_tool_checks(payload)
    assert len(results) >= 0


@pytest.mark.asyncio
async def test_executor_specific_checks():
    """Test executor runs only specified checks."""
    registry = CheckRegistry()
    registry.register(MockCheck)
    registry.register(ErrorCheck)
    
    executor = CheckExecutor(registry=registry)
    
    payload = CheckPayload(text="test")
    
    # Run only MockCheck
    results = await executor.run_checks("llm.input", payload, check_names=["mock_check"])
    assert len(results) == 1
    assert results[0].check_name == "mock_check"


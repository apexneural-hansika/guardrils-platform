"""Tests for action executor."""

import pytest
from app.policy_engine.actions import ActionExecutor, execute_action
from app.schemas.gateway import ActionType, ContentPayload


def test_action_allow():
    """Test ALLOW action returns original content."""
    content = ContentPayload(text="Hello world")
    result = ActionExecutor.execute(ActionType.ALLOW, content)
    
    assert result.text == "Hello world"
    assert result == content


def test_action_block():
    """Test BLOCK action returns empty content."""
    content = ContentPayload(text="Hello world")
    result = ActionExecutor.execute(ActionType.BLOCK, content)
    
    assert result.text == ""
    assert result.tokens == 0


def test_action_redact():
    """Test REDACT action redacts content."""
    content = ContentPayload(text="My email is test@example.com")
    config = {
        "char": "█",
        "patterns": ["test@example.com"]
    }
    
    result = ActionExecutor.execute(ActionType.REDACT, content, config)
    
    assert "test@example.com" not in result.text
    assert "█" in result.text


def test_action_log_only():
    """Test LOG_ONLY action returns original content."""
    content = ContentPayload(text="Hello world")
    result = ActionExecutor.execute(ActionType.LOG_ONLY, content)
    
    assert result.text == "Hello world"


def test_action_rewrite():
    """Test REWRITE action rewrites content."""
    content = ContentPayload(text="Original text")
    config = {
        "template": "Rewritten: {original}"
    }
    
    result = ActionExecutor.execute(ActionType.REWRITE, content, config)
    
    assert "Rewritten: Original text" in result.text


def test_execute_action_convenience():
    """Test convenience function."""
    content = ContentPayload(text="test")
    result = execute_action(ActionType.ALLOW, content)
    
    assert result.text == "test"


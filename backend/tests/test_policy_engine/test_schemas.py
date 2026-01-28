"""Tests for policy schema validation."""

import pytest
from app.policy_engine.schemas import PolicySchema, validate_policy
from app.core.exceptions import ValidationError


def test_validate_valid_policy():
    """Test validation of valid policy."""
    policy = {
        "version": "1",
        "policies": {
            "test": {
                "action": "allow"
            }
        }
    }
    
    # Should not raise
    validate_policy(policy)


def test_validate_missing_version():
    """Test validation fails without version."""
    policy = {
        "policies": {
            "test": {
                "action": "allow"
            }
        }
    }
    
    with pytest.raises(ValidationError):
        validate_policy(policy)


def test_validate_missing_policies():
    """Test validation fails without policies."""
    policy = {
        "version": "1"
    }
    
    with pytest.raises(ValidationError):
        validate_policy(policy)


def test_validate_invalid_action():
    """Test validation fails with invalid action."""
    policy = {
        "version": "1",
        "policies": {
            "test": {
                "action": "invalid_action"
            }
        }
    }
    
    with pytest.raises(ValidationError):
        validate_policy(policy)


def test_validate_missing_action():
    """Test validation fails without action."""
    policy = {
        "version": "1",
        "policies": {
            "test": {
                "scope": "all"
            }
        }
    }
    
    with pytest.raises(ValidationError):
        validate_policy(policy)


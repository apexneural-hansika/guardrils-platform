"""Tests for policy parser."""

import pytest
from app.policy_engine.parser import PolicyParser, parse_policy_yaml, PolicyAST
from app.core.exceptions import ValidationError


def test_parse_valid_yaml():
    """Test parsing valid YAML policy."""
    yaml_content = """
version: "1"
policies:
  pii:
    action: redact
    scope: all
  toxicity:
    action: block
    threshold: 0.7
"""
    ast = parse_policy_yaml(yaml_content)
    
    assert ast.version == "1"
    assert "pii" in ast.policies
    assert "toxicity" in ast.policies
    assert ast.policies["pii"]["action"] == "redact"


def test_parse_valid_json():
    """Test parsing valid JSON policy."""
    json_content = '{"version": "1", "policies": {"test": {"action": "allow"}}}'
    parser = PolicyParser()
    ast = parser.parse_json(json_content)
    
    assert ast.version == "1"
    assert "test" in ast.policies


def test_parse_invalid_yaml():
    """Test parsing invalid YAML raises error."""
    yaml_content = "invalid: yaml: content: ["
    
    with pytest.raises(ValidationError):
        parse_policy_yaml(yaml_content)


def test_parse_missing_version():
    """Test parsing policy without version raises error."""
    yaml_content = """
policies:
  test:
    action: allow
"""
    
    with pytest.raises(ValidationError):
        parser = PolicyParser()
        ast = parser.parse_yaml(yaml_content)
        parser.validate_structure(ast)


def test_parse_missing_policies():
    """Test parsing policy without policies raises error."""
    yaml_content = """
version: "1"
"""
    
    with pytest.raises(ValidationError):
        parser = PolicyParser()
        ast = parser.parse_yaml(yaml_content)
        parser.validate_structure(ast)


def test_parse_missing_action():
    """Test parsing policy without action raises error."""
    yaml_content = """
version: "1"
policies:
  test:
    scope: all
"""
    
    with pytest.raises(ValidationError):
        parser = PolicyParser()
        ast = parser.parse_yaml(yaml_content)
        parser.validate_structure(ast)


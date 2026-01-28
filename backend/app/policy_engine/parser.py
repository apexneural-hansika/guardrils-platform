"""
Policy parser: YAML → internal AST.

Converts policy YAML/JSON into an internal Abstract Syntax Tree (AST)
for evaluation. Policies should be pure logic, not infra-aware.
"""

import yaml
import json
from typing import Any, Dict
from app.core.exceptions import ValidationError


class PolicyAST:
    """
    Abstract Syntax Tree representation of a policy.

    This is the internal format used by the evaluator.
    Policies are pure logic - no infrastructure dependencies.
    """

    def __init__(self, data: Dict[str, Any]):
        """
        Initialize AST from parsed data.

        Args:
            data: Parsed policy data structure
        """
        # Store original data to check if version was explicitly provided
        self._raw_data = data
        self.version = data.get("version")
        self.policies = data.get("policies", {})
        self.metadata = data.get("metadata", {})

    def __repr__(self) -> str:
        """String representation."""
        version_str = self.version or "unknown"
        return f"<PolicyAST v{version_str} policies={len(self.policies)}>"


class PolicyParser:
    """
    Parser for policy YAML/JSON DSL.

    Converts policy definitions into PolicyAST for evaluation.
    """

    @staticmethod
    def parse_yaml(yaml_content: str) -> PolicyAST:
        """
        Parse policy from YAML string.

        Args:
            yaml_content: YAML policy definition

        Returns:
            PolicyAST instance

        Raises:
            ValidationError: If YAML is invalid or malformed
        """
        try:
            data = yaml.safe_load(yaml_content)
            if not isinstance(data, dict):
                raise ValidationError("Policy must be a YAML object")
            return PolicyAST(data)
        except yaml.YAMLError as e:
            raise ValidationError(f"Invalid YAML: {str(e)}")
        except Exception as e:
            raise ValidationError(f"Failed to parse policy: {str(e)}")

    @staticmethod
    def parse_json(json_content: str) -> PolicyAST:
        """
        Parse policy from JSON string.

        Args:
            json_content: JSON policy definition

        Returns:
            PolicyAST instance

        Raises:
            ValidationError: If JSON is invalid or malformed
        """
        try:
            data = json.loads(json_content)
            if not isinstance(data, dict):
                raise ValidationError("Policy must be a JSON object")
            return PolicyAST(data)
        except json.JSONDecodeError as e:
            raise ValidationError(f"Invalid JSON: {str(e)}")
        except Exception as e:
            raise ValidationError(f"Failed to parse policy: {str(e)}")

    @staticmethod
    def validate_structure(ast: PolicyAST) -> None:
        """
        Validate policy AST structure.

        Args:
            ast: Policy AST to validate

        Raises:
            ValidationError: If structure is invalid
        """
        # Check if version was explicitly provided in original data
        if "version" not in ast._raw_data:
            raise ValidationError("Policy must have a version")
        
        if not ast.version:
            raise ValidationError("Policy version cannot be empty")

        if not ast.policies:
            raise ValidationError("Policy must have at least one policy definition")

        # Validate each policy has required fields
        for policy_name, policy_data in ast.policies.items():
            if not isinstance(policy_data, dict):
                raise ValidationError(f"Policy '{policy_name}' must be an object")

            # Each policy should have an action
            if "action" not in policy_data:
                raise ValidationError(f"Policy '{policy_name}' must have an 'action' field")


def parse_policy_yaml(yaml_content: str) -> PolicyAST:
    """
    Convenience function to parse policy YAML.

    Args:
        yaml_content: YAML policy definition

    Returns:
        PolicyAST instance
    """
    parser = PolicyParser()
    ast = parser.parse_yaml(yaml_content)
    parser.validate_structure(ast)
    return ast


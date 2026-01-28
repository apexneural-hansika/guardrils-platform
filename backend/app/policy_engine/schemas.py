"""
Policy JSONSchema validation.

Validates policy structure against a JSONSchema to ensure
policies are well-formed before parsing/evaluation.
"""

import json
from typing import Any, Dict, Optional
from app.core.exceptions import ValidationError


class PolicySchema:
    """
    JSONSchema validator for policy definitions.

    Ensures policies conform to expected structure before processing.
    """

    # Minimal v1 schema (will be expanded)
    V1_SCHEMA = {
        "type": "object",
        "required": ["version", "policies"],
        "properties": {
            "version": {"type": "string", "enum": ["1"]},
            "policies": {
                "type": "object",
                "patternProperties": {
                    ".*": {
                        "type": "object",
                        "required": ["action"],
                        "properties": {
                            "action": {
                                "type": "string",
                                "enum": [
                                    "allow",
                                    "block",
                                    "redact",
                                    "rewrite",
                                    "route",
                                    "escalate",
                                    "log_only",
                                ],
                            },
                            "scope": {"type": "string"},
                            "conditions": {"type": "array"},
                            "reason": {"type": "string"},
                            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                        },
                    }
                },
            },
            "metadata": {"type": "object"},
        },
    }

    @staticmethod
    def validate(policy_data: Dict[str, Any], schema: Optional[Dict[str, Any]] = None) -> None:
        """
        Validate policy data against JSONSchema.

        Args:
            policy_data: Policy data to validate
            schema: Optional custom schema (defaults to V1_SCHEMA)

        Raises:
            ValidationError: If policy does not conform to schema
        """
        schema = schema or PolicySchema.V1_SCHEMA

        # Basic structure validation
        if not isinstance(policy_data, dict):
            raise ValidationError("Policy must be an object")

        if "version" not in policy_data:
            raise ValidationError("Policy must have a 'version' field")

        if "policies" not in policy_data:
            raise ValidationError("Policy must have a 'policies' field")

        # Validate version
        version = policy_data.get("version")
        if version not in ["1"]:
            raise ValidationError(f"Unsupported policy version: {version}")

        # Validate policies structure
        policies = policy_data.get("policies", {})
        if not isinstance(policies, dict):
            raise ValidationError("'policies' must be an object")

        # Validate each policy
        for policy_name, policy_def in policies.items():
            if not isinstance(policy_def, dict):
                raise ValidationError(f"Policy '{policy_name}' must be an object")

            if "action" not in policy_def:
                raise ValidationError(f"Policy '{policy_name}' must have an 'action' field")

            action = policy_def.get("action")
            valid_actions = [
                "allow",
                "block",
                "redact",
                "rewrite",
                "route",
                "escalate",
                "log_only",
            ]
            if action not in valid_actions:
                raise ValidationError(
                    f"Policy '{policy_name}' has invalid action '{action}'. "
                    f"Must be one of: {valid_actions}"
                )


def validate_policy(policy_data: Dict[str, Any]) -> None:
    """
    Convenience function to validate policy data.

    Args:
        policy_data: Policy data to validate

    Raises:
        ValidationError: If policy is invalid
    """
    PolicySchema.validate(policy_data)


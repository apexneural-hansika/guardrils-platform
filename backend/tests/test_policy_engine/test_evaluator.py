"""Tests for policy evaluator."""

import pytest
from app.policy_engine.parser import PolicyAST
from app.policy_engine.evaluator import PolicyEvaluator
from app.checks.base import CheckResult
from app.schemas.gateway import ActionType


def test_evaluate_no_policies():
    """Test evaluation with no policies."""
    ast = PolicyAST({"version": "1", "policies": {}})
    evaluator = PolicyEvaluator(ast)
    
    result = evaluator.evaluate("llm.input", [])
    
    assert result["action"] == ActionType.ALLOW
    assert result["triggered_policies"] == []
    assert result["reason"] == "No policies triggered"


def test_evaluate_policy_triggered():
    """Test evaluation when policy is triggered."""
    ast = PolicyAST({
        "version": "1",
        "policies": {
            "block_long": {
                "action": "block",
                "scope": "llm.input",
                "conditions": [
                    {"type": "check_failed", "check": "length_check"}
                ]
            }
        }
    })
    evaluator = PolicyEvaluator(ast)
    
    check_results = [
        CheckResult(
            check_name="length_check",
            status="fail",
            score=0.9,
            latency_ms=10,
        )
    ]
    
    result = evaluator.evaluate("llm.input", check_results)
    
    assert result["action"] == ActionType.BLOCK
    assert "block_long" in result["triggered_policies"]
    assert result["reason"] is not None


def test_evaluate_scope_filtering():
    """Test evaluation filters by scope."""
    ast = PolicyAST({
        "version": "1",
        "policies": {
            "input_policy": {
                "action": "block",
                "scope": "llm.input"
            },
            "output_policy": {
                "action": "block",
                "scope": "llm.output"
            }
        }
    })
    evaluator = PolicyEvaluator(ast)
    
    # Should only trigger input_policy
    result = evaluator.evaluate("llm.input", [])
    assert len(result["triggered_policies"]) == 1
    
    # Should only trigger output_policy
    result = evaluator.evaluate("llm.output", [])
    assert len(result["triggered_policies"]) == 1


def test_evaluate_most_restrictive_action():
    """Test evaluation chooses most restrictive action."""
    ast = PolicyAST({
        "version": "1",
        "policies": {
            "allow_policy": {
                "action": "allow",
                "scope": "all"
            },
            "block_policy": {
                "action": "block",
                "scope": "all"
            }
        }
    })
    evaluator = PolicyEvaluator(ast)
    
    result = evaluator.evaluate("llm.input", [])
    
    # Block should win over allow
    assert result["action"] == ActionType.BLOCK
    assert "block_policy" in result["triggered_policies"]


def test_evaluate_condition_check_score():
    """Test evaluation with score-based condition."""
    ast = PolicyAST({
        "version": "1",
        "policies": {
            "high_toxicity": {
                "action": "block",
                "conditions": [
                    {"type": "check_score_above", "check": "toxicity", "threshold": 0.7}
                ]
            }
        }
    })
    evaluator = PolicyEvaluator(ast)
    
    # High score should trigger
    check_results = [
        CheckResult(
            check_name="toxicity",
            status="pass",
            score=0.9,
            latency_ms=10,
        )
    ]
    
    result = evaluator.evaluate("llm.input", check_results)
    assert result["action"] == ActionType.BLOCK
    
    # Low score should not trigger
    check_results = [
        CheckResult(
            check_name="toxicity",
            status="pass",
            score=0.5,
            latency_ms=10,
        )
    ]
    
    result = evaluator.evaluate("llm.input", check_results)
    assert result["action"] == ActionType.ALLOW


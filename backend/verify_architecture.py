#!/usr/bin/env python3
"""
Verification script for architecture components.

Run this to verify all new components are working correctly.
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.checks.executor import CheckExecutor
from app.checks.registry import CheckRegistry
from app.checks.base import Check, CheckPayload, CheckResult
from app.policy_engine.parser import parse_policy_yaml
from app.policy_engine.evaluator import PolicyEvaluator
from app.policy_engine.actions import ActionExecutor
from app.policy_engine.schemas import validate_policy
from app.schemas.gateway import ActionType, ContentPayload


class SimpleLengthCheck(Check):
    """Simple check for testing."""

    name = "length_check"
    version = "1.0.0"
    description = "Checks text length"
    scope = ["llm.input", "llm.output", "all"]

    async def run(self, payload: CheckPayload) -> CheckResult:
        """Check text length."""
        text = payload.text or ""
        if len(text) > 100:
            return CheckResult(
                check_name=self.name,
                status="fail",
                score=0.9,
                message=f"Text too long: {len(text)} chars",
                latency_ms=5,
            )
        return CheckResult(
            check_name=self.name,
            status="pass",
            score=0.0,
            message=f"Text length OK: {len(text)} chars",
            latency_ms=5,
        )


async def test_check_executor():
    """Test check executor."""
    print("🧪 Testing Check Executor...")
    
    registry = CheckRegistry()
    registry.register(SimpleLengthCheck)
    
    executor = CheckExecutor(registry=registry)
    
    # Test short text
    payload = CheckPayload(text="Hello")
    results = await executor.run_checks("llm.input", payload)
    
    assert len(results) == 1
    assert results[0].check_name == "length_check"
    assert results[0].status == "pass"
    print("  ✅ Short text: PASS")
    
    # Test long text
    payload = CheckPayload(text="A" * 150)
    results = await executor.run_checks("llm.input", payload)
    
    assert len(results) == 1
    assert results[0].status == "fail"
    print("  ✅ Long text: FAIL (expected)")
    
    print("  ✅ Check Executor: WORKING\n")


def test_policy_parser():
    """Test policy parser."""
    print("🧪 Testing Policy Parser...")
    
    yaml_content = """
version: "1"
policies:
  block_long:
    action: block
    scope: all
    conditions:
      - type: check_failed
        check: length_check
"""
    ast = parse_policy_yaml(yaml_content)
    
    assert ast.version == "1"
    assert "block_long" in ast.policies
    print("  ✅ YAML parsing: WORKING")
    
    # Test validation
    policy_data = {
        "version": "1",
        "policies": {
            "test": {"action": "allow"}
        }
    }
    validate_policy(policy_data)
    print("  ✅ Schema validation: WORKING")
    
    print("  ✅ Policy Parser: WORKING\n")


async def test_policy_evaluator():
    """Test policy evaluator."""
    print("🧪 Testing Policy Evaluator...")
    
    yaml_content = """
version: "1"
policies:
  block_long:
    action: block
    scope: llm.input
    conditions:
      - type: check_failed
        check: length_check
"""
    ast = parse_policy_yaml(yaml_content)
    evaluator = PolicyEvaluator(ast)
    
    # Test with failing check
    check_results = [
        CheckResult(
            check_name="length_check",
            status="fail",
            score=0.9,
            latency_ms=10,
        )
    ]
    
    decision = evaluator.evaluate("llm.input", check_results)
    
    assert decision["action"] == ActionType.BLOCK
    assert "block_long" in decision["triggered_policies"]
    print("  ✅ Policy evaluation: WORKING")
    
    # Test with passing check
    check_results = [
        CheckResult(
            check_name="length_check",
            status="pass",
            score=0.0,
            latency_ms=10,
        )
    ]
    
    decision = evaluator.evaluate("llm.input", check_results)
    assert decision["action"] == ActionType.ALLOW
    print("  ✅ Policy evaluation (pass): WORKING")
    
    print("  ✅ Policy Evaluator: WORKING\n")


def test_action_executor():
    """Test action executor."""
    print("🧪 Testing Action Executor...")
    
    content = ContentPayload(text="Hello world")
    
    # Test ALLOW
    result = ActionExecutor.execute(ActionType.ALLOW, content)
    assert result.text == "Hello world"
    print("  ✅ ALLOW action: WORKING")
    
    # Test BLOCK
    result = ActionExecutor.execute(ActionType.BLOCK, content)
    assert result.text == ""
    print("  ✅ BLOCK action: WORKING")
    
    # Test REDACT
    content = ContentPayload(text="Email: test@example.com")
    result = ActionExecutor.execute(
        ActionType.REDACT,
        content,
        {"char": "█", "patterns": ["test@example.com"]}
    )
    assert "test@example.com" not in result.text
    print("  ✅ REDACT action: WORKING")
    
    print("  ✅ Action Executor: WORKING\n")


async def test_integration():
    """Test full integration."""
    print("🧪 Testing Full Integration...")
    
    # 1. Register check
    registry = CheckRegistry()
    registry.register(SimpleLengthCheck)
    
    # 2. Run checks
    executor = CheckExecutor(registry=registry)
    payload = CheckPayload(text="A" * 150)  # Long text
    check_results = await executor.run_checks("llm.input", payload)
    
    # 3. Evaluate policy
    yaml_content = """
version: "1"
policies:
  block_long:
    action: block
    conditions:
      - type: check_failed
        check: length_check
"""
    ast = parse_policy_yaml(yaml_content)
    evaluator = PolicyEvaluator(ast)
    decision = evaluator.evaluate("llm.input", check_results)
    
    # 4. Execute action
    content = ContentPayload(text="A" * 150)
    modified = ActionExecutor.execute(decision["action"], content)
    
    assert decision["action"] == ActionType.BLOCK
    assert modified.text == ""  # Blocked content is empty
    print("  ✅ Full flow: WORKING")
    
    print("  ✅ Integration: WORKING\n")


async def main():
    """Run all verification tests."""
    print("=" * 60)
    print("Architecture Verification")
    print("=" * 60)
    print()
    
    try:
        # Test components
        await test_check_executor()
        test_policy_parser()
        await test_policy_evaluator()
        test_action_executor()
        await test_integration()
        
        print("=" * 60)
        print("✅ ALL TESTS PASSED - Architecture is working!")
        print("=" * 60)
        return 0
        
    except Exception as e:
        print("=" * 60)
        print(f"❌ TEST FAILED: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)


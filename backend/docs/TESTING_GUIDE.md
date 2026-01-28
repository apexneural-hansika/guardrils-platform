# Testing Guide - How to Test and Verify

This guide shows you how to test the new architecture components and verify everything is working.

## Quick Start

### 1. Run All Tests

```bash
cd backend
pytest tests/ -v
```

**Expected Output:**
```
======================== test session starts =========================
collected 20+ items

tests/test_api/test_health.py::test_root_endpoint PASSED
tests/test_api/test_health.py::test_health_endpoint PASSED
tests/test_api/test_gateway.py::test_evaluate_endpoint PASSED
tests/test_checks/test_executor.py::test_executor_run_checks PASSED
tests/test_policy_engine/test_parser.py::test_parse_valid_yaml PASSED
...
======================== 20+ passed in 2.5s =========================
```

### 2. Run Specific Test Suites

```bash
# Test check executor
pytest tests/test_checks/ -v

# Test policy engine
pytest tests/test_policy_engine/ -v

# Test API endpoints
pytest tests/test_api/ -v

# Test services
pytest tests/test_services/ -v
```

### 3. Run with Coverage

```bash
pytest tests/ --cov=app --cov-report=html
```

Open `htmlcov/index.html` in your browser to see coverage report.

## Component Testing

### Testing Check Executor

The check executor orchestrates check execution. Test it:

```bash
pytest tests/test_checks/test_executor.py -v
```

**What It Tests:**
- ✅ Running checks correctly
- ✅ Handling check failures
- ✅ Timeout handling
- ✅ Error handling
- ✅ Multiple checks
- ✅ Scope filtering
- ✅ Pre/post/tool checks

**Example Test:**
```python
# This test verifies the executor runs checks and handles results
async def test_executor_run_checks():
    registry = CheckRegistry()
    registry.register(MockCheck)
    executor = CheckExecutor(registry=registry)
    results = await executor.run_checks("llm.input", payload)
    assert len(results) == 1
```

### Testing Policy Engine

The policy engine parses, evaluates, and executes policies. Test it:

```bash
pytest tests/test_policy_engine/ -v
```

**What It Tests:**
- ✅ YAML/JSON parsing
- ✅ Policy validation
- ✅ Policy evaluation
- ✅ Action execution
- ✅ Scope filtering
- ✅ Most restrictive action selection

**Example Test:**
```python
# This test verifies policy evaluation
def test_evaluate_policy_triggered():
    ast = PolicyAST({...})
    evaluator = PolicyEvaluator(ast)
    result = evaluator.evaluate("llm.input", check_results)
    assert result["action"] == ActionType.BLOCK
```

## Integration Testing

### End-to-End Flow Test

Create a simple integration test:

```python
# tests/test_integration/test_full_flow.py
import pytest
from app.checks.executor import CheckExecutor
from app.checks.registry import CheckRegistry
from app.policy_engine.parser import parse_policy_yaml
from app.policy_engine.evaluator import PolicyEvaluator
from app.checks.base import CheckPayload

@pytest.mark.asyncio
async def test_full_flow():
    # 1. Register a check
    registry = CheckRegistry()
    registry.register(MockCheck)
    
    # 2. Run checks
    executor = CheckExecutor(registry=registry)
    payload = CheckPayload(text="This is a very long text")
    check_results = await executor.run_checks("llm.input", payload)
    
    # 3. Evaluate policies
    policy_yaml = """
    version: "1"
    policies:
      block_long:
        action: block
        conditions:
          - type: check_failed
            check: mock_check
    """
    ast = parse_policy_yaml(policy_yaml)
    evaluator = PolicyEvaluator(ast)
    decision = evaluator.evaluate("llm.input", check_results)
    
    # 4. Verify
    assert decision["action"] == ActionType.BLOCK
```

## Manual Testing

### 1. Test Check System

```python
# test_checks_manual.py
from app.checks.executor import CheckExecutor
from app.checks.registry import CheckRegistry
from app.checks.base import CheckPayload
from tests.test_checks.test_executor import MockCheck

# Register check
registry = CheckRegistry()
registry.register(MockCheck)

# Create executor
executor = CheckExecutor(registry=registry)

# Run checks
payload = CheckPayload(text="Hello world")
results = await executor.run_checks("llm.input", payload)

print(f"Ran {len(results)} checks")
for result in results:
    print(f"  {result.check_name}: {result.status} (score: {result.score})")
```

### 2. Test Policy Engine

```python
# test_policy_manual.py
from app.policy_engine.parser import parse_policy_yaml
from app.policy_engine.evaluator import PolicyEvaluator
from app.checks.base import CheckResult

# Parse policy
yaml_content = """
version: "1"
policies:
  block_toxic:
    action: block
    conditions:
      - type: check_score_above
        check: toxicity
        threshold: 0.7
"""
ast = parse_policy_yaml(yaml_content)

# Evaluate
evaluator = PolicyEvaluator(ast)
check_results = [
    CheckResult(
        check_name="toxicity",
        status="pass",
        score=0.9,
        latency_ms=10,
    )
]
decision = evaluator.evaluate("llm.input", check_results)

print(f"Action: {decision['action']}")
print(f"Triggered: {decision['triggered_policies']}")
```

### 3. Test API Endpoints

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# In another terminal, test endpoints
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app",
    "scope": "llm.output",
    "content": {"text": "Hello world"}
  }'
```

## Verification Checklist

### ✅ Component Tests Pass

```bash
# All component tests should pass
pytest tests/test_checks/ -v
pytest tests/test_policy_engine/ -v
```

**Expected:** All tests pass (20+ tests)

### ✅ Integration Works

```bash
# Integration tests should pass
pytest tests/test_api/ -v
pytest tests/test_services/ -v
```

**Expected:** All API and service tests pass

### ✅ No Linting Errors

```bash
cd backend
ruff check app/
```

**Expected:** No errors

### ✅ Type Checking (Optional)

```bash
cd backend
mypy app/ --ignore-missing-imports
```

**Expected:** No critical errors

### ✅ Backend Starts

```bash
cd backend
uvicorn app.main:app --reload
```

**Expected:** Server starts without errors

### ✅ Health Endpoints Work

```bash
curl http://localhost:8000/health
curl http://localhost:8000/v1/health
```

**Expected:** Returns `{"status": "healthy", ...}`

## Troubleshooting

### Tests Fail with Import Errors

**Problem:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
```bash
cd backend
export PYTHONPATH=$PWD:$PYTHONPATH
pytest tests/ -v
```

Or install in development mode:
```bash
cd backend
pip install -e .
```

### Tests Timeout

**Problem:** Tests hang or timeout

**Solution:** Check for:
- Infinite loops in checks
- Missing `await` in async code
- Blocking operations

### Policy Parsing Fails

**Problem:** `ValidationError` when parsing policies

**Solution:**
- Check YAML syntax
- Ensure `version` and `policies` fields exist
- Ensure each policy has an `action` field

### Checks Don't Run

**Problem:** Executor returns empty results

**Solution:**
- Verify checks are registered: `registry.list_names()`
- Check scope matches: `check.scope`
- Verify check class inherits from `Check`

## Next Steps

Once all tests pass:

1. ✅ **Create Real Checks** - Implement PII detection, toxicity, etc.
2. ✅ **Create Real Policies** - Define actual policy YAML files
3. ✅ **Integrate with Gateway** - Connect executor and evaluator to gateway service
4. ✅ **Add Audit Logging** - Log all decisions to database
5. ✅ **Performance Testing** - Test with many concurrent requests

## Summary

**To verify everything works:**

1. Run: `pytest tests/ -v` → Should see 20+ passing tests
2. Check: All component tests pass
3. Verify: Backend starts without errors
4. Test: Health endpoints return 200 OK

**If all tests pass, the architecture is working!** ✅


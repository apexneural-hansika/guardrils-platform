# Testing Guide

## Overview

This guide covers comprehensive testing strategies for the Guardrails Platform, including unit tests, integration tests, and security tests.

## Test Structure

```
backend/tests/
├── test_api/          # API endpoint tests
│   ├── test_auth.py   # Authentication & authorization tests
│   ├── test_gateway.py # Gateway endpoint tests
│   ├── test_rate_limiting.py # Rate limiting tests
│   └── test_audit.py  # Audit log API tests
├── test_services/     # Service layer tests
├── test_checks/       # Check executor tests
└── test_policy_engine/ # Policy engine tests
```

## Running Tests

### All Tests
```bash
cd backend
pytest
```

### With Coverage
```bash
pytest --cov=app --cov-report=html
```

### Specific Test File
```bash
pytest tests/test_api/test_auth.py
```

### Specific Test
```bash
pytest tests/test_api/test_auth.py::test_gateway_evaluate_without_auth
```

## Test Categories

### 1. Authentication Tests

Tests in `test_api/test_auth.py` cover:
- Unauthenticated access (should fail)
- Invalid API keys
- JWT token validation
- Organization access control

### 2. Rate Limiting Tests

Tests in `test_api/test_rate_limiting.py` cover:
- Rate limit enforcement
- Rate limit headers
- Health endpoint exclusion
- Retry-After headers

### 3. Audit Log Tests

Tests in `test_api/test_audit.py` cover:
- Audit log query endpoints
- Authentication requirements
- Filter functionality
- Session-based queries

### 4. Gateway Tests

Tests in `test_api/test_gateway.py` cover:
- Evaluate endpoint
- Intercept endpoint
- Request validation
- Response format

## Integration Testing

### Prerequisites

1. Start infrastructure:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. Run migrations:
```bash
cd backend
alembic upgrade head
```

3. Set up test data (if needed)

### Running Integration Tests

```bash
pytest tests/test_api/ -v
```

## Security Testing

### OWASP Top 10 Test Coverage

1. **Injection**: Test SQL injection, XSS, command injection
2. **Broken Authentication**: Test auth bypass, token manipulation
3. **Sensitive Data Exposure**: Test PII handling, secret leakage
4. **SSRF**: Test URL validation, private IP blocking
5. **Broken Access Control**: Test org isolation, resource access
6. **Security Misconfiguration**: Test CORS, headers, defaults

### Example Security Test

```python
@pytest.mark.asyncio
async def test_ssrf_protection():
    """Test SSRF protection blocks localhost URLs."""
    payload = {
        "app_id": "test",
        "provider": "custom",
        "endpoint": "http://localhost:8080",  # Should be blocked
        "call_config": {},
    }
    response = await client.post("/v1/gateway/intercept", json=payload)
    assert response.status_code == 400  # SSRF blocked
```

## Mocking

### Mock External Services

```python
from unittest.mock import AsyncMock, patch

@patch('app.services.gateway_service.HTTPClient')
async def test_with_mocked_http(mock_client):
    mock_client.return_value.__aenter__.return_value.post = AsyncMock(
        return_value=MockResponse(status_code=200)
    )
    # Test code
```

### Mock Database

```python
from unittest.mock import AsyncMock

@pytest.fixture
def mock_db():
    return AsyncMock(spec=AsyncSession)
```

## Test Data

### Fixtures

Create reusable test data in `conftest.py`:

```python
@pytest.fixture
def sample_evaluate_request():
    return EvaluateRequest(
        app_id="test-app",
        scope="llm.output",
        content=ContentPayload(text="Test content"),
    )
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after each test
3. **Naming**: Use descriptive test names
4. **Coverage**: Aim for >80% code coverage
5. **Speed**: Keep tests fast (use mocks where appropriate)

## Continuous Integration

Tests should run automatically on:
- Pull requests
- Commits to main branch
- Nightly builds

See `.github/workflows/` for CI configuration.


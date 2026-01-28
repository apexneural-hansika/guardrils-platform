# Guardrails Platform Python SDK

Python SDK for integrating Guardrails Platform into your applications. Provides policy enforcement for LLM inputs/outputs, tool calls, and data access with comprehensive audit trails.

## Installation

### From PyPI (Future)

```bash
pip install guardrails-sdk
```

### From Source

```bash
cd sdk/python
pip install -e .
```

### Development Installation

```bash
cd sdk/python
pip install -e ".[dev]"
```

## Quick Start

### Synchronous Client

```python
from guardrails_sdk import GuardrailsClient

# Initialize client
client = GuardrailsClient(
    api_key="your-api-key",
    app_id="your-app-id",
    base_url="https://api.guardrails.dev",  # Optional, defaults to production
    timeout=30.0,  # Optional, defaults to 30 seconds
    env="prod",  # Optional, defaults to "prod"
)

# Evaluate content
result = client.evaluate(
    text="Hello, my SSN is 123-45-6789",
    scope="llm.output",
    user_id="user123",
    session_id="session456",
)

if result.action == "block":
    print(f"Blocked: {result.reason}")
elif result.action == "redact":
    print(f"Redacted content: {result.modified_content.text}")

# Wrap an LLM call
from guardrails_sdk import BlockedError

try:
    result = client.wrap(
        input_text=user_prompt,
        call=lambda: openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": user_prompt}]
        ),
        user_id="user123",
    )
    print(f"Response: {result.response}")
except BlockedError as e:
    print(f"Request blocked: {e.message}")
```

### Asynchronous Client

```python
from guardrails_sdk import AsyncGuardrailsClient

async def main():
    async with AsyncGuardrailsClient(
        api_key="your-api-key",
        app_id="your-app-id",
    ) as client:
        # Evaluate content
        result = await client.evaluate(
            text="Hello, my SSN is 123-45-6789",
            scope="llm.output",
        )

        # Wrap an LLM call
        result = await client.wrap(
            input_text=user_prompt,
            call=lambda: openai.chat.completions.acreate(
                model="gpt-4",
                messages=[{"role": "user", "content": user_prompt}]
            ),
        )
        print(f"Response: {result.response}")

# Run
import asyncio
asyncio.run(main())
```

## Setup

### Development Setup

```bash
# Navigate to SDK directory
cd sdk/python

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e ".[dev]"

# Run tests
pytest

# Run linter
ruff check guardrails_sdk/

# Run type checker
mypy guardrails_sdk/
```

### Building Package

```bash
# Build distribution
python -m build

# This creates:
# - dist/guardrails-sdk-0.1.0.tar.gz (source distribution)
# - dist/guardrails_sdk-0.1.0-py3-none-any.whl (wheel)
```

## API Reference

### GuardrailsClient

Synchronous client for Guardrails Platform.

#### Methods

- `evaluate(text, scope, user_id, session_id, metadata, dry_run)` - Evaluate content against policies
- `wrap(input_text, call, user_id, session_id, metadata, on_block)` - Wrap an LLM call with guardrails

### AsyncGuardrailsClient

Asynchronous client for Guardrails Platform.

#### Methods

- `evaluate(text, scope, user_id, session_id, metadata, dry_run)` - Evaluate content against policies (async)
- `wrap(input_text, call, user_id, session_id, metadata, on_block)` - Wrap an LLM call with guardrails (async)

## Configuration

All configuration is done via constructor parameters (no environment variables required):

- `api_key` (required): Your Guardrails API key
- `app_id` (required): Your application ID
- `base_url` (optional): Base URL for API (default: "https://api.guardrails.dev")
- `timeout` (optional): Request timeout in seconds (default: 30.0)
- `env` (optional): Environment name (default: "prod")

## Error Handling

```python
from guardrails_sdk import (
    GuardrailsError,
    BlockedError,
    RateLimitError,
    NetworkError,
    TimeoutError,
)

try:
    result = client.evaluate(text="...")
except BlockedError as e:
    print(f"Blocked: {e.message}, Decision: {e.decision}")
except RateLimitError:
    print("Rate limit exceeded, retry later")
except TimeoutError:
    print("Request timed out")
except NetworkError:
    print("Network error occurred")
except GuardrailsError as e:
    print(f"Error: {e.message} (code: {e.code})")
```

## Testing

### Quick Test Script

The easiest way to test your endpoints:

```bash
cd sdk/python
python test_endpoints.py
```

This script tests:
- Backend connectivity
- All health endpoints
- SDK initialization
- Gateway endpoints (when implemented)

### Running Tests

#### Prerequisites

```bash
cd sdk/python
pip install -e ".[dev]"
```

#### Run All Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=guardrails_sdk --cov-report=html
```

#### Run Specific Tests

```bash
# Unit tests only
pytest tests/test_client.py tests/test_async_client.py -v

# Integration tests only (requires backend running)
pytest tests/test_integration.py -m integration -v

# Specific test
pytest tests/test_client.py::test_evaluate_success -v
```

### Test Types

#### Unit Tests

**Location:** `tests/test_client.py`, `tests/test_async_client.py`

**Purpose:** Test SDK functionality with mocked HTTP responses.

**What They Test:**
- Client initialization
- Request building
- Response parsing
- Error handling
- Text extraction
- Content modification

**Run:**
```bash
pytest tests/test_client.py tests/test_async_client.py
```

#### Integration Tests

**Location:** `tests/test_integration.py`

**Purpose:** Test SDK against a running backend instance.

**Prerequisites:**
- Backend server running on `http://localhost:8000`
- Database and Redis configured (for health checks)

**Run:**
```bash
# Terminal 1: Start backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Run integration tests
cd sdk/python
pytest tests/test_integration.py -m integration -v
```

### Testing Workflow

#### Step 1: Start Backend

```bash
# Terminal 1
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

#### Step 2: Verify Backend is Running

```bash
# Terminal 2 - Quick test
curl http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "guardrails-platform",
  "environment": "development"
}
```

#### Step 3: Run SDK Tests

```bash
# Terminal 2
cd sdk/python
python test_endpoints.py
```

### Available Endpoints

#### Currently Available

| Method | Endpoint | Description | Test Command |
|--------|----------|-------------|--------------|
| GET | `/` | Root endpoint | `curl http://localhost:8000/` |
| GET | `/health` | Health check | `curl http://localhost:8000/health` |
| GET | `/v1/health` | Basic health check | `curl http://localhost:8000/v1/health` |
| GET | `/v1/health/db` | Database health check | `curl http://localhost:8000/v1/health/db` |
| GET | `/v1/health/redis` | Redis health check | `curl http://localhost:8000/v1/health/redis` |
| POST | `/v1/gateway/evaluate` | Evaluate content | `client.evaluate()` |
| POST | `/v1/gateway/intercept` | Full interception | `client.wrap()` |

### Testing Individual Endpoints

#### Using curl

```bash
# Root
curl http://localhost:8000/

# Health
curl http://localhost:8000/health

# V1 Health
curl http://localhost:8000/v1/health

# Database Health
curl http://localhost:8000/v1/health/db

# Redis Health
curl http://localhost:8000/v1/health/redis
```

#### Using Python

```python
import httpx

BASE_URL = "http://localhost:8000"

# Test each endpoint
endpoints = ["/", "/health", "/v1/health", "/v1/health/db", "/v1/health/redis"]

for endpoint in endpoints:
    try:
        response = httpx.get(f"{BASE_URL}{endpoint}", timeout=5.0)
        print(f"✅ {endpoint}: {response.status_code}")
        print(f"   {response.json()}")
    except Exception as e:
        print(f"❌ {endpoint}: {e}")
```

### Expected Test Results

#### When Backend is Running:

```
✅ GET /                    - Service info returned
✅ GET /health              - Health status returned
✅ GET /v1/health           - V1 health returned
✅ GET /v1/health/db        - Database status returned
✅ GET /v1/health/redis     - Redis status returned
✅ SDK client initialized   - Client created successfully
✅ SDK evaluate()           - Gateway endpoint working
✅ SDK wrap()               - Gateway intercept working
```

#### When Backend is NOT Running:

```
❌ All endpoint tests fail (connection refused)
✅ SDK client initialized   - Still works!
❌ SDK evaluate()           - Network error (expected)
```

## Troubleshooting

### Backend Not Running

**Error:** `Connection refused` or `Network error`

**Solution:**
```bash
# Start backend
cd backend
uvicorn app.main:app --reload
```

### Database Connection Issues

**Error:** Health check shows database disconnected

**Solution:**
```bash
# Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# Run migrations
cd backend
alembic upgrade head
```

### Redis Connection Issues

**Error:** Health check shows Redis disconnected

**Solution:**
```bash
# Start Redis
docker-compose -f docker-compose.dev.yml up -d redis
```

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'guardrails_sdk'`

**Solution:**
```bash
cd sdk/python
pip install -e .
```

### Tests Not Found

**Problem:** Running from wrong directory

**Solution:**
```bash
# Make sure you're in sdk/python
cd sdk/python
pytest
```

## Project Structure

```
sdk/python/
├── guardrails_sdk/        # Main package
│   ├── __init__.py       # Package exports
│   ├── client.py         # Sync client
│   ├── async_client.py   # Async client
│   ├── models.py         # Data models
│   └── exceptions.py     # Exception classes
├── tests/                # Test suite
│   ├── test_client.py    # Unit tests for sync client
│   ├── test_async_client.py  # Unit tests for async client
│   └── test_integration.py   # Integration tests
├── examples/             # Usage examples
│   └── basic_usage.py
├── pyproject.toml        # Package configuration
├── pytest.ini           # Pytest configuration
├── run_tests.sh         # Test runner script
├── test_endpoints.py    # Quick endpoint test script
└── README.md           # This file
```

## Code Quality Standards

- ✅ All files under 500 LOC
- ✅ Type hints on all functions
- ✅ Docstrings for all public APIs
- ✅ Error handling with custom exceptions
- ✅ Context manager support
- ✅ No hardcoded secrets
- ✅ Environment-based configuration

## Swagger UI

Access interactive API documentation at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

You can test endpoints directly from the Swagger UI by:
1. Opening http://localhost:8000/docs
2. Expanding an endpoint
3. Clicking "Try it out"
4. Clicking "Execute"
5. Viewing the response

## License

MIT

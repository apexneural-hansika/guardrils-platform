# Guardrails Platform

> **Platform Type:** Horizontal (any vertical)  
> **Stack:** FastAPI + React/TypeScript/TailwindCSS  
> **Integration:** SDK + Proxy  
> **Compliance:** Design for both India (DPDP) + Global (SOC2/GDPR)

A production-grade policy enforcement and audit platform for AI applications. Provides guardrails for LLM inputs/outputs, tool calls, and data access with comprehensive audit trails.

## Purpose

Guardrails Platform enables organizations to:
- Enforce content policies across LLM interactions
- Detect and prevent PII, secrets, prompt injection, and other security risks
- Maintain compliance with GDPR, DPDP, SOC2, and other frameworks
- Audit all AI interactions with full traceability
- Manage policies via YAML DSL or visual builder

## Local Run Steps

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker Compose)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd guardrails-platform

# Start infrastructure (PostgreSQL, Redis)
docker-compose -f docker-compose.dev.yml up -d

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

The backend will be available at `http://localhost:8000`  
The frontend will be available at `http://localhost:5173`

## Environment Setup

**Quick Setup:** Run `./scripts/setup-env.sh` to automatically create `.env` files with secure secrets.

For manual setup, see [backend/docs/SETUP.md](backend/docs/SETUP.md) for detailed instructions.

### Backend Environment Variables

Create `backend/.env` (copy from `.env.example` in the root) and configure:

```bash
# Generate secrets:
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
python3 -c "import secrets; print('SESSION_SECRET=' + secrets.token_urlsafe(32))"

# Then create backend/.env with:
ENV=development
JWT_SECRET=<your-generated-secret>
SESSION_SECRET=<your-generated-secret>
DATABASE_URL=postgresql+asyncpg://guardrails:guardrails@localhost:5432/guardrails_dev
# ... see .env.example for all options
```

### Frontend Environment Variables

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000/v1
VITE_APP_NAME=Guardrails Platform
```

## Tests

### Backend Tests

```bash
cd backend
pytest
pytest --cov=app --cov-report=html  # With coverage
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

## Migrations

### Create Migration

```bash
cd backend
alembic revision --autogenerate -m "description"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback

```bash
alembic downgrade -1
```

## Adding Providers

The platform uses a provider-based architecture. To add a new check or service provider:

1. **Check Provider**: Create a new file in `backend/app/checks/{category}/`
2. **Service Provider**: Create a new file in `backend/app/providers/`
3. Register in the appropriate registry
4. Add tests in `backend/tests/`
5. Update documentation

Example check structure:
```python
# backend/app/checks/security/my_check.py
from app.checks.base import Check, CheckPayload, CheckResult

class MyCheck(Check):
    name = "my_check"
    version = "1.0.0"
    description = "Description of what this check does"
    
    async def run(self, payload: CheckPayload) -> CheckResult:
        # Implementation
        pass
```

## Deployment Notes

### Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates configured
- [ ] CORS origins restricted
- [ ] Rate limits configured
- [ ] Monitoring and alerting set up
- [ ] Backup strategy in place
- [ ] Security audit completed

### Kubernetes Deployment

See `deploy/kubernetes/` for manifests.

```bash
kubectl apply -f deploy/kubernetes/
```

### Docker Production Build

```bash
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d
```

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running: `docker ps`
2. Check DATABASE_URL format
3. Verify network connectivity
4. Check database logs: `docker-compose logs postgres`

### Migration Errors

1. Ensure database is up-to-date: `alembic current`
2. Check for conflicting migrations
3. Review migration files in `backend/alembic/versions/`

### API Authentication Issues

1. Verify API key format
2. Check X-API-Key header
3. Review security middleware logs
4. Validate JWT_SECRET is set

### Frontend Build Issues

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check Node.js version: `node --version` (should be 18+)
3. Verify environment variables
4. Check browser console for errors

## Architecture

- **Backend**: FastAPI (async), SQLAlchemy (async), Alembic migrations
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Database**: PostgreSQL (primary), Redis (caching/rate limiting)
- **SDKs**: Python and TypeScript clients
- **Proxy**: FastAPI-based proxy for LLM providers

## Documentation

### Root Documentation
- **[README.md](README.md)** - This file (quick start, setup, architecture)
- **[spec.md](spec.md)** - Complete implementation specification

### Product Documentation (`/docs/`)
Product and user-facing documentation:
- [Architecture Flow](docs/architecture-flow.md) - Detailed execution flow
- [SDK Naming Strategy](docs/sdk-naming-strategy.md) - SDK branding
- [Project Structure](docs/PROJECT_STRUCTURE.md) - File organization guide
- [Compliance Improvements](docs/COMPLIANCE_IMPROVEMENTS.md) - Security & compliance features
- [Swagger UI Organization](docs/SWAGGER_UI_ORGANIZATION.md) - API documentation guide
- [Testing](docs/TESTING.md) - Testing guide
- [OWASP Coverage](docs/OWASP_COVERAGE.md) - Security coverage

### Backend Documentation (`/backend/docs/`)
Backend engineering and development documentation:
- [Setup Guide](backend/docs/SETUP.md) - Environment setup
- [Testing Guide](backend/docs/TESTING_GUIDE.md) - Comprehensive testing
- [Compliance Review](backend/docs/REFERENCE_COMPLIANCE_REVIEW.md) - Reference.md compliance
- [Fixes Applied](backend/docs/FIXES_APPLIED.md) - Recent fixes
- See [backend/docs/README.md](backend/docs/README.md) for full index

### Frontend Documentation (`/frontend/docs/`)
Frontend engineering and development documentation:
- [Frontend Guide](frontend/docs/README.md) - Complete frontend setup and development guide
- [Compliance Review](frontend/docs/FRONTEND_COMPLIANCE_REVIEW.md) - Reference.md compliance review
- See [frontend/docs/README.md](frontend/docs/README.md) for full index

## Security & Compliance

### OWASP Top 10 Coverage

- ✅ **Injection**: SQLAlchemy ORM, Pydantic validation
- ✅ **Cryptographic Failures**: JWT secrets, SHA-256 hashing, secure defaults
- ✅ **Security Misconfiguration**: CORS restrictions, secure headers
- ✅ **SSRF Protection**: URL validation, private IP blocking
- ⚠️ **Broken Access Control**: RBAC structure exists, needs comprehensive testing
- ⚠️ **Auth Failures**: API key + JWT auth implemented, needs comprehensive testing
- ⚠️ **Vulnerable Components**: Dependency audit recommended

### Production Features

- **Rate Limiting**: Multi-tier (minute/hour/day) with Redis
- **Timeouts/Retries**: Exponential backoff with circuit breaker
- **Audit Logging**: Comprehensive audit trail for all requests
- **SSRF Protection**: URL validation and private IP blocking
- **Authentication**: API key and JWT token support

## Contributing

1. Follow the engineering standards in `.cursor/commands/reference.md`
2. Keep files under ~500 LOC
3. Write tests for all new features
4. Update documentation
5. Ensure no linting errors

## License

[Your License Here]


# Project Structure Guide

This document explains what files and folders to keep and their purpose.

## 📁 Root Directory

### Keep These Files:
- `README.md` - Main project documentation
- `SETUP.md` - Environment setup instructions
- `PROJECT_STRUCTURE.md` - This file
- `Makefile` - Common development commands
- `.gitignore` - Git ignore rules
- `.env.example` - Environment variable template (DO NOT commit actual `.env`)
- `docker-compose.dev.yml` - Local development infrastructure (Postgres, Redis)
- `spec.md` - Project specification (reference document)

### Do NOT Commit:
- `.env` - Your actual environment variables (contains secrets)
- `*.log` - Log files
- `__pycache__/` - Python cache
- `node_modules/` - Node.js dependencies

---

## 📁 backend/ - FastAPI Backend

### Keep Everything In:

```
backend/
├── pyproject.toml          # Python project config & dependencies
├── requirements.txt        # Python dependencies (pip install)
├── alembic.ini            # Alembic migration config
│
├── alembic/               # Database migrations
│   ├── env.py            # Alembic environment setup
│   ├── script.py.mako    # Migration template
│   └── versions/         # Migration files (auto-generated)
│       └── .gitkeep      # Keep folder in git
│
├── app/                   # Main application code
│   ├── __init__.py
│   ├── main.py           # FastAPI app entry point
│   ├── config.py         # Environment config (settings)
│   ├── dependencies.py   # Dependency injection (DB, Redis)
│   │
│   ├── api/              # API routes
│   │   ├── __init__.py
│   │   ├── health.py     # Health check endpoints
│   │   └── v1/           # API v1 routes
│   │       ├── __init__.py
│   │       ├── router.py  # Main v1 router
│   │       └── [future: gateway.py, policies.py, audit.py, etc.]
│   │
│   ├── core/             # Core infrastructure
│   │   ├── __init__.py
│   │   ├── security.py   # Auth, JWT, API keys
│   │   ├── exceptions.py # Custom exceptions
│   │   ├── middleware.py # CORS, logging, correlation IDs
│   │   └── telemetry.py  # OpenTelemetry setup
│   │
│   ├── models/           # Database models (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── base.py       # SQLAlchemy base
│   │   ├── organization.py # Org, User, APIKey
│   │   ├── app.py        # App, Environment
│   │   ├── policy.py     # Policy, PolicyVersion, Assignment
│   │   ├── audit.py      # Request, Decision, Violation
│   │   └── incident.py   # Incident, IncidentNote
│   │
│   ├── schemas/          # Pydantic request/response schemas
│   │   └── [future: gateway.py, policy.py, check.py, audit.py]
│   │
│   ├── services/          # Business logic services
│   │   ├── gateway_service.py  # Core product engine (single entry point)
│   │   └── [future: policy_service.py, audit_service.py, etc.]
│   │
│   ├── checks/           # Check runner plugins
│   │   ├── __init__.py
│   │   ├── base.py       # Abstract check class
│   │   ├── registry.py   # Check registry
│   │   ├── executor.py   # Check execution orchestrator
│   │   └── [future: security/, quality/, cost/]
│   │
│   ├── policy_engine/    # Policy DSL engine (pure logic)
│   │   ├── __init__.py
│   │   ├── parser.py     # YAML → AST
│   │   ├── evaluator.py  # AST + signals → decisions
│   │   ├── actions.py    # block / redact / allow / rewrite
│   │   └── schemas.py    # Policy JSONSchema validation
│   │
│   └── utils/            # Utility functions
│       └── [future: hashing.py, redaction.py, tokens.py]
│
├── proxy/                # Proxy service (future)
│   └── [future: main.py, interceptor.py, providers/]
│
└── tests/               # Tests
    └── [future: test files]
```

### Do NOT Commit:
- `backend/.env` - Environment variables
- `backend/venv/` - Python virtual environment
- `backend/__pycache__/` - Python cache
- `backend/.pytest_cache/` - Test cache
- `backend/.mypy_cache/` - Type checker cache

---

## 📁 frontend/ - React Frontend

### Keep Everything In:

```
frontend/
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript config
├── tsconfig.node.json    # TypeScript config for Node
├── vite.config.ts        # Vite build config
├── tailwind.config.js    # TailwindCSS config
├── postcss.config.js     # PostCSS config
├── index.html            # HTML entry point
├── .eslintrc.cjs         # ESLint config
├── .gitignore            # Frontend gitignore
│
└── src/                  # Source code
    ├── main.tsx          # React entry point
    ├── App.tsx           # Main App component
    ├── index.css         # Global styles (Tailwind)
    │
    ├── api/              # API client
    │   └── [future: client.ts, policies.ts, audit.ts, apps.ts]
    │
    ├── components/       # React components
    │   ├── ui/          # Reusable UI components
    │   ├── layout/      # Layout components
    │   ├── policies/    # Policy management components
    │   ├── audit/       # Audit log components
    │   └── dashboard/   # Dashboard components
    │
    ├── pages/            # Page components
    │   └── [future: Dashboard.tsx, Policies.tsx, etc.]
    │
    ├── hooks/            # Custom React hooks
    │   └── [future: usePolicy.ts, useAudit.ts]
    │
    ├── store/            # State management (Zustand)
    │   └── [future: index.ts, authSlice.ts, uiSlice.ts]
    │
    ├── types/            # TypeScript type definitions
    │   └── [future: policy.ts, audit.ts, common.ts]
    │
    └── utils/            # Utility functions
        └── [future: formatters.ts, validators.ts]
```

### Do NOT Commit:
- `frontend/.env` - Environment variables
- `frontend/node_modules/` - Node.js dependencies
- `frontend/dist/` - Build output
- `frontend/.vite/` - Vite cache

---

## 📁 sdk/ - SDK Packages

### Keep Everything In:

```
sdk/
├── python/               # Python SDK
│   ├── pyproject.toml
│   ├── guardrails_sdk/
│   │   ├── __init__.py
│   │   ├── client.py
│   │   ├── async_client.py
│   │   ├── models.py
│   │   └── exceptions.py
│   └── tests/
│
└── typescript/           # TypeScript SDK
    ├── package.json
    ├── src/
    │   ├── index.ts
    │   ├── client.ts
    │   ├── types.ts
    │   └── errors.ts
    └── tests/
```

**Status:** Placeholder folders (`.gitkeep` files) - to be implemented later

---

## 📁 deploy/ - Deployment Configs

### Keep Everything In:

```
deploy/
├── kubernetes/           # Kubernetes manifests
│   ├── namespace.yaml
│   ├── gateway-deployment.yaml
│   ├── proxy-deployment.yaml
│   └── configmap.yaml
│
└── terraform/            # Terraform infrastructure
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

**Status:** Placeholder folders (`.gitkeep` files) - to be implemented later

---

## 📁 docs/ - Documentation

### Keep Everything In:

```
docs/
├── architecture-flow.md  # Canonical execution flow (CRITICAL)
├── api.md                # API documentation
├── policy-dsl.md         # Policy DSL reference
├── integration-guide.md  # Integration guide
└── compliance/           # Compliance docs
    ├── soc2.md
    ├── gdpr.md
    └── dpdp.md
```

**Status:** Placeholder folders (`.gitkeep` files) - to be implemented later

---

## 📁 scripts/ - Utility Scripts

### Keep Everything In:

```
scripts/
├── setup-env.py          # Environment setup script
└── setup-env.sh          # Environment setup script (bash)
```

---

## 🗑️ What to DELETE (if accidentally created)

### Never Keep:
- `*.pyc` - Python bytecode
- `.DS_Store` - macOS system file
- `Thumbs.db` - Windows system file
- `*.swp`, `*.swo` - Vim swap files
- `*.log` - Log files (unless needed for debugging)
- `venv/`, `env/`, `.venv/` - Virtual environments (recreate locally)
- `node_modules/` - Node dependencies (reinstall with `npm install`)
- `.pytest_cache/`, `.mypy_cache/`, `.ruff_cache/` - Cache directories
- `dist/`, `build/` - Build artifacts (regenerate)

---

## 📋 Quick Reference: What Goes Where

| Type | Location | Example |
|------|----------|---------|
| **Backend Code** | `backend/app/` | `backend/app/api/v1/gateway.py` |
| **Database Models** | `backend/app/models/` | `backend/app/models/policy.py` |
| **API Routes** | `backend/app/api/v1/` | `backend/app/api/v1/policies.py` |
| **Services** | `backend/app/services/` | `backend/app/services/gateway_service.py` |
| **Frontend Code** | `frontend/src/` | `frontend/src/pages/Dashboard.tsx` |
| **Frontend Components** | `frontend/src/components/` | `frontend/src/components/ui/Button.tsx` |
| **Migrations** | `backend/alembic/versions/` | `backend/alembic/versions/001_initial.py` |
| **Tests** | `backend/tests/`, `frontend/src/__tests__/` | `backend/tests/test_gateway.py` |
| **Config Files** | Root or respective folders | `docker-compose.dev.yml`, `backend/alembic.ini` |
| **Documentation** | Root or `docs/` | `README.md`, `docs/api.md` |

---

## ✅ Git Best Practices

### Always Commit:
- Source code (`.py`, `.ts`, `.tsx`, `.js`, `.jsx`)
- Configuration files (`.toml`, `.json`, `.ini`, `.yaml`, `.yml`)
- Documentation (`.md`)
- Migration files (`alembic/versions/*.py`)
- Templates and examples (`.example`, `.template`)

### Never Commit:
- Environment files (`.env`, `.env.local`)
- Secrets and keys
- Dependencies (`node_modules/`, `venv/`)
- Build artifacts (`dist/`, `build/`, `*.egg`, `*.whl`)
- Cache directories (`.pytest_cache/`, `.mypy_cache/`, `.vite/`)
- IDE files (`.vscode/`, `.idea/`) - unless team-specific settings
- OS files (`.DS_Store`, `Thumbs.db`)

---

## 🎯 Summary

**Keep:**
- All source code
- All configuration files (except `.env`)
- All documentation
- Migration files
- Project structure files

**Delete/Ignore:**
- `.env` files (use `.env.example` as template)
- `node_modules/`, `venv/`
- Cache directories
- Build artifacts
- OS/IDE files

The `.gitignore` file is already configured to handle most of this automatically!


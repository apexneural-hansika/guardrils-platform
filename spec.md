# Guardrails Platform: Complete Implementation Guide

> **Platform Type:** Horizontal (any vertical)  
> **Stack:** FastAPI + React/TailwindCSS  
> **Integration:** SDK + Proxy  
> **Compliance:** Design for both India (DPDP) + Global (SOC2/GDPR)

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Database Schema](#2-database-schema)
3. [API Specifications](#3-api-specifications)
4. [Policy DSL v1 Specification](#4-policy-dsl-v1-specification)
5. [Core Services Implementation](#5-core-services-implementation)
6. [Check Runner Plugins](#6-check-runner-plugins)
7. [SDK Design](#7-sdk-design)
8. [Proxy Service](#8-proxy-service)
9. [Admin Console UI](#9-admin-console-ui)
10. [Step-by-Step Build Order](#10-step-by-step-build-order)

---

## 1. Project Structure

```
guardrails-platform/
│
├── README.md
├── docker-compose.yml
├── docker-compose.dev.yml
├── Makefile
├── .env.example
│
├── backend/
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry
│   │   ├── config.py                  # Settings & env vars
│   │   ├── dependencies.py            # DI containers
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py          # Main v1 router
│   │   │   │   ├── gateway.py         # /evaluate, /intercept
│   │   │   │   ├── policies.py        # Policy CRUD
│   │   │   │   ├── checks.py          # Check runner endpoints
│   │   │   │   ├── audit.py           # Logs & traces
│   │   │   │   ├── apps.py            # App registration
│   │   │   │   └── admin.py           # Admin operations
│   │   │   └── health.py
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py            # API key auth, JWT
│   │   │   ├── exceptions.py          # Custom exceptions
│   │   │   ├── middleware.py          # Request logging, CORS
│   │   │   └── telemetry.py           # OpenTelemetry setup
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # SQLAlchemy base
│   │   │   ├── app.py                 # App, Environment
│   │   │   ├── policy.py              # Policy, PolicyVersion
│   │   │   ├── assignment.py          # PolicyAssignment
│   │   │   ├── audit.py               # Request, Decision, Violation
│   │   │   └── incident.py            # Incident, IncidentNote
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── common.py              # Shared schemas
│   │   │   ├── gateway.py             # Evaluate request/response
│   │   │   ├── policy.py              # Policy schemas
│   │   │   ├── check.py               # Check result schemas
│   │   │   └── audit.py               # Audit log schemas
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── gateway_service.py     # Request orchestration
│   │   │   ├── policy_service.py      # Policy evaluation
│   │   │   ├── check_runner.py        # Check execution engine
│   │   │   ├── audit_service.py       # Logging & traces
│   │   │   └── action_service.py      # Action enforcement
│   │   │
│   │   ├── checks/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Abstract check class
│   │   │   ├── registry.py            # Check plugin registry
│   │   │   ├── security/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── pii_detector.py
│   │   │   │   ├── secrets_scanner.py
│   │   │   │   ├── prompt_injection.py
│   │   │   │   └── url_validator.py
│   │   │   ├── quality/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── schema_validator.py
│   │   │   │   ├── citation_checker.py
│   │   │   │   └── toxicity_filter.py
│   │   │   └── cost/
│   │   │       ├── __init__.py
│   │   │       ├── token_budget.py
│   │   │       └── rate_limiter.py
│   │   │
│   │   ├── policy_engine/
│   │   │   ├── __init__.py
│   │   │   ├── parser.py              # YAML DSL parser
│   │   │   ├── evaluator.py           # Condition evaluation
│   │   │   ├── actions.py             # Action executors
│   │   │   └── compiler.py            # DSL to runtime
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── hashing.py             # Content hashing
│   │       ├── redaction.py           # Redaction strategies
│   │       └── tokens.py              # Token estimation
│   │
│   ├── proxy/
│   │   ├── __init__.py
│   │   ├── main.py                    # Proxy server entry
│   │   ├── interceptor.py             # Request/response intercept
│   │   ├── providers/
│   │   │   ├── __init__.py
│   │   │   ├── openai.py
│   │   │   ├── anthropic.py
│   │   │   └── base.py
│   │   └── config.py
│   │
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_gateway.py
│       ├── test_policies.py
│       ├── test_checks/
│       └── test_integration/
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   │
│   ├── public/
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       │
│       ├── api/
│       │   ├── client.ts              # Axios/fetch setup
│       │   ├── policies.ts
│       │   ├── audit.ts
│       │   └── apps.ts
│       │
│       ├── components/
│       │   ├── ui/                    # Reusable UI components
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Table.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Card.tsx
│       │   │   └── Dropdown.tsx
│       │   │
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Header.tsx
│       │   │   └── Layout.tsx
│       │   │
│       │   ├── policies/
│       │   │   ├── PolicyList.tsx
│       │   │   ├── PolicyEditor.tsx
│       │   │   ├── PolicyVersions.tsx
│       │   │   └── PolicySimulator.tsx
│       │   │
│       │   ├── audit/
│       │   │   ├── TraceViewer.tsx
│       │   │   ├── TraceTimeline.tsx
│       │   │   ├── LogsTable.tsx
│       │   │   └── ViolationsList.tsx
│       │   │
│       │   └── dashboard/
│       │       ├── StatsCards.tsx
│       │       ├── ViolationsChart.tsx
│       │       └── RecentActivity.tsx
│       │
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── Policies.tsx
│       │   ├── PolicyDetail.tsx
│       │   ├── Logs.tsx
│       │   ├── TraceDetail.tsx
│       │   ├── Violations.tsx
│       │   ├── Incidents.tsx
│       │   ├── Apps.tsx
│       │   └── Settings.tsx
│       │
│       ├── hooks/
│       │   ├── usePolicy.ts
│       │   ├── useAudit.ts
│       │   └── useWebSocket.ts
│       │
│       ├── store/
│       │   ├── index.ts               # Zustand store
│       │   ├── authSlice.ts
│       │   └── uiSlice.ts
│       │
│       ├── types/
│       │   ├── policy.ts
│       │   ├── audit.ts
│       │   └── common.ts
│       │
│       └── utils/
│           ├── formatters.ts
│           └── validators.ts
│
├── sdk/
│   ├── python/
│   │   ├── pyproject.toml
│   │   ├── guardrails_sdk/
│   │   │   ├── __init__.py
│   │   │   ├── client.py
│   │   │   ├── async_client.py
│   │   │   ├── models.py
│   │   │   └── exceptions.py
│   │   └── tests/
│   │
│   └── typescript/
│       ├── package.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── client.ts
│       │   ├── types.ts
│       │   └── errors.ts
│       └── tests/
│
├── deploy/
│   ├── kubernetes/
│   │   ├── namespace.yaml
│   │   ├── gateway-deployment.yaml
│   │   ├── proxy-deployment.yaml
│   │   └── configmap.yaml
│   │
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── docs/
    ├── api.md
    ├── policy-dsl.md
    ├── integration-guide.md
    └── compliance/
        ├── soc2.md
        ├── gdpr.md
        └── dpdp.md
```

---

## 2. Database Schema

### PostgreSQL Schema (Alembic Migration)

```sql
-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations (multi-tenant support)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member', -- admin, member, viewer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, email)
);

-- API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE,  -- SHA-256 hash
    key_prefix VARCHAR(12) NOT NULL,        -- First 12 chars for display
    scopes TEXT[] DEFAULT ARRAY['read', 'write'],
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APP MANAGEMENT
-- ============================================

-- Registered Applications
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    owners UUID[] DEFAULT ARRAY[]::UUID[],
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, slug)
);

-- Environments
CREATE TABLE environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,           -- dev, staging, prod
    is_production BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(app_id, name)
);

-- ============================================
-- POLICY MANAGEMENT
-- ============================================

-- Policy Status Enum
CREATE TYPE policy_status AS ENUM ('draft', 'active', 'deprecated', 'archived');

-- Policy Scope Enum
CREATE TYPE policy_scope AS ENUM (
    'llm.input', 
    'llm.output', 
    'tool.call', 
    'tool.result',
    'data.access',
    'all'
);

-- Policies
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    scope policy_scope NOT NULL,
    status policy_status DEFAULT 'draft',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, slug)
);

-- Policy Versions (immutable)
CREATE TABLE policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content_yaml TEXT NOT NULL,          -- Original YAML
    content_json JSONB NOT NULL,         -- Compiled JSON
    content_hash VARCHAR(64) NOT NULL,   -- SHA-256 for audit
    changelog TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(policy_id, version)
);

-- Create index for fast lookup
CREATE INDEX idx_policy_versions_published 
ON policy_versions(policy_id, is_published) 
WHERE is_published = TRUE;

-- Policy Assignments (which policies apply where)
CREATE TABLE policy_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    policy_version_id UUID REFERENCES policy_versions(id),
    
    -- Target (one of these will be set)
    target_type VARCHAR(20) NOT NULL,    -- org, app, env, team
    target_id UUID NOT NULL,
    
    -- Configuration
    priority INTEGER DEFAULT 100,        -- Lower = higher priority
    enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(policy_id, target_type, target_id)
);

CREATE INDEX idx_policy_assignments_target 
ON policy_assignments(target_type, target_id, enabled);

-- ============================================
-- AUDIT & TRACING
-- ============================================

-- Requests (append-only audit log)
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id VARCHAR(64) NOT NULL UNIQUE,
    
    -- Context
    org_id UUID NOT NULL,
    app_id UUID NOT NULL,
    env_id UUID,
    user_id VARCHAR(255),                -- External user ID
    session_id VARCHAR(255),
    
    -- Request details
    scope policy_scope NOT NULL,
    input_hash VARCHAR(64),              -- Hash of input content
    input_preview TEXT,                  -- First 500 chars (for search)
    token_count INTEGER,
    model VARCHAR(100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for scalability
CREATE INDEX idx_requests_created_at ON requests(created_at);
CREATE INDEX idx_requests_app_env ON requests(app_id, env_id, created_at);
CREATE INDEX idx_requests_user ON requests(org_id, user_id, created_at);

-- Decisions (what action was taken)
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    trace_id VARCHAR(64) NOT NULL,
    
    -- Policy applied
    policy_id UUID REFERENCES policies(id),
    policy_version_id UUID REFERENCES policy_versions(id),
    policy_version_hash VARCHAR(64),     -- Snapshot for audit
    
    -- Decision
    action VARCHAR(20) NOT NULL,         -- allow, block, redact, etc.
    reason TEXT,
    confidence FLOAT,
    
    -- Timing
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decisions_trace ON decisions(trace_id);

-- Violations (when checks fail)
CREATE TABLE violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    trace_id VARCHAR(64) NOT NULL,
    
    -- Check details
    check_name VARCHAR(100) NOT NULL,
    check_version VARCHAR(20),
    
    -- Violation details
    severity VARCHAR(20) NOT NULL,       -- low, medium, high, critical
    category VARCHAR(50),                -- pii, security, quality, cost
    message TEXT,
    evidence JSONB NOT NULL,             -- What was found
    
    -- Location
    location_start INTEGER,
    location_end INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_violations_severity ON violations(severity, created_at);
CREATE INDEX idx_violations_check ON violations(check_name, created_at);

-- ============================================
-- INCIDENT MANAGEMENT
-- ============================================

CREATE TYPE incident_status AS ENUM (
    'open', 
    'investigating', 
    'resolved', 
    'false_positive'
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Grouping
    title VARCHAR(255) NOT NULL,
    description TEXT,
    violation_ids UUID[] NOT NULL,
    
    -- Status
    status incident_status DEFAULT 'open',
    severity VARCHAR(20) NOT NULL,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    
    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Notes/Comments
CREATE TABLE incident_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONFIGURATION
-- ============================================

-- Global allowlists/blocklists
CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,           -- allowlist, blocklist
    category VARCHAR(50) NOT NULL,       -- domains, emails, patterns
    entries TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, name)
);

-- Rate limit configurations
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Target
    target_type VARCHAR(20) NOT NULL,    -- org, app, user
    target_id VARCHAR(255),
    
    -- Limits
    requests_per_minute INTEGER,
    requests_per_hour INTEGER,
    requests_per_day INTEGER,
    tokens_per_minute INTEGER,
    tokens_per_hour INTEGER,
    tokens_per_day INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_apps_updated_at
    BEFORE UPDATE ON apps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_policy_assignments_updated_at
    BEFORE UPDATE ON policy_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 3. API Specifications

### OpenAPI Structure

```yaml
openapi: 3.0.3
info:
  title: Guardrails Platform API
  version: 1.0.0
  description: Policy enforcement and audit platform for AI applications

servers:
  - url: https://api.guardrails.dev/v1
    description: Production
  - url: http://localhost:8000/v1
    description: Local development

security:
  - ApiKeyAuth: []

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
```

### Gateway Endpoints

```python
# backend/app/api/v1/gateway.py

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.gateway import (
    EvaluateRequest,
    EvaluateResponse,
    InterceptRequest,
    InterceptResponse
)
from app.services.gateway_service import GatewayService

router = APIRouter(prefix="/gateway", tags=["Gateway"])


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate(
    request: EvaluateRequest,
    gateway: GatewayService = Depends()
) -> EvaluateResponse:
    """
    Evaluate content against applicable policies.
    
    Returns decision without executing the actual LLM/tool call.
    Use this for pre-flight checks or custom integration.
    """
    return await gateway.evaluate(request)


@router.post("/intercept", response_model=InterceptResponse)
async def intercept(
    request: InterceptRequest,
    gateway: GatewayService = Depends()
) -> InterceptResponse:
    """
    Full interception flow:
    1. Evaluate input policies
    2. Execute the call (if allowed)
    3. Evaluate output policies
    4. Return (possibly modified) response
    
    Use this for SDK/proxy integration.
    """
    return await gateway.intercept(request)
```

### Request/Response Schemas

```python
# backend/app/schemas/gateway.py

from pydantic import BaseModel, Field
from typing import Optional, Literal, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class PolicyScope(str, Enum):
    LLM_INPUT = "llm.input"
    LLM_OUTPUT = "llm.output"
    TOOL_CALL = "tool.call"
    TOOL_RESULT = "tool.result"
    DATA_ACCESS = "data.access"


class ActionType(str, Enum):
    ALLOW = "allow"
    BLOCK = "block"
    REDACT = "redact"
    REWRITE = "rewrite"
    ROUTE = "route"
    ESCALATE = "escalate"
    LOG_ONLY = "log_only"


class ContentPayload(BaseModel):
    """Content being evaluated"""
    text: Optional[str] = None
    model: Optional[str] = None
    tool_name: Optional[str] = None
    tool_args: Optional[dict[str, Any]] = None
    tokens: Optional[int] = None
    messages: Optional[list[dict]] = None  # For chat format


class EvaluateRequest(BaseModel):
    """Request to evaluate content against policies"""
    
    # Identity (required)
    app_id: str = Field(..., description="Registered application ID")
    
    # Context (optional but recommended)
    env: Optional[str] = Field("prod", description="Environment name")
    user_id: Optional[str] = Field(None, description="End user identifier")
    session_id: Optional[str] = Field(None, description="Session/conversation ID")
    team_id: Optional[str] = Field(None, description="Team identifier")
    
    # Content (required)
    scope: PolicyScope = Field(..., description="What type of content")
    content: ContentPayload = Field(..., description="Content to evaluate")
    
    # Options
    trace_id: Optional[str] = Field(None, description="Custom trace ID")
    dry_run: bool = Field(False, description="Log only, don't enforce")
    metadata: Optional[dict[str, Any]] = None


class CheckResult(BaseModel):
    """Result from a single check"""
    check_name: str
    status: Literal["pass", "fail", "error", "skip"]
    score: Optional[float] = Field(None, ge=0, le=1)
    message: Optional[str] = None
    evidence: Optional[dict[str, Any]] = None
    latency_ms: int


class PolicyDecision(BaseModel):
    """Decision from policy evaluation"""
    policy_id: str
    policy_name: str
    policy_version: int
    action: ActionType
    reason: str
    checks: list[CheckResult]


class EvaluateResponse(BaseModel):
    """Response from policy evaluation"""
    
    # Identification
    trace_id: str
    request_id: str
    
    # Decision
    action: ActionType
    reason: str
    
    # Details
    policies_evaluated: int
    policies_triggered: int
    decisions: list[PolicyDecision]
    
    # Modified content (if action is redact/rewrite)
    modified_content: Optional[ContentPayload] = None
    
    # Timing
    total_latency_ms: int
    timestamp: datetime


class InterceptRequest(BaseModel):
    """Request for full interception (input + call + output)"""
    
    # Same as EvaluateRequest
    app_id: str
    env: Optional[str] = "prod"
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    
    # Input content
    input: ContentPayload
    
    # Call configuration
    provider: Literal["openai", "anthropic", "azure", "custom"]
    endpoint: Optional[str] = None  # For custom provider
    call_config: dict[str, Any]     # Provider-specific config
    
    # Options
    trace_id: Optional[str] = None
    timeout_ms: int = 30000
    metadata: Optional[dict[str, Any]] = None


class InterceptResponse(BaseModel):
    """Response from full interception"""
    
    trace_id: str
    
    # Input evaluation
    input_decision: EvaluateResponse
    
    # Call result (if input was allowed)
    call_executed: bool
    call_response: Optional[dict[str, Any]] = None
    call_error: Optional[str] = None
    call_latency_ms: Optional[int] = None
    
    # Output evaluation (if call succeeded)
    output_decision: Optional[EvaluateResponse] = None
    
    # Final result
    final_action: ActionType
    final_content: Optional[ContentPayload] = None
    
    total_latency_ms: int
```

### Policy Endpoints

```python
# backend/app/api/v1/policies.py

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get("")
async def list_policies(
    status: Optional[str] = Query(None),
    scope: Optional[str] = Query(None),
    tags: Optional[list[str]] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """List all policies with filtering and pagination"""
    pass


@router.post("")
async def create_policy(policy: PolicyCreate):
    """Create a new policy (as draft)"""
    pass


@router.get("/{policy_id}")
async def get_policy(policy_id: UUID):
    """Get policy details including current version"""
    pass


@router.put("/{policy_id}")
async def update_policy(policy_id: UUID, policy: PolicyUpdate):
    """Update policy metadata (not content - use versions)"""
    pass


@router.delete("/{policy_id}")
async def delete_policy(policy_id: UUID):
    """Archive a policy (soft delete)"""
    pass


# Version management
@router.get("/{policy_id}/versions")
async def list_versions(policy_id: UUID):
    """List all versions of a policy"""
    pass


@router.post("/{policy_id}/versions")
async def create_version(policy_id: UUID, version: PolicyVersionCreate):
    """Create a new version of the policy"""
    pass


@router.post("/{policy_id}/versions/{version}/publish")
async def publish_version(policy_id: UUID, version: int):
    """Publish a version (requires approval if configured)"""
    pass


@router.post("/{policy_id}/rollback")
async def rollback(policy_id: UUID, target_version: int):
    """Rollback to a previous version"""
    pass


# Simulation
@router.post("/simulate")
async def simulate(request: SimulateRequest):
    """
    Dry-run a policy against test payload.
    Does not log to audit trail.
    """
    pass


# Assignments
@router.get("/{policy_id}/assignments")
async def list_assignments(policy_id: UUID):
    """List where this policy is assigned"""
    pass


@router.post("/{policy_id}/assignments")
async def create_assignment(policy_id: UUID, assignment: AssignmentCreate):
    """Assign policy to app/env/team"""
    pass


@router.delete("/{policy_id}/assignments/{assignment_id}")
async def delete_assignment(policy_id: UUID, assignment_id: UUID):
    """Remove policy assignment"""
    pass
```

### Audit Endpoints

```python
# backend/app/api/v1/audit.py

from fastapi import APIRouter, Depends, Query
from datetime import datetime
from typing import Optional
from uuid import UUID

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/traces")
async def list_traces(
    app_id: Optional[UUID] = None,
    env: Optional[str] = None,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    """Search and list request traces"""
    pass


@router.get("/traces/{trace_id}")
async def get_trace(trace_id: str):
    """
    Get complete trace details including:
    - Request metadata
    - All check results
    - All decisions
    - Timeline visualization data
    """
    pass


@router.get("/violations")
async def list_violations(
    severity: Optional[str] = None,
    check_name: Optional[str] = None,
    app_id: Optional[UUID] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    """List violations with filtering"""
    pass


@router.post("/incidents")
async def create_incident(incident: IncidentCreate):
    """Create incident from violations"""
    pass


@router.get("/incidents")
async def list_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    assigned_to: Optional[UUID] = None
):
    """List incidents"""
    pass


@router.patch("/incidents/{incident_id}")
async def update_incident(incident_id: UUID, update: IncidentUpdate):
    """Update incident status, assignment, resolution"""
    pass


# Reporting
@router.get("/reports/summary")
async def get_summary(
    start_time: datetime,
    end_time: datetime,
    group_by: str = Query("day")  # hour, day, week
):
    """Get summary statistics for dashboard"""
    pass


@router.get("/reports/compliance")
async def get_compliance_report(
    start_time: datetime,
    end_time: datetime,
    format: str = Query("json")  # json, csv, pdf
):
    """Generate compliance report"""
    pass
```

---

## 4. Policy DSL v1 Specification

### Complete DSL Schema

```yaml
# Policy DSL v1 Specification
# All fields with their types and validation rules

# ============================================
# METADATA (required)
# ============================================
name: string                    # Unique identifier, lowercase with underscores
  pattern: "^[a-z][a-z0-9_]*$"
  max_length: 100
  required: true

version: string                 # Semantic version (managed by system)
  pattern: "^\d+\.\d+\.\d+$"
  auto_generated: true

description: string             # Human-readable description
  max_length: 500
  required: false

# ============================================
# TARGETING (required)
# ============================================
scope: enum                     # When this policy applies
  values:
    - llm.input                 # Before sending to LLM
    - llm.output                # After receiving from LLM
    - tool.call                 # Before tool execution
    - tool.result               # After tool returns
    - data.access               # Data retrieval
    - all                       # All scopes
  required: true

# ============================================
# CONDITIONS (required - at least one)
# ============================================
conditions:
  # Logical operators (use ONE at top level)
  all: list[condition]          # AND - all must match
  any: list[condition]          # OR - at least one must match
  none: list[condition]         # NOT - none must match

# Condition types:
condition:
  # Text matching
  contains: string | list[string]        # Substring match
  not_contains: string | list[string]
  starts_with: string
  ends_with: string
  
  # Regex
  regex: string                          # RE2 compatible
  not_regex: string
  
  # Numeric comparison
  token_count: comparison
  token_estimate: comparison
  length: comparison
  
  # Field comparison
  field: string                          # JSONPath to field
  equals: any
  not_equals: any
  in: list[any]
  not_in: list[any]
  gt: number
  gte: number
  lt: number
  lte: number
  
  # Check results (reference other checks)
  check: string                          # Check name
  check_result: enum[pass, fail]
  check_score_gt: number
  check_score_lt: number
  
  # Context conditions
  user_id: comparison
  app_id: comparison
  env: comparison
  model: comparison
  
  # Lists (reference configured lists)
  in_list: string                        # List name (allowlist/blocklist)
  not_in_list: string

comparison:
  equals: any
  not_equals: any
  gt: number
  gte: number
  lt: number
  lte: number
  in: list[any]
  not_in: list[any]
  matches: string                        # Regex

# ============================================
# CHECKS (optional - run specific validators)
# ============================================
checks: list[check_config]

check_config:
  name: string                           # Registered check name
  enabled: boolean                       # Default: true
  config: object                         # Check-specific config
  on_error: enum[fail, pass, skip]       # Default: fail

# ============================================
# ACTION (required)
# ============================================
action: enum
  values:
    - allow                     # Permit request
    - block                     # Reject request
    - redact                    # Remove/mask content
    - rewrite                   # Transform content
    - route                     # Send to different model/service
    - escalate                  # Human review
    - log_only                  # Record but don't enforce (dry-run)
  required: true

# ============================================
# ACTION CONFIGURATION (depends on action)
# ============================================

# For action: block
block_config:
  message: string               # Error message to return
  code: string                  # Error code (e.g., "PII_DETECTED")

# For action: redact
redact_config:
  strategy: enum
    values:
      - mask_all                # Replace with [REDACTED]
      - mask_partial            # Show first/last chars
      - mask_last4              # Show only last 4 chars
      - hash                    # Replace with hash
      - tokenize                # Replace with token
      - remove                  # Delete entirely
  placeholder: string           # Custom placeholder text
  preserve_format: boolean      # Keep same length

# For action: rewrite
rewrite_config:
  template: string              # Text template with {variables}
  llm_rewrite: boolean          # Use LLM to rewrite
  llm_prompt: string            # Prompt for LLM rewrite

# For action: route
route_config:
  target_model: string          # Model to route to
  target_endpoint: string       # Custom endpoint
  reason: string                # Why routing

# For action: escalate
escalate_config:
  queue: string                 # Review queue name
  timeout_action: enum          # What to do if no response
    values: [block, allow]
  timeout_seconds: integer

# ============================================
# METADATA & BEHAVIOR
# ============================================
severity: enum
  values: [low, medium, high, critical]
  default: medium

tags: list[string]              # For organization/filtering

enabled: boolean                # Default: true

# Execution control
stop_on_match: boolean          # Don't run subsequent policies
  default: false

priority: integer               # Lower = runs first
  default: 100

# Notifications
notify:
  on_trigger: boolean           # Send notification when triggered
  channels: list[string]        # slack, email, webhook
  
# ============================================
# COMPLIANCE MAPPING
# ============================================
compliance:
  frameworks: list[string]      # SOC2, GDPR, HIPAA, DPDP
  controls: list[string]        # Specific control IDs
  evidence_retention_days: int  # How long to keep evidence
```

### Example Policies

```yaml
# ============================================
# EXAMPLE 1: PII Protection (India + Global)
# ============================================
name: pii_protection
description: Detect and redact personal identifiable information

scope: llm.output

checks:
  - name: pii_detector
    config:
      # India-specific
      detect_aadhaar: true
      detect_pan: true
      detect_voter_id: true
      # Global
      detect_ssn: true
      detect_passport: true
      detect_credit_card: true
      detect_email: true
      detect_phone: true
      # Sensitivity
      confidence_threshold: 0.8

conditions:
  any:
    - check: pii_detector
      check_result: fail

action: redact
redact_config:
  strategy: mask_partial
  placeholder: "[PII REDACTED]"

severity: high

tags: [pii, compliance, privacy]

compliance:
  frameworks: [GDPR, DPDP, SOC2]
  controls: [GDPR-Art17, DPDP-Sec8]
  evidence_retention_days: 90

---
# ============================================
# EXAMPLE 2: Prompt Injection Defense
# ============================================
name: prompt_injection_defense
description: Detect and block prompt injection attempts

scope: llm.input

checks:
  - name: prompt_injection
    config:
      detection_mode: aggressive
      patterns:
        - "ignore previous instructions"
        - "disregard above"
        - "new instructions:"
        - "system prompt:"
      ml_detection: true
      ml_threshold: 0.7

conditions:
  any:
    - check: prompt_injection
      check_result: fail
    - check: prompt_injection
      check_score_gt: 0.7

action: block
block_config:
  message: "Request blocked: potentially harmful content detected"
  code: "INJECTION_DETECTED"

severity: critical

tags: [security, injection]

notify:
  on_trigger: true
  channels: [slack]

---
# ============================================
# EXAMPLE 3: Token Budget Control
# ============================================
name: token_budget_free_tier
description: Enforce token limits for free tier users

scope: llm.input

conditions:
  all:
    - field: "$.metadata.user_tier"
      equals: "free"
    - token_estimate:
        gt: 1000

action: route
route_config:
  target_model: "claude-3-haiku"
  reason: "Token budget exceeded for free tier"

severity: low

tags: [cost, routing]

---
# ============================================
# EXAMPLE 4: Secrets Detection
# ============================================
name: secrets_detection
description: Prevent API keys and secrets from being sent to LLMs

scope: all

checks:
  - name: secrets_scanner
    config:
      detect_aws_keys: true
      detect_gcp_keys: true
      detect_azure_keys: true
      detect_api_keys: true
      detect_private_keys: true
      detect_jwt: true
      custom_patterns:
        - name: "internal_api_key"
          pattern: "sk_live_[a-zA-Z0-9]{24}"

conditions:
  any:
    - check: secrets_scanner
      check_result: fail

action: block
block_config:
  message: "Request blocked: secrets detected in content"
  code: "SECRETS_DETECTED"

severity: critical

tags: [security, secrets]

compliance:
  frameworks: [SOC2]
  controls: [CC6.1]

notify:
  on_trigger: true
  channels: [slack, email]

---
# ============================================
# EXAMPLE 5: Output Quality (RAG Citations)
# ============================================
name: require_citations
description: Ensure RAG responses include source citations

scope: llm.output

conditions:
  all:
    - field: "$.metadata.is_rag"
      equals: true

checks:
  - name: citation_checker
    config:
      min_citations: 1
      citation_patterns:
        - "[Source: {source}]"
        - "According to {source}"
        - "Reference: {source}"
      require_valid_urls: true

conditions:
  any:
    - check: citation_checker
      check_result: fail

action: rewrite
rewrite_config:
  llm_rewrite: true
  llm_prompt: |
    The following response lacks proper citations.
    Add appropriate source citations based on the context.
    Original response: {content}
    Available sources: {sources}

severity: medium

tags: [quality, rag, citations]

---
# ============================================
# EXAMPLE 6: Domain Allowlist
# ============================================
name: url_domain_allowlist
description: Only allow URLs from approved domains

scope: llm.output

checks:
  - name: url_validator
    config:
      extract_urls: true
      allowlist_name: "approved_domains"  # References configured list
      check_reachability: false

conditions:
  any:
    - check: url_validator
      check_result: fail

action: redact
redact_config:
  strategy: remove
  
severity: medium

tags: [security, urls]
```

---

## 5. Core Services Implementation

### Gateway Service

```python
# backend/app/services/gateway_service.py

from typing import Optional
from uuid import uuid4
import time
from opentelemetry import trace

from app.schemas.gateway import (
    EvaluateRequest, EvaluateResponse,
    InterceptRequest, InterceptResponse,
    ActionType, PolicyDecision
)
from app.services.policy_service import PolicyService
from app.services.check_runner import CheckRunner
from app.services.audit_service import AuditService
from app.services.action_service import ActionService


tracer = trace.get_tracer(__name__)


class GatewayService:
    def __init__(
        self,
        policy_service: PolicyService,
        check_runner: CheckRunner,
        audit_service: AuditService,
        action_service: ActionService
    ):
        self.policy_service = policy_service
        self.check_runner = check_runner
        self.audit_service = audit_service
        self.action_service = action_service
    
    async def evaluate(self, request: EvaluateRequest) -> EvaluateResponse:
        """Evaluate content against applicable policies"""
        
        with tracer.start_as_current_span("gateway.evaluate") as span:
            start_time = time.perf_counter()
            
            # Generate trace ID if not provided
            trace_id = request.trace_id or str(uuid4())
            request_id = str(uuid4())
            
            span.set_attribute("trace_id", trace_id)
            span.set_attribute("app_id", request.app_id)
            span.set_attribute("scope", request.scope.value)
            
            # 1. Get applicable policies
            policies = await self.policy_service.get_applicable_policies(
                app_id=request.app_id,
                env=request.env,
                scope=request.scope,
                user_id=request.user_id,
                team_id=request.team_id
            )
            
            span.set_attribute("policies_count", len(policies))
            
            # 2. Evaluate each policy
            decisions: list[PolicyDecision] = []
            final_action = ActionType.ALLOW
            final_reason = "No policies triggered"
            modified_content = None
            
            for policy in policies:
                with tracer.start_as_current_span(f"evaluate.{policy.name}"):
                    decision = await self._evaluate_policy(
                        policy=policy,
                        request=request,
                        trace_id=trace_id
                    )
                    
                    if decision:
                        decisions.append(decision)
                        
                        # Determine final action (most restrictive wins)
                        if self._is_more_restrictive(decision.action, final_action):
                            final_action = decision.action
                            final_reason = decision.reason
                        
                        # Apply action if needed
                        if decision.action in [ActionType.REDACT, ActionType.REWRITE]:
                            modified_content = await self.action_service.apply_action(
                                action=decision.action,
                                content=request.content,
                                policy=policy,
                                evidence=decision.checks
                            )
                        
                        # Stop if policy says so
                        if policy.stop_on_match:
                            break
            
            # 3. Log to audit trail (unless dry run)
            if not request.dry_run:
                await self.audit_service.log_request(
                    trace_id=trace_id,
                    request_id=request_id,
                    request=request,
                    decisions=decisions,
                    final_action=final_action
                )
            
            # 4. Build response
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            
            return EvaluateResponse(
                trace_id=trace_id,
                request_id=request_id,
                action=final_action,
                reason=final_reason,
                policies_evaluated=len(policies),
                policies_triggered=len(decisions),
                decisions=decisions,
                modified_content=modified_content,
                total_latency_ms=elapsed_ms,
                timestamp=datetime.utcnow()
            )
    
    async def _evaluate_policy(
        self,
        policy: Policy,
        request: EvaluateRequest,
        trace_id: str
    ) -> Optional[PolicyDecision]:
        """Evaluate a single policy against the request"""
        
        # Run checks defined in policy
        check_results = []
        if policy.checks:
            check_results = await self.check_runner.run_checks(
                checks=policy.checks,
                content=request.content,
                context={
                    "trace_id": trace_id,
                    "app_id": request.app_id,
                    "user_id": request.user_id,
                    "metadata": request.metadata
                }
            )
        
        # Evaluate conditions
        triggered = await self.policy_service.evaluate_conditions(
            conditions=policy.conditions,
            content=request.content,
            check_results=check_results,
            context=request
        )
        
        if triggered:
            return PolicyDecision(
                policy_id=str(policy.id),
                policy_name=policy.name,
                policy_version=policy.version,
                action=policy.action,
                reason=self._build_reason(policy, check_results),
                checks=check_results
            )
        
        return None
    
    def _is_more_restrictive(self, new: ActionType, current: ActionType) -> bool:
        """Determine if new action is more restrictive"""
        priority = {
            ActionType.ALLOW: 0,
            ActionType.LOG_ONLY: 1,
            ActionType.ROUTE: 2,
            ActionType.REWRITE: 3,
            ActionType.REDACT: 4,
            ActionType.ESCALATE: 5,
            ActionType.BLOCK: 6
        }
        return priority.get(new, 0) > priority.get(current, 0)
    
    def _build_reason(self, policy: Policy, checks: list[CheckResult]) -> str:
        """Build human-readable reason for decision"""
        failed_checks = [c for c in checks if c.status == "fail"]
        if failed_checks:
            check_names = ", ".join(c.check_name for c in failed_checks)
            return f"Policy '{policy.name}' triggered by: {check_names}"
        return f"Policy '{policy.name}' conditions matched"
```

### Policy Service

```python
# backend/app/services/policy_service.py

from typing import Optional
from uuid import UUID
import hashlib
import yaml
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.policy import Policy, PolicyVersion, PolicyAssignment
from app.schemas.policy import PolicyCreate, PolicyVersionCreate
from app.policy_engine.parser import PolicyParser
from app.policy_engine.evaluator import ConditionEvaluator


class PolicyService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.parser = PolicyParser()
        self.evaluator = ConditionEvaluator()
    
    async def get_applicable_policies(
        self,
        app_id: str,
        env: Optional[str],
        scope: str,
        user_id: Optional[str] = None,
        team_id: Optional[str] = None
    ) -> list[Policy]:
        """
        Get all policies that apply to this request.
        
        Resolution order (highest to lowest priority):
        1. User-specific assignments
        2. Team-specific assignments
        3. Environment-specific assignments
        4. App-specific assignments
        5. Organization-wide assignments
        """
        
        # Build query for all potentially applicable assignments
        query = (
            select(PolicyAssignment)
            .join(Policy)
            .join(PolicyVersion)
            .where(
                and_(
                    PolicyAssignment.enabled == True,
                    Policy.status == 'active',
                    PolicyVersion.is_published == True,
                    Policy.scope.in_([scope, 'all'])
                )
            )
            .order_by(PolicyAssignment.priority.asc())
        )
        
        result = await self.db.execute(query)
        assignments = result.scalars().all()
        
        # Filter to applicable assignments
        applicable = []
        for assignment in assignments:
            if self._assignment_applies(
                assignment,
                app_id=app_id,
                env=env,
                user_id=user_id,
                team_id=team_id
            ):
                applicable.append(assignment.policy)
        
        return applicable
    
    def _assignment_applies(
        self,
        assignment: PolicyAssignment,
        app_id: str,
        env: Optional[str],
        user_id: Optional[str],
        team_id: Optional[str]
    ) -> bool:
        """Check if an assignment applies to this context"""
        
        if assignment.target_type == "org":
            return True
        elif assignment.target_type == "app":
            return str(assignment.target_id) == app_id
        elif assignment.target_type == "env":
            return str(assignment.target_id) == env
        elif assignment.target_type == "team":
            return str(assignment.target_id) == team_id
        elif assignment.target_type == "user":
            return str(assignment.target_id) == user_id
        
        return False
    
    async def create_policy(
        self,
        org_id: UUID,
        data: PolicyCreate,
        created_by: UUID
    ) -> Policy:
        """Create a new policy with initial version"""
        
        # Parse and validate YAML
        parsed = self.parser.parse(data.content_yaml)
        
        # Create policy
        policy = Policy(
            org_id=org_id,
            name=parsed['name'],
            slug=self._slugify(parsed['name']),
            description=parsed.get('description'),
            scope=parsed['scope'],
            status='draft',
            tags=parsed.get('tags', []),
            created_by=created_by
        )
        
        self.db.add(policy)
        await self.db.flush()
        
        # Create initial version
        version = await self._create_version(
            policy_id=policy.id,
            content_yaml=data.content_yaml,
            parsed=parsed,
            created_by=created_by,
            version_number=1
        )
        
        await self.db.commit()
        
        return policy
    
    async def create_version(
        self,
        policy_id: UUID,
        data: PolicyVersionCreate,
        created_by: UUID
    ) -> PolicyVersion:
        """Create a new version of an existing policy"""
        
        # Get current max version
        query = select(PolicyVersion.version).where(
            PolicyVersion.policy_id == policy_id
        ).order_by(PolicyVersion.version.desc()).limit(1)
        
        result = await self.db.execute(query)
        current_version = result.scalar() or 0
        
        # Parse new content
        parsed = self.parser.parse(data.content_yaml)
        
        version = await self._create_version(
            policy_id=policy_id,
            content_yaml=data.content_yaml,
            parsed=parsed,
            created_by=created_by,
            version_number=current_version + 1,
            changelog=data.changelog
        )
        
        await self.db.commit()
        
        return version
    
    async def _create_version(
        self,
        policy_id: UUID,
        content_yaml: str,
        parsed: dict,
        created_by: UUID,
        version_number: int,
        changelog: Optional[str] = None
    ) -> PolicyVersion:
        """Internal helper to create a policy version"""
        
        content_json = json.dumps(parsed, sort_keys=True)
        content_hash = hashlib.sha256(content_json.encode()).hexdigest()
        
        version = PolicyVersion(
            policy_id=policy_id,
            version=version_number,
            content_yaml=content_yaml,
            content_json=parsed,
            content_hash=content_hash,
            changelog=changelog,
            is_published=False,
            created_by=created_by
        )
        
        self.db.add(version)
        return version
    
    async def publish_version(
        self,
        policy_id: UUID,
        version: int,
        approved_by: UUID
    ) -> PolicyVersion:
        """Publish a version (make it active)"""
        
        # Unpublish current published version
        await self.db.execute(
            PolicyVersion.__table__.update()
            .where(
                and_(
                    PolicyVersion.policy_id == policy_id,
                    PolicyVersion.is_published == True
                )
            )
            .values(is_published=False)
        )
        
        # Publish new version
        query = select(PolicyVersion).where(
            and_(
                PolicyVersion.policy_id == policy_id,
                PolicyVersion.version == version
            )
        )
        result = await self.db.execute(query)
        policy_version = result.scalar_one()
        
        policy_version.is_published = True
        policy_version.approved_by = approved_by
        policy_version.approved_at = datetime.utcnow()
        
        # Update policy status to active
        policy = await self.db.get(Policy, policy_id)
        policy.status = 'active'
        
        await self.db.commit()
        
        return policy_version
    
    async def simulate(
        self,
        policy_yaml: str,
        test_payload: dict
    ) -> dict:
        """
        Simulate policy evaluation against test payload.
        Does not persist anything.
        """
        
        parsed = self.parser.parse(policy_yaml)
        
        # TODO: Run checks and evaluate conditions
        # Return detailed results
        
        pass
    
    async def evaluate_conditions(
        self,
        conditions: dict,
        content: ContentPayload,
        check_results: list[CheckResult],
        context: EvaluateRequest
    ) -> bool:
        """Evaluate policy conditions against content and check results"""
        return self.evaluator.evaluate(
            conditions=conditions,
            content=content,
            check_results=check_results,
            context=context
        )
    
    def _slugify(self, name: str) -> str:
        """Convert name to URL-safe slug"""
        return name.lower().replace(' ', '_').replace('-', '_')
```

### Check Runner

```python
# backend/app/services/check_runner.py

from typing import Any
import asyncio
import time
from opentelemetry import trace

from app.checks.registry import CheckRegistry
from app.checks.base import Check, CheckPayload, CheckResult
from app.schemas.gateway import ContentPayload


tracer = trace.get_tracer(__name__)


class CheckRunner:
    def __init__(self, registry: CheckRegistry):
        self.registry = registry
    
    async def run_checks(
        self,
        checks: list[dict],
        content: ContentPayload,
        context: dict
    ) -> list[CheckResult]:
        """
        Run multiple checks against content.
        
        Supports both sync and async checks.
        Async checks run in parallel.
        """
        
        results = []
        async_tasks = []
        
        for check_config in checks:
            check_name = check_config['name']
            check = self.registry.get(check_name)
            
            if not check:
                results.append(CheckResult(
                    check_name=check_name,
                    status="error",
                    message=f"Check '{check_name}' not found",
                    latency_ms=0
                ))
                continue
            
            if not check_config.get('enabled', True):
                results.append(CheckResult(
                    check_name=check_name,
                    status="skip",
                    message="Check disabled",
                    latency_ms=0
                ))
                continue
            
            # Prepare payload
            payload = CheckPayload(
                content=content,
                config=check_config.get('config', {}),
                context=context
            )
            
            if check.is_async:
                async_tasks.append(self._run_check_async(check, payload))
            else:
                result = await self._run_check(check, payload)
                results.append(result)
        
        # Run async checks in parallel
        if async_tasks:
            async_results = await asyncio.gather(*async_tasks, return_exceptions=True)
            for result in async_results:
                if isinstance(result, Exception):
                    results.append(CheckResult(
                        check_name="unknown",
                        status="error",
                        message=str(result),
                        latency_ms=0
                    ))
                else:
                    results.append(result)
        
        return results
    
    async def _run_check(self, check: Check, payload: CheckPayload) -> CheckResult:
        """Run a single check with timing and error handling"""
        
        with tracer.start_as_current_span(f"check.{check.name}") as span:
            start_time = time.perf_counter()
            
            try:
                result = await check.run(payload)
                result.latency_ms = int((time.perf_counter() - start_time) * 1000)
                
                span.set_attribute("check.status", result.status)
                span.set_attribute("check.latency_ms", result.latency_ms)
                
                return result
                
            except Exception as e:
                latency = int((time.perf_counter() - start_time) * 1000)
                span.record_exception(e)
                
                return CheckResult(
                    check_name=check.name,
                    status="error",
                    message=str(e),
                    latency_ms=latency
                )
    
    async def _run_check_async(self, check: Check, payload: CheckPayload) -> CheckResult:
        """Wrapper for async check execution"""
        return await self._run_check(check, payload)
```

---

## 6. Check Runner Plugins

### Base Check Class

```python
# backend/app/checks/base.py

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional, Literal

from app.schemas.gateway import ContentPayload


@dataclass
class CheckPayload:
    """Input to a check"""
    content: ContentPayload
    config: dict[str, Any]
    context: dict[str, Any]


@dataclass
class CheckResult:
    """Output from a check"""
    check_name: str
    status: Literal["pass", "fail", "error", "skip"]
    score: Optional[float] = None  # 0.0 to 1.0
    message: Optional[str] = None
    evidence: Optional[dict[str, Any]] = None
    latency_ms: int = 0
    
    def to_dict(self) -> dict:
        return {
            "check_name": self.check_name,
            "status": self.status,
            "score": self.score,
            "message": self.message,
            "evidence": self.evidence,
            "latency_ms": self.latency_ms
        }


class Check(ABC):
    """Base class for all checks"""
    
    name: str
    version: str
    description: str
    
    @property
    def is_async(self) -> bool:
        """Override to True for checks that benefit from async execution"""
        return False
    
    @abstractmethod
    async def run(self, payload: CheckPayload) -> CheckResult:
        """Execute the check and return results"""
        pass
    
    def validate_config(self, config: dict) -> bool:
        """Validate check-specific configuration"""
        return True
```

### Check Registry

```python
# backend/app/checks/registry.py

from typing import Optional
from app.checks.base import Check

# Import all checks
from app.checks.security.pii_detector import PIIDetector
from app.checks.security.secrets_scanner import SecretsScanner
from app.checks.security.prompt_injection import PromptInjectionDetector
from app.checks.security.url_validator import URLValidator
from app.checks.quality.schema_validator import SchemaValidator
from app.checks.quality.citation_checker import CitationChecker
from app.checks.quality.toxicity_filter import ToxicityFilter
from app.checks.cost.token_budget import TokenBudget
from app.checks.cost.rate_limiter import RateLimiter


class CheckRegistry:
    """Registry of all available checks"""
    
    def __init__(self):
        self._checks: dict[str, Check] = {}
        self._register_defaults()
    
    def _register_defaults(self):
        """Register built-in checks"""
        
        default_checks = [
            # Security
            PIIDetector(),
            SecretsScanner(),
            PromptInjectionDetector(),
            URLValidator(),
            # Quality
            SchemaValidator(),
            CitationChecker(),
            ToxicityFilter(),
            # Cost
            TokenBudget(),
            RateLimiter(),
        ]
        
        for check in default_checks:
            self.register(check)
    
    def register(self, check: Check):
        """Register a check"""
        self._checks[check.name] = check
    
    def get(self, name: str) -> Optional[Check]:
        """Get a check by name"""
        return self._checks.get(name)
    
    def list_all(self) -> list[dict]:
        """List all registered checks with metadata"""
        return [
            {
                "name": check.name,
                "version": check.version,
                "description": check.description,
                "is_async": check.is_async
            }
            for check in self._checks.values()
        ]
```

### PII Detector (India + Global)

```python
# backend/app/checks/security/pii_detector.py

import re
from typing import Any
from app.checks.base import Check, CheckPayload, CheckResult


class PIIDetector(Check):
    """
    Detect personally identifiable information.
    Supports both Indian and global PII patterns.
    """
    
    name = "pii_detector"
    version = "1.0.0"
    description = "Detect and locate PII in text content"
    
    # Indian PII patterns
    PATTERNS_INDIA = {
        "aadhaar": r"\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b",
        "pan": r"\b[A-Z]{5}\d{4}[A-Z]\b",
        "voter_id": r"\b[A-Z]{3}\d{7}\b",
        "passport_in": r"\b[A-Z]\d{7}\b",
        "driving_license_in": r"\b[A-Z]{2}\d{2}\s?\d{11}\b",
        "ifsc": r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
        "gstin": r"\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]\b",
    }
    
    # Global PII patterns
    PATTERNS_GLOBAL = {
        "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
        "passport": r"\b[A-Z]{1,2}\d{6,9}\b",
        "credit_card": r"\b(?:\d{4}[-\s]?){3}\d{4}\b",
        "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
        "phone_intl": r"\+\d{1,3}[-\s]?\d{6,14}",
        "phone_us": r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b",
        "ip_address": r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",
    }
    
    # Luhn algorithm for credit card validation
    @staticmethod
    def _luhn_check(card_number: str) -> bool:
        digits = [int(d) for d in card_number if d.isdigit()]
        if len(digits) < 13:
            return False
        
        odd_digits = digits[-1::-2]
        even_digits = digits[-2::-2]
        
        total = sum(odd_digits)
        for d in even_digits:
            d *= 2
            total += d if d < 10 else d - 9
        
        return total % 10 == 0
    
    async def run(self, payload: CheckPayload) -> CheckResult:
        config = payload.config
        text = payload.content.text or ""
        
        if not text:
            return CheckResult(
                check_name=self.name,
                status="pass",
                message="No text content to check"
            )
        
        findings = []
        
        # Check Indian patterns
        for pii_type, pattern in self.PATTERNS_INDIA.items():
            if not config.get(f"detect_{pii_type}", True):
                continue
            
            for match in re.finditer(pattern, text, re.IGNORECASE):
                findings.append({
                    "type": pii_type,
                    "value_masked": self._mask_value(match.group()),
                    "start": match.start(),
                    "end": match.end(),
                    "region": "india"
                })
        
        # Check global patterns
        for pii_type, pattern in self.PATTERNS_GLOBAL.items():
            if not config.get(f"detect_{pii_type}", True):
                continue
            
            for match in re.finditer(pattern, text, re.IGNORECASE):
                value = match.group()
                
                # Additional validation for credit cards
                if pii_type == "credit_card":
                    if not self._luhn_check(value):
                        continue
                
                findings.append({
                    "type": pii_type,
                    "value_masked": self._mask_value(value),
                    "start": match.start(),
                    "end": match.end(),
                    "region": "global"
                })
        
        # Filter by confidence threshold
        threshold = config.get("confidence_threshold", 0.8)
        # TODO: Add ML-based confidence scoring
        
        if findings:
            return CheckResult(
                check_name=self.name,
                status="fail",
                score=1.0,
                message=f"Found {len(findings)} PII instance(s)",
                evidence={
                    "findings": findings,
                    "total_count": len(findings),
                    "types_found": list(set(f["type"] for f in findings))
                }
            )
        
        return CheckResult(
            check_name=self.name,
            status="pass",
            score=0.0,
            message="No PII detected"
        )
    
    def _mask_value(self, value: str) -> str:
        """Mask value for safe logging"""
        if len(value) <= 4:
            return "*" * len(value)
        return value[:2] + "*" * (len(value) - 4) + value[-2:]
```

### Secrets Scanner

```python
# backend/app/checks/security/secrets_scanner.py

import re
from typing import Any
from app.checks.base import Check, CheckPayload, CheckResult


class SecretsScanner(Check):
    """Detect API keys, tokens, and other secrets"""
    
    name = "secrets_scanner"
    version = "1.0.0"
    description = "Detect API keys, tokens, passwords, and other secrets"
    
    # Pattern definitions with entropy requirements
    PATTERNS = {
        "aws_access_key": {
            "pattern": r"(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}",
            "entropy_min": 3.5
        },
        "aws_secret_key": {
            "pattern": r"(?i)aws_secret_access_key[\"'\\s:=]+([A-Za-z0-9/+=]{40})",
            "entropy_min": 4.0
        },
        "gcp_api_key": {
            "pattern": r"AIza[0-9A-Za-z_-]{35}",
            "entropy_min": 4.0
        },
        "azure_storage_key": {
            "pattern": r"[A-Za-z0-9+/]{86}==",
            "entropy_min": 5.0
        },
        "github_token": {
            "pattern": r"gh[pousr]_[A-Za-z0-9_]{36,}",
            "entropy_min": 4.0
        },
        "openai_api_key": {
            "pattern": r"sk-[A-Za-z0-9]{48}",
            "entropy_min": 4.5
        },
        "anthropic_api_key": {
            "pattern": r"sk-ant-[A-Za-z0-9-]{95}",
            "entropy_min": 4.5
        },
        "stripe_key": {
            "pattern": r"(?:sk|pk)_(?:test|live)_[A-Za-z0-9]{24,}",
            "entropy_min": 4.0
        },
        "jwt": {
            "pattern": r"eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+",
            "entropy_min": 3.0
        },
        "private_key": {
            "pattern": r"-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----",
            "entropy_min": 0  # Header match is sufficient
        },
        "generic_api_key": {
            "pattern": r"(?i)(?:api[_-]?key|apikey|api[_-]?secret)[\"'\\s:=]+[\"']?([A-Za-z0-9_-]{20,})[\"']?",
            "entropy_min": 3.5
        },
        "generic_secret": {
            "pattern": r"(?i)(?:secret|password|passwd|pwd)[\"'\\s:=]+[\"']?([A-Za-z0-9!@#$%^&*()_+-=]{8,})[\"']?",
            "entropy_min": 3.0
        }
    }
    
    @staticmethod
    def _calculate_entropy(s: str) -> float:
        """Calculate Shannon entropy of a string"""
        import math
        from collections import Counter
        
        if not s:
            return 0.0
        
        counts = Counter(s)
        length = len(s)
        
        entropy = 0.0
        for count in counts.values():
            p = count / length
            entropy -= p * math.log2(p)
        
        return entropy
    
    async def run(self, payload: CheckPayload) -> CheckResult:
        config = payload.config
        text = payload.content.text or ""
        
        if not text:
            return CheckResult(
                check_name=self.name,
                status="pass",
                message="No text content to check"
            )
        
        findings = []
        
        for secret_type, spec in self.PATTERNS.items():
            # Check if this type is enabled
            config_key = f"detect_{secret_type.split('_')[0]}_keys"
            if not config.get(config_key, True):
                continue
            
            pattern = spec["pattern"]
            entropy_min = spec["entropy_min"]
            
            for match in re.finditer(pattern, text):
                value = match.group(1) if match.groups() else match.group()
                
                # Check entropy threshold
                if entropy_min > 0:
                    entropy = self._calculate_entropy(value)
                    if entropy < entropy_min:
                        continue
                
                findings.append({
                    "type": secret_type,
                    "value_preview": value[:8] + "..." if len(value) > 8 else value,
                    "start": match.start(),
                    "end": match.end(),
                    "entropy": round(self._calculate_entropy(value), 2)
                })
        
        # Check custom patterns
        custom_patterns = config.get("custom_patterns", [])
        for custom in custom_patterns:
            pattern = custom.get("pattern")
            name = custom.get("name", "custom")
            
            for match in re.finditer(pattern, text):
                findings.append({
                    "type": f"custom:{name}",
                    "value_preview": match.group()[:8] + "...",
                    "start": match.start(),
                    "end": match.end()
                })
        
        if findings:
            return CheckResult(
                check_name=self.name,
                status="fail",
                score=1.0,
                message=f"Found {len(findings)} potential secret(s)",
                evidence={
                    "findings": findings,
                    "total_count": len(findings),
                    "types_found": list(set(f["type"] for f in findings))
                }
            )
        
        return CheckResult(
            check_name=self.name,
            status="pass",
            score=0.0,
            message="No secrets detected"
        )
```

### Prompt Injection Detector

```python
# backend/app/checks/security/prompt_injection.py

import re
from typing import Any
from app.checks.base import Check, CheckPayload, CheckResult


class PromptInjectionDetector(Check):
    """Detect prompt injection attempts"""
    
    name = "prompt_injection"
    version = "1.0.0"
    description = "Detect prompt injection and jailbreak attempts"
    
    # Heuristic patterns for injection detection
    INJECTION_PATTERNS = [
        # Instruction override attempts
        r"(?i)ignore (?:all |any )?(?:previous |prior |above |earlier )?instructions?",
        r"(?i)disregard (?:all |any )?(?:previous |prior |above )?(?:instructions?|rules?|guidelines?)",
        r"(?i)forget (?:everything|all|what) (?:you|i) (?:told|said|mentioned)",
        r"(?i)new (?:instructions?|rules?|guidelines?):",
        r"(?i)(?:from now on|starting now),? (?:you are|act as|pretend)",
        
        # Role manipulation
        r"(?i)you are (?:now |actually )?(?:a |an )?(?:different|new|evil|unrestricted)",
        r"(?i)pretend (?:to be|you are|you're) (?:a |an )?",
        r"(?i)act as (?:if you were|a |an )",
        r"(?i)roleplay as",
        r"(?i)jailbreak",
        r"(?i)dan mode",
        r"(?i)developer mode",
        
        # System prompt extraction
        r"(?i)(?:what is|show me|reveal|display|print|output) (?:your |the )?(?:system |initial )?prompt",
        r"(?i)(?:repeat|echo|show) (?:the |your )?(?:instructions?|rules?|guidelines?)",
        r"(?i)what (?:are|were) you (?:told|instructed|programmed)",
        
        # Delimiter manipulation
        r"```(?:system|admin|root)",
        r"\[SYSTEM\]",
        r"\[ADMIN\]",
        r"<\|(?:im_start|system|endoftext)\|>",
        
        # Output format manipulation
        r"(?i)respond (?:only |just )?(?:with|in) (?:json|xml|code)",
        r"(?i)output (?:only |just )?(?:the |a )?(?:json|xml|raw)",
        
        # Encoding tricks
        r"(?i)(?:base64|rot13|hex) (?:encode|decode|encoded|decoded)",
        r"(?i)translate (?:to|into) (?:base64|binary|hex)",
    ]
    
    # Scoring weights for different pattern categories
    PATTERN_WEIGHTS = {
        "instruction_override": 0.8,
        "role_manipulation": 0.7,
        "system_extraction": 0.9,
        "delimiter_manipulation": 0.85,
        "encoding_tricks": 0.6
    }
    
    async def run(self, payload: CheckPayload) -> CheckResult:
        config = payload.config
        text = payload.content.text or ""
        
        if not text:
            return CheckResult(
                check_name=self.name,
                status="pass",
                message="No text content to check"
            )
        
        findings = []
        max_score = 0.0
        
        # Check heuristic patterns
        for pattern in self.INJECTION_PATTERNS:
            matches = list(re.finditer(pattern, text))
            for match in matches:
                # Determine category
                category = self._categorize_pattern(pattern)
                weight = self.PATTERN_WEIGHTS.get(category, 0.5)
                
                findings.append({
                    "pattern_matched": pattern[:50] + "..." if len(pattern) > 50 else pattern,
                    "text_matched": match.group()[:100],
                    "start": match.start(),
                    "end": match.end(),
                    "category": category,
                    "weight": weight
                })
                
                max_score = max(max_score, weight)
        
        # Check custom patterns from config
        custom_patterns = config.get("patterns", [])
        for pattern in custom_patterns:
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            for match in matches:
                findings.append({
                    "pattern_matched": f"custom: {pattern[:30]}...",
                    "text_matched": match.group()[:100],
                    "start": match.start(),
                    "end": match.end(),
                    "category": "custom",
                    "weight": 0.7
                })
                max_score = max(max_score, 0.7)
        
        # ML-based detection (if enabled)
        if config.get("ml_detection", False):
            ml_score = await self._ml_detect(text)
            ml_threshold = config.get("ml_threshold", 0.7)
            
            if ml_score > ml_threshold:
                findings.append({
                    "pattern_matched": "ML model detection",
                    "text_matched": text[:100] + "...",
                    "category": "ml_detection",
                    "weight": ml_score
                })
                max_score = max(max_score, ml_score)
        
        # Determine final status
        detection_mode = config.get("detection_mode", "moderate")
        threshold = {
            "permissive": 0.8,
            "moderate": 0.6,
            "aggressive": 0.4
        }.get(detection_mode, 0.6)
        
        if max_score >= threshold:
            return CheckResult(
                check_name=self.name,
                status="fail",
                score=max_score,
                message=f"Potential prompt injection detected (score: {max_score:.2f})",
                evidence={
                    "findings": findings,
                    "max_score": max_score,
                    "threshold": threshold,
                    "detection_mode": detection_mode
                }
            )
        
        return CheckResult(
            check_name=self.name,
            status="pass",
            score=max_score,
            message="No prompt injection detected"
        )
    
    def _categorize_pattern(self, pattern: str) -> str:
        """Categorize a pattern by type"""
        pattern_lower = pattern.lower()
        
        if "ignore" in pattern_lower or "disregard" in pattern_lower or "forget" in pattern_lower:
            return "instruction_override"
        elif "pretend" in pattern_lower or "act as" in pattern_lower or "roleplay" in pattern_lower:
            return "role_manipulation"
        elif "prompt" in pattern_lower or "instructions" in pattern_lower:
            return "system_extraction"
        elif "system" in pattern_lower or "admin" in pattern_lower or "|>" in pattern_lower:
            return "delimiter_manipulation"
        elif "base64" in pattern_lower or "encode" in pattern_lower:
            return "encoding_tricks"
        
        return "other"
    
    async def _ml_detect(self, text: str) -> float:
        """
        ML-based injection detection.
        TODO: Integrate with actual ML model
        """
        # Placeholder - would call actual ML model
        return 0.0
```

---

## 7. SDK Design

### Python SDK

```python
# sdk/python/guardrails_sdk/client.py

from typing import Optional, Any, Callable, TypeVar
from dataclasses import dataclass
import httpx
import asyncio

from .models import (
    EvaluateRequest,
    EvaluateResponse,
    InterceptResult,
    ContentPayload,
    PolicyScope
)
from .exceptions import GuardrailsError, BlockedError, RateLimitError


T = TypeVar('T')


@dataclass
class GuardrailsConfig:
    """SDK configuration"""
    api_key: str
    app_id: str
    base_url: str = "https://api.guardrails.dev"
    timeout: float = 30.0
    env: str = "prod"
    default_user_id: Optional[str] = None


class GuardrailsClient:
    """
    Guardrails SDK client for Python.
    
    Usage:
        client = GuardrailsClient(
            api_key="your-api-key",
            app_id="your-app-id"
        )
        
        # Simple evaluation
        result = client.evaluate(
            text="Hello, my SSN is 123-45-6789",
            scope="llm.output"
        )
        
        # Wrap an LLM call
        response = client.wrap(
            input_text=user_prompt,
            call=lambda: openai.chat.completions.create(...)
        )
    """
    
    def __init__(
        self,
        api_key: str,
        app_id: str,
        base_url: str = "https://api.guardrails.dev",
        timeout: float = 30.0,
        env: str = "prod"
    ):
        self.config = GuardrailsConfig(
            api_key=api_key,
            app_id=app_id,
            base_url=base_url,
            timeout=timeout,
            env=env
        )
        
        self._client = httpx.Client(
            base_url=f"{base_url}/v1",
            headers={
                "X-API-Key": api_key,
                "Content-Type": "application/json"
            },
            timeout=timeout
        )
    
    def evaluate(
        self,
        text: str,
        scope: str = "llm.output",
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        metadata: Optional[dict] = None,
        dry_run: bool = False
    ) -> EvaluateResponse:
        """
        Evaluate text against policies.
        
        Args:
            text: Content to evaluate
            scope: Policy scope (llm.input, llm.output, etc.)
            user_id: Optional user identifier
            session_id: Optional session identifier
            metadata: Optional metadata dict
            dry_run: If True, log but don't enforce
            
        Returns:
            EvaluateResponse with decision and details
        """
        
        request = EvaluateRequest(
            app_id=self.config.app_id,
            env=self.config.env,
            scope=scope,
            content=ContentPayload(text=text),
            user_id=user_id,
            session_id=session_id,
            metadata=metadata,
            dry_run=dry_run
        )
        
        response = self._client.post(
            "/gateway/evaluate",
            json=request.to_dict()
        )
        
        self._handle_response(response)
        return EvaluateResponse.from_dict(response.json())
    
    def wrap(
        self,
        input_text: str,
        call: Callable[[], T],
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        metadata: Optional[dict] = None,
        on_block: Optional[Callable[[EvaluateResponse], T]] = None
    ) -> InterceptResult[T]:
        """
        Wrap an LLM call with guardrails.
        
        1. Evaluates input
        2. If allowed, executes the call
        3. Evaluates output
        4. Returns result (possibly modified)
        
        Args:
            input_text: Input to the LLM
            call: Function that makes the actual LLM call
            user_id: Optional user identifier
            session_id: Optional session identifier
            metadata: Optional metadata
            on_block: Handler for blocked requests
            
        Returns:
            InterceptResult containing response and metadata
        """
        
        # Evaluate input
        input_result = self.evaluate(
            text=input_text,
            scope="llm.input",
            user_id=user_id,
            session_id=session_id,
            metadata=metadata
        )
        
        if input_result.action == "block":
            if on_block:
                return InterceptResult(
                    response=on_block(input_result),
                    blocked=True,
                    input_decision=input_result
                )
            raise BlockedError(
                f"Request blocked: {input_result.reason}",
                decision=input_result
            )
        
        # Execute the call
        try:
            response = call()
        except Exception as e:
            return InterceptResult(
                response=None,
                error=str(e),
                input_decision=input_result
            )
        
        # Extract output text
        output_text = self._extract_text(response)
        
        # Evaluate output
        output_result = self.evaluate(
            text=output_text,
            scope="llm.output",
            user_id=user_id,
            session_id=session_id,
            metadata=metadata
        )
        
        # Apply modifications if needed
        final_response = response
        if output_result.action in ["redact", "rewrite"] and output_result.modified_content:
            final_response = self._apply_modification(response, output_result.modified_content)
        
        return InterceptResult(
            response=final_response,
            input_decision=input_result,
            output_decision=output_result,
            modified=output_result.action in ["redact", "rewrite"]
        )
    
    def _handle_response(self, response: httpx.Response):
        """Handle HTTP response and raise appropriate errors"""
        
        if response.status_code == 429:
            raise RateLimitError("Rate limit exceeded")
        
        if response.status_code >= 400:
            try:
                error_data = response.json()
                message = error_data.get("detail", "Unknown error")
            except:
                message = response.text
            
            raise GuardrailsError(
                f"API error ({response.status_code}): {message}"
            )
    
    def _extract_text(self, response: Any) -> str:
        """Extract text from various LLM response formats"""
        
        # OpenAI format
        if hasattr(response, 'choices'):
            return response.choices[0].message.content
        
        # Anthropic format
        if hasattr(response, 'content'):
            if isinstance(response.content, list):
                return response.content[0].text
            return response.content
        
        # String
        if isinstance(response, str):
            return response
        
        # Dict
        if isinstance(response, dict):
            return response.get('text', response.get('content', str(response)))
        
        return str(response)
    
    def _apply_modification(self, response: Any, modified: ContentPayload) -> Any:
        """Apply content modification to response"""
        # TODO: Implement based on response type
        return response
    
    def close(self):
        """Close the client"""
        self._client.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.close()
```

### TypeScript SDK

```typescript
// sdk/typescript/src/client.ts

import axios, { AxiosInstance } from 'axios';

export interface GuardrailsConfig {
  apiKey: string;
  appId: string;
  baseUrl?: string;
  timeout?: number;
  env?: string;
}

export interface ContentPayload {
  text?: string;
  model?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  tokens?: number;
}

export interface EvaluateRequest {
  appId: string;
  env: string;
  scope: string;
  content: ContentPayload;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
  dryRun?: boolean;
}

export interface CheckResult {
  checkName: string;
  status: 'pass' | 'fail' | 'error' | 'skip';
  score?: number;
  message?: string;
  evidence?: Record<string, unknown>;
  latencyMs: number;
}

export interface PolicyDecision {
  policyId: string;
  policyName: string;
  policyVersion: number;
  action: string;
  reason: string;
  checks: CheckResult[];
}

export interface EvaluateResponse {
  traceId: string;
  requestId: string;
  action: 'allow' | 'block' | 'redact' | 'rewrite' | 'route' | 'escalate' | 'log_only';
  reason: string;
  policiesEvaluated: number;
  policiesTriggered: number;
  decisions: PolicyDecision[];
  modifiedContent?: ContentPayload;
  totalLatencyMs: number;
  timestamp: string;
}

export interface InterceptResult<T> {
  response?: T;
  blocked: boolean;
  error?: string;
  inputDecision: EvaluateResponse;
  outputDecision?: EvaluateResponse;
  modified: boolean;
}

export class BlockedError extends Error {
  constructor(
    message: string,
    public decision: EvaluateResponse
  ) {
    super(message);
    this.name = 'BlockedError';
  }
}

export class GuardrailsClient {
  private client: AxiosInstance;
  private config: Required<GuardrailsConfig>;

  constructor(config: GuardrailsConfig) {
    this.config = {
      baseUrl: 'https://api.guardrails.dev',
      timeout: 30000,
      env: 'prod',
      ...config,
    };

    this.client = axios.create({
      baseURL: `${this.config.baseUrl}/v1`,
      timeout: this.config.timeout,
      headers: {
        'X-API-Key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async evaluate(params: {
    text: string;
    scope?: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
    dryRun?: boolean;
  }): Promise<EvaluateResponse> {
    const request: EvaluateRequest = {
      appId: this.config.appId,
      env: this.config.env,
      scope: params.scope || 'llm.output',
      content: { text: params.text },
      userId: params.userId,
      sessionId: params.sessionId,
      metadata: params.metadata,
      dryRun: params.dryRun || false,
    };

    const response = await this.client.post<EvaluateResponse>(
      '/gateway/evaluate',
      this.toSnakeCase(request)
    );

    return this.toCamelCase(response.data);
  }

  async wrap<T>(params: {
    inputText: string;
    call: () => Promise<T>;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
    onBlock?: (decision: EvaluateResponse) => T;
  }): Promise<InterceptResult<T>> {
    // Evaluate input
    const inputResult = await this.evaluate({
      text: params.inputText,
      scope: 'llm.input',
      userId: params.userId,
      sessionId: params.sessionId,
      metadata: params.metadata,
    });

    if (inputResult.action === 'block') {
      if (params.onBlock) {
        return {
          response: params.onBlock(inputResult),
          blocked: true,
          inputDecision: inputResult,
          modified: false,
        };
      }
      throw new BlockedError(
        `Request blocked: ${inputResult.reason}`,
        inputResult
      );
    }

    // Execute call
    let response: T;
    try {
      response = await params.call();
    } catch (error) {
      return {
        blocked: false,
        error: error instanceof Error ? error.message : String(error),
        inputDecision: inputResult,
        modified: false,
      };
    }

    // Extract and evaluate output
    const outputText = this.extractText(response);
    const outputResult = await this.evaluate({
      text: outputText,
      scope: 'llm.output',
      userId: params.userId,
      sessionId: params.sessionId,
      metadata: params.metadata,
    });

    return {
      response,
      blocked: false,
      inputDecision: inputResult,
      outputDecision: outputResult,
      modified: ['redact', 'rewrite'].includes(outputResult.action),
    };
  }

  private extractText(response: unknown): string {
    if (typeof response === 'string') return response;
    
    // OpenAI format
    if (this.hasProperty(response, 'choices')) {
      const choices = (response as any).choices;
      return choices[0]?.message?.content || '';
    }
    
    // Anthropic format
    if (this.hasProperty(response, 'content')) {
      const content = (response as any).content;
      if (Array.isArray(content)) {
        return content[0]?.text || '';
      }
      return content;
    }

    return JSON.stringify(response);
  }

  private hasProperty(obj: unknown, prop: string): boolean {
    return typeof obj === 'object' && obj !== null && prop in obj;
  }

  private toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
    // Convert camelCase to snake_case
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = value;
    }
    return result;
  }

  private toCamelCase(obj: Record<string, unknown>): any {
    // Convert snake_case to camelCase
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = value;
    }
    return result;
  }
}
```

---

## 8. Proxy Service

```python
# backend/proxy/main.py

from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse
import httpx
from typing import Optional
import json

from app.services.gateway_service import GatewayService
from app.schemas.gateway import EvaluateRequest, ContentPayload, PolicyScope


app = FastAPI(title="Guardrails Proxy")


# Provider base URLs
PROVIDER_URLS = {
    "openai": "https://api.openai.com",
    "anthropic": "https://api.anthropic.com",
    "azure": None,  # Configured per-tenant
}


@app.api_route("/{provider}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_request(
    provider: str,
    path: str,
    request: Request,
    gateway: GatewayService = Depends()
):
    """
    Proxy requests to LLM providers with guardrails enforcement.
    
    Usage:
        Instead of: https://api.openai.com/v1/chat/completions
        Use:        https://proxy.guardrails.dev/openai/v1/chat/completions
    """
    
    if provider not in PROVIDER_URLS:
        return Response(
            content=json.dumps({"error": f"Unknown provider: {provider}"}),
            status_code=400
        )
    
    # Extract metadata from headers
    app_id = request.headers.get("X-Guardrails-App-Id")
    user_id = request.headers.get("X-Guardrails-User-Id")
    env = request.headers.get("X-Guardrails-Env", "prod")
    
    if not app_id:
        return Response(
            content=json.dumps({"error": "X-Guardrails-App-Id header required"}),
            status_code=400
        )
    
    # Get request body
    body = await request.body()
    body_json = json.loads(body) if body else {}
    
    # Extract input text
    input_text = extract_input_text(provider, body_json)
    
    # Evaluate input
    if input_text:
        input_result = await gateway.evaluate(EvaluateRequest(
            app_id=app_id,
            env=env,
            user_id=user_id,
            scope=PolicyScope.LLM_INPUT,
            content=ContentPayload(
                text=input_text,
                model=body_json.get("model")
            )
        ))
        
        if input_result.action == "block":
            return Response(
                content=json.dumps({
                    "error": {
                        "message": input_result.reason,
                        "type": "guardrails_blocked",
                        "code": "content_policy_violation",
                        "trace_id": input_result.trace_id
                    }
                }),
                status_code=400,
                headers={"X-Guardrails-Trace-Id": input_result.trace_id}
            )
        
        # Apply input modifications if needed
        if input_result.modified_content:
            body_json = apply_input_modification(provider, body_json, input_result.modified_content)
    
    # Forward to provider
    provider_url = PROVIDER_URLS[provider]
    
    # Copy relevant headers
    forward_headers = {}
    for header in ["Authorization", "Content-Type", "Accept"]:
        if header in request.headers:
            forward_headers[header] = request.headers[header]
    
    # Check if streaming
    is_streaming = body_json.get("stream", False)
    
    async with httpx.AsyncClient() as client:
        if is_streaming:
            return await handle_streaming_response(
                client=client,
                provider=provider,
                url=f"{provider_url}/{path}",
                headers=forward_headers,
                body=json.dumps(body_json),
                gateway=gateway,
                app_id=app_id,
                env=env,
                user_id=user_id
            )
        else:
            response = await client.request(
                method=request.method,
                url=f"{provider_url}/{path}",
                headers=forward_headers,
                content=json.dumps(body_json)
            )
            
            # Parse response
            response_json = response.json()
            output_text = extract_output_text(provider, response_json)
            
            # Evaluate output
            if output_text:
                output_result = await gateway.evaluate(EvaluateRequest(
                    app_id=app_id,
                    env=env,
                    user_id=user_id,
                    scope=PolicyScope.LLM_OUTPUT,
                    content=ContentPayload(text=output_text)
                ))
                
                if output_result.action == "block":
                    return Response(
                        content=json.dumps({
                            "error": {
                                "message": "Response blocked by content policy",
                                "type": "guardrails_blocked",
                                "trace_id": output_result.trace_id
                            }
                        }),
                        status_code=400,
                        headers={"X-Guardrails-Trace-Id": output_result.trace_id}
                    )
                
                # Apply output modifications
                if output_result.modified_content:
                    response_json = apply_output_modification(
                        provider, response_json, output_result.modified_content
                    )
            
            return Response(
                content=json.dumps(response_json),
                status_code=response.status_code,
                headers=dict(response.headers)
            )


def extract_input_text(provider: str, body: dict) -> Optional[str]:
    """Extract input text from provider-specific request format"""
    
    if provider == "openai":
        messages = body.get("messages", [])
        if messages:
            return messages[-1].get("content", "")
    
    elif provider == "anthropic":
        messages = body.get("messages", [])
        if messages:
            content = messages[-1].get("content", "")
            if isinstance(content, list):
                return " ".join(c.get("text", "") for c in content if c.get("type") == "text")
            return content
    
    return body.get("prompt", body.get("input", ""))


def extract_output_text(provider: str, response: dict) -> Optional[str]:
    """Extract output text from provider-specific response format"""
    
    if provider == "openai":
        choices = response.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "")
    
    elif provider == "anthropic":
        content = response.get("content", [])
        if content:
            return " ".join(c.get("text", "") for c in content if c.get("type") == "text")
    
    return response.get("text", "")


def apply_input_modification(provider: str, body: dict, modified: ContentPayload) -> dict:
    """Apply content modification to input"""
    # TODO: Implement provider-specific modification
    return body


def apply_output_modification(provider: str, response: dict, modified: ContentPayload) -> dict:
    """Apply content modification to output"""
    # TODO: Implement provider-specific modification
    return response
```

---

## 9. Admin Console UI

### Key Components

```typescript
// frontend/src/pages/Policies.tsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { policiesApi } from '../api/policies';
import { PolicyList } from '../components/policies/PolicyList';
import { PolicyEditor } from '../components/policies/PolicyEditor';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

export function PoliciesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    scope: '',
    tags: [] as string[],
  });

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies', filters],
    queryFn: () => policiesApi.list(filters),
  });

  const createMutation = useMutation({
    mutationFn: policiesApi.create,
    onSuccess: () => {
      setIsCreating(false);
      // Invalidate and refetch
    },
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
          <p className="text-gray-500 mt-1">
            Manage enforcement rules for your AI applications
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          Create Policy
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="deprecated">Deprecated</option>
        </select>

        <select
          value={filters.scope}
          onChange={(e) => setFilters({ ...filters, scope: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Scopes</option>
          <option value="llm.input">LLM Input</option>
          <option value="llm.output">LLM Output</option>
          <option value="tool.call">Tool Call</option>
        </select>
      </div>

      {/* Policy List */}
      <PolicyList
        policies={policies?.data || []}
        isLoading={isLoading}
        onEdit={setEditingPolicy}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create Policy"
        size="xl"
      >
        <PolicyEditor
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreating(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingPolicy}
        onClose={() => setEditingPolicy(null)}
        title={`Edit: ${editingPolicy?.name}`}
        size="xl"
      >
        {editingPolicy && (
          <PolicyEditor
            policy={editingPolicy}
            onSave={(data) => {/* update mutation */}}
            onCancel={() => setEditingPolicy(null)}
          />
        )}
      </Modal>
    </div>
  );
}
```

```typescript
// frontend/src/components/policies/PolicyEditor.tsx

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Policy, PolicyCreate } from '../../types/policy';
import { Button } from '../ui/Button';
import { Tab } from '../ui/Tab';

interface PolicyEditorProps {
  policy?: Policy;
  onSave: (data: PolicyCreate) => void;
  onCancel: () => void;
}

export function PolicyEditor({ policy, onSave, onCancel }: PolicyEditorProps) {
  const [activeTab, setActiveTab] = useState<'yaml' | 'visual'>('yaml');
  const [yaml, setYaml] = useState(policy?.content_yaml || DEFAULT_POLICY_YAML);
  const [errors, setErrors] = useState<string[]>([]);

  const validateYaml = (content: string): boolean => {
    try {
      // TODO: Call validation API
      return true;
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Invalid YAML']);
      return false;
    }
  };

  const handleSave = () => {
    if (validateYaml(yaml)) {
      onSave({ content_yaml: yaml });
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <Tab
          active={activeTab === 'yaml'}
          onClick={() => setActiveTab('yaml')}
        >
          YAML Editor
        </Tab>
        <Tab
          active={activeTab === 'visual'}
          onClick={() => setActiveTab('visual')}
        >
          Visual Builder
        </Tab>
      </div>

      {/* Editor */}
      <div className="flex-1">
        {activeTab === 'yaml' ? (
          <Editor
            height="100%"
            language="yaml"
            value={yaml}
            onChange={(value) => setYaml(value || '')}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        ) : (
          <VisualPolicyBuilder
            yaml={yaml}
            onChange={setYaml}
          />
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((error, i) => (
            <p key={i} className="text-red-600 text-sm">{error}</p>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => {/* simulate */}}>
          Simulate
        </Button>
        <Button onClick={handleSave}>
          Save Policy
        </Button>
      </div>
    </div>
  );
}

const DEFAULT_POLICY_YAML = `# New Policy
name: my_policy
description: Describe what this policy does

scope: llm.output

checks:
  - name: pii_detector
    config:
      detect_email: true
      detect_phone: true

conditions:
  any:
    - check: pii_detector
      check_result: fail

action: redact
redact_config:
  strategy: mask_partial

severity: medium

tags:
  - pii
  - compliance
`;
```

```typescript
// frontend/src/components/audit/TraceViewer.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/audit';
import { TraceTimeline } from './TraceTimeline';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface TraceViewerProps {
  traceId: string;
}

export function TraceViewer({ traceId }: TraceViewerProps) {
  const { data: trace, isLoading } = useQuery({
    queryKey: ['trace', traceId],
    queryFn: () => auditApi.getTrace(traceId),
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!trace) {
    return <div>Trace not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Trace: {traceId}</h2>
          <p className="text-gray-500 text-sm">
            {new Date(trace.timestamp).toLocaleString()}
          </p>
        </div>
        <ActionBadge action={trace.finalAction} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-500">App</div>
          <div className="font-medium">{trace.appName}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Environment</div>
          <div className="font-medium">{trace.env}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Policies Evaluated</div>
          <div className="font-medium">{trace.policiesEvaluated}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Total Latency</div>
          <div className="font-medium">{trace.totalLatencyMs}ms</div>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Request Timeline</h3>
        <TraceTimeline events={trace.events} />
      </Card>

      {/* Decisions */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Policy Decisions</h3>
        <div className="space-y-4">
          {trace.decisions.map((decision, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{decision.policyName}</span>
                <ActionBadge action={decision.action} />
              </div>
              <p className="text-gray-600 text-sm">{decision.reason}</p>
              
              {/* Check Results */}
              <div className="mt-3 space-y-2">
                {decision.checks.map((check, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm">
                    <StatusIcon status={check.status} />
                    <span>{check.checkName}</span>
                    <span className="text-gray-400">({check.latencyMs}ms)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Raw Request/Response */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Request Details</h3>
        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
          {JSON.stringify(trace.request, null, 2)}
        </pre>
      </Card>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    allow: 'bg-green-100 text-green-800',
    block: 'bg-red-100 text-red-800',
    redact: 'bg-yellow-100 text-yellow-800',
    rewrite: 'bg-blue-100 text-blue-800',
  };

  return (
    <Badge className={colors[action] || 'bg-gray-100 text-gray-800'}>
      {action.toUpperCase()}
    </Badge>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass') {
    return <span className="text-green-500">✓</span>;
  }
  if (status === 'fail') {
    return <span className="text-red-500">✗</span>;
  }
  return <span className="text-gray-400">○</span>;
}
```

### UI Screen Specifications

| Screen | Key Features |
|--------|--------------|
| **Dashboard** | Stats cards (requests, violations, actions), violation trend chart, recent activity feed, quick actions |
| **Policies** | Filterable list, status badges, version indicator, create/edit modal with YAML editor + visual builder |
| **Policy Detail** | Version history with diffs, assignments list, simulation tool, approval workflow |
| **Logs** | Searchable table with trace_id/app/user filters, time range picker, quick action filters |
| **Trace Detail** | Visual timeline, policy decisions, check results, raw request/response, copy trace ID |
| **Violations** | Severity-sorted list, evidence preview, create incident action, bulk actions |
| **Incidents** | Kanban-style board (open/investigating/resolved), assignment dropdown, notes thread |
| **Settings** | API keys management, SDK config snippets, allowlist/blocklist editor, webhook config |

---

## 10. Step-by-Step Build Order

### Phase 1: Foundation (Week 1-2)

```
□ Day 1-2: Project Setup
  ├── Initialize monorepo structure
  ├── Set up FastAPI backend with basic config
  ├── Set up React + Vite + TailwindCSS frontend
  ├── Docker Compose for local dev (Postgres, Redis)
  └── Basic CI/CD pipeline

□ Day 3-4: Database & Models
  ├── Create Alembic migrations
  ├── Implement SQLAlchemy models
  ├── Set up database connection pooling
  └── Add seed data for development

□ Day 5-7: Core Infrastructure
  ├── API authentication (API keys)
  ├── Request/response schemas
  ├── Error handling middleware
  ├── OpenTelemetry instrumentation
  └── Basic health endpoints
```

### Phase 2: Gateway & Audit (Week 3-4)

```
□ Day 8-10: Gateway Service
  ├── Implement /evaluate endpoint
  ├── Request normalization
  ├── Basic policy lookup (stub)
  └── Response formatting

□ Day 11-14: Audit Service
  ├── Request logging to Postgres
  ├── Decision logging
  ├── Trace ID generation
  ├── Basic query endpoints
  └── OpenTelemetry trace export
```

### Phase 3: Policy Engine (Week 5-6)

```
□ Day 15-17: Policy Service
  ├── Policy CRUD operations
  ├── Version management
  ├── Content hashing
  └── Assignment logic

□ Day 18-21: Policy Evaluation
  ├── YAML DSL parser
  ├── Condition evaluator
  ├── Policy targeting resolver
  └── Simulation endpoint
```

### Phase 4: Check Runner (Week 7-8)

```
□ Day 22-24: Check Framework
  ├── Base check class
  ├── Check registry
  ├── Parallel execution
  └── Error handling

□ Day 25-28: Core Checks
  ├── PII Detector (India + Global)
  ├── Secrets Scanner
  ├── Schema Validator
  ├── Token Budget
  └── Prompt Injection (basic)
```

### Phase 5: Action Enforcement (Week 9)

```
□ Day 29-31: Action Service
  ├── Redaction strategies
  ├── Block response formatting
  ├── Route decision logic
  └── Escalation queue (stub)
```

### Phase 6: Admin Console (Week 10-12)

```
□ Day 32-35: Core UI
  ├── Layout & navigation
  ├── Authentication flow
  ├── Dashboard with stats
  └── Basic styling

□ Day 36-40: Policy Management UI
  ├── Policy list with filters
  ├── YAML editor (Monaco)
  ├── Version history
  └── Simulation tool

□ Day 41-45: Audit UI
  ├── Logs table with search
  ├── Trace viewer
  ├── Timeline visualization
  └── Violation list
```

### Phase 7: SDKs & Proxy (Week 13-14)

```
□ Day 46-49: Python SDK
  ├── Client implementation
  ├── Async client
  ├── Error handling
  └── Documentation

□ Day 50-52: TypeScript SDK
  ├── Client implementation
  ├── Type definitions
  └── Documentation

□ Day 53-56: Proxy Service
  ├── OpenAI proxy
  ├── Anthropic proxy
  ├── Streaming support
  └── Header-based config
```

### Phase 8: Polish & Launch (Week 15-16)

```
□ Day 57-60: Testing
  ├── Unit tests (>80% coverage)
  ├── Integration tests
  ├── Load testing
  └── Security audit

□ Day 61-64: Documentation
  ├── API documentation
  ├── Integration guides
  ├── Policy authoring guide
  └── Compliance documentation

□ Day 65-70: Deployment
  ├── Kubernetes manifests
  ├── Production database setup
  ├── Monitoring & alerting
  └── Launch checklist
```

---

## Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/your-org/guardrails-platform
cd guardrails-platform

# Start local environment
docker-compose -f docker-compose.dev.yml up -d

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Run tests
cd backend && pytest
cd frontend && npm test
```

---

This implementation guide gives you everything needed to build a production-grade Guardrails Platform. Start with Phase 1 and proceed systematically—each phase builds on the previous one.



USE POSTGRES DATABASE
FASTAPI - ASYNCHRONOUS
REACT-TypeScript-TAILWINDCSS
# Architecture Flow - Guardrails Platform

This document describes the canonical execution flow for the Guardrails Platform. This flow must be preserved to maintain system invariants and ensure consistent behavior.

## Overview

The Guardrails Platform enforces policies on AI interactions through a well-defined pipeline. All requests flow through a single gateway service, which orchestrates checks, policy evaluation, and actions.

## Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SDK / Proxy Request                        │
│  (from application code or proxy service)                     │
└──────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Gateway Service (gateway_service.py)           │
│  • Normalizes payloads                                       │
│  • Routes to appropriate handlers                           │
│  • Coordinates execution flow                                │
└──────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Check Executor (checks/executor.py)               │
│  • Determines which checks to run                            │
│  • Executes checks in parallel (with concurrency control)   │
│  • Enforces timeouts                                         │
│  • Aggregates results                                        │
└──────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Policy Engine (policy_engine/)                   │
│  • Parser: YAML → AST                                        │
│  • Evaluator: AST + check results → decision                 │
│  • Actions: Execute action (block/redact/rewrite)           │
└──────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Audit Service (future)                          │
│  • Logs all interactions                                     │
│  • Records decisions                                          │
│  • Stores violations                                          │
└──────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Response                                  │
│  (modified content or error)                                 │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Flow: Evaluate Request

### 1. Request Reception

**Entry Point:** `POST /v1/gateway/evaluate`

**Handler:** `gateway_service.evaluate()`

**Responsibilities:**
- Validate request schema
- Generate trace ID
- Normalize payload

### 2. Check Execution

**Component:** `CheckExecutor.run_checks()`

**Process:**
1. Determine applicable checks based on scope
2. Create `CheckPayload` from request
3. Execute checks concurrently (with semaphore)
4. Enforce per-check timeouts
5. Aggregate `CheckResult` objects

**Key Invariants:**
- Checks are stateless plugins
- Checks must complete within timeout
- Check failures don't stop execution (return error status)

### 3. Policy Evaluation

**Component:** `PolicyEvaluator.evaluate()`

**Process:**
1. Load applicable policies (from database)
2. Parse policy YAML/JSON into AST
3. Evaluate conditions against check results
4. Determine action (most restrictive wins)
5. Calculate confidence score

**Key Invariants:**
- Policies are pure logic (no infrastructure dependencies)
- Policy evaluation is deterministic
- Actions have priority order (block > redact > allow)

### 4. Action Execution

**Component:** `ActionExecutor.execute()`

**Process:**
1. Execute action on content:
   - `ALLOW`: Return original content
   - `BLOCK`: Return empty content
   - `REDACT`: Remove sensitive information
   - `REWRITE`: Transform content
   - `LOG_ONLY`: Return original (log elsewhere)
2. Return modified `ContentPayload`

**Key Invariants:**
- Actions are pure transformations
- Original content is never mutated
- Actions are idempotent

### 5. Audit Logging

**Component:** `AuditService` (future)

**Process:**
1. Create `Request` record
2. Create `Decision` records for each policy
3. Create `Violation` records for failed checks
4. Store in database

**Key Invariants:**
- All interactions are logged
- Audit trail is immutable
- Trace ID links all records

### 6. Response

**Format:** `EvaluateResponse`

**Contains:**
- Trace ID
- Action taken
- Reason
- Policies evaluated/triggered
- Modified content (if applicable)
- Timing information

## Detailed Flow: Intercept Request

### 1. Request Reception

**Entry Point:** `POST /v1/gateway/intercept`

**Handler:** `gateway_service.intercept()`

### 2. Input Evaluation

Same as Evaluate flow (steps 2-6), but for input content.

**If BLOCK:**
- Return early with `call_executed=False`
- Skip LLM call
- Return input decision only

### 3. LLM Call Execution

**If ALLOW:**
- Execute actual LLM provider call
- Handle provider-specific errors
- Measure latency

### 4. Output Evaluation

Same as Evaluate flow (steps 2-6), but for output content.

### 5. Final Decision

- Combine input and output decisions
- Most restrictive action wins
- Return `InterceptResponse` with:
  - Input decision
  - Output decision
  - LLM response (possibly modified)
  - Final action

## Component Responsibilities

### Gateway Service

**Single Entry Point** for all SDK/Proxy requests.

**Must:**
- Normalize all payloads
- Route to appropriate handlers
- Emit audit events
- Handle errors gracefully

**Must NOT:**
- Contain business logic
- Execute checks directly
- Evaluate policies directly

### Check Executor

**Orchestrates check execution.**

**Must:**
- Control execution order
- Enforce timeouts
- Handle failures gracefully
- Aggregate results

**Must NOT:**
- Know about policies
- Know about actions
- Know about audit logging

### Policy Engine

**Pure logic for policy evaluation.**

**Must:**
- Parse YAML/JSON into AST
- Evaluate conditions
- Determine actions
- Execute transformations

**Must NOT:**
- Know about infrastructure
- Know about database
- Know about external services

### Check Plugins

**Stateless evaluation functions.**

**Must:**
- Be pure functions (no side effects)
- Return CheckResult
- Complete within timeout
- Handle errors gracefully

**Must NOT:**
- Know about policies
- Know about other checks
- Know about actions

## Key Invariants

1. **Single Gateway Path**: All requests flow through `GatewayService`
2. **Check Isolation**: Checks are stateless plugins
3. **Policy Purity**: Policies are pure logic (no infrastructure)
4. **Action Idempotency**: Actions are idempotent transformations
5. **Audit Completeness**: All interactions are logged
6. **Trace Consistency**: Trace ID links all related records

## Future Enhancements

- **Caching**: Cache policy ASTs and check results
- **Streaming**: Support streaming responses
- **Batching**: Batch multiple evaluations
- **Async Actions**: Support async action execution
- **Custom Actions**: Allow custom action plugins

## Breaking This Flow

**DO NOT:**
- Bypass Gateway Service
- Execute checks directly from API routes
- Embed policy logic in checks
- Skip audit logging
- Mutate original content

**If you need to change the flow:**
1. Update this document
2. Update all affected components
3. Update tests
4. Update documentation

---

**This flow is the contract between components. Breaking it breaks the system.**


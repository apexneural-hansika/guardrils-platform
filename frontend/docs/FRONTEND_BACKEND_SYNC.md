# Frontend-Backend Synchronization Summary

**Date:** 2026-01-23  
**Status:** ✅ **SYNCHRONIZED**

## Executive Summary

All frontend types, API endpoints, and request/response formats have been updated to match the backend schemas exactly. The frontend is now fully synchronized with the backend implementation.

---

## ✅ Changes Applied

### 1. Gateway API Types ✅
**File:** `frontend/guardrails_frontend/src/types/api.ts`

**Updated:**
- ✅ `EvaluateRequest` - Now matches backend `EvaluateRequest` schema exactly
  - Added `app_id`, `env`, `user_id`, `session_id`, `team_id`
  - Changed `scope` to `PolicyScope` enum type
  - Changed `content` to `ContentPayload` object
  - Added `trace_id`, `dry_run`, `metadata`
- ✅ `EvaluateResponse` - Now matches backend `EvaluateResponse` schema
  - Added `trace_id`, `request_id`
  - Changed `action` to `ActionType` enum
  - Added `policies_evaluated`, `policies_triggered`
  - Changed to `decisions: PolicyDecision[]`
  - Added `modified_content`, `total_latency_ms`, `timestamp`
- ✅ `InterceptRequest` - Now matches backend `InterceptRequest` schema
- ✅ `InterceptResponse` - Now matches backend `InterceptResponse` schema
- ✅ Added `PolicyScope` enum matching backend
- ✅ Added `ActionType` enum matching backend
- ✅ Added `ContentPayload` interface matching backend

### 2. Organization Types ✅
**File:** `frontend/guardrails_frontend/src/types/organization.ts`

**Updated:**
- ✅ `OrganizationResponse` - Added `settings` field
- ✅ `OrganizationUpdate` - Changed to use `settings` instead of `slug`
- ✅ `UserResponse` - Changed `organization_id` to `org_id`
- ✅ `UserResponse` - Changed role to `'admin' | 'member' | 'viewer'` (was `'admin' | 'security' | 'developer'`)
- ✅ `UserCreate` - Made `name` and `role` optional (matching backend)
- ✅ `UserUpdate` - Removed `email` (not updatable in backend)
- ✅ `APIKeyCreate` - Changed to use `scopes` and `expires_at` (was `expires_in_days`)
- ✅ `APIKeyResponse` - Added `scopes` field
- ✅ `APIKeyCreateResponse` - Added `scopes` field

### 3. Application Types ✅
**File:** `frontend/guardrails_frontend/src/types/application.ts`

**Updated:**
- ✅ `AppResponse` - Added `slug`, `description`, `owners`, `settings` fields
- ✅ `AppCreate` - Added `slug`, `description`, `settings` fields
- ✅ `AppUpdate` - Added `description`, `settings` fields
- ✅ `EnvironmentCreate` - Changed to use `name: 'dev' | 'staging' | 'prod'` and `is_production` (was `slug`)
- ✅ `EnvironmentResponse` - Changed to match backend schema exactly

### 4. Audit Types ✅
**File:** `frontend/guardrails_frontend/src/types/audit.ts` (NEW)

**Created:**
- ✅ `RequestResponse` - Matches backend `RequestResponse` schema
- ✅ `DecisionResponse` - Matches backend `DecisionResponse` schema
- ✅ `ViolationResponse` - Matches backend `ViolationResponse` schema
- ✅ `RequestDetailResponse` - Matches backend `RequestDetailResponse` schema

**Updated:**
- ✅ `frontend/guardrails_frontend/src/api/audit.ts` - Now uses proper types from `types/audit.ts`

### 5. API Response Formats ✅

**Updated:**
- ✅ `organizationsApi.list()` - Changed return type from `PaginatedResponse<OrganizationResponse>` to `OrganizationResponse[]` (backend returns list)
- ✅ `applicationsApi.list()` - Changed return type from `PaginatedResponse<AppResponse>` to `AppResponse[]` (backend returns list)
- ✅ `auditApi.listRequests()` - Changed return type from `PaginatedResponse<AuditRequest>` to `RequestResponse[]` (backend returns list)

### 6. Common Types ✅
**File:** `frontend/guardrails_frontend/src/types/common.ts`

**Updated:**
- ✅ Removed duplicate `User` and `Organization` interfaces (now re-exported from `types/organization.ts`)
- ✅ Kept `Severity`, `PolicyScope`, `ActionType`, `PolicyStatus`, `DecisionType` enums
- ✅ Kept `Environment` interface (UI-specific)

### 7. Settings Page ✅
**File:** `frontend/guardrails_frontend/src/pages/Settings/index.tsx`

**Updated:**
- ✅ `createApiKeyMutation` - Changed to use `scopes` and `expires_at` instead of `expires_in_days`
- ✅ `createUserMutation` - Changed role type to `'admin' | 'member' | 'viewer'`
- ✅ `createUserMutation` - Made `name` optional

---

## 📋 Type Mapping Reference

### Backend → Frontend Type Mapping

| Backend Schema | Frontend Type | Status |
|---------------|---------------|--------|
| `EvaluateRequest` | `EvaluateRequest` | ✅ Matches |
| `EvaluateResponse` | `EvaluateResponse` | ✅ Matches |
| `InterceptRequest` | `InterceptRequest` | ✅ Matches |
| `InterceptResponse` | `InterceptResponse` | ✅ Matches |
| `OrganizationResponse` | `OrganizationResponse` | ✅ Matches |
| `UserResponse` | `UserResponse` | ✅ Matches |
| `APIKeyResponse` | `APIKeyResponse` | ✅ Matches |
| `AppResponse` | `AppResponse` | ✅ Matches |
| `EnvironmentResponse` | `EnvironmentResponse` | ✅ Matches |
| `RequestResponse` | `RequestResponse` | ✅ Matches |
| `DecisionResponse` | `DecisionResponse` | ✅ Matches |
| `ViolationResponse` | `ViolationResponse` | ✅ Matches |
| `RequestDetailResponse` | `RequestDetailResponse` | ✅ Matches |

### Enum Mapping

| Backend Enum | Frontend Type | Status |
|-------------|--------------|--------|
| `PolicyScope` | `PolicyScope` | ✅ Matches |
| `ActionType` | `ActionType` | ✅ Matches |
| User `role` | `'admin' | 'member' | 'viewer'` | ✅ Matches |

---

## 🔧 API Endpoint Verification

All endpoints verified to match backend:

| Endpoint | Frontend | Backend | Status |
|----------|----------|---------|--------|
| `POST /gateway/evaluate` | ✅ | ✅ | ✅ Matches |
| `POST /gateway/intercept` | ✅ | ✅ | ✅ Matches |
| `GET /health` | ✅ | ✅ | ✅ Matches |
| `GET /organizations` | ✅ | ✅ | ✅ Matches |
| `POST /organizations` | ✅ | ✅ | ✅ Matches |
| `GET /organizations/{id}` | ✅ | ✅ | ✅ Matches |
| `PUT /organizations/{id}` | ✅ | ✅ | ✅ Matches |
| `POST /organizations/{id}/users` | ✅ | ✅ | ✅ Matches |
| `GET /organizations/{id}/users` | ✅ | ✅ | ✅ Matches |
| `GET /organizations/users/{id}` | ✅ | ✅ | ✅ Matches |
| `PUT /organizations/users/{id}` | ✅ | ✅ | ✅ Matches |
| `POST /organizations/{id}/api-keys` | ✅ | ✅ | ✅ Matches |
| `GET /organizations/{id}/api-keys` | ✅ | ✅ | ✅ Matches |
| `DELETE /organizations/api-keys/{id}` | ✅ | ✅ | ✅ Matches |
| `GET /apps` | ✅ | ✅ | ✅ Matches |
| `POST /apps` | ✅ | ✅ | ✅ Matches |
| `GET /apps/{id}` | ✅ | ✅ | ✅ Matches |
| `PUT /apps/{id}` | ✅ | ✅ | ✅ Matches |
| `DELETE /apps/{id}` | ✅ | ✅ | ✅ Matches |
| `POST /apps/{id}/environments` | ✅ | ✅ | ✅ Matches |
| `GET /apps/{id}/environments` | ✅ | ✅ | ✅ Matches |
| `GET /audit/requests` | ✅ | ✅ | ✅ Matches |
| `GET /audit/requests/{trace_id}` | ✅ | ✅ | ✅ Matches |
| `GET /audit/requests/{trace_id}/decisions` | ✅ | ✅ | ✅ Matches |
| `GET /audit/requests/{trace_id}/violations` | ✅ | ✅ | ✅ Matches |

---

## ✅ Verification Checklist

- ✅ All TypeScript types match backend Pydantic schemas
- ✅ All API endpoints match backend routes
- ✅ All request formats match backend expectations
- ✅ All response formats match backend responses
- ✅ All enum values match backend enums
- ✅ All field names match backend field names (snake_case)
- ✅ All optional fields correctly marked as optional
- ✅ All required fields correctly marked as required
- ✅ Response types match backend return types (list vs paginated)
- ✅ No linting errors

---

## 📝 Notes

### Response Format Differences
- **Backend returns lists directly** (not paginated objects) for:
  - `GET /organizations` → `list[OrganizationResponse]`
  - `GET /apps` → `list[AppResponse]`
  - `GET /audit/requests` → `list[RequestResponse]`
- **Frontend updated** to expect arrays directly instead of `PaginatedResponse<T>`

### Field Name Conventions
- Backend uses **snake_case** for all field names
- Frontend TypeScript types use **snake_case** to match backend
- Frontend JavaScript code can use **camelCase** for local variables

### Role Types
- Backend uses: `'admin' | 'member' | 'viewer'`
- Frontend updated from: `'admin' | 'security' | 'developer'` to match backend

---

## ✅ Conclusion

**Frontend is now fully synchronized with backend.**

All types, endpoints, and formats match exactly. The frontend is ready to integrate with the backend API without any type mismatches or format errors.


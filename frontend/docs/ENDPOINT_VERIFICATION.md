# Frontend-Backend Endpoint Verification

**Date:** 2026-01-23  
**Status:** ✅ **VERIFIED** (Some endpoints not yet implemented in backend)

## Executive Summary

All frontend API calls are correctly configured to hit the backend. The API client uses the correct base URL (`VITE_API_BASE_URL`), and all endpoint paths match the backend routes. Some frontend endpoints reference backend routes that are not yet implemented (policies, violations, compliance).

---

## ✅ Verified Endpoints

### 1. API Client Configuration ✅
- **File:** `frontend/guardrails_frontend/src/api/client.ts`
- **Base URL:** Uses `API_BASE_URL` from constants (defaults to `http://localhost:8000/v1`)
- **Status:** ✅ Correctly configured
- **Environment Variable:** `VITE_API_BASE_URL` (properly documented in `.env.example`)

### 2. Gateway Endpoints ✅
**Frontend:** `frontend/guardrails_frontend/src/api/gateway.ts`
- `POST /gateway/evaluate` → ✅ Backend: `POST /v1/gateway/evaluate`
- `POST /gateway/intercept` → ✅ Backend: `POST /v1/gateway/intercept`

### 3. Health Endpoints ✅
**Frontend:** `frontend/guardrails_frontend/src/api/health.ts`
- `GET /health` → ✅ Backend: `GET /v1/health`
- `GET /health/db` → ✅ Backend: `GET /v1/health/db`
- `GET /health/redis` → ✅ Backend: `GET /v1/health/redis`

### 4. Organizations Endpoints ✅
**Frontend:** `frontend/guardrails_frontend/src/api/organizations.ts`
- `POST /organizations` → ✅ Backend: `POST /v1/organizations`
- `GET /organizations` → ✅ Backend: `GET /v1/organizations`
- `GET /organizations/{org_id}` → ✅ Backend: `GET /v1/organizations/{org_id}`
- `PUT /organizations/{org_id}` → ✅ Backend: `PUT /v1/organizations/{org_id}`
- `POST /organizations/{org_id}/users` → ✅ Backend: `POST /v1/organizations/{org_id}/users`
- `GET /organizations/{org_id}/users` → ✅ Backend: `GET /v1/organizations/{org_id}/users`
- `GET /organizations/users/{user_id}` → ✅ Backend: `GET /v1/organizations/users/{user_id}`
- `PUT /organizations/users/{user_id}` → ✅ Backend: `PUT /v1/organizations/users/{user_id}`
- `POST /organizations/{org_id}/api-keys` → ✅ Backend: `POST /v1/organizations/{org_id}/api-keys`
- `GET /organizations/{org_id}/api-keys` → ✅ Backend: `GET /v1/organizations/{org_id}/api-keys`
- `DELETE /organizations/api-keys/{key_id}` → ✅ Backend: `DELETE /v1/organizations/api-keys/{key_id}`

### 5. Applications Endpoints ✅
**Frontend:** `frontend/guardrails_frontend/src/api/applications.ts`
- `POST /apps` → ✅ Backend: `POST /v1/apps`
- `GET /apps` → ✅ Backend: `GET /v1/apps`
- `GET /apps/{app_id}` → ✅ Backend: `GET /v1/apps/{app_id}`
- `PUT /apps/{app_id}` → ✅ Backend: `PUT /v1/apps/{app_id}`
- `DELETE /apps/{app_id}` → ✅ Backend: `DELETE /v1/apps/{app_id}`
- `POST /apps/{app_id}/environments` → ✅ Backend: `POST /v1/apps/{app_id}/environments`
- `GET /apps/{app_id}/environments` → ✅ Backend: `GET /v1/apps/{app_id}/environments`

### 6. Audit Endpoints ✅
**Frontend:** `frontend/guardrails_frontend/src/api/audit.ts` (NEW)
- `GET /audit/requests` → ✅ Backend: `GET /v1/audit/requests`
- `GET /audit/requests/{trace_id}` → ✅ Backend: `GET /v1/audit/requests/{trace_id}`
- `GET /audit/requests/{trace_id}/decisions` → ✅ Backend: `GET /v1/audit/requests/{trace_id}/decisions`
- `GET /audit/requests/{trace_id}/violations` → ✅ Backend: `GET /v1/audit/requests/{trace_id}/violations`

---

## ⚠️ Endpoints Not Yet Implemented in Backend

### 1. Policies Endpoints ⚠️
**Frontend:** `frontend/guardrails_frontend/src/api/policies.ts`
- `GET /policies` → ⚠️ Backend: Not implemented
- `GET /policies/{id}` → ⚠️ Backend: Not implemented
- `POST /policies` → ⚠️ Backend: Not implemented
- `PUT /policies/{id}` → ⚠️ Backend: Not implemented
- `DELETE /policies/{id}` → ⚠️ Backend: Not implemented
- `GET /policies/{id}/stats` → ⚠️ Backend: Not implemented
- `POST /policies/{id}/activate` → ⚠️ Backend: Not implemented
- `POST /policies/{id}/deactivate` → ⚠️ Backend: Not implemented

**Status:** Frontend is ready, backend needs implementation.

### 2. Violations Endpoints ⚠️
**Frontend:** `frontend/guardrails_frontend/src/api/violations.ts`
- `GET /violations` → ⚠️ Backend: Not implemented
- `GET /violations/{id}` → ⚠️ Backend: Not implemented
- `GET /violations/stats` → ⚠️ Backend: Not implemented
- `POST /violations/{id}/export` → ⚠️ Backend: Not implemented
- `POST /violations/export` → ⚠️ Backend: Not implemented

**Status:** Frontend is ready, backend needs implementation.

**Note:** Violations data may be available via `/v1/audit/requests/{trace_id}/violations` endpoint.

### 3. Compliance Endpoints ⚠️
**Frontend:** `frontend/guardrails_frontend/src/api/compliance.ts`
- `GET /compliance/frameworks` → ⚠️ Backend: Not implemented
- `GET /compliance/frameworks/{id}` → ⚠️ Backend: Not implemented
- `GET /compliance/controls/{id}` → ⚠️ Backend: Not implemented
- `POST /compliance/report` → ⚠️ Backend: Not implemented
- `POST /compliance/controls/{id}/link-policy` → ⚠️ Backend: Not implemented
- `DELETE /compliance/controls/{id}/unlink-policy` → ⚠️ Backend: Not implemented

**Status:** Frontend is ready, backend needs implementation.

---

## ✅ Configuration Verification

### API Base URL ✅
- **Location:** `frontend/guardrails_frontend/src/utils/constants.ts`
- **Default:** `http://localhost:8000/v1`
- **Environment Variable:** `VITE_API_BASE_URL`
- **Status:** ✅ Correctly configured

### API Client ✅
- **Location:** `frontend/guardrails_frontend/src/api/client.ts`
- **Base URL:** Uses `API_BASE_URL` from constants
- **Timeout:** 30 seconds ✅
- **Headers:** `Content-Type: application/json` ✅
- **Auth:** Bearer token via `Authorization` header ✅
- **API Key:** Via `X-API-Key` header ✅
- **Error Handling:** Comprehensive (401, 403, 404, 429, 500+) ✅

### Vite Proxy Configuration ✅
- **Location:** `frontend/guardrails_frontend/vite.config.ts`
- **Proxy:** `/v1` → `http://localhost:8000`
- **Status:** ✅ Correctly configured for development

---

## 📋 Endpoint Mapping Summary

| Frontend Endpoint | Backend Route | Status |
|------------------|---------------|--------|
| `/gateway/evaluate` | `/v1/gateway/evaluate` | ✅ Implemented |
| `/gateway/intercept` | `/v1/gateway/intercept` | ✅ Implemented |
| `/health` | `/v1/health` | ✅ Implemented |
| `/health/db` | `/v1/health/db` | ✅ Implemented |
| `/health/redis` | `/v1/health/redis` | ✅ Implemented |
| `/organizations` | `/v1/organizations` | ✅ Implemented |
| `/organizations/{id}` | `/v1/organizations/{id}` | ✅ Implemented |
| `/organizations/{id}/users` | `/v1/organizations/{id}/users` | ✅ Implemented |
| `/organizations/users/{id}` | `/v1/organizations/users/{id}` | ✅ Implemented |
| `/organizations/{id}/api-keys` | `/v1/organizations/{id}/api-keys` | ✅ Implemented |
| `/organizations/api-keys/{id}` | `/v1/organizations/api-keys/{id}` | ✅ Implemented |
| `/apps` | `/v1/apps` | ✅ Implemented |
| `/apps/{id}` | `/v1/apps/{id}` | ✅ Implemented |
| `/apps/{id}/environments` | `/v1/apps/{id}/environments` | ✅ Implemented |
| `/policies` | `/v1/policies` | ⚠️ Not implemented |
| `/violations` | `/v1/violations` | ⚠️ Not implemented |
| `/compliance/*` | `/v1/compliance/*` | ⚠️ Not implemented |
| `/audit/requests` | `/v1/audit/requests` | ✅ Implemented |
| `/audit/requests/{id}` | `/v1/audit/requests/{id}` | ✅ Implemented |
| `/audit/requests/{id}/decisions` | `/v1/audit/requests/{id}/decisions` | ✅ Implemented |
| `/audit/requests/{id}/violations` | `/v1/audit/requests/{id}/violations` | ✅ Implemented |

---

## 🔧 Recommendations

### 1. ✅ Audit API Client Added
Created `frontend/guardrails_frontend/src/api/audit.ts` to match backend audit endpoints.

### 2. Implement Backend Endpoints (P0)
- **Policies API** - Required for policy management UI
- **Violations API** - Required for violations dashboard
- **Compliance API** - Required for compliance reporting

### 3. Error Handling (P1)
- Add retry logic for failed requests
- Add offline detection
- Improve error messages for 404s (endpoint not implemented)

### 4. Type Safety (P2)
- Ensure all API response types match backend schemas
- Add runtime validation for API responses

---

## ✅ Conclusion

**All frontend endpoints are correctly configured to hit the backend.**

- ✅ API client uses correct base URL
- ✅ All implemented backend endpoints match frontend calls
- ✅ Authentication headers properly configured
- ✅ Error handling comprehensive
- ⚠️ Some frontend endpoints reference unimplemented backend routes (expected for development)

**Status:** Frontend is ready and correctly configured. Backend needs to implement policies, violations, and compliance endpoints to complete the integration.


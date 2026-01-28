# Swagger UI Organization Guide

## Overview

The API documentation is now perfectly separated in Swagger UI with clear distinctions between:

1. **🔵 User API - SDK Integration** (for developers)
2. **🔴 Admin API - Organizations & Users** (for platform admins)
3. **🔴 Admin API - Applications** (for platform admins)
4. **🟢 System - Health & Monitoring** (for system monitoring)

## How It Appears in Swagger UI

When you visit `http://localhost:8000/docs`, you'll see:

### 🔵 User API - SDK Integration
**Tag:** `User API - SDK Integration`

Endpoints for developers integrating the Guardrails SDK:
- `POST /v1/gateway/evaluate` - Evaluate content against policies
- `POST /v1/gateway/intercept` - Full LLM call interception

**Description:** Endpoints for SDK integration. Used by developers to evaluate content and intercept LLM calls.

**Authentication:** Requires `X-API-Key` header

---

### 🔴 Admin API - Organizations & Users
**Tag:** `Admin API - Organizations & Users`

Endpoints for managing organizations, users, and API keys:
- `POST /v1/organizations` - Create organization
- `GET /v1/organizations/{org_id}` - Get organization
- `PUT /v1/organizations/{org_id}` - Update organization
- `GET /v1/organizations` - List organizations
- `POST /v1/organizations/{org_id}/users` - Create user
- `GET /v1/organizations/{org_id}/users` - List users
- `GET /v1/organizations/users/{user_id}` - Get user
- `PUT /v1/organizations/users/{user_id}` - Update user
- `POST /v1/organizations/{org_id}/api-keys` - Generate API key
- `GET /v1/organizations/{org_id}/api-keys` - List API keys
- `DELETE /v1/organizations/api-keys/{key_id}` - Revoke API key

**Description:** Manage organizations, users, and API keys. Admin-only endpoints.

**Authentication:** Admin authentication required (coming soon)

---

### 🔴 Admin API - Applications
**Tag:** `Admin API - Applications`

Endpoints for managing applications and environments:
- `POST /v1/apps?org_id={org_id}` - Register application
- `GET /v1/apps/{app_id}` - Get application
- `GET /v1/apps?org_id={org_id}` - List applications
- `PUT /v1/apps/{app_id}` - Update application
- `DELETE /v1/apps/{app_id}` - Delete application
- `POST /v1/apps/{app_id}/environments` - Create environment
- `GET /v1/apps/{app_id}/environments` - List environments

**Description:** Register applications and manage environments. Admin-only endpoints.

**Authentication:** Admin authentication required (coming soon)

---

### 🟢 System - Health & Monitoring
**Tag:** `System - Health & Monitoring`

System endpoints for monitoring:
- `GET /v1/health` - Basic health check
- `GET /v1/health/db` - Database connectivity check
- `GET /v1/health/redis` - Redis connectivity check

**Description:** System health checks and monitoring endpoints.

**Authentication:** No authentication required

---

## Features Added

### 1. Clear Tag Organization
- Each endpoint group has a descriptive tag
- Tags are color-coded in Swagger UI
- Tags are grouped logically

### 2. Comprehensive Descriptions
Every endpoint now has:
- **Summary:** One-line description
- **Description:** Detailed explanation including:
  - Who should use it (User/Admin/System)
  - What it does
  - Authentication requirements
  - Use cases
  - Important warnings (where applicable)

### 3. Response Documentation
- Common response codes documented at router level
- Clear error messages
- Status code descriptions

### 4. Main API Description
The FastAPI app description now includes:
- Overview of API organization
- Quick start guide
- Authentication information
- Links to documentation

## Example Endpoint Documentation

### User Endpoint Example

```python
@router.post(
    "/evaluate",
    response_model=EvaluateResponse,
    summary="Evaluate content against policies",
    description="""
    **User Endpoint** - For SDK integration and custom implementations.
    
    Evaluates content (text, messages, tool calls) against applicable policies
    without executing the actual LLM/tool call.
    
    **Use Cases:**
    - Pre-flight checks before LLM calls
    - Post-processing validation
    - Custom integration workflows
    
    **Authentication:** Requires `X-API-Key` header with valid API key.
    
    **Returns:** Policy decision (allow, block, redact, rewrite) with detailed reasoning.
    """,
)
```

### Admin Endpoint Example

```python
@router.post(
    "/{org_id}/api-keys",
    response_model=APIKeyCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate API key",
    description="""
    **Admin Endpoint** - Generate a new API key for SDK authentication.
    
    API keys are used by developers to authenticate SDK requests.
    
    **⚠️ Important:** The full `key` is only returned once on creation.
    Store it securely - it cannot be retrieved later.
    
    **Scopes:** Control what the key can do (`read`, `write`, etc.)
    
    **Returns:** API key object with the full key (save it immediately!).
    """,
)
```

## Benefits

1. **Clear Separation:** Users can immediately see which endpoints are for them vs admins
2. **Better Discovery:** Swagger UI groups endpoints logically
3. **Self-Documenting:** Each endpoint explains its purpose, use cases, and requirements
4. **Reduced Confusion:** No more guessing which endpoint to use
5. **Professional Appearance:** Well-organized API documentation

## Testing

1. Start the server:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. Visit Swagger UI:
   ```
   http://localhost:8000/docs
   ```

3. You'll see:
   - Four distinct tag groups
   - Clear descriptions for each endpoint
   - Organized by user type (User/Admin/System)
   - Color-coded tags

## Next Steps

When you add new endpoints:

1. **User endpoints** → Use tag: `"User API - SDK Integration"`
2. **Admin endpoints** → Use tag: `"Admin API - [Category]"`
3. **System endpoints** → Use tag: `"System - [Category]"`

Always include:
- `summary` - One-line description
- `description` - Detailed explanation
- Mark endpoint type: `**User Endpoint**` or `**Admin Endpoint**`


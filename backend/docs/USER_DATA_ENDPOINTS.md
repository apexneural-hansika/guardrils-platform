# User Data Management Endpoints

## Overview

The platform now has endpoints for managing:
- **Organizations** (multi-tenant support)
- **Users** (within organizations)
- **Applications** (registered apps that use the gateway)
- **API Keys** (for authentication)
- **Environments** (dev/staging/prod per app)

## How User Data Flows

### 1. Create Organization
First, create an organization:

```bash
POST /v1/organizations
{
  "name": "Acme Corp",
  "slug": "acme-corp"  # Optional, auto-generated if not provided
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "settings": {},
  "created_at": "2026-01-23T12:00:00Z",
  "updated_at": "2026-01-23T12:00:00Z"
}
```

### 2. Create Users
Add users to the organization:

```bash
POST /v1/organizations/{org_id}/users
{
  "email": "admin@acme.com",
  "name": "Admin User",
  "role": "admin"  # admin, member, or viewer
}
```

### 3. Create API Key
Generate an API key for the organization:

```bash
POST /v1/organizations/{org_id}/api-keys
{
  "name": "Production Key",
  "scopes": ["read", "write"],
  "expires_at": null  # Optional expiration
}
```

**Response (includes the key - save it!):**
```json
{
  "id": "uuid-here",
  "org_id": "uuid-here",
  "name": "Production Key",
  "key": "gr_abc123...",  // ⚠️ Save this! Only shown once
  "key_prefix": "gr_abc123",
  "scopes": ["read", "write"],
  "expires_at": null,
  "created_at": "2026-01-23T12:00:00Z"
}
```

### 4. Register Application
Register an application that will use the gateway:

```bash
POST /v1/apps?org_id={org_id}
{
  "name": "My LLM App",
  "slug": "my-llm-app",  # Optional
  "description": "Main application",
  "settings": {}
}
```

**Response:**
```json
{
  "id": "app-uuid-here",  // ⚠️ Use this as app_id in gateway calls
  "org_id": "org-uuid-here",
  "name": "My LLM App",
  "slug": "my-llm-app",
  "description": "Main application",
  "owners": [],
  "settings": {},
  "created_at": "2026-01-23T12:00:00Z",
  "updated_at": "2026-01-23T12:00:00Z"
}
```

### 5. Create Environment
Create environments (dev/staging/prod) for the app:

```bash
POST /v1/apps/{app_id}/environments
{
  "name": "prod",  # dev, staging, or prod
  "is_production": true,
  "settings": {}
}
```

### 6. Use Gateway with app_id
Now you can use the gateway endpoints with the `app_id`:

```bash
POST /v1/gateway/evaluate
{
  "app_id": "app-uuid-here",  // From step 4
  "scope": "llm.output",
  "content": {"text": "Hello world"}
}
```

## Complete Endpoint Reference

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/organizations` | Create organization |
| GET | `/v1/organizations/{org_id}` | Get organization |
| PUT | `/v1/organizations/{org_id}` | Update organization |
| GET | `/v1/organizations` | List organizations |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/organizations/{org_id}/users` | Create user |
| GET | `/v1/organizations/{org_id}/users` | List users |
| GET | `/v1/organizations/users/{user_id}` | Get user |
| PUT | `/v1/organizations/users/{user_id}` | Update user |

### API Keys

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/organizations/{org_id}/api-keys` | Create API key |
| GET | `/v1/organizations/{org_id}/api-keys` | List API keys |
| DELETE | `/v1/organizations/api-keys/{key_id}` | Revoke API key |

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/apps?org_id={org_id}` | Create application |
| GET | `/v1/apps/{app_id}` | Get application |
| GET | `/v1/apps?org_id={org_id}` | List applications |
| PUT | `/v1/apps/{app_id}` | Update application |
| DELETE | `/v1/apps/{app_id}` | Delete application |

### Environments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/apps/{app_id}/environments` | Create environment |
| GET | `/v1/apps/{app_id}/environments` | List environments |

## Example Workflow

```bash
# 1. Create organization
ORG_ID=$(curl -X POST http://localhost:8000/v1/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "My Company"}' | jq -r '.id')

# 2. Create user
USER_ID=$(curl -X POST http://localhost:8000/v1/organizations/$ORG_ID/users \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "role": "admin"}' | jq -r '.id')

# 3. Create API key
API_KEY=$(curl -X POST http://localhost:8000/v1/organizations/$ORG_ID/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "Main Key"}' | jq -r '.key')

# 4. Register application
APP_ID=$(curl -X POST "http://localhost:8000/v1/apps?org_id=$ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "My App"}' | jq -r '.id')

# 5. Use gateway with app_id
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"app_id\": \"$APP_ID\",
    \"scope\": \"llm.output\",
    \"content\": {\"text\": \"Hello world\"}
  }"
```

## Authentication

Currently, endpoints accept `org_id` as query parameters. In production, you should:

1. **Extract `org_id` from authenticated user's token**
2. **Use API keys for SDK/Proxy authentication**
3. **Implement proper RBAC** (role-based access control)

## Next Steps

1. ✅ Organizations CRUD - **IMPLEMENTED**
2. ✅ Users CRUD - **IMPLEMENTED**
3. ✅ Applications CRUD - **IMPLEMENTED**
4. ✅ API Keys CRUD - **IMPLEMENTED**
5. ⏳ Policies CRUD - **TODO**
6. ⏳ Audit log querying - **TODO**
7. ⏳ Authentication middleware - **TODO**
8. ⏳ RBAC enforcement - **TODO**


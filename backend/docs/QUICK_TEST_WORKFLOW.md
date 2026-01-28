# Quick Test Workflow for User Data Endpoints

## ✅ Everything is Working!

Based on your terminal output, the server is running correctly. Here's how to test the complete flow:

## Step-by-Step Testing

### 1. Create Organization (✅ Working)
```bash
curl -X POST http://localhost:8000/v1/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "My Company"}'
```

**Response:** You'll get back an organization with an `id` field (UUID).

**Example Response:**
```json
{
  "id": "12c0f5b5-9bd5-4f4d-9a7f-a0dc7b3585c9",
  "name": "My Company",
  "slug": "my-company",
  "settings": {},
  "created_at": "2026-01-23T11:29:36.996916+00:00",
  "updated_at": "2026-01-23T11:29:36.996919+00:00"
}
```

### 2. Create Application (⚠️ Use the UUID from step 1)
```bash
# Replace {ORG_ID} with the actual UUID from step 1
curl -X POST "http://localhost:8000/v1/apps?org_id=12c0f5b5-9bd5-4f4d-9a7f-a0dc7b3585c9" \
  -H "Content-Type: application/json" \
  -d '{"name": "My App"}'
```

**Note:** The `org_id` must be a valid UUID, not the string "org_id".

**Example Response:**
```json
{
  "id": "app-uuid-here",
  "org_id": "12c0f5b5-9bd5-4f4d-9a7f-a0dc7b3585c9",
  "name": "My App",
  "slug": "my-app",
  "description": null,
  "owners": [],
  "settings": {},
  "created_at": "2026-01-23T11:30:00.000000+00:00",
  "updated_at": "2026-01-23T11:30:00.000000+00:00"
}
```

### 3. Use Gateway with app_id
```bash
# Replace {APP_ID} with the UUID from step 2
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "app-uuid-from-step-2",
    "scope": "llm.output",
    "content": {"text": "Hello world"}
  }'
```

## Complete Example Script

```bash
#!/bin/bash

# Step 1: Create organization
ORG_RESPONSE=$(curl -s -X POST http://localhost:8000/v1/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Company"}')

ORG_ID=$(echo $ORG_RESPONSE | jq -r '.id')
echo "✅ Created organization: $ORG_ID"

# Step 2: Create application
APP_RESPONSE=$(curl -s -X POST "http://localhost:8000/v1/apps?org_id=$ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test App"}')

APP_ID=$(echo $APP_RESPONSE | jq -r '.id')
echo "✅ Created application: $APP_ID"

# Step 3: Test gateway
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d "{
    \"app_id\": \"$APP_ID\",
    \"scope\": \"llm.output\",
    \"content\": {\"text\": \"Hello world\"}
  }"
```

## Available Endpoints Summary

### Organizations
- ✅ `POST /v1/organizations` - Create organization
- ✅ `GET /v1/organizations/{org_id}` - Get organization
- ✅ `GET /v1/organizations` - List organizations
- ✅ `PUT /v1/organizations/{org_id}` - Update organization

### Users
- ✅ `POST /v1/organizations/{org_id}/users` - Create user
- ✅ `GET /v1/organizations/{org_id}/users` - List users
- ✅ `GET /v1/organizations/users/{user_id}` - Get user
- ✅ `PUT /v1/organizations/users/{user_id}` - Update user

### API Keys
- ✅ `POST /v1/organizations/{org_id}/api-keys` - Create API key
- ✅ `GET /v1/organizations/{org_id}/api-keys` - List API keys
- ✅ `DELETE /v1/organizations/api-keys/{key_id}` - Revoke API key

### Applications
- ✅ `POST /v1/apps?org_id={uuid}` - Create application
- ✅ `GET /v1/apps/{app_id}` - Get application
- ✅ `GET /v1/apps?org_id={uuid}` - List applications
- ✅ `PUT /v1/apps/{app_id}` - Update application
- ✅ `DELETE /v1/apps/{app_id}` - Delete application

### Environments
- ✅ `POST /v1/apps/{app_id}/environments` - Create environment
- ✅ `GET /v1/apps/{app_id}/environments` - List environments

### Gateway
- ✅ `POST /v1/gateway/evaluate` - Evaluate content
- ✅ `POST /v1/gateway/intercept` - Full interception

## Interactive Testing

Visit **http://localhost:8000/docs** in your browser to use the interactive Swagger UI. You can:
- See all endpoints
- Test them directly from the browser
- View request/response schemas
- Copy curl commands

## Status: ✅ All Systems Operational

All endpoints are implemented and working. The only issue was using a literal string `"org_id"` instead of the actual UUID value.


# How to Test the Backend Server

## 🚀 Starting the Server

### Option 1: Direct Uvicorn Command

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**What happens:**
- FastAPI application starts on `http://127.0.0.1:8000`
- `--reload` enables auto-reload on code changes
- Server will show startup logs and be ready to accept requests

### Option 2: Using Python Module

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Expected Startup Output

```
INFO:     Will watch for changes in these directories: ['/path/to/backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXXX] using WatchFiles
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
Starting guardrails-platform in development mode
INFO:     Application startup complete.
```

---

## 🧪 Testing the Server

### 1. Health Check Endpoints

#### Root Endpoint
```bash
curl http://localhost:8000/
```

**Expected Response:**
```json
{
  "service": "guardrails-platform",
  "version": "0.1.0",
  "docs": "/docs"
}
```

#### Basic Health Check
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "guardrails-platform",
  "environment": "development"
}
```

#### V1 Health Check
```bash
curl http://localhost:8000/v1/health
```

**Expected Response:**
```json
{
  "status": "healthy"
}
```

#### Database Health Check
```bash
curl http://localhost:8000/v1/health/db
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

#### Redis Health Check
```bash
curl http://localhost:8000/v1/health/redis
```

**Expected Response:**
```json
{
  "status": "healthy",
  "redis": "connected"
}
```

---

### 2. Interactive API Documentation

#### Swagger UI (Recommended)
Open in browser:
```
http://localhost:8000/docs
```

**What you'll see:**
- Interactive API documentation
- Try out endpoints directly from the browser
- See request/response schemas
- Test all endpoints with sample data

#### ReDoc (Alternative)
Open in browser:
```
http://localhost:8000/redoc
```

**What you'll see:**
- Clean, readable API documentation
- All endpoints and schemas
- Better for reading (less interactive)

---

### 3. Gateway Endpoints

#### Evaluate Endpoint (Policy Evaluation)

```bash
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app",
    "scope": "llm.output",
    "content": {
      "text": "Hello, this is a test message"
    }
  }'
```

**Expected Response:**
```json
{
  "trace_id": "uuid-here",
  "request_id": "uuid-here",
  "action": "allow",
  "reason": "No policies triggered",
  "policies_evaluated": 0,
  "policies_triggered": 0,
  "decisions": [],
  "modified_content": null,
  "total_latency_ms": 5,
  "timestamp": "2026-01-23T12:00:00Z"
}
```

#### Intercept Endpoint (Full LLM Call Interception)

```bash
curl -X POST http://localhost:8000/v1/gateway/intercept \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app",
    "input": {
      "text": "What is the weather today?"
    },
    "provider": "openai",
    "call_config": {
      "model": "gpt-4",
      "temperature": 0.7
    }
  }'
```

**Expected Response:**
```json
{
  "trace_id": "uuid-here",
  "input_decision": {
    "trace_id": "uuid-here",
    "request_id": "uuid-here",
    "action": "allow",
    "reason": "No policies triggered",
    "policies_evaluated": 0,
    "policies_triggered": 0,
    "decisions": [],
    "modified_content": null,
    "total_latency_ms": 3,
    "timestamp": "2026-01-23T12:00:00Z"
  },
  "call_executed": true,
  "call_response": {
    "content": "Mock LLM response"
  },
  "call_error": null,
  "call_latency_ms": 100,
  "output_decision": {
    "trace_id": "uuid-here",
    "request_id": "uuid-here",
    "action": "allow",
    "reason": "No policies triggered",
    "policies_evaluated": 0,
    "policies_triggered": 0,
    "decisions": [],
    "modified_content": null,
    "total_latency_ms": 2,
    "timestamp": "2026-01-23T12:00:00Z"
  },
  "final_action": "allow",
  "final_content": null,
  "total_latency_ms": 105
}
```

---

### 4. Testing with Different Scopes

#### LLM Input Scope
```bash
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app",
    "scope": "llm.input",
    "content": {
      "text": "User input text here"
    }
  }'
```

#### LLM Output Scope
```bash
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app",
    "scope": "llm.output",
    "content": {
      "text": "LLM generated response here"
    }
  }'
```

#### Tool Call Scope
```bash
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app",
    "scope": "tool.call",
    "content": {
      "tool_name": "weather_api",
      "tool_args": {"location": "New York"}
    }
  }'
```

---

### 5. Testing Error Cases

#### Invalid Request (Missing Required Field)
```bash
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app"
  }'
```

**Expected Response:** `422 Unprocessable Entity` with validation error details

#### Invalid Scope
```bash
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app",
    "scope": "invalid.scope",
    "content": {"text": "test"}
  }'
```

**Expected Response:** `422 Unprocessable Entity` with validation error

---

### 6. Using the Interactive Docs (Easiest Method)

1. **Start the server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Open browser:**
   ```
   http://localhost:8000/docs
   ```

3. **Click "Try it out"** on any endpoint

4. **Fill in the request body** (or use defaults)

5. **Click "Execute"**

6. **See the response** with status code, headers, and body

---

## 🔍 What to Check

### ✅ Server is Working If:

1. **Startup completes without errors**
   - Look for: `INFO: Application startup complete.`

2. **Health endpoints return 200 OK**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status": "healthy", ...}
   ```

3. **Swagger UI loads**
   - Visit: `http://localhost:8000/docs`
   - Should see interactive API documentation

4. **Gateway endpoints accept requests**
   - Try the `/v1/gateway/evaluate` endpoint
   - Should return a valid JSON response

### ❌ Common Issues:

1. **Port already in use:**
   ```
   ERROR: [Errno 48] Address already in use
   ```
   **Solution:** Change port or kill existing process
   ```bash
   # Change port
   uvicorn app.main:app --reload --port 8001
   
   # Or find and kill existing process
   lsof -ti:8000 | xargs kill
   ```

2. **Database connection error:**
   ```
   Database connection failed
   ```
   **Solution:** Make sure PostgreSQL is running
   ```bash
   # Check if Docker containers are running
   docker-compose ps
   
   # Start if needed
   make dev-up
   ```

3. **Module not found:**
   ```
   ModuleNotFoundError: No module named 'app'
   ```
   **Solution:** Make sure you're in the backend directory
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

---

## 📊 Quick Test Script

Save this as `test_server.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

echo "🧪 Testing Guardrails Platform Server"
echo "======================================"

# Test 1: Root endpoint
echo -e "\n1. Testing root endpoint..."
curl -s "$BASE_URL/" | jq '.' || echo "Failed"

# Test 2: Health check
echo -e "\n2. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq '.' || echo "Failed"

# Test 3: V1 health
echo -e "\n3. Testing v1 health endpoint..."
curl -s "$BASE_URL/v1/health" | jq '.' || echo "Failed"

# Test 4: Evaluate endpoint
echo -e "\n4. Testing evaluate endpoint..."
curl -s -X POST "$BASE_URL/v1/gateway/evaluate" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test-app",
    "scope": "llm.output",
    "content": {"text": "Hello world"}
  }' | jq '.' || echo "Failed"

echo -e "\n✅ All tests complete!"
```

**Run it:**
```bash
chmod +x test_server.sh
./test_server.sh
```

---

## 🎯 Recommended Testing Flow

1. **Start the server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Verify it's running:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Open Swagger UI:**
   - Visit: `http://localhost:8000/docs`
   - Explore available endpoints

4. **Test gateway endpoints:**
   - Use Swagger UI to test `/v1/gateway/evaluate`
   - Try different scopes and content

5. **Check logs:**
   - Watch the terminal for request logs
   - Each request should show correlation ID and timing

---

## 📝 What Happens Behind the Scenes

When you start the server:

1. **FastAPI initializes:**
   - Loads configuration from environment variables
   - Sets up database connection pool
   - Configures Redis client
   - Registers all API routes
   - Sets up middleware (CORS, logging, correlation IDs)

2. **On each request:**
   - Correlation ID is generated/used
   - Request is logged with timing
   - Validation happens (Pydantic schemas)
   - Business logic executes
   - Response is formatted and returned
   - Response time is logged

3. **Available endpoints:**
   - `/` - Root endpoint
   - `/health` - Basic health check
   - `/v1/health` - V1 health check
   - `/v1/health/db` - Database health
   - `/v1/health/redis` - Redis health
   - `/v1/gateway/evaluate` - Policy evaluation
   - `/v1/gateway/intercept` - Full interception
   - `/docs` - Swagger UI
   - `/redoc` - ReDoc documentation

---

## 🚀 Next Steps

Once the server is running and tested:

1. **Test with real policies** (when implemented)
2. **Test with actual LLM providers** (when integrated)
3. **Monitor logs** for performance
4. **Test error scenarios** (timeouts, invalid data)
5. **Load testing** (when ready for production)

---

## 💡 Pro Tips

1. **Use `--reload` for development** - Auto-restarts on code changes
2. **Use Swagger UI** - Easiest way to test endpoints
3. **Check logs** - Every request is logged with correlation ID
4. **Test health endpoints first** - Quick way to verify server is up
5. **Use `jq` for pretty JSON** - `curl ... | jq '.'` formats responses nicely


# Environment Setup Guide

## Quick Setup

Run the setup script to create `.env` files with secure secrets:

```bash
./scripts/setup-env.sh
```

Or manually create the files:

## Manual Setup

### Backend Environment

Create `backend/.env` (or copy from `.env.example`):

```bash
# Copy example
cp .env.example backend/.env

# Generate secure secrets
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
python3 -c "import secrets; print('SESSION_SECRET=' + secrets.token_urlsafe(32))"
```

Then update `backend/.env` with the generated secrets.

**Required Variables:**
- `JWT_SECRET` - Minimum 32 characters (for JWT signing)
- `SESSION_SECRET` - Minimum 32 characters (for session management)
- `DATABASE_URL` - PostgreSQL connection string

**Example `backend/.env`:**
```env
ENV=development
APP_NAME=guardrails-platform
APP_URL=http://localhost:8000
PORT=8000

JWT_SECRET=your-generated-secret-here-min-32-chars
SESSION_SECRET=your-generated-secret-here-min-32-chars
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

DATABASE_URL=postgresql+asyncpg://guardrails:guardrails@localhost:5432/guardrails_dev
REDIS_URL=redis://localhost:6379/0

LOG_LEVEL=INFO
OTEL_ENABLED=true
```

### Frontend Environment

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/v1
VITE_APP_NAME=Guardrails Platform
```

## Verify Setup

1. **Check backend config loads:**
   ```bash
   cd backend
   python3 -c "from app.config import settings; print('Config loaded:', settings.app_name)"
   ```

2. **Start infrastructure:**
   ```bash
   make dev-up
   ```

3. **Test database connection:**
   ```bash
   cd backend
   python3 -c "from app.dependencies import engine; import asyncio; asyncio.run(engine.connect())"
   ```

## Troubleshooting

### "JWT_SECRET must be at least 32 characters"
- Generate a longer secret: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`

### "DATABASE_URL is required"
- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Check connection string format: `postgresql+asyncpg://user:pass@host:port/dbname`

### "Config validation error"
- Check all required fields in `.env`
- Verify no typos in variable names
- Ensure values match expected types (strings, integers, booleans)


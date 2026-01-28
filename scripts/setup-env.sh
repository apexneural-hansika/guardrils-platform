#!/bin/bash
# Setup script to create .env files from .env.example

set -e

echo "Setting up environment files..."

# Generate secure secrets
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32 | tr -d '\n')
SESSION_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32 | tr -d '\n')

# Backend .env
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env..."
    cp .env.example backend/.env
    # Replace placeholder secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/change-me-in-production-use-secure-random-string-min-32-chars/$JWT_SECRET/g" backend/.env
        sed -i '' "s/change-me-in-production-use-secure-random-string-min-32-chars/$SESSION_SECRET/g" backend/.env
    else
        # Linux
        sed -i "s/change-me-in-production-use-secure-random-string-min-32-chars/$JWT_SECRET/g" backend/.env
        sed -i "s/change-me-in-production-use-secure-random-string-min-32-chars/$SESSION_SECRET/g" backend/.env
    fi
    echo "✓ Created backend/.env with secure secrets"
else
    echo "⚠ backend/.env already exists, skipping..."
fi

# Frontend .env
if [ ! -f frontend/.env ]; then
    echo "Creating frontend/.env..."
    cp frontend/.env.example frontend/.env
    echo "✓ Created frontend/.env"
else
    echo "⚠ frontend/.env already exists, skipping..."
fi

echo ""
echo "Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Review backend/.env and adjust if needed"
echo "2. Start infrastructure: make dev-up"
echo "3. Run migrations: cd backend && alembic upgrade head"
echo "4. Start backend: cd backend && uvicorn app.main:app --reload"
echo "5. Start frontend: cd frontend && npm run dev"


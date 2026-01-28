#!/usr/bin/env python3
"""Setup script to create .env files from .env.example with secure secrets."""

import os
import secrets
import shutil
from pathlib import Path

def generate_secret() -> str:
    """Generate a secure random secret."""
    return secrets.token_urlsafe(32)

def setup_env():
    """Set up environment files."""
    root = Path(__file__).parent.parent
    
    # Generate secrets
    jwt_secret = generate_secret()
    session_secret = generate_secret()
    
    print("Setting up environment files...")
    print(f"Generated JWT_SECRET: {jwt_secret[:20]}...")
    print(f"Generated SESSION_SECRET: {session_secret[:20]}...")
    print()
    
    # Backend .env
    backend_env = root / "backend" / ".env"
    env_example = root / ".env.example"
    
    if not backend_env.exists() and env_example.exists():
        print("Creating backend/.env...")
        shutil.copy(env_example, backend_env)
        
        # Replace placeholder secrets
        content = backend_env.read_text()
        content = content.replace(
            "JWT_SECRET=change-me-in-production-use-secure-random-string-min-32-chars",
            f"JWT_SECRET={jwt_secret}"
        )
        content = content.replace(
            "SESSION_SECRET=change-me-in-production-use-secure-random-string-min-32-chars",
            f"SESSION_SECRET={session_secret}"
        )
        backend_env.write_text(content)
        print("✓ Created backend/.env with secure secrets")
    elif backend_env.exists():
        print("⚠ backend/.env already exists, skipping...")
    else:
        print("⚠ .env.example not found, cannot create backend/.env")
    
    # Frontend .env
    frontend_env = root / "frontend" / ".env"
    frontend_example = root / "frontend" / ".env.example"
    
    if not frontend_env.exists() and frontend_example.exists():
        print("Creating frontend/.env...")
        shutil.copy(frontend_example, frontend_env)
        print("✓ Created frontend/.env")
    elif frontend_env.exists():
        print("⚠ frontend/.env already exists, skipping...")
    else:
        print("⚠ frontend/.env.example not found, cannot create frontend/.env")
    
    print()
    print("Environment setup complete!")
    print()
    print("Next steps:")
    print("1. Review backend/.env and adjust if needed")
    print("2. Start infrastructure: make dev-up")
    print("3. Run migrations: cd backend && alembic upgrade head")
    print("4. Start backend: cd backend && uvicorn app.main:app --reload")
    print("5. Start frontend: cd frontend && npm run dev")

if __name__ == "__main__":
    setup_env()


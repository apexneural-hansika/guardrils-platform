"""Security utilities: API key authentication, JWT, hashing."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Security
from fastapi.security import APIKeyHeader
from app.config import settings
from app.core.exceptions import AuthenticationError

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# API Key header
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def hash_api_key(key: str) -> str:
    """
    Hash an API key using SHA-256.
    
    Args:
        key: API key to hash
        
    Returns:
        str: SHA-256 hash (hex)
    """
    return hashlib.sha256(key.encode()).hexdigest()


def generate_api_key() -> tuple[str, str]:
    """
    Generate a new API key.
    
    Returns:
        tuple: (full_key, key_prefix) - Full key and first 12 chars for display
    """
    full_key = f"gr_{secrets.token_urlsafe(32)}"
    key_prefix = full_key[:12]
    return full_key, key_prefix


def verify_api_key(key_hash: str, provided_key: str) -> bool:
    """
    Verify an API key against its hash.
    
    Args:
        key_hash: Stored hash
        provided_key: Key to verify
        
    Returns:
        bool: True if valid
    """
    computed_hash = hash_api_key(provided_key)
    return secrets.compare_digest(computed_hash, key_hash)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Token payload
        expires_delta: Optional expiration delta
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=24)
    
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT access token.
    
    Args:
        token: JWT token string
        
    Returns:
        dict: Decoded token payload
        
    Raises:
        AuthenticationError: If token is invalid
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return payload
    except JWTError as e:
        raise AuthenticationError(f"Invalid token: {str(e)}")


async def get_api_key(api_key: Optional[str] = Security(api_key_header)) -> str:
    """
    Dependency to extract and validate API key from header.
    
    Args:
        api_key: API key from header
        
    Returns:
        str: API key
        
    Raises:
        HTTPException: If API key is missing
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return api_key


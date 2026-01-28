"""Custom exception classes."""

from typing import Optional, Any


class GuardrailsError(Exception):
    """Base exception for Guardrails Platform."""

    def __init__(
        self,
        message: str,
        code: Optional[str] = None,
        details: Optional[dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code or "GUARDRAILS_ERROR"
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(GuardrailsError):
    """Authentication failed."""

    def __init__(self, message: str = "Authentication failed", details: Optional[dict] = None):
        super().__init__(message, code="AUTH_ERROR", details=details)


class AuthorizationError(GuardrailsError):
    """Authorization failed."""

    def __init__(self, message: str = "Authorization failed", details: Optional[dict] = None):
        super().__init__(message, code="AUTHZ_ERROR", details=details)


class ValidationError(GuardrailsError):
    """Validation failed."""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(message, code="VALIDATION_ERROR", details=details)


class PolicyError(GuardrailsError):
    """Policy-related error."""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(message, code="POLICY_ERROR", details=details)


class CheckError(GuardrailsError):
    """Check execution error."""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(message, code="CHECK_ERROR", details=details)


class RateLimitError(GuardrailsError):
    """Rate limit exceeded."""

    def __init__(self, message: str = "Rate limit exceeded", details: Optional[dict] = None):
        super().__init__(message, code="RATE_LIMIT_ERROR", details=details)


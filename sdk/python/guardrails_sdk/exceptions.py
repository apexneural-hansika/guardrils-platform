"""SDK exception classes."""

from typing import Optional, Any


class GuardrailsError(Exception):
    """Base exception for Guardrails SDK."""

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


class BlockedError(GuardrailsError):
    """Request was blocked by a policy."""

    def __init__(
        self,
        message: str,
        decision: Optional[Any] = None,
        details: Optional[dict[str, Any]] = None,
    ):
        super().__init__(message, code="BLOCKED", details=details)
        self.decision = decision


class RateLimitError(GuardrailsError):
    """Rate limit exceeded."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        details: Optional[dict[str, Any]] = None,
    ):
        super().__init__(message, code="RATE_LIMIT_ERROR", details=details)


class AuthenticationError(GuardrailsError):
    """Authentication failed."""

    def __init__(
        self,
        message: str = "Authentication failed",
        details: Optional[dict[str, Any]] = None,
    ):
        super().__init__(message, code="AUTH_ERROR", details=details)


class ValidationError(GuardrailsError):
    """Validation failed."""

    def __init__(
        self,
        message: str,
        details: Optional[dict[str, Any]] = None,
    ):
        super().__init__(message, code="VALIDATION_ERROR", details=details)


class NetworkError(GuardrailsError):
    """Network/connection error."""

    def __init__(
        self,
        message: str = "Network error occurred",
        details: Optional[dict[str, Any]] = None,
    ):
        super().__init__(message, code="NETWORK_ERROR", details=details)


class TimeoutError(GuardrailsError):
    """Request timeout."""

    def __init__(
        self,
        message: str = "Request timeout",
        details: Optional[dict[str, Any]] = None,
    ):
        super().__init__(message, code="TIMEOUT_ERROR", details=details)


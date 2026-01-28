"""HTTP client with timeouts, retries, and circuit breaker support.

Implements reference.md requirements:
- Every external call must have: timeout, bounded retries, exponential backoff + jitter
- No infinite retries
- No retry on non-idempotent operations unless explicitly designed
"""

import asyncio
import random
import time
from typing import Optional, TypeVar, Callable, Awaitable
from enum import Enum
import httpx
from app.config import settings
from app.core.exceptions import GuardrailsError

T = TypeVar("T")


class CircuitState(str, Enum):
    """Circuit breaker states."""

    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if service recovered


class CircuitBreaker:
    """
    Simple circuit breaker pattern.

    Prevents cascading failures by stopping requests when service is failing.
    """

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        half_open_max_calls: int = 3,
    ):
        """
        Initialize circuit breaker.

        Args:
            failure_threshold: Number of failures before opening circuit
            recovery_timeout: Seconds to wait before attempting recovery
            half_open_max_calls: Max calls in half-open state before closing
        """
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.half_open_success_count = 0

    def record_success(self) -> None:
        """Record a successful call."""
        if self.state == CircuitState.HALF_OPEN:
            self.half_open_success_count += 1
            if self.half_open_success_count >= self.half_open_max_calls:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
                self.half_open_success_count = 0
        elif self.state == CircuitState.CLOSED:
            self.failure_count = 0

    def record_failure(self) -> None:
        """Record a failed call."""
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.state == CircuitState.CLOSED:
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
        elif self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.OPEN
            self.half_open_success_count = 0

    def should_allow(self) -> bool:
        """Check if request should be allowed."""
        if self.state == CircuitState.CLOSED:
            return True

        if self.state == CircuitState.OPEN:
            # Check if recovery timeout has passed
            if (
                self.last_failure_time
                and time.time() - self.last_failure_time >= self.recovery_timeout
            ):
                self.state = CircuitState.HALF_OPEN
                self.half_open_success_count = 0
                return True
            return False

        # HALF_OPEN
        return True


class RetryConfig:
    """Configuration for retry behavior."""

    def __init__(
        self,
        max_retries: int = 3,
        initial_delay: float = 1.0,
        max_delay: float = 60.0,
        exponential_base: float = 2.0,
        jitter: bool = True,
        retry_on: Optional[list[int]] = None,
    ):
        """
        Initialize retry configuration.

        Args:
            max_retries: Maximum number of retry attempts
            initial_delay: Initial delay in seconds
            max_delay: Maximum delay in seconds
            exponential_base: Base for exponential backoff
            jitter: Add random jitter to delays
            retry_on: HTTP status codes to retry on (default: 5xx, 429)
        """
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.jitter = jitter
        self.retry_on = retry_on or [429, 500, 502, 503, 504]


async def retry_with_backoff(
    func: Callable[[], Awaitable[T]],
    config: RetryConfig,
    circuit_breaker: Optional[CircuitBreaker] = None,
) -> T:
    """
    Execute function with exponential backoff retry.

    Args:
        func: Async function to execute
        config: Retry configuration
        circuit_breaker: Optional circuit breaker

    Returns:
        Result from function

    Raises:
        Last exception if all retries exhausted
    """
    if circuit_breaker and not circuit_breaker.should_allow():
        raise GuardrailsError(
            "Circuit breaker is open - service is unavailable",
            code="CIRCUIT_BREAKER_OPEN",
        )

    last_exception: Optional[Exception] = None
    delay = config.initial_delay

    for attempt in range(config.max_retries + 1):
        try:
            result = await func()
            if circuit_breaker:
                circuit_breaker.record_success()
            return result

        except httpx.HTTPStatusError as e:
            last_exception = e
            # Only retry on configured status codes
            if e.response.status_code not in config.retry_on:
                if circuit_breaker:
                    circuit_breaker.record_failure()
                raise

        except (httpx.TimeoutException, httpx.NetworkError, httpx.ConnectError) as e:
            last_exception = e
            # Always retry network/timeout errors

        except Exception as e:
            last_exception = e
            # Don't retry on other exceptions
            if circuit_breaker:
                circuit_breaker.record_failure()
            raise

        # Don't retry on last attempt
        if attempt < config.max_retries:
            # Calculate delay with exponential backoff
            if config.jitter:
                # Add random jitter (0-20% of delay)
                jitter_amount = delay * 0.2 * random.random()
                actual_delay = delay + jitter_amount
            else:
                actual_delay = delay

            await asyncio.sleep(min(actual_delay, config.max_delay))

            # Exponential backoff
            delay = min(delay * config.exponential_base, config.max_delay)

    # All retries exhausted
    if circuit_breaker:
        circuit_breaker.record_failure()

    if last_exception:
        raise last_exception
    raise GuardrailsError("All retry attempts exhausted", code="RETRY_EXHAUSTED")


class HTTPClient:
    """
    HTTP client with timeout, retry, and circuit breaker support.

    Implements reference.md requirements for external calls.
    """

    def __init__(
        self,
        timeout: float = 30.0,
        max_retries: int = 3,
        circuit_breaker: Optional[CircuitBreaker] = None,
    ):
        """
        Initialize HTTP client.

        Args:
            timeout: Request timeout in seconds
            max_retries: Maximum retry attempts
            circuit_breaker: Optional circuit breaker instance
        """
        self.timeout = timeout
        self.retry_config = RetryConfig(max_retries=max_retries)
        self.circuit_breaker = circuit_breaker or CircuitBreaker()

        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(timeout, connect=5.0, read=timeout),
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
        )

    async def post(
        self,
        url: str,
        json: Optional[dict] = None,
        headers: Optional[dict] = None,
        idempotent: bool = True,
    ) -> httpx.Response:
        """
        Make POST request with retry and circuit breaker.

        Args:
            url: Request URL
            json: JSON payload
            headers: Request headers
            idempotent: Whether request is idempotent (affects retry behavior)

        Returns:
            HTTP response

        Raises:
            GuardrailsError: On failure after retries
        """
        if not idempotent and self.retry_config.max_retries > 0:
            # Non-idempotent requests should not retry by default
            config = RetryConfig(max_retries=0)
        else:
            config = self.retry_config

        async def _make_request() -> httpx.Response:
            response = await self._client.post(url, json=json, headers=headers)
            response.raise_for_status()
            return response

        return await retry_with_backoff(_make_request, config, self.circuit_breaker)

    async def get(
        self,
        url: str,
        headers: Optional[dict] = None,
        params: Optional[dict] = None,
    ) -> httpx.Response:
        """
        Make GET request with retry and circuit breaker.

        Args:
            url: Request URL
            headers: Request headers
            params: Query parameters

        Returns:
            HTTP response

        Raises:
            GuardrailsError: On failure after retries
        """
        async def _make_request() -> httpx.Response:
            response = await self._client.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response

        return await retry_with_backoff(
            _make_request, self.retry_config, self.circuit_breaker
        )

    async def close(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()


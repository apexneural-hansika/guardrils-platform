"""
Check executor for orchestrating check execution order and performance.

This is the "brain" that coordinates check execution, handles timeouts,
manages execution order (pre/post/tool-call), and ensures audit consistency.
"""

import asyncio
import time
from typing import List, Optional, Type
from datetime import datetime, timezone

from app.checks.base import Check, CheckPayload, CheckResult
from app.checks.registry import CheckRegistry, get_check_registry


class CheckExecutor:
    """
    Executor for running checks in a controlled, auditable manner.

    Responsibilities:
    - Control execution order (pre/post/tool-call checks)
    - Enforce timeouts per check
    - Aggregate results
    - Ensure audit consistency
    - Handle failures gracefully
    """

    def __init__(
        self,
        registry: Optional[CheckRegistry] = None,
        default_timeout_ms: int = 5000,
        max_concurrent: int = 10,
    ):
        """
        Initialize check executor.

        Args:
            registry: Check registry (defaults to global registry)
            default_timeout_ms: Default timeout per check in milliseconds
            max_concurrent: Maximum concurrent check executions
        """
        self.registry = registry or get_check_registry()
        self.default_timeout_ms = default_timeout_ms
        self.max_concurrent = max_concurrent

    async def run_checks(
        self,
        scope: str,
        payload: CheckPayload,
        check_names: Optional[List[str]] = None,
        timeout_ms: Optional[int] = None,
    ) -> List[CheckResult]:
        """
        Run all applicable checks for a given scope.

        Args:
            scope: Policy scope (e.g., "llm.input", "llm.output")
            payload: Content to check
            check_names: Optional list of specific check names to run
                         (if None, runs all checks for the scope)
            timeout_ms: Override default timeout per check

        Returns:
            List of CheckResult objects (one per check)
        """
        # Get checks to run
        if check_names:
            checks = [
                self.registry.get(name)
                for name in check_names
                if self.registry.get(name) is not None
            ]
        else:
            check_classes = self.registry.get_by_scope(scope)
            checks = check_classes

        if not checks:
            return []

        # Run checks with concurrency control
        timeout = timeout_ms or self.default_timeout_ms
        semaphore = asyncio.Semaphore(self.max_concurrent)

        async def run_single_check(check_class: Type[Check]) -> CheckResult:
            """Run a single check with timeout and error handling."""
            async with semaphore:
                check_instance = check_class()
                start_time = time.perf_counter()

                try:
                    # Run check with timeout
                    result = await asyncio.wait_for(
                        check_instance.run(payload),
                        timeout=timeout / 1000.0,  # Convert ms to seconds
                    )
                    elapsed_ms = int((time.perf_counter() - start_time) * 1000)

                    # Ensure latency is set
                    if result.latency_ms == 0:
                        result.latency_ms = elapsed_ms

                    return result

                except asyncio.TimeoutError:
                    elapsed_ms = int((time.perf_counter() - start_time) * 1000)
                    return CheckResult(
                        check_name=check_instance.name,
                        status="error",
                        message=f"Check timed out after {timeout}ms",
                        latency_ms=elapsed_ms,
                    )

                except Exception as e:
                    elapsed_ms = int((time.perf_counter() - start_time) * 1000)
                    return CheckResult(
                        check_name=check_instance.name,
                        status="error",
                        message=f"Check failed: {str(e)}",
                        latency_ms=elapsed_ms,
                    )

        # Execute all checks concurrently
        results = await asyncio.gather(
            *[run_single_check(check_class) for check_class in checks],
            return_exceptions=False,
        )

        return results

    async def run_pre_checks(
        self,
        payload: CheckPayload,
        check_names: Optional[List[str]] = None,
    ) -> List[CheckResult]:
        """
        Run pre-execution checks (for input validation).

        Args:
            payload: Input content to check
            check_names: Optional list of specific check names

        Returns:
            List of CheckResult objects
        """
        return await self.run_checks("llm.input", payload, check_names)

    async def run_post_checks(
        self,
        payload: CheckPayload,
        check_names: Optional[List[str]] = None,
    ) -> List[CheckResult]:
        """
        Run post-execution checks (for output validation).

        Args:
            payload: Output content to check
            check_names: Optional list of specific check names

        Returns:
            List of CheckResult objects
        """
        return await self.run_checks("llm.output", payload, check_names)

    async def run_tool_checks(
        self,
        payload: CheckPayload,
        check_names: Optional[List[str]] = None,
    ) -> List[CheckResult]:
        """
        Run tool call checks (for tool execution validation).

        Args:
            payload: Tool call content to check
            check_names: Optional list of specific check names

        Returns:
            List of CheckResult objects
        """
        return await self.run_checks("tool.call", payload, check_names)


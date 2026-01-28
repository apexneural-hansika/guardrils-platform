"""Gateway service for policy evaluation and interception."""

from uuid import uuid4, UUID
from datetime import datetime, timezone
from typing import Optional
import time

from app.schemas.gateway import (
    EvaluateRequest,
    EvaluateResponse,
    InterceptRequest,
    InterceptResponse,
    ActionType,
    PolicyDecision,
    CheckResult,
    ContentPayload,
)


class GatewayService:
    """Service for evaluating policies and intercepting LLM calls."""

    def __init__(self, db=None, audit_service=None):
        """
        Initialize gateway service.

        Args:
            db: Optional database session (for audit logging)
            audit_service: Optional audit service instance
        """
        self.db = db
        self.audit_service = audit_service

    async def evaluate(
        self,
        request: EvaluateRequest,
        org_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> EvaluateResponse:
        """
        Evaluate content against applicable policies.

        Returns decision without executing the actual LLM/tool call.
        Use this for pre-flight checks or custom integration.

        Args:
            request: Evaluation request
            org_id: Organization ID (for audit logging)
            ip_address: Client IP address (for audit logging)
            user_agent: User agent (for audit logging)
        """
        start_time = time.perf_counter()

        # Generate trace ID if not provided
        trace_id = request.trace_id or str(uuid4())
        request_id = str(uuid4())

        # TODO: Get applicable policies from database
        # TODO: Run checks
        # TODO: Evaluate conditions
        # TODO: Determine action

        # For now, return a basic allow response
        # This will be enhanced with actual policy evaluation logic
        decisions: list[PolicyDecision] = []

        # Mock decision for testing
        if request.content.text and len(request.content.text) > 1000:
            decisions.append(
                PolicyDecision(
                    policy_id=str(uuid4()),
                    policy_name="test_policy",
                    policy_version=1,
                    action=ActionType.ALLOW,
                    reason="Content length check passed",
                    checks=[
                        CheckResult(
                            check_name="length_check",
                            status="pass",
                            score=0.0,
                            message="Content length is acceptable",
                            latency_ms=5,
                        )
                    ],
                )
            )

        elapsed_ms = int((time.perf_counter() - start_time) * 1000)

        response = EvaluateResponse(
            trace_id=trace_id,
            request_id=request_id,
            action=ActionType.ALLOW,
            reason="No policies triggered" if not decisions else "Policy evaluation completed",
            policies_evaluated=0,  # TODO: Get actual count
            policies_triggered=len(decisions),
            decisions=decisions,
            modified_content=None,
            total_latency_ms=elapsed_ms,
            timestamp=datetime.now(timezone.utc),
        )

        # Log to audit trail if audit service is available
        if self.audit_service and org_id:
            try:
                # Get app_id as UUID
                app_uuid = UUID(request.app_id) if isinstance(request.app_id, str) else request.app_id
                
                # Get input text
                input_text = request.content.text or str(request.content.model_dump())
                
                # Log request
                audit_request = await self.audit_service.log_request(
                    trace_id=trace_id,
                    org_id=org_id,
                    app_id=app_uuid,
                    scope=request.scope.value if hasattr(request.scope, 'value') else str(request.scope),
                    user_id=request.user_id,
                    session_id=request.session_id,
                    input_text=input_text,
                    model=request.content.model,
                    token_count=request.content.tokens,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    metadata=request.metadata,
                )

                # Log decisions
                for decision in decisions:
                    await self.audit_service.log_decision(
                        request_id=audit_request.id,
                        trace_id=trace_id,
                        action=decision.action.value if hasattr(decision.action, 'value') else str(decision.action),
                        reason=decision.reason,
                        policy_id=UUID(decision.policy_id) if decision.policy_id else None,
                        latency_ms=elapsed_ms,
                    )

                # Log violations (failed checks)
                for decision in decisions:
                    for check in decision.checks:
                        if check.status == "fail":
                            await self.audit_service.log_violation(
                                request_id=audit_request.id,
                                trace_id=trace_id,
                                check_name=check.check_name,
                                severity="high" if check.score and check.score > 0.7 else "medium",
                                message=check.message or "Check failed",
                                evidence=check.evidence or {},
                            )
            except Exception as e:
                # Don't fail the request if audit logging fails
                print(f"Audit logging failed: {e}")

        return response

    async def intercept(self, request: InterceptRequest) -> InterceptResponse:
        """
        Full interception flow:
        1. Evaluate input policies
        2. Execute the call (if allowed)
        3. Evaluate output policies
        4. Return (possibly modified) response

        Use this for SDK/proxy integration.
        """
        start_time = time.perf_counter()
        trace_id = request.trace_id or str(uuid4())

        # 1. Evaluate input
        input_evaluate_request = EvaluateRequest(
            app_id=request.app_id,
            env=request.env,
            user_id=request.user_id,
            session_id=request.session_id,
            scope="llm.input",  # Input scope
            content=request.input,
            trace_id=trace_id,
            metadata=request.metadata,
        )

        input_decision = await self.evaluate(
            input_evaluate_request,
            org_id=org_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        # 2. If blocked, return early
        if input_decision.action == ActionType.BLOCK:
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            return InterceptResponse(
                trace_id=trace_id,
                input_decision=input_decision,
                call_executed=False,
                call_response=None,
                call_error=None,
                call_latency_ms=None,
                output_decision=None,
                final_action=ActionType.BLOCK,
                final_content=None,
                total_latency_ms=elapsed_ms,
            )

        # 3. Execute the call with timeout/retry protection
        call_executed = False
        call_response = None
        call_error = None
        call_latency_ms = None

        try:
            from app.core.http_client import HTTPClient
            from app.core.ssrf_protection import validate_llm_provider_url

            # Validate provider URL if custom endpoint
            if request.endpoint:
                validate_llm_provider_url(request.endpoint)

            # Create HTTP client with timeout/retry
            timeout = request.timeout_ms / 1000.0 if request.timeout_ms else 30.0
            async with HTTPClient(timeout=timeout, max_retries=2) as client:
                # TODO: Implement actual LLM provider calls
                # For now, mock the response
                call_executed = True
                call_response = {"content": "Mock LLM response"}
                call_latency_ms = 100

        except Exception as e:
            call_executed = False
            call_error = str(e)
            call_latency_ms = None

        # 4. Evaluate output
        output_decision = None
        if call_executed and call_response:
            output_content = ContentPayload(
                text=call_response.get("content", str(call_response))
            )
            output_evaluate_request = EvaluateRequest(
                app_id=request.app_id,
                env=request.env,
                user_id=request.user_id,
                session_id=request.session_id,
                scope="llm.output",  # Output scope
                content=output_content,
                trace_id=trace_id,
                metadata=request.metadata,
            )
            output_decision = await self.evaluate(
                output_evaluate_request,
                org_id=org_id,
                ip_address=ip_address,
                user_agent=user_agent,
            )

        # 5. Determine final action
        final_action = input_decision.action
        final_content = None

        if output_decision:
            # Output action takes precedence if more restrictive
            if self._is_more_restrictive(output_decision.action, final_action):
                final_action = output_decision.action
                final_content = output_decision.modified_content

        elapsed_ms = int((time.perf_counter() - start_time) * 1000)

        return InterceptResponse(
            trace_id=trace_id,
            input_decision=input_decision,
            call_executed=call_executed,
            call_response=call_response,
            call_error=call_error,
            call_latency_ms=call_latency_ms,
            output_decision=output_decision,
            final_action=final_action,
            final_content=final_content,
            total_latency_ms=elapsed_ms,
        )

    def _is_more_restrictive(self, new: ActionType, current: ActionType) -> bool:
        """Determine if new action is more restrictive."""
        priority = {
            ActionType.ALLOW: 0,
            ActionType.LOG_ONLY: 1,
            ActionType.ROUTE: 2,
            ActionType.REWRITE: 3,
            ActionType.REDACT: 4,
            ActionType.ESCALATE: 5,
            ActionType.BLOCK: 6,
        }
        return priority.get(new, 0) > priority.get(current, 0)


"""Gateway API schemas."""

from pydantic import BaseModel, Field
from typing import Optional, Literal, Any
from datetime import datetime
from enum import Enum


class PolicyScope(str, Enum):
    """Policy scope types."""

    LLM_INPUT = "llm.input"
    LLM_OUTPUT = "llm.output"
    TOOL_CALL = "tool.call"
    TOOL_RESULT = "tool.result"
    DATA_ACCESS = "data.access"


class ActionType(str, Enum):
    """Policy action types."""

    ALLOW = "allow"
    BLOCK = "block"
    REDACT = "redact"
    REWRITE = "rewrite"
    ROUTE = "route"
    ESCALATE = "escalate"
    LOG_ONLY = "log_only"


class ContentPayload(BaseModel):
    """Content being evaluated."""

    text: Optional[str] = None
    model: Optional[str] = None
    tool_name: Optional[str] = None
    tool_args: Optional[dict[str, Any]] = None
    tokens: Optional[int] = None
    messages: Optional[list[dict[str, Any]]] = None  # For chat format


class EvaluateRequest(BaseModel):
    """Request to evaluate content against policies."""

    # Identity (required)
    app_id: str = Field(..., description="Registered application ID")

    # Context (optional but recommended)
    env: Optional[str] = Field("prod", description="Environment name")
    user_id: Optional[str] = Field(None, description="End user identifier")
    session_id: Optional[str] = Field(None, description="Session/conversation ID")
    team_id: Optional[str] = Field(None, description="Team identifier")

    # Content (required)
    scope: PolicyScope = Field(..., description="What type of content")
    content: ContentPayload = Field(..., description="Content to evaluate")

    # Options
    trace_id: Optional[str] = Field(None, description="Custom trace ID")
    dry_run: bool = Field(False, description="Log only, don't enforce")
    metadata: Optional[dict[str, Any]] = None


class CheckResult(BaseModel):
    """Result from a single check."""

    check_name: str
    status: Literal["pass", "fail", "error", "skip"]
    score: Optional[float] = Field(None, ge=0, le=1)
    message: Optional[str] = None
    evidence: Optional[dict[str, Any]] = None
    latency_ms: int


class PolicyDecision(BaseModel):
    """Decision from policy evaluation."""

    policy_id: str
    policy_name: str
    policy_version: int
    action: ActionType
    reason: str
    checks: list[CheckResult]


class EvaluateResponse(BaseModel):
    """Response from policy evaluation."""

    # Identification
    trace_id: str
    request_id: str

    # Decision
    action: ActionType
    reason: str

    # Details
    policies_evaluated: int
    policies_triggered: int
    decisions: list[PolicyDecision]

    # Modified content (if action is redact/rewrite)
    modified_content: Optional[ContentPayload] = None

    # Timing
    total_latency_ms: int
    timestamp: datetime


class InterceptRequest(BaseModel):
    """Request for full interception (input + call + output)."""

    # Same as EvaluateRequest
    app_id: str
    env: Optional[str] = "prod"
    user_id: Optional[str] = None
    session_id: Optional[str] = None

    # Input content
    input: ContentPayload

    # Call configuration
    provider: Literal["openai", "anthropic", "azure", "custom"]
    endpoint: Optional[str] = None  # For custom provider
    call_config: dict[str, Any]  # Provider-specific config

    # Options
    trace_id: Optional[str] = None
    timeout_ms: int = 30000
    metadata: Optional[dict[str, Any]] = None


class InterceptResponse(BaseModel):
    """Response from full interception."""

    trace_id: str

    # Input evaluation
    input_decision: EvaluateResponse

    # Call result (if input was allowed)
    call_executed: bool
    call_response: Optional[dict[str, Any]] = None
    call_error: Optional[str] = None
    call_latency_ms: Optional[int] = None

    # Output evaluation (if call succeeded)
    output_decision: Optional[EvaluateResponse] = None

    # Final result
    final_action: ActionType
    final_content: Optional[ContentPayload] = None

    total_latency_ms: int


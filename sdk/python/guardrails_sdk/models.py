"""SDK data models and schemas."""

from __future__ import annotations

from typing import Optional, Any, Literal, TypeVar, Generic
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


T = TypeVar("T")


class PolicyScope(str, Enum):
    """Policy scope types."""

    LLM_INPUT = "llm.input"
    LLM_OUTPUT = "llm.output"
    TOOL_CALL = "tool.call"
    TOOL_RESULT = "tool.result"
    DATA_ACCESS = "data.access"
    ALL = "all"


class ActionType(str, Enum):
    """Action types from policy evaluation."""

    ALLOW = "allow"
    BLOCK = "block"
    REDACT = "redact"
    REWRITE = "rewrite"
    ROUTE = "route"
    ESCALATE = "escalate"
    LOG_ONLY = "log_only"


@dataclass
class ContentPayload:
    """Content being evaluated."""

    text: Optional[str] = None
    model: Optional[str] = None
    tool_name: Optional[str] = None
    tool_args: Optional[dict[str, Any]] = None
    tokens: Optional[int] = None
    messages: Optional[list[dict[str, Any]]] = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        result: dict[str, Any] = {}
        if self.text is not None:
            result["text"] = self.text
        if self.model is not None:
            result["model"] = self.model
        if self.tool_name is not None:
            result["tool_name"] = self.tool_name
        if self.tool_args is not None:
            result["tool_args"] = self.tool_args
        if self.tokens is not None:
            result["tokens"] = self.tokens
        if self.messages is not None:
            result["messages"] = self.messages
        return result

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ContentPayload":
        """Create from dictionary."""
        return cls(
            text=data.get("text"),
            model=data.get("model"),
            tool_name=data.get("tool_name"),
            tool_args=data.get("tool_args"),
            tokens=data.get("tokens"),
            messages=data.get("messages"),
        )


@dataclass
class CheckResult:
    """Result from a single check."""

    check_name: str
    status: Literal["pass", "fail", "error", "skip"]
    score: Optional[float] = None
    message: Optional[str] = None
    evidence: Optional[dict[str, Any]] = None
    latency_ms: int = 0

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        result: dict[str, Any] = {
            "check_name": self.check_name,
            "status": self.status,
            "latency_ms": self.latency_ms,
        }
        if self.score is not None:
            result["score"] = self.score
        if self.message is not None:
            result["message"] = self.message
        if self.evidence is not None:
            result["evidence"] = self.evidence
        return result

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "CheckResult":
        """Create from dictionary."""
        return cls(
            check_name=data["check_name"],
            status=data["status"],
            score=data.get("score"),
            message=data.get("message"),
            evidence=data.get("evidence"),
            latency_ms=data.get("latency_ms", 0),
        )


@dataclass
class PolicyDecision:
    """Decision from policy evaluation."""

    policy_id: str
    policy_name: str
    policy_version: int
    action: str
    reason: str
    checks: list[CheckResult] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "policy_id": self.policy_id,
            "policy_name": self.policy_name,
            "policy_version": self.policy_version,
            "action": self.action,
            "reason": self.reason,
            "checks": [check.to_dict() for check in self.checks],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "PolicyDecision":
        """Create from dictionary."""
        return cls(
            policy_id=data["policy_id"],
            policy_name=data["policy_name"],
            policy_version=data["policy_version"],
            action=data["action"],
            reason=data["reason"],
            checks=[
                CheckResult.from_dict(check_data)
                for check_data in data.get("checks", [])
            ],
        )


@dataclass
class EvaluateRequest:
    """Request to evaluate content against policies."""

    app_id: str
    scope: str
    content: ContentPayload
    env: str = "prod"
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    trace_id: Optional[str] = None
    dry_run: bool = False
    metadata: Optional[dict[str, Any]] = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        result: dict[str, Any] = {
            "app_id": self.app_id,
            "env": self.env,
            "scope": self.scope,
            "content": self.content.to_dict(),
            "dry_run": self.dry_run,
        }
        if self.user_id is not None:
            result["user_id"] = self.user_id
        if self.session_id is not None:
            result["session_id"] = self.session_id
        if self.trace_id is not None:
            result["trace_id"] = self.trace_id
        if self.metadata is not None:
            result["metadata"] = self.metadata
        return result


@dataclass
class EvaluateResponse:
    """Response from policy evaluation."""

    trace_id: str
    request_id: str
    action: str
    reason: str
    policies_evaluated: int
    policies_triggered: int
    decisions: list[PolicyDecision] = field(default_factory=list)
    modified_content: Optional[ContentPayload] = None
    total_latency_ms: int = 0
    timestamp: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        result: dict[str, Any] = {
            "trace_id": self.trace_id,
            "request_id": self.request_id,
            "action": self.action,
            "reason": self.reason,
            "policies_evaluated": self.policies_evaluated,
            "policies_triggered": self.policies_triggered,
            "decisions": [decision.to_dict() for decision in self.decisions],
            "total_latency_ms": self.total_latency_ms,
        }
        if self.modified_content is not None:
            result["modified_content"] = self.modified_content.to_dict()
        if self.timestamp is not None:
            result["timestamp"] = self.timestamp
        return result

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "EvaluateResponse":
        """Create from dictionary."""
        return cls(
            trace_id=data["trace_id"],
            request_id=data["request_id"],
            action=data["action"],
            reason=data["reason"],
            policies_evaluated=data.get("policies_evaluated", 0),
            policies_triggered=data.get("policies_triggered", 0),
            decisions=[
                PolicyDecision.from_dict(decision_data)
                for decision_data in data.get("decisions", [])
            ],
            modified_content=(
                ContentPayload.from_dict(data["modified_content"])
                if data.get("modified_content")
                else None
            ),
            total_latency_ms=data.get("total_latency_ms", 0),
            timestamp=data.get("timestamp"),
        )


@dataclass
class InterceptResult(Generic[T]):
    """Result from wrapping an LLM call."""

    response: Optional[T] = None
    blocked: bool = False
    error: Optional[str] = None
    input_decision: Optional[EvaluateResponse] = None
    output_decision: Optional[EvaluateResponse] = None
    modified: bool = False


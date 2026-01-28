"""Base classes for check plugins."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional
from datetime import datetime, timezone


@dataclass
class CheckPayload:
    """Payload passed to a check for evaluation."""

    text: Optional[str] = None
    model: Optional[str] = None
    tool_name: Optional[str] = None
    tool_args: Optional[dict[str, Any]] = None
    tokens: Optional[int] = None
    messages: Optional[list[dict[str, Any]]] = None  # For chat format
    metadata: Optional[dict[str, Any]] = None


@dataclass
class CheckResult:
    """Result from a check execution."""

    check_name: str
    status: str  # "pass", "fail", "error", "skip"
    score: Optional[float] = None  # 0.0 to 1.0
    message: Optional[str] = None
    evidence: Optional[dict[str, Any]] = None
    latency_ms: int = 0
    timestamp: datetime = None

    def __post_init__(self):
        """Set timestamp if not provided."""
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)


class Check(ABC):
    """
    Abstract base class for check plugins.

    Checks are pluggable components that evaluate content for specific
    conditions (PII detection, toxicity, prompt injection, etc.).

    Each check must:
    - Have a unique name and version
    - Implement the run() method
    - Return a CheckResult
    """

    name: str
    version: str
    description: str
    scope: list[str]  # ["llm.input", "llm.output", "tool.call", etc.]

    @abstractmethod
    async def run(self, payload: CheckPayload) -> CheckResult:
        """
        Execute the check against the payload.

        Args:
            payload: Content and metadata to check

        Returns:
            CheckResult with status, score, and evidence
        """
        pass

    def __repr__(self) -> str:
        """String representation."""
        return f"<Check {self.name} v{self.version}>"


"""
Action executor: block / redact / allow / rewrite.

Executes policy actions on content. Actions are pure transformations
- no infrastructure dependencies.
"""

from typing import Any, Dict, Optional
from app.schemas.gateway import ActionType, ContentPayload


class ActionExecutor:
    """
    Executes policy actions on content.

    Actions are pure transformations - no infrastructure awareness.
    """

    @staticmethod
    def execute(
        action: ActionType,
        content: ContentPayload,
        action_config: Optional[Dict[str, Any]] = None,
    ) -> ContentPayload:
        """
        Execute action on content.

        Args:
            action: Action to execute
            content: Content to modify
            action_config: Optional configuration for the action

        Returns:
            Modified ContentPayload (or original if action is ALLOW)
        """
        action_config = action_config or {}

        if action == ActionType.ALLOW:
            return content

        elif action == ActionType.BLOCK:
            # Block: return empty content
            return ContentPayload(
                text="",
                model=content.model,
                tool_name=content.tool_name,
                tool_args=content.tool_args,
                tokens=0,
                messages=[],
            )

        elif action == ActionType.REDACT:
            return ActionExecutor._redact(content, action_config)

        elif action == ActionType.REWRITE:
            return ActionExecutor._rewrite(content, action_config)

        elif action == ActionType.LOG_ONLY:
            # Log only: return original content
            return content

        elif action == ActionType.ROUTE:
            # Route: return original (routing handled elsewhere)
            return content

        elif action == ActionType.ESCALATE:
            # Escalate: return original (escalation handled elsewhere)
            return content

        # Default: allow
        return content

    @staticmethod
    def _redact(
        content: ContentPayload,
        config: Dict[str, Any],
    ) -> ContentPayload:
        """
        Redact sensitive information from content.

        Args:
            content: Content to redact
            config: Redaction configuration

        Returns:
            Redacted ContentPayload
        """
        text = content.text or ""
        redaction_char = config.get("char", "█")
        patterns = config.get("patterns", [])

        # Simple redaction (will be enhanced with actual pattern matching)
        for pattern in patterns:
            # Placeholder: actual implementation will use regex/ML
            if pattern in text:
                text = text.replace(pattern, redaction_char * len(pattern))

        return ContentPayload(
            text=text,
            model=content.model,
            tool_name=content.tool_name,
            tool_args=content.tool_args,
            tokens=content.tokens,
            messages=content.messages,
        )

    @staticmethod
    def _rewrite(
        content: ContentPayload,
        config: Dict[str, Any],
    ) -> ContentPayload:
        """
        Rewrite content according to policy.

        Args:
            content: Content to rewrite
            config: Rewrite configuration

        Returns:
            Rewritten ContentPayload
        """
        text = content.text or ""
        rewrite_template = config.get("template", "")

        # Simple rewrite (will be enhanced with actual LLM rewriting)
        if rewrite_template:
            text = rewrite_template.format(original=text)

        return ContentPayload(
            text=text,
            model=content.model,
            tool_name=content.tool_name,
            tool_args=content.tool_args,
            tokens=content.tokens,
            messages=content.messages,
        )


def execute_action(
    action: ActionType,
    content: ContentPayload,
    action_config: Optional[Dict[str, Any]] = None,
) -> ContentPayload:
    """
    Convenience function to execute an action.

    Args:
        action: Action to execute
        content: Content to modify
        action_config: Optional configuration

    Returns:
        Modified ContentPayload
    """
    return ActionExecutor.execute(action, content, action_config)


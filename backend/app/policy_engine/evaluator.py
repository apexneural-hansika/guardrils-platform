"""
Policy evaluator: AST + signals → decisions.

Evaluates policy AST against check results and context to determine
the appropriate action (allow, block, redact, rewrite, etc.).
"""

from typing import Any, Dict, List, Optional
from app.policy_engine.parser import PolicyAST
from app.checks.base import CheckResult
from app.schemas.gateway import ActionType


class PolicyEvaluator:
    """
    Evaluates policies against check results and context.

    Takes policy AST and check results, evaluates conditions,
    and determines the appropriate action.
    """

    def __init__(self, ast: PolicyAST):
        """
        Initialize evaluator with policy AST.

        Args:
            ast: Policy AST to evaluate
        """
        self.ast = ast

    def evaluate(
        self,
        scope: str,
        check_results: List[CheckResult],
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate policies against check results.

        Args:
            scope: Policy scope (e.g., "llm.input", "llm.output")
            check_results: Results from check execution
            context: Additional context (user_id, session_id, etc.)

        Returns:
            Dictionary with:
            - action: ActionType
            - reason: str
            - triggered_policies: list of policy names
            - confidence: float (0.0 to 1.0)
        """
        context = context or {}
        triggered_policies = []
        action = ActionType.ALLOW
        reason = "No policies triggered"
        max_confidence = 0.0

        # Evaluate each policy
        for policy_name, policy_data in self.ast.policies.items():
            # Check if policy applies to this scope
            policy_scope = policy_data.get("scope", "all")
            if policy_scope != "all" and policy_scope != scope:
                continue

            # Evaluate policy conditions
            if self._evaluate_conditions(policy_data, check_results, context):
                triggered_policies.append(policy_name)

                # Determine action (most restrictive wins)
                policy_action = self._get_action(policy_data)
                if self._is_more_restrictive(policy_action, action):
                    action = policy_action
                    reason = policy_data.get("reason", f"Policy '{policy_name}' triggered")

                # Track confidence
                confidence = policy_data.get("confidence", 0.5)
                max_confidence = max(max_confidence, confidence)

        return {
            "action": action,
            "reason": reason,
            "triggered_policies": triggered_policies,
            "confidence": max_confidence,
        }

    def _evaluate_conditions(
        self,
        policy_data: Dict[str, Any],
        check_results: List[CheckResult],
        context: Dict[str, Any],
    ) -> bool:
        """
        Evaluate policy conditions against check results.

        Args:
            policy_data: Policy definition
            check_results: Check execution results
            context: Additional context

        Returns:
            True if policy conditions are met
        """
        conditions = policy_data.get("conditions", [])

        # If no conditions, policy always applies
        if not conditions:
            return True

        # Evaluate each condition
        for condition in conditions:
            if not self._evaluate_condition(condition, check_results, context):
                return False

        return True

    def _evaluate_condition(
        self,
        condition: Dict[str, Any],
        check_results: List[CheckResult],
        context: Dict[str, Any],
    ) -> bool:
        """
        Evaluate a single condition.

        Args:
            condition: Condition definition
            check_results: Check execution results
            context: Additional context

        Returns:
            True if condition is met
        """
        condition_type = condition.get("type")

        if condition_type == "check_failed":
            check_name = condition.get("check")
            for result in check_results:
                if result.check_name == check_name and result.status == "fail":
                    return True
            return False

        elif condition_type == "check_score_above":
            check_name = condition.get("check")
            threshold = condition.get("threshold", 0.5)
            for result in check_results:
                if result.check_name == check_name and result.score and result.score > threshold:
                    return True
            return False

        elif condition_type == "context_match":
            key = condition.get("key")
            value = condition.get("value")
            return context.get(key) == value

        # Default: condition not met
        return False

    def _get_action(self, policy_data: Dict[str, Any]) -> ActionType:
        """
        Extract action from policy data.

        Args:
            policy_data: Policy definition

        Returns:
            ActionType
        """
        action_str = policy_data.get("action", "allow")
        try:
            return ActionType(action_str.lower())
        except ValueError:
            return ActionType.ALLOW

    def _is_more_restrictive(self, new: ActionType, current: ActionType) -> bool:
        """
        Determine if new action is more restrictive than current.

        Args:
            new: New action
            current: Current action

        Returns:
            True if new is more restrictive
        """
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


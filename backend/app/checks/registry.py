"""Check registry for plugin discovery and management."""

from typing import Dict, Type, Optional
from app.checks.base import Check


class CheckRegistry:
    """
    Registry for check plugins.

    Allows dynamic registration and discovery of checks by name or scope.
    """

    def __init__(self):
        """Initialize empty registry."""
        self._checks: Dict[str, Type[Check]] = {}

    def register(self, check_class: Type[Check]) -> None:
        """
        Register a check class.

        Args:
            check_class: Check class to register

        Raises:
            ValueError: If check name already registered
        """
        check_instance = check_class()
        if check_instance.name in self._checks:
            raise ValueError(
                f"Check '{check_instance.name}' already registered. "
                f"Use a different name or unregister first."
            )
        self._checks[check_instance.name] = check_class

    def unregister(self, name: str) -> None:
        """
        Unregister a check by name.

        Args:
            name: Check name to unregister
        """
        if name in self._checks:
            del self._checks[name]

    def get(self, name: str) -> Optional[Type[Check]]:
        """
        Get a check class by name.

        Args:
            name: Check name

        Returns:
            Check class or None if not found
        """
        return self._checks.get(name)

    def get_all(self) -> Dict[str, Type[Check]]:
        """
        Get all registered checks.

        Returns:
            Dictionary of check name -> check class
        """
        return self._checks.copy()

    def get_by_scope(self, scope: str) -> list[Type[Check]]:
        """
        Get all checks that support a given scope.

        Args:
            scope: Policy scope (e.g., "llm.input", "llm.output")

        Returns:
            List of check classes that support the scope
        """
        matching = []
        for check_class in self._checks.values():
            check_instance = check_class()
            if scope in check_instance.scope or "all" in check_instance.scope:
                matching.append(check_class)
        return matching

    def list_names(self) -> list[str]:
        """
        List all registered check names.

        Returns:
            List of check names
        """
        return list(self._checks.keys())


# Global registry instance
_registry: Optional[CheckRegistry] = None


def get_check_registry() -> CheckRegistry:
    """
    Get the global check registry instance.

    Returns:
        CheckRegistry singleton
    """
    global _registry
    if _registry is None:
        _registry = CheckRegistry()
    return _registry


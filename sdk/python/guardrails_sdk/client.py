"""Synchronous Guardrails SDK client."""

from __future__ import annotations

from typing import Optional, Any, Callable, TypeVar
from dataclasses import dataclass
import httpx

from .models import (
    EvaluateRequest,
    EvaluateResponse,
    InterceptResult,
    ContentPayload,
)
from .exceptions import (
    GuardrailsError,
    BlockedError,
    RateLimitError,
    NetworkError,
    TimeoutError,
)

T = TypeVar("T")


@dataclass
class GuardrailsConfig:
    """SDK configuration."""

    api_key: str
    app_id: str
    base_url: str = "https://api.guardrails.dev"
    timeout: float = 30.0
    env: str = "prod"
    default_user_id: Optional[str] = None


class GuardrailsClient:
    """
    Guardrails SDK client for Python (synchronous).

    Usage:
        client = GuardrailsClient(
            api_key="your-api-key",
            app_id="your-app-id"
        )

        # Simple evaluation
        result = client.evaluate(
            text="Hello, my SSN is 123-45-6789",
            scope="llm.output"
        )

        # Wrap an LLM call
        response = client.wrap(
            input_text=user_prompt,
            call=lambda: openai.chat.completions.create(...)
        )
    """

    def __init__(
        self,
        api_key: str,
        app_id: str,
        base_url: str = "https://api.guardrails.dev",
        timeout: float = 30.0,
        env: str = "prod",
    ):
        """
        Initialize the Guardrails client.

        Args:
            api_key: Your Guardrails API key
            app_id: Your application ID
            base_url: Base URL for the Guardrails API (default: production)
            timeout: Request timeout in seconds (default: 30.0)
            env: Environment name (default: "prod")
        """
        if not api_key:
            raise ValueError("api_key is required")
        if not app_id:
            raise ValueError("app_id is required")

        self.config = GuardrailsConfig(
            api_key=api_key,
            app_id=app_id,
            base_url=base_url,
            timeout=timeout,
            env=env,
        )

        self._client = httpx.Client(
            base_url=f"{base_url}/v1",
            headers={
                "X-API-Key": api_key,
                "Content-Type": "application/json",
            },
            timeout=timeout,
        )

    def evaluate(
        self,
        text: str,
        scope: str = "llm.output",
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
        dry_run: bool = False,
    ) -> EvaluateResponse:
        """
        Evaluate text against policies.

        Args:
            text: Content to evaluate
            scope: Policy scope (llm.input, llm.output, etc.)
            user_id: Optional user identifier
            session_id: Optional session identifier
            metadata: Optional metadata dict
            dry_run: If True, log but don't enforce

        Returns:
            EvaluateResponse with decision and details

        Raises:
            BlockedError: If request is blocked
            RateLimitError: If rate limit is exceeded
            NetworkError: If network error occurs
            TimeoutError: If request times out
            GuardrailsError: For other API errors
        """
        request = EvaluateRequest(
            app_id=self.config.app_id,
            env=self.config.env,
            scope=scope,
            content=ContentPayload(text=text),
            user_id=user_id or self.config.default_user_id,
            session_id=session_id,
            metadata=metadata,
            dry_run=dry_run,
        )

        try:
            response = self._client.post(
                "/gateway/evaluate",
                json=request.to_dict(),
            )
            self._handle_response(response)
            return EvaluateResponse.from_dict(response.json())
        except httpx.TimeoutException as e:
            raise TimeoutError(f"Request timeout: {str(e)}")
        except httpx.NetworkError as e:
            raise NetworkError(f"Network error: {str(e)}")
        except httpx.HTTPError as e:
            raise GuardrailsError(f"HTTP error: {str(e)}")

    def wrap(
        self,
        input_text: str,
        call: Callable[[], T],
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
        on_block: Optional[Callable[[EvaluateResponse], T]] = None,
    ) -> InterceptResult[T]:
        """
        Wrap an LLM call with guardrails.

        1. Evaluates input
        2. If allowed, executes the call
        3. Evaluates output
        4. Returns result (possibly modified)

        Args:
            input_text: Input to the LLM
            call: Function that makes the actual LLM call
            user_id: Optional user identifier
            session_id: Optional session identifier
            metadata: Optional metadata
            on_block: Handler for blocked requests

        Returns:
            InterceptResult containing response and metadata

        Raises:
            BlockedError: If input is blocked and on_block is not provided
        """
        user_id = user_id or self.config.default_user_id

        # Evaluate input
        input_result = self.evaluate(
            text=input_text,
            scope="llm.input",
            user_id=user_id,
            session_id=session_id,
            metadata=metadata,
        )

        if input_result.action == "block":
            if on_block:
                return InterceptResult(
                    response=on_block(input_result),
                    blocked=True,
                    input_decision=input_result,
                )
            raise BlockedError(
                f"Request blocked: {input_result.reason}",
                decision=input_result,
            )

        # Execute the call
        try:
            response = call()
        except Exception as e:
            return InterceptResult(
                response=None,
                error=str(e),
                input_decision=input_result,
            )

        # Extract output text
        output_text = self._extract_text(response)

        # Evaluate output
        output_result = self.evaluate(
            text=output_text,
            scope="llm.output",
            user_id=user_id,
            session_id=session_id,
            metadata=metadata,
        )

        # Apply modifications if needed
        final_response = response
        if output_result.action in ["redact", "rewrite"] and output_result.modified_content:
            final_response = self._apply_modification(
                response, output_result.modified_content
            )

        return InterceptResult(
            response=final_response,
            input_decision=input_result,
            output_decision=output_result,
            modified=output_result.action in ["redact", "rewrite"],
        )

    def _handle_response(self, response: httpx.Response) -> None:
        """Handle HTTP response and raise appropriate errors."""
        if response.status_code == 429:
            raise RateLimitError("Rate limit exceeded")

        if response.status_code == 401:
            raise GuardrailsError(
                "Authentication failed",
                code="AUTH_ERROR",
            )

        if response.status_code >= 400:
            try:
                error_data = response.json()
                message = error_data.get("detail") or error_data.get("message", "Unknown error")
            except Exception:
                message = response.text or "Unknown error"

            raise GuardrailsError(
                f"API error ({response.status_code}): {message}",
            )

    def _extract_text(self, response: Any) -> str:
        """Extract text from various LLM response formats."""
        # OpenAI format
        if hasattr(response, "choices"):
            return response.choices[0].message.content

        # Anthropic format
        if hasattr(response, "content"):
            if isinstance(response.content, list):
                return response.content[0].text
            return response.content

        # String
        if isinstance(response, str):
            return response

        # Dict
        if isinstance(response, dict):
            return response.get("text") or response.get("content") or str(response)

        return str(response)

    def _apply_modification(self, response: Any, modified: ContentPayload) -> Any:
        """
        Apply content modification to response based on response type.

        Args:
            response: Original LLM response (various formats)
            modified: Modified content from Guardrails

        Returns:
            Response with modified content applied
        """
        if not modified or not modified.text:
            return response

        modified_text = modified.text

        # OpenAI format (object with choices attribute)
        if hasattr(response, "choices"):
            # Create a copy-like structure
            if isinstance(response, dict):
                result = response.copy()
                if result.get("choices") and len(result["choices"]) > 0:
                    result["choices"][0]["message"]["content"] = modified_text
                return result
            else:
                # Object with attributes - try to modify in place if possible
                # For immutable objects, return modified dict representation
                if hasattr(response, "__dict__"):
                    # Create a dict representation
                    result = {
                        "choices": [
                            {
                                "message": {
                                    "content": modified_text,
                                    "role": getattr(
                                        response.choices[0].message, "role", "assistant"
                                    ),
                                }
                            }
                        ]
                    }
                    # Preserve other attributes if they exist
                    if hasattr(response, "id"):
                        result["id"] = response.id
                    if hasattr(response, "model"):
                        result["model"] = response.model
                    if hasattr(response, "created"):
                        result["created"] = response.created
                    return result

        # Anthropic format (object with content attribute)
        if hasattr(response, "content"):
            if isinstance(response, dict):
                result = response.copy()
                if isinstance(result.get("content"), list):
                    # Update first text content block
                    for item in result["content"]:
                        if item.get("type") == "text":
                            item["text"] = modified_text
                            break
                else:
                    result["content"] = modified_text
                return result
            else:
                # Object with attributes
                if isinstance(response.content, list):
                    # Find and update text content
                    new_content = []
                    text_updated = False
                    for item in response.content:
                        if hasattr(item, "type") and item.type == "text" and not text_updated:
                            # Create new text block with modified content
                            new_item = {"type": "text", "text": modified_text}
                            new_content.append(new_item)
                            text_updated = True
                        else:
                            # Preserve other content blocks
                            if isinstance(item, dict):
                                new_content.append(item)
                            else:
                                new_content.append(
                                    {"type": getattr(item, "type", "text"), "text": str(item)}
                                )
                    return {"content": new_content}
                else:
                    return {"content": modified_text}

        # String response
        if isinstance(response, str):
            return modified_text

        # Dict response
        if isinstance(response, dict):
            result = response.copy()
            # Try common keys
            if "text" in result:
                result["text"] = modified_text
            elif "content" in result:
                result["content"] = modified_text
            elif "message" in result:
                if isinstance(result["message"], dict):
                    result["message"]["content"] = modified_text
                else:
                    result["message"] = modified_text
            else:
                # Add text key if no standard key found
                result["text"] = modified_text
            return result

        # Fallback: return modified text as string
        return modified_text

    def close(self) -> None:
        """Close the client and release resources."""
        self._client.close()

    def __enter__(self) -> "GuardrailsClient":
        """Context manager entry."""
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Context manager exit."""
        self.close()


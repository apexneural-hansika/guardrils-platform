"""Basic usage examples for Guardrails SDK."""

from guardrails_sdk import GuardrailsClient, BlockedError, RateLimitError


def example_evaluate():
    """Example: Evaluate content."""
    client = GuardrailsClient(
        api_key="your-api-key",
        app_id="your-app-id",
    )

    # Evaluate text
    result = client.evaluate(
        text="Hello, my email is john@example.com",
        scope="llm.output",
        user_id="user123",
    )

    print(f"Action: {result.action}")
    print(f"Reason: {result.reason}")
    print(f"Policies evaluated: {result.policies_evaluated}")

    if result.action == "block":
        print("Content was blocked!")
    elif result.action == "redact" and result.modified_content:
        print(f"Redacted content: {result.modified_content.text}")


def example_wrap_llm_call():
    """Example: Wrap an LLM call."""
    client = GuardrailsClient(
        api_key="your-api-key",
        app_id="your-app-id",
    )

    # Simulate an LLM call
    def mock_llm_call():
        return {
            "choices": [
                {
                    "message": {
                        "content": "Your account balance is $1,000. Your SSN is 123-45-6789."
                    }
                }
            ]
        }

    try:
        result = client.wrap(
            input_text="What's my account balance?",
            call=mock_llm_call,
            user_id="user123",
        )

        if result.blocked:
            print("Request was blocked")
        elif result.modified:
            print(f"Response was modified: {result.response}")
        else:
            print(f"Response: {result.response}")

    except BlockedError as e:
        print(f"Blocked: {e.message}")
        if e.decision:
            print(f"Reason: {e.decision.reason}")


def example_error_handling():
    """Example: Error handling."""
    client = GuardrailsClient(
        api_key="your-api-key",
        app_id="your-app-id",
    )

    try:
        result = client.evaluate(text="Hello", scope="llm.output")
    except BlockedError as e:
        print(f"Content blocked: {e.message}")
    except RateLimitError:
        print("Rate limit exceeded, please retry later")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    print("Guardrails SDK Examples")
    print("=" * 50)
    print("\nNote: These examples require a valid API key and app ID.")
    print("Replace 'your-api-key' and 'your-app-id' with your actual credentials.\n")


#!/usr/bin/env python3
"""Simple script to test backend endpoints and SDK."""

import sys
import httpx
from pathlib import Path

# Add SDK to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from guardrails_sdk import GuardrailsClient, AsyncGuardrailsClient
    SDK_AVAILABLE = True
except (ImportError, TypeError) as e:
    SDK_AVAILABLE = False
    print(f"⚠️  SDK not available: {e}")
    print("   Install with: cd sdk/python && pip install -e .")


BASE_URL = "http://localhost:8000"


def test_backend_endpoints():
    """Test all available backend endpoints."""
    print("🧪 Testing Backend Endpoints")
    print("=" * 50)
    
    endpoints = [
        ("GET", "/", "Root endpoint"),
        ("GET", "/health", "Health check"),
        ("GET", "/v1/health", "V1 health check"),
        ("GET", "/v1/health/db", "Database health"),
        ("GET", "/v1/health/redis", "Redis health"),
    ]
    
    results = []
    
    for method, endpoint, description in endpoints:
        try:
            url = f"{BASE_URL}{endpoint}"
            response = httpx.get(url, timeout=5.0)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {method} {endpoint}")
                print(f"   {description}")
                print(f"   Response: {data}")
                results.append(("✅", endpoint, "PASS"))
            else:
                print(f"❌ {method} {endpoint}")
                print(f"   Status: {response.status_code}")
                results.append(("❌", endpoint, f"FAIL ({response.status_code})"))
        except httpx.ConnectError:
            print(f"❌ {method} {endpoint}")
            print(f"   ERROR: Cannot connect to {BASE_URL}")
            print(f"   Make sure backend is running: uvicorn app.main:app --reload")
            results.append(("❌", endpoint, "CONNECTION ERROR"))
        except Exception as e:
            print(f"❌ {method} {endpoint}")
            print(f"   ERROR: {str(e)}")
            results.append(("❌", endpoint, f"ERROR: {str(e)}"))
        
        print()
    
    return results


def test_sdk_basic():
    """Test SDK basic functionality."""
    if not SDK_AVAILABLE:
        print("\n⏭️  Skipping SDK tests (SDK not available)")
        return []
    
    print("\n🧪 Testing SDK")
    print("=" * 50)
    
    results = []
    
    try:
        # Test client initialization
        client = GuardrailsClient(
            api_key="test-api-key",
            app_id="test-app-id",
            base_url=BASE_URL,
            timeout=5.0,
        )
        print("✅ SDK client initialized")
        print(f"   Base URL: {client.config.base_url}")
        print(f"   App ID: {client.config.app_id}")
        results.append(("✅", "SDK Init", "PASS"))
    except Exception as e:
        print(f"❌ SDK client initialization failed: {e}")
        results.append(("❌", "SDK Init", f"ERROR: {str(e)}"))
    
    # Test evaluate (will fail until gateway is implemented)
    try:
        result = client.evaluate(
            text="Hello world",
            scope="llm.output",
        )
        print("✅ SDK evaluate() works")
        results.append(("✅", "SDK Evaluate", "PASS"))
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg or "gateway" in error_msg.lower():
            print("⏳ SDK evaluate() - Gateway endpoint not implemented yet")
            print(f"   Expected error: {error_msg}")
            results.append(("⏳", "SDK Evaluate", "NOT IMPLEMENTED"))
        else:
            print(f"❌ SDK evaluate() failed: {e}")
            results.append(("❌", "SDK Evaluate", f"ERROR: {str(e)}"))
    
    return results


def main():
    """Run all tests."""
    print("\n" + "=" * 50)
    print("Guardrails SDK - Endpoint Testing")
    print("=" * 50)
    print(f"Backend URL: {BASE_URL}\n")
    
    # Test backend endpoints
    endpoint_results = test_backend_endpoints()
    
    # Test SDK
    sdk_results = test_sdk_basic()
    
    # Summary
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    
    all_results = endpoint_results + sdk_results
    passed = sum(1 for status, _, _ in all_results if status == "✅")
    failed = sum(1 for status, _, _ in all_results if status == "❌")
    pending = sum(1 for status, _, _ in all_results if status == "⏳")
    
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⏳ Pending: {pending}")
    print(f"📊 Total: {len(all_results)}")
    
    # Check if failures are just due to backend not running
    backend_not_running = all(
        "Cannot connect" in str(result[2]) or "Connection refused" in str(result[2])
        for status, endpoint, result in endpoint_results
        if status == "❌"
    )
    
    if failed > 0:
        if backend_not_running:
            print("\n⚠️  Tests failed because backend is not running.")
            print("   Start backend with: cd ../../backend && uvicorn app.main:app --reload")
            print("   Then run this script again.")
        else:
            print("\n❌ Some tests failed. Check the output above.")
        sys.exit(1)
    elif pending > 0:
        print("\n⏳ Some features are not yet implemented (expected).")
        sys.exit(0)
    else:
        print("\n✅ All tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()


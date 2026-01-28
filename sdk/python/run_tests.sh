#!/bin/bash
# Quick test runner script for Guardrails SDK

set -e

echo "🧪 Running Guardrails SDK Tests"
echo "================================"
echo ""

# Check if backend is running
echo "📡 Checking if backend is running..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8000"
    RUN_INTEGRATION=true
else
    echo "⚠️  Backend is not running. Skipping integration tests."
    echo "   Start backend with: cd ../../backend && uvicorn app.main:app --reload"
    RUN_INTEGRATION=false
fi

echo ""
echo "🔬 Running unit tests..."
pytest tests/test_client.py tests/test_async_client.py -v

if [ "$RUN_INTEGRATION" = true ]; then
    echo ""
    echo "🔗 Running integration tests..."
    pytest tests/test_integration.py -m integration -v
else
    echo ""
    echo "⏭️  Skipping integration tests (backend not running)"
fi

echo ""
echo "✅ Test run complete!"


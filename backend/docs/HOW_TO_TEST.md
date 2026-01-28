# How to Test and Verify - Quick Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Run All Tests

```bash
cd backend
pytest tests/ -v
```

**Expected:** 20+ tests passing ✅

### Step 2: Run Verification Script

```bash
cd backend
python verify_architecture.py
```

**Expected:** All components verified ✅

### Step 3: Start Backend and Test Endpoints

```bash
# Terminal 1: Start backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Test endpoints
curl http://localhost:8000/health
curl -X POST http://localhost:8000/v1/gateway/evaluate \
  -H "Content-Type: application/json" \
  -d '{"app_id": "test", "scope": "llm.output", "content": {"text": "Hello"}}'
```

**Expected:** Health returns 200, evaluate returns decision ✅

## 📋 What Gets Tested

### ✅ Check Executor
- Runs checks correctly
- Handles failures
- Enforces timeouts
- Filters by scope

### ✅ Policy Engine
- Parses YAML/JSON
- Validates structure
- Evaluates policies
- Executes actions

### ✅ Integration
- Full flow: Check → Policy → Action
- API endpoints
- Service layer

## 🎯 Verification Checklist

- [ ] All tests pass: `pytest tests/ -v`
- [ ] Verification script passes: `python verify_architecture.py`
- [ ] Backend starts: `uvicorn app.main:app --reload`
- [ ] Health endpoint works: `curl http://localhost:8000/health`
- [ ] No linting errors: `ruff check app/`

## 📚 Detailed Guide

See `backend/tests/TESTING_GUIDE.md` for comprehensive testing instructions.

## 🐛 Troubleshooting

**Tests fail?**
```bash
cd backend
export PYTHONPATH=$PWD:$PYTHONPATH
pytest tests/ -v
```

**Import errors?**
```bash
cd backend
pip install -e .
```

**Backend won't start?**
- Check database is running: `docker-compose -f docker-compose.dev.yml up -d postgres`
- Check environment variables: `cat backend/.env`

## ✅ Success Indicators

If you see:
- ✅ All tests passing
- ✅ Verification script shows "ALL TESTS PASSED"
- ✅ Backend starts without errors
- ✅ Health endpoint returns 200

**Then everything is working!** 🎉


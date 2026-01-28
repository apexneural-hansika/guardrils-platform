# 📦 What to Keep - Quick Reference

## ✅ KEEP ALL THESE FOLDERS & FILES

### Root Level
```
✅ README.md
✅ SETUP.md
✅ PROJECT_STRUCTURE.md
✅ KEEP_THIS.md
✅ Makefile
✅ .gitignore
✅ .env.example
✅ docker-compose.dev.yml
✅ spec.md
```

### backend/
```
✅ backend/pyproject.toml
✅ backend/requirements.txt
✅ backend/alembic.ini
✅ backend/alembic/
   ✅ env.py
   ✅ script.py.mako
   ✅ versions/ (folder - migrations go here)
✅ backend/app/
   ✅ __init__.py
   ✅ main.py
   ✅ config.py
   ✅ dependencies.py
   ✅ api/ (all files)
   ✅ core/ (all files)
   ✅ models/ (all files)
```

### frontend/
```
✅ frontend/package.json
✅ frontend/tsconfig.json
✅ frontend/tsconfig.node.json
✅ frontend/vite.config.ts
✅ frontend/tailwind.config.js
✅ frontend/postcss.config.js
✅ frontend/index.html
✅ frontend/.eslintrc.cjs
✅ frontend/src/ (all files)
```

### scripts/
```
✅ scripts/setup-env.py
✅ scripts/setup-env.sh
```

### Placeholder Folders (keep empty folders)
```
✅ sdk/ (will contain Python & TypeScript SDKs later)
✅ deploy/ (will contain Kubernetes & Terraform configs later)
✅ docs/ (will contain documentation later)
```

---

## ❌ DELETE/IGNORE THESE

### Virtual Environments (recreate locally)
```
❌ venv/ (in root - should be backend/venv/)
❌ backend/venv/ (recreate with: python -m venv venv)
❌ env/
❌ .venv/
```

### Python Cache
```
❌ __pycache__/ (anywhere)
❌ *.pyc
❌ *.pyo
```

### Node.js
```
❌ frontend/node_modules/ (reinstall with: npm install)
❌ frontend/dist/
❌ frontend/.vite/
```

### Environment Files (contains secrets!)
```
❌ .env (anywhere - use .env.example as template)
❌ backend/.env
❌ frontend/.env
❌ .env.local
```

### Cache & Build Artifacts
```
❌ .pytest_cache/
❌ .mypy_cache/
❌ .ruff_cache/
❌ *.egg-info/
❌ dist/
❌ build/
```

### IDE & OS Files
```
❌ .vscode/ (unless team settings)
❌ .idea/
❌ .DS_Store
❌ Thumbs.db
❌ *.swp, *.swo
```

### Logs
```
❌ *.log
❌ logs/
```

---

## 🎯 Current Issue: Root venv/

**You have `venv/` in the root directory - this should be deleted!**

Virtual environments should be:
- `backend/venv/` for backend Python
- Not in root

**To fix:**
```bash
# Delete root venv
rm -rf venv/

# Create proper backend venv
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📋 File Organization Rules

1. **Backend code** → `backend/app/`
2. **Frontend code** → `frontend/src/`
3. **Migrations** → `backend/alembic/versions/`
4. **Config files** → Root or respective folders
5. **Scripts** → `scripts/`
6. **Documentation** → Root or `docs/`
7. **Tests** → `backend/tests/` or `frontend/src/__tests__/`

---

## 🔍 Quick Check Commands

```bash
# See what's tracked by git
git ls-files

# See what's ignored
git status --ignored

# Check for large files
find . -type f -size +1M -not -path "./venv/*" -not -path "./node_modules/*"

# Find cache directories
find . -type d -name "__pycache__" -o -name ".pytest_cache" -o -name ".mypy_cache"
```

---

## ✅ Summary

**Keep:**
- All source code (`.py`, `.ts`, `.tsx`, `.js`, `.jsx`)
- All config files (`.toml`, `.json`, `.ini`, `.yaml`)
- All documentation (`.md`)
- Project structure

**Delete:**
- `venv/` in root (move to `backend/venv/`)
- All `__pycache__/` folders
- All `.env` files (keep `.env.example`)
- Cache directories

The `.gitignore` should handle most of this automatically!


.PHONY: help setup dev-up dev-down test backend-test frontend-test migrate migrate-create lint format clean

help:
	@echo "Guardrails Platform - Makefile Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup          - Initial project setup"
	@echo "  make dev-up         - Start development infrastructure (Postgres, Redis)"
	@echo "  make dev-down       - Stop development infrastructure"
	@echo ""
	@echo "Backend:"
	@echo "  make backend-test   - Run backend tests"
	@echo "  make migrate        - Run database migrations"
	@echo "  make migrate-create - Create new migration (use MESSAGE='description')"
	@echo ""
	@echo "Frontend:"
	@echo "  make frontend-test  - Run frontend tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint           - Run linters (backend + frontend)"
	@echo "  make format         - Format code (backend + frontend)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Clean generated files and caches"

setup:
	@echo "Setting up Guardrails Platform..."
	@python3 scripts/setup-env.py || echo "⚠ Could not run setup script. Create .env files manually."
	@cd backend && python -m venv venv
	@cd backend && . venv/bin/activate && pip install -r requirements.txt
	@cd frontend && npm install
	@echo "Setup complete! Run 'make dev-up' to start infrastructure."

dev-up:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@echo "Infrastructure started. Run 'make migrate' to set up database."

dev-down:
	docker-compose -f docker-compose.dev.yml down

migrate:
	@cd backend && . venv/bin/activate && alembic upgrade head

migrate-create:
	@if [ -z "$(MESSAGE)" ]; then \
		echo "Error: MESSAGE is required. Usage: make migrate-create MESSAGE='description'"; \
		exit 1; \
	fi
	@cd backend && . venv/bin/activate && alembic revision --autogenerate -m "$(MESSAGE)"

backend-test:
	@cd backend && . venv/bin/activate && pytest

frontend-test:
	@cd frontend && npm test

lint:
	@cd backend && . venv/bin/activate && ruff check app tests
	@cd backend && . venv/bin/activate && mypy app
	@cd frontend && npm run lint

format:
	@cd backend && . venv/bin/activate && ruff format app tests
	@cd frontend && npm run format

clean:
	@find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete
	@find . -type d -name ".pytest_cache" -exec rm -r {} + 2>/dev/null || true
	@find . -type d -name ".mypy_cache" -exec rm -r {} + 2>/dev/null || true
	@cd frontend && rm -rf node_modules/.vite 2>/dev/null || true
	@echo "Cleanup complete."


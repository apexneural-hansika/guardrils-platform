# SDK Naming Strategy

## Current State

The SDK is currently named `guardrails_sdk` in the Python package.

## Future Strategy

For brand consistency and product positioning, the SDK should be renamed to align with the product brand.

### Recommended Naming

**Product Name:** `apex-guardrails` (or your chosen brand)

**Python SDK:**
- Package name: `apex-guardrails-sdk` (PyPI)
- Import name: `apex_guardrails` (Python module)
- Usage: `from apex_guardrails import Guard`

**TypeScript SDK:**
- Package name: `@apex/guardrails-sdk` (npm)
- Import name: `@apex/guardrails-sdk`
- Usage: `import { Guard } from '@apex/guardrails-sdk'`

## Migration Plan

### Phase 1: Current (Development)
- Keep `guardrails_sdk` for now
- Document future rename
- Ensure SDK contract is stable

### Phase 2: Brand Alignment (Before Public Release)
- Rename package to `apex-guardrails-sdk`
- Update all imports
- Update documentation
- Update examples
- Release as new package version

### Phase 3: Deprecation (If Needed)
- Keep old package with deprecation notice
- Redirect to new package
- Sunset old package after migration period

## Implementation Notes

When renaming:
1. Update `pyproject.toml` / `package.json`
2. Update all import statements
3. Update documentation
4. Update examples
5. Update CI/CD pipelines
6. Update README files

## Why This Matters

- **Brand Consistency**: SDK name should match product brand
- **Trust**: Clear naming builds user trust
- **Discoverability**: Easier to find on package registries
- **Professionalism**: Shows product maturity

---

**Status:** Documented for future implementation. Current `guardrails_sdk` name is acceptable for development phase.


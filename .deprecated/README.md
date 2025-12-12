# Deprecated Code Archive

This folder contains code that has been deprecated and is excluded from git, ESLint, and TypeScript compilation.

## Purpose

This folder serves as a temporary archive for experimental code and unused domains that are no longer part of the active codebase. It allows us to:

1. **Clean the active codebase** without permanently losing historical implementations
2. **Avoid TypeScript/ESLint errors** from old code during development
3. **Reference past implementations** if needed during development
4. **Safe migration path** - old production flow kept intact until new implementation is verified

## Contents

### Iterations (Experimental Implementations)

- **`iterations/v1/`** - First experimental conversation engine implementation

  - Modular flow architecture with separate cognitive, behavioral, and emotional components
  - Multi-stage processing with complex state management
  - Replaced by more streamlined V7 architecture

- **`iterations/v2/`** - Second experimental conversation engine implementation
  - Attempted optimization of V1 with simplified modules
  - Compact prompt engineering experiments
  - Superseded by V7's holistic approach

### Domains (Unused Business Logic)

- **`domains/chat-context/`** - Deprecated context management system
  - Old context synthesis implementation
  - Replaced by simplified SessionContext in prod-candidate
  - Contained over-engineered Session Dynamics Matrix (SDM)

## Important Notes

⚠️ **This folder is intentionally excluded from:**

- Git version control (`.gitignore`)
- ESLint checking (`eslint.config.mjs`)
- TypeScript compilation (`tsconfig.json`)

⚠️ **Do not import or reference code from this folder** in the active codebase.

⚠️ **Old production flow** (domains/conversation-engine, domains/open-chat) is **NOT** in this folder yet. It will only be deprecated AFTER the new prod-candidate implementation is successfully integrated and verified in production.

## Migration Strategy

**Conservative Approach:**

- Keep old production conversation flow intact (conversation-engine, open-chat, session-dynamics, session-wellness)
- Only move experimental code and truly unused domains here
- Deprecate old production flow ONLY after new implementation is proven stable

This ensures we can always roll back if issues are discovered with the new implementation.

## When to Delete

This folder can be safely deleted when:

1. New prod-candidate implementation has been in production for 30+ days
2. No critical issues have been discovered
3. Team confirms no reference to old implementations is needed
4. Migration to new architecture is complete and verified

---

**Last Updated:** January 2025
**Migration Phase:** Experimental Code Cleanup
**Status:** Old production flow still active, only experiments archived

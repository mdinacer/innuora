# Unused Code Inventory

The following exports currently have **zero in-repo references** (checked with `npx ts-prune` on 2025‑03‑23). They can be safely deleted or moved to a legacy area if you don’t plan to revive them.

## Server Actions

- `src/app/actions/session-actions.ts`
  - `getSessionsUpdateInfo`
  - `getSessionChartData`
- `src/app/actions/user-actions.ts`
  - `getCurrentUserWithRelations`
  - `deleteCurrentUser`
  - `checkUserExists`
  - `updateUserProfile`
- `src/app/actions/user-config-actions.ts`
  - `updateAppearanceSettings`
- `src/app/actions/user-context.ts`
  - `_getUserByAuthIdInternal`

## Domain Layer

- `src/domains/encrypted-session/encrypted-session.actions.ts`
  - Entire CRUD surface (`getUserSessionOverviews`, `getUserSessions`, `getUserSession`, `createSession`, `addSession`, `updateSession`, `deleteSession`, `getSessionsLastUpdate`, `getSessionLastUpdate`)
- `src/domains/session-memory/session-memory.action.ts`
  - `generateSessionMemoryFromCurrentSession`
- `src/domains/session-summary/session-summary.action.ts`
  - `getSessionSummary`
- `src/domains/session-wellness/session-wellness.service.ts`
  - `sessionWellnessService`
- `src/domains/session-wellness/session-wellness.types.ts`
  - `SessionWellnessContext`
- `src/domains/chat-context/chat-context.manager.ts`
  - `ChatContextManager`
- `src/domains/conversation-engine/services/conversation-window.service.ts`
  - `ConversationWindowService`
- `src/domains/conversation-engine/constants/reflection.prompt.ts`
  - `INNUORA_REFLECTION_INSTRUCTIONS_OLD`
- `src/lib/env-validation.ts`
  - `validateEnvironmentVariables`
  - `getOptionalEnvVar`
  - `validateClientEnvironment`

## UI Components & Hooks

- `src/components/background-animation.tsx`
  - default export
- `src/components/dynamic-loaders.tsx`
  - `DynamicChat`, `DynamicForms`, `DynamicCredits`
- `src/components/credits/index.ts`
  - Re‑exports (`CreditsBalance`, `InsufficientCreditsWarning`, `CreditsTransactionHistory`, `CreditPackages`, `CreditTransaction`)
- `src/components/credits/credit-packages.tsx`
  - default export
- `src/components/credits/insufficient-credits-warning.tsx`
  - default export
- `src/components/crisis/crisis-confirmation-dialog.tsx`
  - default export
- `src/components/input/select-field.tsx`
  - default export
- `src/components/input/select-input.tsx`
  - default export
- `src/components/pwa/pwa-install-prompt.tsx`
  - `usePWAInstall`
- `src/components/pwa/service-worker-registration.tsx`
  - `useBackgroundSync`
- `src/components/session-diagnostics/user-diagnostics-view.tsx`
  - default export
- `src/components/diagnostics/advanced/advanced-diagnostic-page.tsx`
  - default export
- `src/components/diagnostics/basic/basic-diagnostic-page.tsx`
  - default export
- `src/components/sessions/session-details/index.tsx`
  - default export
- `src/components/sessions/sessions-page/index.tsx`
  - default export
- `src/components/settings/sections/notification-settings.tsx`
  - default export

> ℹ️ **Known False Positives:** “unused” reports for Next.js entrypoints (e.g. `next.config.ts`, `src/app/error.tsx`) and barrel files resolved through the `@` alias can be ignored—they are required at runtime even without explicit imports.

# Over-Engineering Hotspots

## 1. Session Context & Dynamics Stack

- **Files:** `src/lib/session/session-context-service.ts`, `src/lib/session/session-context.utils.ts`, `src/domains/session-dynamics/*`.
- **Symptoms:** Multi-layer indirection (service + utils + dynamics domain) just to persist a handful of JSON blobs between requests. The current engine only reads/writes the relational trace, analyses list, and lifecycle metadata—everything else is unused.
- **Recommendation:** Collapse the service + utils into a single module that exposes `getSessionData`/`setSessionData`, limit the payload shape to what the engine consumes, and drop the Kalman-like smoothing logic unless you genuinely need forward predictions.

## 2. Encrypted Session Legacy Actions

- **Files:** `src/domains/encrypted-session/encrypted-session.actions.ts`.
- **Symptoms:** Full CRUD API lingering alongside the new three-stage pipeline. Nothing calls these actions anymore, so they create noise and confuse the migration story.
- **Recommendation:** Remove them outright (or move under a `__legacy__` folder). If you need admin tooling later, you can reintroduce focused endpoints.

## 3. AI Cost Analysis Toolkit

- **Files:** `src/lib/cost-analysis/*`, `src/app/[locale]/cost-analysis`.
- **Symptoms:** A whole static site and tiktoken-powered analyzer to compute token costs—impressive, but heavy-handed. The product only needs high-level per-operation estimates; maintaining a bespoke analyzer bloats the codebase and build output (~2.5 MB page).
- **Recommendation:** Replace with a lightweight script (or remove entirely) and track real costs via logging or analytics dashboards.

## 4. Dynamic Loader Registry

- **Files:** `src/components/dynamic-loaders.tsx`, multiple lazy exports.
- **Symptoms:** Indirection that promises tree-shaking / dynamic imports, but the consuming code doesn’t use these registries. Maintaining the mapping adds overhead without delivering runtime gains.
- **Recommendation:** Delete unused entries, or convert to a generated map that’s only produced when a loader is actually referenced.

## 5. Device/PWA Infrastructure

- **Files:** PWA hooks and service worker registration.
- **Symptoms:** Hooks expose background sync and install prompts, yet the PWA story isn’t implemented (all hooks unused, lots of TODOs).
- **Recommendation:** Either ship the PWA features or remove the scaffold. Keeping speculative infra increases bundle size and mental load.

## 6. Double-Coded Memory & Summary Actions

- **Files:** `session-memory.action.ts`, `session-summary.action.ts`, `session-diagnostics/*`.
- **Symptoms:** Duplicate server actions for reflection/memory/summaries that the conversation pipeline now handles inline. They’re relics from earlier iterations.
- **Recommendation:** Remove them to avoid mistaken reuse; if you need background jobs later, reintroduce purpose-built actions.

## 7. Prompt & Security Layers

- **Files:** `src/domains/ai-conversation/prompts/prompt.security-protocol.ts`, multiple localized prompt bundles.
- **Symptoms:** Multiple prompt packs, persona variants, and security protocol scaffolding, yet only one combination is actually used. Maintaining unused prompt code increases risk when updating.
- **Recommendation:** Trim to the active prompt set and move experimental variants into documentation or fixtures.

By pruning the unused exports above and simplifying the highlighted areas, you can dramatically reduce maintenance overhead while keeping the therapeutic core intact. Let me know if you want automated deletions or targeted refactors next.

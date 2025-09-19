# Domain-Driven Design Reorganization Plan for Mirael

Based on my analysis of the Mirael therapeutic AI application, here's a comprehensive domain-driven folder structure plan:

## Current Issues Identified

1. **Scattered Business Logic**: Critical business logic spread across `/app/actions/`, `/lib/ai/`, `/stores/`, and `/components/`
2. **Duplicate Code**: Session stores exist in both `/domains/` and `/lib/ai/mirael-core/v2/stores/`
3. **Missing Domain Boundaries**: Key business domains not properly organized
4. **Mixed Concerns**: Technical infrastructure mixed with business logic

## Recommended Domain Structure

### Core Business Domains

#### 1. **user-management/**

- **Purpose**: User lifecycle, authentication, profiles, preferences
- **Contents**:
  - `user.store.ts` (move from `/stores/user-data.store.ts`)
  - `user.actions.ts` (move from `/app/actions/user-actions.ts`)
  - `auth.actions.ts` (move from `/app/actions/auth-actions.ts`)
  - `user.types.ts`
  - `components/` (auth forms, user dropdown, etc.)
  - `hooks/` (user management hooks)

#### 2. **therapeutic-analysis/**

- **Purpose**: AI therapy analysis, CBT modules, state analysis
- **Contents**:
  - `state-analysis/` (move from `/lib/ai/mirael-core/v2/state-analysis/`)
  - `session-analysis/` (move from `/lib/ai/mirael-core/v2/session-analysis/`)
  - `modules/` (move from `/lib/ai/mirael-core/v2/modules/`)
  - `therapeutic-analysis.actions.ts`
  - `therapeutic-analysis.types.ts` (already exists)
  - `hooks/` (analysis hooks)

#### 3. **session-management/**

- **Purpose**: Consolidate all session-related functionality
- **Contents**:
  - `active-session/` (existing)
  - `encrypted-session/` (existing)
  - `session-sync/` (existing)
  - `session.actions.ts` (move from `/app/actions/session-actions.ts`)
  - `session.types.ts`
  - `components/` (session cards, details, etc.)

#### 4. **ai-conversation/**

- **Purpose**: Chat interactions, message handling, AI communication
- **Contents**:
  - `open-chat/` (existing hooks)
  - `flow-chat/` (flow chat logic)
  - `conversation.actions.ts` (move from `/lib/ai/mirael-core/v2/mirael-chat.action.ts`)
  - `conversation.types.ts`
  - `memory/` (move from `/lib/ai/shared/session-memory/`)
  - `prompts/` (move from `/lib/ai/shared/prompts/`)

#### 5. **points-system/**

- **Purpose**: Points management, billing, transactions
- **Contents**:
  - `points.store.ts`
  - `points.actions.ts` (move from `/app/actions/points-actions.ts`)
  - `points.types.ts`
  - `components/` (move from `/components/points/`)
  - `hooks/` (points management hooks)

#### 6. **admin/**

- **Purpose**: Administrative functions, audit logs, system management
- **Contents**:
  - `audit.actions.ts` (move from `/app/actions/audit-actions.ts`)
  - `admin.types.ts`
  - `components/` (move from `/components/admin/`)
  - `hooks/` (admin hooks)

### Supporting Domains

#### 7. **notifications/**

- **Purpose**: Toast notifications, alerts, user feedback
- **Contents**:
  - `notifications.store.ts`
  - `notifications.types.ts`
  - `components/` (toast components)

#### 8. **encryption/**

- **Purpose**: Security, key management, data protection
- **Contents**:
  - `encryption.utils.ts` (move from `/lib/crypto/`)
  - `encryption.types.ts`
  - `encryption.actions.ts`

## Implementation Strategy

### Phase 1: Core Domain Creation

1. Create `user-management/` domain with auth and user logic
2. Create `therapeutic-analysis/` domain consolidating AI analysis
3. Create `ai-conversation/` domain for chat interactions
4. Create `points-system/` domain for billing logic

### Phase 2: Consolidation

1. Merge duplicate session stores
2. Move scattered actions into appropriate domains
3. Reorganize components by domain
4. Update imports throughout codebase

### Phase 3: Clean Architecture

1. Establish clear domain interfaces
2. Implement domain services pattern
3. Create domain events for cross-domain communication
4. Remove technical infrastructure from business domains

## Benefits

- **Clear Boundaries**: Each domain has single responsibility
- **Reduced Duplication**: Consolidate scattered logic
- **Better Maintainability**: Easier to locate and modify business logic
- **Scalable Architecture**: Easy to add new features within domains
- **Team Collaboration**: Clear ownership of business areas

## Detailed Domain Breakdown

### Current Analysis

The current `/domains/` folder structure shows:

```
domains/
├── active-session/           ✅ Well organized
├── encrypted-session/        ✅ Well organized
├── open-chat/               ✅ Well organized
├── session-sync/            ✅ Well organized
└── therapeutic-analysis/    ⚠️ Only has types file
```

### Issues Found

1. **State Analysis Logic**: Currently in `/lib/ai/mirael-core/v2/state-analysis/` - should be in `therapeutic-analysis/`
2. **Session Analysis Logic**: Currently in `/lib/ai/mirael-core/v2/session-analysis/` - should be in `therapeutic-analysis/`
3. **CBT Modules**: Currently in `/lib/ai/mirael-core/v2/modules/` - should be in `therapeutic-analysis/`
4. **User Management**: Scattered across `/app/actions/auth-actions.ts`, `/stores/user-data.store.ts` - needs dedicated domain
5. **Points System**: In `/app/actions/points-actions.ts` and `/components/points/` - needs dedicated domain
6. **Admin Functions**: In `/app/actions/audit-actions.ts` and `/components/admin/` - needs dedicated domain
7. **Duplicate Stores**: Session stores exist in both `/domains/` and `/lib/ai/mirael-core/v2/stores/`

### Recommended Actions

1. **Expand therapeutic-analysis/**: Move all CBT, state analysis, and session analysis logic here
2. **Create user-management/**: Consolidate all user, auth, and profile logic
3. **Create points-system/**: Move all points and billing logic
4. **Create admin/**: Consolidate administrative functions
5. **Create ai-conversation/**: Move chat logic and prompts
6. **Clean up duplicates**: Remove duplicate stores and consolidate functionality

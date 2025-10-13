# Mirael - Comprehensive Project Analysis & Memory Snapshot

> **Last Updated**: 2025-01-19  
> **Purpose**: Complete project understanding for AI assistant memory across sessions  
> **Project Version**: Next.js 15.5.2 with latest cleanup (post-refactor)

## Executive Summary

**Mirael** is a sophisticated **Next.js 15 therapeutic chat platform** that combines AI-powered conversations with evidence-based Cognitive Behavioral Therapy (CBT) methodologies. It features **zero-knowledge client-side encryption**, **local-first architecture with cloud sync**, and **comprehensive internationalization** (EN/AR/FR with RTL support).

**Key Characteristics**:

- Privacy-first with client-side encryption
- Local-first with cloud backup
- Evidence-based therapeutic interventions
- Single active session per user across devices
- Cross-device session continuity via cloud sync

## Technology Stack

### Core Framework

- **Frontend**: Next.js 15.5.2 + React 19.1.0 + TypeScript (strict)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Authentication**: Supabase Auth with role-based access
- **AI/ML**: OpenAI + OpenRouter APIs with custom CBT modules
- **State Management**: Zustand with IndexedDB persistence (LocalForage)
- **Encryption**: WebCrypto (PBKDF2 + AES-KW + AES-GCM)
- **Styling**: Tailwind CSS 4 + Radix UI + Custom Design System
- **Build**: pnpm package manager, ESLint + Prettier

### Package.json Key Dependencies

```json
{
  "@supabase/supabase-js": "latest",
  "next": "15.5.2",
  "prisma": "latest",
  "react": "19.1.0",
  "tailwindcss": "4.0.0-beta.3",
  "typescript": "5.7.2",
  "zustand": "latest"
}
```

## Project Structure

```
src/
├── app/[locale]/           # Next.js App Router with i18n
│   ├── (legal)/           # Route group: EULA, Privacy, Terms
│   ├── (protected)/       # Route group: Sessions, authenticated areas
│   ├── auth/             # Authentication pages (sign-in, sign-up, verify)
│   ├── encryption/       # Encryption setup page
│   └── actions/          # Server actions (auth, session, audit, etc.)
├── components/            # UI components (organized by feature)
│   ├── chat-interface/   # Core chat components (flow-chat, open-chat)
│   ├── sessions/         # Session management UI
│   ├── auth/            # Authentication forms
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   └── mir-ui/          # Custom design system
├── domains/              # Business domain logic (9 core domains)
│   ├── encrypted-session/   # Session encryption, storage, cloud sync
│   ├── cbt-modules/        # Evidence-based therapeutic interventions
│   ├── session-flow/       # Structured conversation orchestration
│   ├── open-chat/          # Free-form AI conversations
│   ├── therapeutic-analysis/ # Real-time psychological assessment
│   ├── ai-conversation/    # Prompt engineering and AI coordination
│   ├── session-memory/     # Context preservation across sessions
│   ├── session-summary/    # Conversation synthesis and insights
│   └── active-session/     # Current session state management
├── lib/                  # Shared utilities and services
│   ├── ai/mirael-core/v2/  # Core AI/CBT engine
│   ├── crypto/            # WebCrypto encryption utilities
│   ├── supabase/          # Database client configuration
│   ├── constants/         # App configuration and constants
│   └── utils/             # Helper functions
├── locales/              # i18n translations (en, ar, fr)
├── stores/               # Global Zustand stores
└── types/                # TypeScript type definitions
```

## Domain-Driven Architecture

### Core Business Domains (9 Domains)

#### 1. **Encrypted Session Domain** (`/domains/encrypted-session/`)

- **Purpose**: Client-side encryption and session security
- **Key Files**:
  - `encrypted-session.crypto.ts` - WebCrypto implementation
  - `encrypted-session.store.ts` - Zustand store for session state
  - `encrypted-session.actions.ts` - Server actions for session CRUD
  - `components/session-decryptor.tsx` - Session decryption UI
- **Pattern**: Full domain encapsulation with crypto, store, and actions

#### 2. **CBT Modules Domain** (`/domains/cbt-modules/`)

- **Purpose**: Cognitive Behavioral Therapy logic implementation
- **Key Components**:
  - `modules.core.ts` - Core therapeutic modules (cognitive, behavioral, mindfulness)
  - `modules.process.ts` - Process modules for different interaction patterns
  - `modules.utility.ts` - Utility modules for common therapeutic techniques
  - `constants/` - CBT categories, types, and therapeutic scope definitions
- **Design**: Evidence-based CBT methodologies translated to code

#### 3. **Session Flow Domain** (`/domains/session-flow/`)

- **Purpose**: Structured therapeutic conversation flows
- **Architecture**:
  - Complex orchestrator pattern with multiple hooks
  - State management for flow progression
  - Message management integration
- **Key Files**:
  - `hooks/use-session-flow-orchestrator.ts` - Main flow control
  - `stores/session-flow.store.ts` - Flow state management
  - `types/session-flow.types.ts` - Flow step definitions
- **Pattern**: Event-driven flow control with validation

#### 4. **Open Chat Domain** (`/domains/open-chat/`)

- **Purpose**: Free-form AI conversation management
- **Features**: Session memory, analysis hooks, conversation state
- **Key Files**:
  - `hooks/use-chat-controller.ts` - Chat orchestration
  - `open-chat.action.ts` - AI conversation server action
  - `open-chat.types.ts` - Session and message type definitions
- **Integration**: Works with therapeutic analysis for insight generation

#### 5. **Therapeutic Analysis Domain** (`/domains/therapeutic-analysis/`)

- **Purpose**: Real-time psychological assessment and pattern recognition
- **Key Files**:
  - `therapeutic-analysis.engine.ts` - Core analysis logic
  - `therapeutic-analysis.prompt.ts` - AI prompts for analysis
  - `therapeutic-analysis.types.ts` - Analysis result types
- **Features**: Emotional intensity, cognitive distortions, crisis detection

#### 6. **AI Conversation Domain** (`/domains/ai-conversation/`)

- **Purpose**: AI chat orchestration and prompt management
- **Structure**: Organized prompt templates for different conversation aspects
- **Key Files**:
  - `prompts/` - Modular prompt templates (persona, tone, security, etc.)
- **Patterns**: Template-based prompt engineering with modular approach

#### 7. **Session Memory Domain** (`/domains/session-memory/`)

- **Purpose**: Context preservation and continuity across sessions
- **Key Files**:
  - `session-memory.action.ts` - Memory management server action
  - `session-memory.prompt.ts` - Memory synthesis prompts
  - `session-memory.utils.ts` - Memory processing utilities

#### 8. **Session Summary Domain** (`/domains/session-summary/`)

- **Purpose**: Conversation synthesis and insights generation
- **Key Files**:
  - `session-summary.action.ts` - Summary generation
  - `session-summary.types.ts` - Summary data structures
  - `session-summary.utils.ts` - Summary processing

#### 9. **Active Session Domain** (`/domains/active-session/`)

- **Purpose**: Current session state management
- **Key Files**:
  - `active-session.store.ts` - Current session Zustand store
  - `active-session.utils.ts` - Session utilities
  - `components/active-session-loader.tsx` - Session loading UI

### Domain Interaction Patterns

- **Loose Coupling**: Domains communicate through well-defined interfaces
- **Shared Types**: Common types in `/types/` for cross-domain communication
- **Event-Driven**: Some domains use callback patterns for coordination
- **Store Integration**: Zustand stores provide reactive state across domains

## Security & Encryption Architecture

### Zero-Knowledge Encryption Model

```
User Password + Salt → PBKDF2 (600k iterations) → Wrapping Key
Random Content Key → AES-GCM → Encrypts all user data
Wrapping Key → AES-KW → Encrypts content key for cloud storage
```

### Key Management Flow

1. **Key Derivation**: User password + stored salt → PBKDF2 → wrapping key
2. **Content Encryption**: Random AES key encrypts all session data
3. **Key Wrapping**: Wrapping key encrypts content key for storage
4. **Storage**: Only encrypted content key and encrypted data stored in cloud
5. **Decryption**: User password → derive wrapping key → unwrap content key → decrypt data

### Encryption Implementation (`/lib/crypto/webcrypto-crypto.ts`)

- **Algorithm Stack**:
  - PBKDF2 (600,000 iterations) for key derivation
  - AES-KW for key wrapping
  - AES-GCM for content encryption
- **Security Model**: Zero-knowledge architecture where server never sees decrypted data
- **Key Storage**: SessionStorage for temporary keys, IndexedDB for wrapped keys

### Authentication System

- **Supabase Auth**: Email/password with verification flow
- **Role-Based Access**: Admin, User, Tester roles (defined in Prisma schema)
- **Session Security**: Server-side session validation via `requireCurrentUser()`
- **API Protection**: All server actions validate authentication

## Session Management Architecture

### Local-First with Cloud Sync Model

- **Source of Truth**: `encrypted-session.store.ts` (Zustand + LocalForage)
- **Cloud Backup**: Encrypted session payloads stored in Supabase
- **Single Active Session**: One session per user across all devices
- **Cross-Device Continuity**: Cloud sync enables session handoff between devices

### Session Store Implementation (`/domains/encrypted-session/encrypted-session.store.ts`)

- **Features**:
  - Session CRUD operations with encryption/decryption
  - Public ID mapping for security (real IDs never exposed to UI)
  - Batch operations for performance
  - Sync status tracking
- **Optimization**: Lazy loading, caching, memory management
- **Error Handling**: Comprehensive error management with user feedback

### Cloud Sync Flow

```
Device A: User works on session → auto-syncs to cloud (encrypted)
Device B: User opens app → "Cloud updates available" notification
Device B: Downloads updates → decrypts with user password → continues session
Result: Both devices have synchronized session stores
```

### Session Types & Components

#### Dual Chat Modes

**1. Flow Chat** (`/components/chat-interface/flow-chat/`)

- **Purpose**: Structured therapeutic conversations
- **Features**: Step-by-step CBT guidance, user input validation, progress tracking
- **Components**:
  - `flow-chat.tsx` - Main flow chat container
  - `flow-message-renderer.tsx` - Message rendering logic
- **Pattern**: Message renderer with action handlers

**2. Open Chat** (`/components/chat-interface/open-chat/`)

- **Purpose**: Free-form AI conversations
- **Features**: Real-time messaging, typing indicators, message history
- **Components**:
  - `open-chat.tsx` - Main chat container
  - `chat-input.tsx` - Message input component
  - `open-message-renderer.tsx` - Message display
- **Pattern**: Traditional chat interface with AI integration

## Database Schema (Prisma)

### Core Entities (`/prisma/schema.prisma`)

#### User Model

```prisma
model User {
  id                String              @id @default(cuid())
  authId            String              @unique
  role              UserRole?           @default(user)
  pointsBalance     Int                 @default(0)
  status            UserAccountStatus?  @default(active)
  isOnboarded       Boolean             @default(false)
  encryptionSalt    String?            // Base64 salt for key derivation
  // Relationships
  sessions          Session[]
  profile           Profile?
  auditLogs         AuditLog[]
  // ... other relationships
}
```

#### Session Model

```prisma
model Session {
  id              String    @id @default(uuid())
  userId          String
  title           String    // Non-encrypted metadata
  subtitle        String?   // Non-encrypted metadata
  modelCode       ModelCode @default(M1)
  autoUpdateTitle Boolean   @default(false)
  persistOnCloud  Boolean   @default(true) // User consent for cloud backup
  metadata        Json      // { messageCount, tokenCount, costUSD }
  encryptedData   Json?     // Encrypted session bundle
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Profile Model (Therapeutic Assessment)

```prisma
model Profile {
  userId                   String                    @unique
  displayName              String?
  ageGroup                 AgeGroup?
  identityConnection       IdentityConnectionLevel?
  copingMechanism          CopingMechanism?
  socialPressureSources    SocialPressureSource[]    @default([])
  emotionalConcerns        EmotionalConcern[]        @default([])
  emotionalAspirations     EmotionalAspirations[]    @default([])

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Key Relationships

```
User (1) → (1) Profile
User (1) → (*) Sessions
User (1) → (*) PointsTransactions
User (1) → (1) UserConfig
User (1) → (*) AuditLogs
```

### Enums (Therapeutic Assessment Types)

- `AgeGroup`: Age18_24, Age25_34, Age35_44, Age45_54, Age55Plus
- `IdentityConnectionLevel`: authentic, conflicted, disconnected, lost
- `CopingMechanism`: shutdown, self_critical, overwhelmed, push_through
- `EmotionalConcern`: anxiety, self_worth, overthinking, loneliness, burnout, etc.
- `EmotionalAspirations`: clarity, calm, confidence, self_compassion, connection, etc.

## AI & Therapeutic System

### CBT Module Implementation (`/domains/cbt-modules/`)

#### Core Therapeutic Modules (`modules.core.ts`)

```typescript
// Beck's Cognitive Model Implementation
COGNITIVE_DISTORTIONS: [
  "all-or-nothing-thinking",
  "overgeneralization",
  "mental-filter",
  "disqualifying-the-positive",
  "jumping-to-conclusions",
  "magnification-and-minimization",
  "emotional-reasoning",
  "should-statements",
  "labeling-and-mislabeling",
  "personalization",
];

// Behavioral Activation Techniques
BEHAVIORAL_TECHNIQUES: [
  "activity-scheduling",
  "behavioral-experiments",
  "graded-task-assignment",
  "exposure-therapy-basics",
];

// Mindfulness Integration
MINDFULNESS_PRACTICES: [
  "grounding-techniques",
  "present-moment-awareness",
  "body-scan-meditation",
  "breathing-exercises",
];
```

#### Therapeutic Categories (`constants/categories.ts`)

```typescript
export const CBT_CATEGORIES = {
  COGNITIVE: ["thought-challenging", "cognitive-restructuring"],
  BEHAVIORAL: ["activity-scheduling", "behavioral-activation"],
  MINDFULNESS: ["grounding", "present-moment"],
  EMOTIONAL: ["emotion-regulation", "distress-tolerance"],
  INTERPERSONAL: ["communication-skills", "boundary-setting"],
} as const;
```

### AI Conversation Flow

```
User Input → Therapeutic Analysis → Module Selection → CBT-Informed Response
```

### Therapeutic Analysis Engine (`/domains/therapeutic-analysis/therapeutic-analysis.engine.ts`)

- **Emotional Intensity Assessment**: 0-10 scale with contextual factors
- **Cognitive Distortion Detection**: Pattern matching with confidence scores
- **Therapeutic Readiness Evaluation**: Engagement and receptivity assessment
- **Crisis Risk Evaluation**: Safety assessment with escalation protocols
- **Continuity Tracking**: Session-to-session progress monitoring

### Prompt Engineering (`/domains/ai-conversation/prompts/`)

#### Modular Prompt System

```typescript
// Core Prompt Modules
prompt.persona.ts; // Therapeutic persona definition
prompt.tone.ts; // Empathetic and professional tone
prompt.security.ts; // Safety and crisis protocols
prompt.session - analysis.ts; // Analysis instruction templates
prompt.summarization.ts; // Session summary generation
prompt.user - context.ts; // User context integration
```

#### Dynamic Prompt Assembly

```typescript
// Example: Context-aware prompt construction
const therapeuticPrompt = [
  PERSONA_PROMPT,
  TONE_PROMPT,
  SECURITY_PROTOCOL,
  USER_CONTEXT(userProfile),
  SESSION_ANALYSIS(previousSessions),
  CBT_MODULE_CONTEXT(selectedModules),
].join("\n\n");
```

## UI/UX Architecture

### Design System (`/components/mir-ui/`)

- **Theme System**: Dark/light mode with system preference detection
- **Components**: Custom button, card, badge, info-card components
- **Typography**: Multi-language font optimization with proper fallbacks
- **Accessibility**: ARIA compliance and keyboard navigation support

### Chat Interface Architecture

#### Shared Components (`/components/chat-interface/shared/`)

```typescript
// Core chat components used by both flow and open chat
chat - container.tsx; // Main chat layout container
chat - header.tsx; // Session title and controls
message - bubble.tsx; // Individual message display
messages - container.tsx; // Message list with virtualization
```

#### Component Hierarchy

```
ChatInterface
├── ChatHeader (title, controls)
├── MessagesContainer
│   └── MessageBubble[] (user/assistant messages)
└── ChatInput (message composition)
```

### Session Management UI (`/components/sessions/`)

#### Sessions Page Structure

```typescript
SessionsPage
├── SessionsPageHeader (title, create button)
├── SessionsCloudState (cloud sync notifications)
├── SessionsPageActions (bulk actions)
└── SessionCard[] (individual session cards)
```

#### Key Session Components

- `sessions-page/index.tsx` - Main sessions list page
- `sessions-page/cloud-sessoins-state.tsx` - Cloud sync detection and management
- `sessions-page/session-card.tsx` - Individual session preview
- `session-details/index.tsx` - Detailed session view with analysis
- `session-form.tsx` - Session creation/editing form

## Internationalization (i18n)

### Multi-Language Support

- **Languages**: English (default), Arabic, French
- **Implementation**: `next-i18n-router` with custom middleware
- **RTL Support**: Complete right-to-left layout support for Arabic
- **Middleware**: `/middleware.ts` handles locale detection and routing

### Translation Structure (`/locales/`)

```
locales/
├── en/ (English)
├── ar/ (Arabic - RTL)
└── fr/ (French)
    ├── common.json      # Shared UI text and labels
    ├── pages.json       # Page-specific content and navigation
    ├── sessions.json    # Session-related terminology
    ├── errors.json      # Error messages and validation
    └── legal.json       # EULA, Privacy Policy, Terms
```

### RTL Implementation Details

- **CSS**: Logical properties for bidirectional layouts (`margin-inline-start`)
- **Typography**: Arabic font optimization with proper line height
- **Layout**: Automatic direction reversal for Arabic language
- **Date Formatting**: Locale-aware formatting with `date-fns`

## State Management (Zustand Stores)

### Core Stores (`/stores/`)

#### 1. Encrypted Session Store (`/domains/encrypted-session/encrypted-session.store.ts`)

```typescript
interface SessionsStoreState {
  sessions: Record<string, PrismaSession>;
  publicIdMap: Record<string, string>; // publicId -> sessionId
  sessionIdMap: Record<string, string>; // sessionId -> publicId
  hasHydrated: boolean;

  // Session operations
  addSession: (session: PrismaSession) => void;
  updateSession: (publicId: string, session: Partial<PrismaSession>) => void;
  removeSession: (publicId: string) => void;
  // ... other methods
}
```

#### 2. User Data Store (`/stores/user-data.store.ts`)

```typescript
interface UserDataStoreState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  // User-related operations
}
```

#### 3. Active Session Store (`/domains/active-session/active-session.store.ts`)

```typescript
interface ActiveSessionStoreState {
  currentSessionId: string | null;
  isSessionActive: boolean;
  sessionData: Session | null;
  // Current session operations
}
```

### Store Persistence

- **Local Storage**: Zustand persist middleware with LocalForage (IndexedDB)
- **Hydration**: Proper SSR hydration handling with `hasHydrated` flags
- **Encryption**: Sensitive data encrypted before persistence

## Server Actions (`/app/actions/`)

### Authentication Actions (`auth-actions.ts`)

```typescript
// Core auth functions
requireCurrentUser(); // Auth validation for protected actions
requireAdmin(); // Admin-only action protection
getCurrentUser(); // Get current authenticated user
```

### Session Actions (`session-actions.ts`)

```typescript
// Session CRUD operations
createSession(data: SessionCreate)
updateSession(id: string, data: SessionUpdate)
updateSessionEncryptedData(id: string, data: EncryptedBlob)
deleteSession(id: string)
getSessionById(id: string)
listSessionsByUser()     // User's session overviews
```

### Audit Actions (`audit-actions.ts`)

```typescript
// Activity logging for compliance
logAction(userId: string, action: string, description: string)
getAuditLogs()          // Admin function for audit trail
```

## Key File Locations (Critical Files)

### Core Business Logic

- `/domains/encrypted-session/encrypted-session.crypto.ts` - **Core encryption implementation**
- `/domains/cbt-modules/modules.core.ts` - **Therapeutic CBT logic**
- `/domains/session-flow/hooks/use-session-flow-orchestrator.ts` - **Flow control**
- `/domains/therapeutic-analysis/therapeutic-analysis.engine.ts` - **AI analysis**

### Data Layer

- `/app/actions/session-actions.ts` - **Session data operations**
- `/prisma/schema.prisma` - **Database schema**
- `/lib/supabase/server.ts` - **Database client configuration**

### UI Entry Points

- `/app/[locale]/(protected)/sessions/page.tsx` - **Main sessions page**
- `/components/sessions/sessions-page/index.tsx` - **Sessions list component**
- `/components/chat-interface/` - **Chat implementations**

### Configuration

- `/middleware.ts` - **Request routing, auth, and i18n**
- `/next.config.ts` - **Next.js configuration**
- `/tailwind.config.ts` - **Styling configuration**

## Development & Deployment

### Package Management

- **Manager**: pnpm for fast, disk-efficient installs
- **Scripts**: Standard Next.js scripts (dev, build, start, lint)
- **Database**: Prisma generate + push for schema management

### Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=

# AI APIs
OPENAI_API_KEY=
OPENROUTER_API_KEY=

# Encryption
ENCRYPTION_SALT_BASE64=
```

### Build Process

```bash
pnpm install
npx prisma generate
npx prisma db push
pnpm build
```

## Architectural Strengths

### 1. Privacy-First Design

- **Zero-Knowledge Architecture**: Server never sees decrypted user data
- **Client-Side Encryption**: All sensitive data encrypted before leaving device
- **User-Controlled Keys**: Users control their own encryption keys

### 2. Therapeutic Grounding

- **Evidence-Based**: Implements proven CBT methodologies
- **Clinical Rigor**: Structured therapeutic interventions with proper assessment
- **Professional Standards**: Crisis detection and appropriate boundaries

### 3. Modern Architecture

- **Latest Tech Stack**: Next.js 15, React 19, TypeScript for reliability
- **Domain-Driven Design**: Clear separation of business concerns
- **Performance Optimized**: Local-first with intelligent cloud sync

### 4. Global Accessibility

- **True Internationalization**: Beyond translation - cultural adaptation
- **RTL Support**: Complete right-to-left layouts for Arabic
- **Accessibility**: ARIA compliance and keyboard navigation

### 5. Developer Experience

- **Type Safety**: Comprehensive TypeScript throughout
- **Clean Architecture**: Well-organized domain boundaries
- **Maintainable**: Clear patterns and consistent structure

## Areas for Future Enhancement

### 1. Advanced Features

- **Payment Integration**: Subscription management and billing
- **Advanced Analytics**: Therapeutic progress tracking and insights
- **Offline Capabilities**: Enhanced offline functionality with sync queues

### 2. Technical Improvements

- **Performance**: Additional optimization for large session histories
- **Testing**: Comprehensive test suite implementation
- **Monitoring**: Error tracking and performance monitoring

### 3. Therapeutic Features

- **Crisis Management**: Advanced crisis detection and intervention protocols
- **Progress Tracking**: Long-term therapeutic outcome measurement
- **Therapist Integration**: Professional oversight and collaboration features

## Unique Innovation

### Hybrid AI-CBT Approach

Combines the accessibility of AI chat with the structure of evidence-based therapy, creating a unique therapeutic experience that's both conversational and clinically grounded.

### Zero-Knowledge Cloud Sync

Enables cross-device session continuity while maintaining complete privacy - users can seamlessly switch devices without compromising data security.

### Culturally Adaptive Interface

True internationalization that goes beyond translation to include cultural sensitivity in therapeutic approaches and interface design.

---

**This document serves as a comprehensive memory snapshot for understanding every aspect of the Mirael therapeutic chat platform. It covers architecture, implementation details, key files, and design decisions to enable informed development and maintenance across sessions.**

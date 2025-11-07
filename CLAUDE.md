# Innuora Project - Technical Documentation

## Project Overview

**Innuora** is an AI-powered therapeutic chat platform built with Next.js 15 that provides personalized Cognitive Behavioral Therapy (CBT) conversations. The platform combines modern web technologies with sophisticated AI integration and client-side encryption to deliver secure, therapeutic experiences.

**Codebase Size**: ~51,000 lines of code across 17 business domains
**Architecture**: Holistic conversation engine with CBT-informed prompts
**Security**: Zero-knowledge encryption with client-side key management

## Core Technologies

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI + OpenRouter APIs
- **Payment Processing**: Stripe (production-ready)
- **Encryption**: WebCrypto API (AES-GCM + AES-KW)
- **State Management**: Zustand with persistence
- **UI Components**: Tailwind CSS + Radix UI
- **Internationalization**: Multi-language support (EN/AR/FR)

## Architecture Overview

### Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── [locale]/          # Internationalized routes
│   ├── actions/           # Server actions
│   └── api/               # API routes
├── components/            # React components
├── domains/               # Business logic domains (17 domains)
├── lib/                   # Shared utilities & configurations
├── stores/                # Zustand state management
├── types/                 # TypeScript definitions
└── locales/               # Translation files
```

### Business Domains

The application is organized into 17 specialized business domains:

- **active-session**: Real-time session duration tracking (excludes idle time)
- **ai-conversation**: AI model configuration and prompt management
- **conversation-engine**: Production holistic conversation engine (GPT-4o)
- **credits**: Revenue-critical billing and credit calculation
- **encrypted-session**: Zero-knowledge encryption for sensitive data
- **open-chat**: Chat interface hooks and state management
- **session-analysis**: Session analytics and insights generation
- **session-diagnostics**: AI-powered diagnostic report generation
- **session-flow**: Onboarding and guided session flows
- **session-memory**: AI-powered memory consolidation (150-300 words)
- **session-summary**: Session summary generation
- **session-sync**: Two-tier synchronization (local + cloud)
- **session-wellness**: Wellness check frequency management
- **therapeutic-analysis**: Real-time user input analysis

## Database Schema

### Core Models

#### User Model

```prisma
model User {
  id               String    @id @default(cuid())
  authId           String    @unique
  role             UserRole? @default(user)
  creditsBalance   Int       @default(0)
  status           UserAccountStatus? @default(active)
  isOnboarded      Boolean   @default(false)
  encryptionSalt   String?   // For client-side encryption

  // Relationships
  profile          Profile?
  sessions         Session[]
  creditTransactions CreditTransaction[]
  subscriptions    Subscription[]
  auditLogs        AuditLog[]
  config           UserConfig?
}
```

#### Session Model

```prisma
model Session {
  id              String    @id @default(uuid())
  userId          String
  title           String
  subtitle        String?
  autoUpdateTitle Boolean   @default(false)
  persistOnCloud  Boolean   @default(true)

  // Non-sensitive metadata
  metadata        Json      // { messageCount, creditsUsed, activeDurationMs, lastActiveAt }

  // Encrypted session content (client-side encryption)
  encryptedData   Json?     // { messages: [...] }

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relationships
  serverContext   SessionContext?  // One-to-one
  aiOperations    AiOperationLog[]
}
```

#### SessionContext (Server-Side Therapeutic Data)

```prisma
model SessionContext {
  sessionId     String   @id
  session       Session  @relation(...)

  // Server-encrypted therapeutic data (app-level encryption)
  encryptedData Json     // { analysisSnapshots, aggregatedAnalysis, memoryStore, relationalTrace }

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**SessionContext.encryptedData Structure**:

```typescript
{
  analysisSnapshots: TherapeuticAnalysisWithMessageId[];  // Background analyses
  aggregatedAnalysis: SessionAnalysis | null;             // Session-level insights
  memoryStore: string | null;                             // AI-generated memory (150-300 words)
  relationalTrace: RelationalTrace;                       // Conversation continuity
}
```

#### Credit System

```prisma
model CreditTransaction {
  id        String                @id @default(cuid())
  userId    String
  type      CreditTransactionType // CREDIT | DEBIT
  amount    Int                   // Always positive
  reason    String                // "ai_usage", "purchase", etc.
  sessionId String?
  metadata  Json?                 // Context data

  createdAt DateTime @default(now())
}

model AiOperationLog {
  id            String   @id @default(cuid())
  userId        String
  sessionId     String?
  messageId     String?
  operation     String   // "RESPONSE", "ANALYSIS", "MEMORY_UPDATE"
  modelUsed     String
  tokenUsage    Json     // { promptTokens, completionTokens, totalTokens }
  creditsCharged Int

  createdAt     DateTime @default(now())
}
```

#### Profile Model

```prisma
model Profile {
  userId                String  @unique
  displayName           String?
  ageGroup              AgeGroup?
  identityConnection    IdentityConnectionLevel?
  copingMechanism       CopingMechanism?
  socialPressureSources SocialPressureSource[]
  emotionalConcerns     EmotionalConcern[]
  emotionalAspirations  EmotionalAspirations[]
}
```

## Conversation Engine (Production System)

### Architecture

**Type**: Holistic single-stage conversation engine
**Location**: `src/domains/conversation-engine/`
**Primary Model**: GPT-4o (reflection category)

### Flow

```
1. User Input Received
   ↓
2. Fetch Session Context (server-side)
   - Relational trace (conversation continuity)
   - Session memory (AI-consolidated context)
   ↓
3. Build Conversation Window
   - Last 8 messages from history
   ↓
4. Call GPT-4o with Locale-Specific Prompts
   - English: HOLISTIC_REFLECTIVE_ENGINE_INSTRUCTIONS_EN_GPT4O_OPTIMAL
   - Arabic: HOLISTIC_REFLECTIVE_ENGINE_INSTRUCTIONS_AR
   - French: HOLISTIC_REFLECTIVE_ENGINE_INSTRUCTIONS_FR
   ↓
5. Parse JSON Output
   - Reflection (warm therapeutic response)
   - Psychoeducation (CBT insights when appropriate)
   - Signals (resistance detection, crisis detection)
   - Next relational trace (continuity for next turn)
   ↓
6. Update Session Context
   - Save new relational trace
   - Update session memory if needed
   ↓
7. Log AI Operation & Deduct Credits
   - Record token usage
   - Calculate and deduct credits
   - Audit logging
```

### Output Structure

```typescript
interface EngineOutput {
  reflection: string; // Main warm therapeutic response

  psychoeducational_thread: {
    type: "integrated" | "none";
    content?: string; // CBT insights (when readiness detected)
  };

  signals: {
    resistance: "none" | "sarcasm" | "dismissive" | "intellectualized";
    crisis: "none" | "acute"; // Crisis detection for safety protocols
  };

  next_relational_trace: RelationalTrace;
}
```

### RelationalTrace (Conversation Continuity)

The relational trace maintains conversation continuity across turns:

```typescript
interface RelationalTrace {
  stance: "grounding" | "steady" | "exploratory" | "nurturing" | "clarifying";
  tone: "warm" | "calm" | "curious" | "light" | "firm";
  focus: string; // Current therapeutic focus
  notes: string; // Therapist-style session notes
  psychoeducation_last_turn: boolean; // Prevents back-to-back psychoeducation
  used_lived_line: boolean; // Tracks conversational techniques
  used_micro_breath: boolean;
}
```

### Server Action

**Location**: `src/domains/conversation-engine/actions/conversation.action.ts`

```typescript
export async function handleHolisticUserInput(
  userInput: string,
  messages: OpenChatMessage[],
  locale: AppLocales,
  sessionId: string,
  messageId: string
): Promise<HandleConversationResult>;
```

## AI Integration System

### Model Configuration

**Location**: `src/domains/ai-conversation/ai-models.ts`

**Model Categories** (AIModelCategory):

```typescript
type AIModelCategory = "reflection" | "diagnostic" | "background" | "auxiliary";
```

**Configured Models**:

- **reflection**: GPT-4o (primary conversations, 128k context)
- **diagnostic**: GPT-4.1 (deep session analysis)
- **background**: GPT-4.1-mini (titles, summaries, memory consolidation)
- **auxiliary**: GPT-4o-mini (micro-tasks like title generation)

### AI Service Architecture

**Location**: `src/app/actions/ai-client-actions.ts`

**Features**:

- **Multi-Provider Support**: OpenAI (primary) + OpenRouter (fallback)
- **Retry Logic**: Exponential backoff for transient failures (3 retries)
- **Rate Limiting**: User-specific rate limits to prevent API abuse
- **Token Tracking**: Precise usage monitoring for billing
- **Error Handling**: Comprehensive error classification
- **Security Protocol**: Automatic injection of safety guidelines

### Credit Calculation

**Conversion Rate**: 1 credit = $0.01 USD = 40 tokens

**Pricing Formula**:

```typescript
const credits = Math.ceil(promptTokens * inputTokenMultiplier + completionTokens * outputTokenMultiplier + baseCredits);
```

**Model-Specific Multipliers**:

- **reflection** (GPT-4o): baseCredits: 2, input: 0.0025, output: 0.01
- **diagnostic** (GPT-4.1): baseCredits: 5, input: 0.00375, output: 0.015
- **background** (GPT-4.1-mini): baseCredits: 1, input: 0.0015, output: 0.006
- **auxiliary** (GPT-4o-mini): baseCredits: 0.5, input: 0.00125, output: 0.005

## Authentication & Security

### Supabase Integration

- **Authentication Provider**: Supabase Auth
- **Session Management**: Server-side validation with middleware
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Role-Based Access**: Admin/user/tester role system

### Client-Side Encryption (Zero-Knowledge)

**Location**: `src/lib/crypto/webcrypto-crypto.ts`

**Key Features**:

- **AES-GCM Encryption**: Content encryption with integrity verification
- **AES-KW Key Wrapping**: Password-derived key wrapping
- **PBKDF2 Key Derivation**: 600,000 iterations with user-specific salt
- **Zero-Knowledge Architecture**: Server never sees decrypted user messages

**Encryption Flow**:

1. User password → PBKDF2 (600k iterations) → Wrapping key
2. Generate random AES-GCM content key → Encrypt session data
3. Wrap content key with password-derived wrapping key
4. Store wrapped key in user metadata, encrypted data in `Session.encryptedData`

**Server-Side Encryption**:

**Location**: `src/lib/crypto/server-crypto.ts`

Therapeutic data (analysis, memory, relational trace) is encrypted server-side with app-level encryption key and stored in `SessionContext.encryptedData`. This data is never sent to the client.

### Security Headers

```typescript
// next.config.ts
headers: [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
];
```

### Rate Limiting

**Location**: `src/lib/rate-limiting/`

- **User-specific limits**: Prevents API abuse and cost overruns
- **Window-based tracking**: Configurable time windows
- **Integration**: Applied to all AI operations
- **Error handling**: Clear user-facing messages when limits exceeded

## Session Management

### Session Encryption

**Location**: `src/domains/encrypted-session/`

**Two-Tier Encryption**:

1. **Client-Side** (User Password):

   - Encrypts: User messages only
   - Storage: `Session.encryptedData` (JSON blob)
   - Algorithm: AES-GCM with user-derived key

2. **Server-Side** (App Secret Key):
   - Encrypts: Analysis, memory, relational trace
   - Storage: `SessionContext.encryptedData` (JSON blob)
   - Algorithm: AES-GCM with app-level encryption key
   - Never sent to client

### Session Synchronization

**Location**: `src/domains/session-sync/`

**Two-Tier Architecture**:

- **Local Sync** (Active Store → Encrypted Store):

  - Trigger: Every user action (1s debounce)
  - Operations: Encrypt client data → Save to IndexedDB
  - Purpose: Fast local persistence

- **Cloud Sync** (Encrypted Store → Supabase):
  - Trigger: 10-minute periodic sync
  - Operations: Upload encrypted session to database
  - Conditional: Only if `session.persistOnCloud === true`
  - Purpose: Cross-device access and backup

**Key Features**:

- **Mutex Protection**: Prevents concurrent sync operations
- **Smart Deduplication**: Avoids redundant syncs when data unchanged
- **Exponential Backoff**: Robust retry logic for failed operations
- **Real-time Status**: Live sync status indicators
- **Error Recovery**: Manual retry buttons and automatic recovery

**Status Types**:

```typescript
type SyncStatus = "synced" | "pending" | "syncing" | "error";
type SyncStatusDetailed = { local: SyncStatus; cloud: SyncStatus | "disabled" };
```

### Session Memory

**Location**: `src/domains/session-memory/`

**Features**:

- **AI-Powered Consolidation**: Uses GPT-4.1-mini to merge and deduplicate facts
- **Size Management**: 150-300 word limit maintained automatically
- **Fact Consolidation**: Merges related information, removes outdated facts
- **Cross-Session Continuity**: Memory persists across sessions
- **Token Efficiency**: Prevents memory bloat while maintaining quality

**Update Trigger**: When user shares significant new information

### Session Duration Tracking

**Location**: `src/domains/active-session/`

- **Real Active Time**: Tracks actual conversation time only
- **Idle Detection**: Excludes gaps longer than 5 minutes
- **Smart Calculation**: Only counts time user is actively engaged
- **Storage**: `Session.metadata.activeDurationMs` and `lastActiveAt`

## Billing & Credit System

### Credit Economics

- **Conversion Rate**: 1 credit = $0.01 USD
- **Token Rate**: 40 tokens = 1 credit
- **Minimum Charge**: 1 credit per AI interaction
- **Rounding**: Always round up for user charges

### Credit Operations

**Location**: `src/app/actions/credit-actions.ts`

**Core Functions**:

- `addCredits()`: Purchase, bonus, refund operations
- `deductCredits()`: AI usage charges with atomic transactions
- `getUserCreditsBalance()`: Real-time balance queries
- `calculateAIMessageCost()`: Precise token-based billing

### Stripe Integration (Production Ready)

**Location**: `src/lib/billing/`

**Status**: Production Stripe Business account configured

**Payment Flow**:

1. **Intent Creation**: Create Stripe payment intent with metadata
2. **Client Payment**: Frontend handles payment with Stripe Elements
3. **Webhook Processing**: Server validates payment and adds credits
4. **Transaction Recording**: Complete audit trail with context

**Credit Packages**:

- **Starter**: 700 credits for $35 (~175 messages)
- **Regular**: 1500 credits for $75 (Most Popular)
- **Premium**: 3000 credits for $150

**Implemented Features**:

- ✅ Payment intent creation with metadata
- ✅ Successful payment processing via webhooks
- ✅ Refund processing with credit deduction
- ✅ Purchase history tracking
- ✅ Stripe customer management
- ✅ Rate limiting on webhooks
- ✅ Error handling with user-friendly messages
- ✅ Frontend billing UI (packages, history, settings)
- ✅ PCI-compliant payment security

**Subscription Infrastructure**:

- Handlers implemented for subscription events
- Database schema ready (Subscription, SubscriptionRenewal models)
- Logic pending for recurring credit allocation

## User Interface Components

### Chat Interface

**Location**: `src/components/chat-interface/`

**Components**:

- **Flow Chat**: Structured onboarding and guided sessions
- **Open Chat**: Free-form therapeutic dialogue
- **Message Rendering**: Markdown support, typing indicators
- **Input Handling**: Rich text input with validation

### Credit Management UI

**Location**: `src/components/credits/`

**Components**:

- **Credits Balance**: Real-time balance display
- **Cost Estimator**: Live pricing as user types
- **Transaction History**: Complete audit trail
- **Purchase Interface**: Stripe integration
- **Insufficient Credits Warning**: Clear upgrade path

### Session Management

**Location**: `src/components/sessions/`

**Features**:

- **Session List**: Encrypted session previews
- **Session Details**: Analysis summaries, quick actions
- **Cloud Sync Status**: Encryption and sync indicators
- **Export Options**: Data portability

## Internationalization

### Language Support

**Supported Locales**: English (EN), Arabic (AR), French (FR)

**Translation Files**:

```
src/locales/
├── en/
├── ar/     # Full RTL support
└── fr/
    ├── common.json
    ├── errors.json
    ├── legal.json
    ├── pages.json
    └── sessions.json
```

**RTL Support**:

- Arabic language full RTL implementation
- Dynamic text direction switching
- UI component RTL adaptations

## Performance Optimizations

### Chat Flow Performance

**Optimization Results**: ~40% faster perceived response time (10s → 5-7s)

**Key Improvements**:

- **Non-Blocking Memory Updates**: Memory operations moved to background
- **Optimized Credit Operations**: Single DB transaction instead of multiple calls
- **Background Session Sync**: Session sync operations don't block UI
- **Parallel Operations**: Non-critical operations parallelized

### Database Design

- **Strategic Indexes**: Optimized for common query patterns
- **Connection Pooling**: Efficient database resource usage via Supabase
- **Query Optimization**: Minimal data transfer
- **Batched Operations**: Credit operations use atomic transactions

### Caching Strategy

- **Client-Side State**: Zustand with persistence
- **Session Storage**: Temporary encryption keys
- **IndexedDB**: Long-term local data storage

### UI Optimizations

- **Debounced Inputs**: Prevents excessive API calls (300ms debounce)
- **Skeleton Loading**: Responsive user feedback during loading states
- **Error Boundaries**: Isolated failure handling
- **Code Splitting**: Dynamic imports for large components

## Testing Infrastructure

### Test Coverage

**Test Files**: 20 test files in `src/`

**Coverage Areas**:

- ✅ **Revenue Functions**: Credits calculation (19 tests), cost estimation (30 tests)
- ✅ **Security**: WebCrypto (34 tests), session encryption (13 tests)
- ✅ **AI Integration**: Rate limiting (17 tests), client actions (25 tests)
- ✅ **Authentication**: Basic auth flow tests
- ✅ **Billing**: Stripe webhooks, payment processing
- ✅ **Session Management**: Sync operations, flow utilities (72 tests)

**Test Locations**:

```
src/
├── app/actions/__tests__/
│   ├── ai-client-actions.test.ts
│   ├── ai-client-actions-rate-limiting.test.ts
│   ├── auth-actions.test.ts
│   ├── billing-actions.test.ts
│   └── credit-actions.test.ts
├── lib/
│   ├── crypto/__tests__/webcrypto-crypto.test.ts
│   └── rate-limiting/__tests__/rate-limiter.test.ts
└── domains/
    ├── encrypted-session/__tests__/
    ├── session-sync/__tests__/
    ├── credits/__tests__/
    └── [other domain tests]
```

**Test Framework**: Vitest with Next.js 15 integration

## Logging & Monitoring

### Unified Logging System

**Location**: `src/lib/logging/unified-logger.ts`

**Features**:

- **Structured Logging**: Consistent log format across application
- **Error Management**: Automatic error classification
- **Audit Trails**: User actions and system events
- **Performance Tracking**: Operation timing and success rates

**Log Levels**:

- **AUDIT**: User actions and business events
- **ERROR**: Application errors with full context
- **WARN**: Non-critical issues and warnings
- **INFO**: General operational information

### Database Logging

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  operation String   // Clean operation name
  level     LogLevel // AUDIT | ERROR | WARN | INFO
  message   String   // Human-readable message
  errorCode String?  // Structured error codes
  sessionId String?  // Session correlation
  userAgent String?  // Client information
  metadata  Json?    // Additional context
  createdAt DateTime @default(now())
}
```

## Error Handling

### Error System

**Location**: `src/lib/errors/`

**Error Classification**:

- **AUTH\_**: Authentication and authorization errors
- **AI\_**: AI service and processing errors
- **CRYPTO\_**: Encryption and security errors
- **BILLING\_**: Payment and credit system errors
- **SESSION\_**: Session management errors
- **VALIDATION\_**: Input validation failures

**Error Flow**:

1. **Operation Fails** → Log with context
2. **Throw AppError** → Structured error object
3. **UI Display** → User-friendly error message
4. **Recovery Options** → Actionable guidance for user

## Development Workflow

### Scripts

```json
{
  "build": "pnpx prisma generate && next build",
  "dev": "next dev",
  "format": "prettier --write .",
  "lint": "eslint \"src/**/*.+(ts|tsx)\"",
  "test": "vitest",
  "test:watch": "vitest --watch"
}
```

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **Prisma**: Type-safe database access
- **Vitest**: Fast unit test runner

### Environment Configuration

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Authentication
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=

# AI Services
OPEN_ROUTER_API_KEY=
OPENAI_API_KEY=

# Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Security Considerations

### Data Protection

- **Client-Side Encryption**: All user messages encrypted before transmission
- **Zero-Knowledge**: Server cannot decrypt user conversations
- **Key Management**: User-controlled encryption keys
- **Secure Headers**: OWASP recommended security headers implemented

### Access Control

- **Authentication**: Supabase Auth with server-side session validation
- **Authorization**: Role-based access control (admin/user/tester)
- **API Security**: Server-side validation for all endpoints
- **Rate Limiting**: Request throttling to prevent abuse

### Compliance Readiness

- **GDPR**: Data portability and deletion capabilities
- **HIPAA**: Encryption and audit trail support
- **SOC 2**: Security and availability controls

## Deployment & Infrastructure

### Production Environment

- **Platform**: Vercel (Next.js optimized)
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics

### Environment Variables

All sensitive configuration managed through Vercel environment variables with development/staging/production separation.

### CI/CD Pipeline

- **Platform**: Vercel (built-in CI/CD)
- **Auto-deploy**: Automatic on git push
- **Build Process**: Prisma generation + Next.js build
- **Environment validation**: Required variables checked at build time
- **Type checking**: TypeScript strict mode validation
- **Linting**: ESLint checks on deployment

### Branch Strategy

- **main**: Production branch (auto-deploy to production)
- **develop**: Development branch (auto-deploy to staging)
- **feature/\***: Feature branches (preview deployments)

## Quick Start Guide for New Developers

### 1. Setup Environment

```bash
pnpm install  # Project uses pnpm, not npm
cp .env.example .env.local
# Request environment variables from team lead
```

### 2. Database Setup

```bash
pnpx prisma generate
pnpx prisma db push
```

### 3. Start Development

```bash
pnpm dev
```

### 4. Key Areas to Understand

- **Domain Logic**: `/src/domains/` - Business logic organization
- **Server Actions**: `/src/app/actions/` - Data operations
- **Encryption**: `/src/lib/crypto/` - Security implementation
- **AI Integration**: `/src/domains/ai-conversation/` - AI service layer
- **Conversation Engine**: `/src/domains/conversation-engine/` - Core therapeutic logic
- **Credits System**: `/src/domains/credits/` + `/src/lib/credits/` - Revenue-critical billing
- **Testing**: `/src/**/__tests__/` - Unit test coverage

### 5. Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Check code quality
pnpm format       # Format code
```

---

This documentation provides a comprehensive overview of the Innuora project architecture, implementation details, and current status. It serves as the authoritative reference for understanding the codebase structure, design decisions, and technical implementation.

**Last Updated**: November 6, 2025

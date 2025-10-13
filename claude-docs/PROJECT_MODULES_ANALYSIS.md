# Mirael Project - Functional Modules Analysis

## Project Overview

Mirael is a sophisticated AI-powered mental health and therapeutic chat application built with Next.js 15, focusing on Cognitive Behavioral Therapy (CBT) methodologies. The application features advanced encryption, session management, and multilingual support.

## 🏗️ Core Functional Modules

### 1. **Authentication & User Management**

- **Location**: `src/app/actions/auth-actions.ts`, `src/components/auth/`
- **Description**: Supabase-based auth with email verification, user profiles, and admin controls
- **Key Features**:
  - Sign-up/sign-in with email verification
  - Role-based access control (user/admin)
  - User profile management with demographics
  - User configuration management (theme, locale, auto-save)
- **Key Functions**: `signUp()`, `signIn()`, `signOut()`, `requireCurrentUser()`, `requireAdmin()`

### 2. **AI/Chat System (Mirael Core)**

- **Location**: `src/lib/ai/mirael-core/v2/`, `src/app/actions/ai-client-actions.ts`
- **Description**: Advanced therapeutic AI with CBT modules and psychological analysis
- **Key Features**:
  - **State Analysis Engine**: Analyzes user emotional state and psychological patterns
  - **CBT Modules System**: 7 therapeutic modules for different interventions
  - **Multi-Provider AI Integration**: OpenAI and OpenRouter support
  - **Conversation Flow Management**: Structured therapeutic conversations
- **CBT Modules**:
  - `COGNITIVE`: Pattern recognition and cognitive distortion identification
  - `BEHAVIORAL_ACTIVATION`: Depression and low energy intervention
  - `MINDFULNESS`: Rumination and emotional regulation techniques
  - `VALUES_CLARIFICATION`: Meaning-making and personal agency building
  - `CORE_BELIEFS`: Deep belief exploration using downward arrow technique
  - `REFRAMING`: Alternative perspective exploration
  - `SHOULDS`: Rigid internal rules identification and softening
- **Key Functions**: `handleUserInput()`, `analyzeUserInput()`, `SendPromptsToAi()`

### 3. **Session Management**

- **Location**: `src/app/actions/session-actions.ts`, `src/components/sessions/`
- **Description**: Therapeutic conversation session lifecycle management
- **Key Features**:
  - Session CRUD operations with user authorization
  - Session metadata tracking (message count, token usage, cost)
  - Session title auto-generation and manual updates
  - Session flow control and step management
- **Key Functions**: `createSession()`, `updateSession()`, `deleteSession()`, `listSessionsByUser()`

### 4. **Data Encryption & Security**

- **Location**: `src/lib/crypto/webcrypto-crypto.ts`
- **Description**: Client-side encryption for sensitive therapeutic data
- **Key Features**:
  - **WebCrypto API Integration**: Browser-native encryption
  - **PBKDF2 Key Derivation**: Password-based key derivation (600k iterations)
  - **AES-GCM Content Encryption**: 256-bit AES encryption for data
  - **AES-KW Key Wrapping**: Secure key storage mechanism
  - **Multi-Storage Support**: SessionStorage and IndexedDB integration
- **Key Functions**: `deriveWrappingKeyFromPassword()`, `encryptObjectWithKey()`, `decryptObjectWithKey()`

### 5. **Session Synchronization**

- **Location**: `src/lib/session-sync/simple-sync.ts`, `src/components/session-sync/`
- **Description**: Intelligent local/cloud sync with user consent
- **Key Features**:
  - **Two-Tier Sync Architecture**: Local sync (frequent) and Cloud sync (periodic)
  - **Debounced Operations**: Efficient sync with configurable delays
  - **User Consent Handling**: Respects `persistOnCloud` user preferences
  - **Conflict Resolution**: Handles sync conflicts and error states
  - **Status Tracking**: Real-time sync status monitoring
- **Key Functions**: `queueLocalSync()`, `queueCloudSync()`, `syncSessionBoth()`

### 6. **Internationalization (i18n)**

- **Location**: `src/lib/i18n/`, `src/locales/`
- **Description**: Multi-language support (EN/AR/FR) with RTL
- **Key Features**:
  - **Supported Languages**: English, Arabic (RTL), French
  - **Namespace Organization**: Common, pages, legal, sessions, errors
  - **Date Formatting**: Locale-specific date formatting with date-fns
  - **Dynamic Loading**: On-demand translation resource loading
- **Key Functions**: `initTranslations()`, language switching components

### 7. **Error Handling & Monitoring**

- **Location**: `src/lib/errors/`
- **Description**: Comprehensive error management with structured codes
- **Key Features**:
  - **Structured Error Codes**: Categorized error taxonomy
  - **Context-Rich Logging**: Detailed error context and metadata
  - **User-Friendly Messages**: Localized error messages
  - **Error Recovery**: Retry mechanisms and graceful degradation
- **Key Functions**: `errorManager.handleError()`, `errorManager.wrapOperation()`

### 8. **State Management**

- **Location**: `src/stores/`, `src/lib/ai/mirael-core/v2/stores/`
- **Description**: Zustand-based application state management
- **Key Features**:
  - **User Data Store**: User preferences and configuration
  - **Active Session Store**: Current session state management
  - **Encrypted Sessions Store**: Encrypted session data storage
  - **Messages Store**: Chat message state management
  - **Persisted Store Base**: Common persistence patterns

### 9. **UI Component System**

- **Location**: `src/components/`
- **Description**: Design system with specialized chat interfaces
- **Key Features**:
  - **Design System**: Consistent UI components using Radix UI and Tailwind
  - **Chat UI**: Flow-based and open chat interfaces
  - **Authentication UI**: Sign-in/sign-up forms with validation
  - **Session Management UI**: Session cards, lists, and management
  - **Theme System**: Dark/light mode with system detection
  - **Form Components**: Reusable form inputs with validation

### 10. **Database Layer**

- **Location**: `prisma/schema.prisma`, `src/lib/prisma.ts`
- **Description**: PostgreSQL database with Prisma ORM
- **Key Features**:
  - **User Management**: Users, profiles, configurations
  - **Session Storage**: Encrypted session data with metadata
  - **Audit Trail**: Activity logs and transactions
  - **Payment System**: Subscription and points management
  - **Feature Flags**: User-specific feature toggles

### 11. **Legal & Compliance**

- **Location**: `src/app/[locale]/(legal)/`
- **Description**: Multi-language legal documents and compliance
- **Key Features**:
  - Terms of Service, Privacy Policy, EULA
  - Multi-language legal documents
  - User consent tracking
  - Age verification requirements

## 📁 Current vs Suggested Folder Structure

### Current Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # UI components
├── lib/                    # Utilities and business logic
├── stores/                 # State management
├── types/                  # TypeScript types
├── locales/               # i18n translations
└── errors/                # Error definitions
```

### 🎯 Suggested Improved Structure (React/Next.js Standard)

```
src/
├── app/                          # Next.js App Router (keep as-is)
├── components/                   # 🔄 Improved organization
│   ├── ui/                       # Base UI components (buttons, inputs, etc.)
│   ├── auth/                     # Authentication components
│   ├── chat/                     # Chat interface components
│   ├── sessions/                 # Session management components
│   ├── sync/                     # Sync status components
│   ├── forms/                    # Reusable form components
│   └── layout/                   # Layout components
├── lib/                          # 🔄 Better organized utilities
│   ├── auth/                     # Authentication utilities
│   ├── ai/                       # AI/chat logic (keep mirael-core structure)
│   ├── sessions/                 # Session management logic
│   ├── crypto/                   # Encryption utilities
│   ├── sync/                     # Synchronization logic
│   ├── errors/                   # Error handling
│   ├── i18n/                     # Internationalization
│   ├── db/                       # Database utilities (Prisma client)
│   ├── validations/              # Zod schemas and validation
│   └── utils/                    # General utilities
├── hooks/                        # 🆕 Custom React hooks
│   ├── auth/                     # Authentication hooks
│   ├── chat/                     # Chat-related hooks
│   ├── sessions/                 # Session hooks
│   └── common/                   # Shared hooks
├── stores/                       # Zustand stores (keep as-is)
├── types/                        # TypeScript definitions (keep as-is)
├── constants/                    # 🆕 Application constants
├── providers/                    # 🆕 React context providers
├── locales/                      # i18n translations (keep as-is)
└── styles/                       # Global styles and CSS
```

## 🎯 Benefits of New Structure

### 1. **React/Next.js Standard Compliance**

- **Familiar**: Follows established React/Next.js conventions
- **Onboarding**: New developers immediately understand the structure
- **Tooling**: Better IDE support and community tooling compatibility
- **Documentation**: Aligns with official Next.js documentation

### 2. **Improved Organization Within Standard Folders**

- **Components**: Organized by feature area instead of flat structure
- **Lib**: Better categorization of utilities and business logic
- **Hooks**: Dedicated folder for custom React hooks (standard practice)
- **Types**: Centralized TypeScript definitions

### 3. **Clear Separation by Responsibility**

- **UI Layer**: `components/` - Pure presentation components
- **Business Logic**: `lib/` - Core application logic
- **State Management**: `stores/` - Zustand stores
- **Integration Layer**: `hooks/` - React integration hooks

### 4. **Scalability Within Standard Structure**

- Easy to add new feature areas within existing folders
- Clear import paths: `@/components/auth/`, `@/lib/sessions/`
- Standard React patterns for hooks and components
- Maintainable without breaking conventions

### 5. **Developer Experience**

- **Familiar Patterns**: Standard React/Next.js folder structure
- **Easy Navigation**: Predictable file locations
- **Import Clarity**: Clear distinction between UI, logic, and state
- **Team Consistency**: Follows industry best practices

## 🔑 Key Architectural Highlights

1. **Security-First Design**: Client-side encryption with zero-trust architecture
2. **Therapeutic Focus**: Evidence-based CBT methodology implementation
3. **Scalable AI Integration**: Multi-provider support with cost tracking
4. **User Privacy**: Granular consent controls and local-first data approach
5. **International Accessibility**: Full RTL support and multi-language capabilities
6. **Progressive Enhancement**: Works offline with intelligent sync

## 📊 Module Complexity Analysis

| Module             | Complexity | Lines of Code | Critical for MVP |
| ------------------ | ---------- | ------------- | ---------------- |
| AI/Chat System     | High       | ~2000+        | ✅ Critical      |
| Authentication     | Medium     | ~800          | ✅ Critical      |
| Session Management | Medium     | ~600          | ✅ Critical      |
| Data Encryption    | High       | ~400          | ✅ Critical      |
| Session Sync       | Medium     | ~300          | ⚠️ Important     |
| i18n               | Low        | ~200          | ⚠️ Important     |
| Error Handling     | Low        | ~150          | ⚠️ Important     |
| UI Components      | Medium     | ~1000         | ✅ Critical      |
| Database Layer     | Low        | ~100          | ✅ Critical      |
| Legal & Compliance | Low        | ~50           | ⚠️ Important     |

---

_This analysis reveals a sophisticated, well-architected application with strong separation of concerns and comprehensive feature coverage for a therapeutic AI platform._

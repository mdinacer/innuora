# Key File Locations and Components

## Critical Files for Understanding the System

### 1. Core Application Entry Points

- **`src/app/[locale]/page.tsx`** - Homepage
- **`src/app/[locale]/(protected)/sessions/page.tsx`** - Sessions listing
- **`src/app/[locale]/(protected)/sessions/[sessionId]/page.tsx`** - Individual session chat
- **`src/middleware.ts`** - Authentication and i18n routing

### 2. AI System Core Files

- **`src/lib/ai/mirael-core/v2/mirael-chat.action.ts`** - Main AI processing entry point
- **`src/lib/ai/mirael-core/v2/state-analysis/state-analysis.action.ts`** - User input analysis
- **`src/lib/ai/mirael-core/v2/modules/modules.core.ts`** - Therapeutic module definitions
- **`src/lib/ai/shared/prompts/prompt.persona.ts`** - Mirael's AI personality definition

### 3. Database and Data Management

- **`prisma/schema.prisma`** - Complete database schema
- **`src/app/actions/session-actions.ts`** - Session CRUD operations
- **`src/app/actions/auth-actions.ts`** - Authentication server actions
- **`src/lib/crypto/encryption.ts`** - Data encryption utilities

### 4. Authentication System

- **`src/lib/supabase/client.ts`** - Client-side Supabase setup
- **`src/lib/supabase/server.ts`** - Server-side Supabase setup
- **`src/components/auth/sign-in-form.tsx`** - Sign-in component
- **`src/components/auth/sign-up-form.tsx`** - Sign-up component

### 5. Chat UI Components

- **`src/components/chat-ui/open-chat-ui.container.tsx`** - Main chat interface
- **`src/components/chat-ui/open-chat/open-chat.main.tsx`** - Chat conversation area
- **`src/components/chat-ui/open-chat/open-chat.input.tsx`** - Message input component

### 6. State Management

- **`src/stores/session.store.ts`** - Session state management
- **`src/stores/user-data.store.ts`** - User data persistence
- **`src/lib/ai/mirael-core/v2/stores/active-session.store.ts`** - Active chat session state

### 7. Internationalization

- **`src/lib/i18n/config.ts`** - i18n configuration
- **`src/locales/en/common.json`** - English translations
- **`src/locales/fr/common.json`** - French translations
- **`src/locales/ar/common.json`** - Arabic translations

### 8. Configuration and Constants

- **`src/lib/constants/app-config.ts`** - Application configuration
- **`src/lib/constants/ai-models.ts`** - AI model definitions and pricing
- **`package.json`** - Dependencies and scripts
- **`next.config.ts`** - Next.js configuration

## Component Architecture Map

### Authentication Flow

```
middleware.ts → auth/layout.tsx → sign-in-form.tsx → auth-actions.ts → supabase
```

### Chat Session Flow

```
sessions/page.tsx → session-card.tsx → sessions/[sessionId]/page.tsx →
open-chat-ui.container.tsx → mirael-chat.action.ts → OpenAI API
```

### Data Encryption Flow

```
user input → encryption.ts → session-actions.ts → prisma → PostgreSQL
```

### AI Processing Pipeline

```
user input → state-analysis.action.ts → modules.core.ts →
mirael-chat.action.ts → OpenAI API → encrypted storage
```

## Important Directories

### `/src/app/`

- Next.js App Router pages and layouts
- Server Actions for backend logic
- Route handlers for API endpoints

### `/src/components/`

- **`auth/`** - Authentication components
- **`chat-ui/`** - Chat interface components
- **`home-page/`** - Landing page components
- **`sessions/`** - Session management components
- **`ui/`** - Reusable UI primitives (Radix-based)

### `/src/lib/`

- **`ai/`** - AI processing and prompt management
- **`crypto/`** - Encryption and security utilities
- **`supabase/`** - Database client configuration
- **`constants/`** - Application constants and configuration

### `/src/stores/`

- Zustand state management stores
- Client-side data persistence
- Session and user state management

### `/src/types/`

- TypeScript type definitions
- Interface definitions for AI models
- Type safety for the entire application

## Configuration Files

### Core Configuration

- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.js`** - Styling configuration
- **`components.json`** - UI component configuration
- **`eslint.config.mjs`** - Code quality rules
- **`prettier.config.mjs`** - Code formatting rules

### Database Configuration

- **`prisma/schema.prisma`** - Database schema definition
- **`prisma/migrations/`** - Database migration history

### Deployment Configuration

- **`next.config.ts`** - Next.js build and runtime configuration
- **`app/manifest.ts`** - PWA manifest generation
- **`app/robots.ts`** - SEO robots.txt generation

## Key Hooks and Utilities

### Custom Hooks

- **`src/hooks/use-mobile.ts`** - Mobile device detection
- **`src/lib/ai/mirael-core/v2/use-mirael-chat.ts`** - AI chat state management

### Utility Functions

- **`src/lib/utils.ts`** - General utility functions
- **`src/utils/capitalize-word.ts`** - Text formatting utilities
- **`src/lib/chat/flow/generate-id.ts`** - ID generation for chat messages

## Error Handling

- **`src/errors/ai-errors.ts`** - AI-specific error types
- **`src/errors/auth.errors.ts`** - Authentication error handling
- **`src/errors/user-input.errors.ts`** - Input validation errors
- **`src/errors/user.errors.ts`** - User operation errors

## Testing and Development

- **`artifacts/`** - HTML prototypes and design artifacts
- **`project-structure.txt`** - Project documentation
- **`app-details.md`** - Application requirements and specifications

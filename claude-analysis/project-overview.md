# Mirael Project Analysis

## Project Overview

Mirael is a Next.js 15 application designed as an emotional mirror and mental clarity assistant for high-functioning, successful women experiencing emotional exhaustion and burnout. The application uses AI-powered conversation to help users gain emotional clarity and challenge cognitive distortions.

## Technology Stack

### Frontend & Framework

- **Next.js 15** with React 19 (latest versions)
- **TypeScript** for type safety
- **TailwindCSS** with custom plugins for UI styling
- **Radix UI** components for accessible UI primitives
- **Motion** (successor to Framer Motion) for animations
- **React Hook Form** with Zod validation
- **Zustand** for state management
- **i18next** for internationalization (supports en, fr, ar)

### Backend & Database

- **Prisma** ORM with PostgreSQL database
- **Supabase** for authentication and real-time features
- **OpenAI API** for AI-powered conversations
- **Server Actions** for backend logic (Next.js App Router)

### Infrastructure & Deployment

- **Vercel** (evident from analytics package)
- **Crypto encryption** for sensitive session data
- **LocalForage** for client-side persistence

## Application Architecture

### Core Components

1. **Authentication System** (`src/app/[locale]/auth/`)

   - Sign-in/sign-up with email verification
   - Password reset functionality
   - Protected routes with middleware
   - Supabase integration

2. **Session Management** (`src/app/[locale]/(protected)/sessions/`)

   - Encrypted session storage
   - Session CRUD operations
   - Real-time session state management

3. **AI Chat System** (`src/lib/ai/mirael-core/`)

   - **v1 & v2** implementations (v2 is current)
   - State analysis and user input processing
   - Module-based response generation
   - Cost tracking and token usage monitoring

4. **Internationalization** (`src/locales/`)
   - Support for English, French, and Arabic
   - Middleware-based locale detection
   - Comprehensive translation coverage

### Key Features

#### Mirael AI Core (v2)

- **State Analysis**: Analyzes user input for emotional state, intensity, themes
- **Module System**:
  - Cognitive distortion detection
  - Core beliefs identification
  - Crisis intervention
  - Reframing assistance
  - "Should" statements recognition
- **Memory Management**: Session memory and context preservation
- **Multi-language Support**: Responses adapt to user's locale

#### Security & Privacy

- **End-to-end Encryption**: Session data encrypted with AES-256-GCM
- **User-specific Encryption**: Each user has unique encryption salt
- **Secure Authentication**: Supabase Auth with email verification
- **Data Protection**: Sensitive information never stored in plaintext

#### User Experience

- **Responsive Design**: Mobile-first with safe area support
- **Dark/Light Theme**: System-aware theme switching
- **Progressive Enhancement**: Works without JavaScript for core features
- **Real-time Updates**: Live session synchronization

## Database Schema

### Core Entities

- **User**: Authentication, points system, encryption settings
- **Profile**: User preferences, emotional concerns, coping mechanisms
- **Session**: Encrypted conversation data with metadata
- **Subscription**: Plan management and billing
- **Audit Logs**: User activity tracking

### Features

- **Points System**: Transaction-based usage tracking
- **Feature Flags**: Per-user feature enablement
- **Admin Tools**: User management and adjustments
- **Feedback System**: User rating and comments

## File Structure Highlights

```
src/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Internationalized routes
│   ├── actions/             # Server Actions
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── chat-ui/            # Chat interface components
│   ├── sessions/           # Session management
│   └── ui/                 # Reusable UI components
├── lib/                     # Core library code
│   ├── ai/                 # AI processing logic
│   ├── crypto/             # Encryption utilities
│   ├── supabase/           # Database client
│   └── constants/          # Application constants
├── stores/                  # Zustand state stores
├── types/                   # TypeScript type definitions
└── locales/                # Translation files
```

## Development Workflow

### Scripts Available

- `dev`: Development server
- `build`: Production build with Prisma generation
- `lint`: ESLint with TypeScript support
- `format`: Prettier code formatting

### Code Quality

- **ESLint** with TypeScript and React rules
- **Prettier** with import sorting and Tailwind class sorting
- **Husky** pre-commit hooks (implied by prettier config)

## Key Insights

1. **Mature Architecture**: Well-structured codebase with clear separation of concerns
2. **Security-First**: Comprehensive encryption and privacy protection
3. **Scalable AI System**: Modular approach to AI processing with version management
4. **International Ready**: Built-in support for multiple languages and regions
5. **Performance Optimized**: Modern React patterns, efficient state management
6. **User-Centric Design**: Focus on emotional safety and user experience

## Current Status

- Clean git status on `dev` branch
- Recent commits show active development on authentication and data encryption
- V2 AI system appears to be the current implementation
- Internationalization recently updated with middleware improvements

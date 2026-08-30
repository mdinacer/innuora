# Innuora

**AI-powered reflective intelligence platform built with Next.js, TypeScript, Supabase, and modern AI infrastructure.**

Innuora is a full-stack web application built around personalized AI conversations and reflective experiences.

The application combines a modern Next.js frontend with a PostgreSQL-backed data layer, authentication, persistent user sessions, AI model integrations, structured domain logic, client-side state management, payments, internationalization, testing, and security-focused infrastructure.

This repository represents the **main application codebase** of the Innuora platform.

---

## Overview

Innuora is designed around personalized AI-assisted conversations that help users reflect on their experiences and develop greater awareness of their thoughts, emotions, and behavioral patterns.

The application combines:

```text
User
 │
 ▼
Web Application
 │
 ├── Authentication
 ├── Conversation UI
 ├── Sessions
 ├── User preferences
 ├── Localization
 └── Product features
        │
        ▼
Application / Domain Logic
        │
        ├── AI orchestration
        ├── Validation
        ├── Session management
        └── Business rules
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
     Supabase  Prisma    AI Providers
     /Postgres           OpenAI/OpenRouter
```

---

## Key Features

- AI-powered conversational experiences
- Personalized sessions
- Authentication and user accounts
- Persistent user data
- Session management
- Internationalization
- English, French, and Arabic support
- RTL support
- AI model integration
- OpenAI API integration
- OpenRouter integration
- Structured AI processing
- Client-side state management
- Encrypted client-side data handling
- Stripe integration
- Responsive UI
- Accessible interface components
- Form validation
- Automated testing
- End-to-end testing
- Database migrations
- Production build analysis
- Performance monitoring

---

## Technology Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Next.js App Router
- Tailwind CSS
- Radix UI
- Zustand
- React Hook Form

### Backend / Data

- Supabase
- PostgreSQL
- Prisma 6
- Next.js Server Actions
- Server-side application logic

### AI

- OpenAI API
- OpenRouter
- Custom application AI logic
- Tokenization with `js-tiktoken`

### Payments

- Stripe
- Stripe React integration

### Validation & Security

- Zod
- Web Crypto APIs
- Supabase SSR authentication
- Server-side validation

### Testing

- Vitest
- Testing Library
- Playwright
- jsdom
- happy-dom

### Internationalization

- i18next
- react-i18next
- next-i18n-router
- RTL support

### Tooling

- ESLint
- Prettier
- TypeScript
- Tailwind CSS
- Next.js Bundle Analyzer

### Monitoring

- Vercel Analytics
- Vercel Speed Insights

---

## Application Architecture

The project uses the Next.js App Router together with domain-oriented application modules.

A simplified architecture:

```text
src
│
├── app
│   ├── routes
│   ├── actions
│   └── layouts
│
├── components
│   └── UI and feature components
│
├── domains
│   └── Domain-specific application logic
│
├── lib
│   ├── AI
│   ├── authentication
│   ├── crypto
│   ├── database
│   ├── payments
│   └── shared infrastructure
│
├── stores
│   └── Zustand state
│
├── hooks
│   └── Reusable React hooks
│
├── locales
│   └── Translation resources
│
├── config
│   └── Application configuration
│
└── types
    └── Shared TypeScript types
```

The current source tree separates application routes, reusable UI, domains, infrastructure, state, localization, and shared types. 

---

## AI Architecture

AI functionality is treated as an application subsystem rather than placing model calls directly inside UI components.

The project includes dedicated AI-related infrastructure under:

```text
src/lib/ai/
```

and contains the Innuora-specific AI/CBT processing layer.

The conceptual flow is:

```text
User Message
      │
      ▼
Conversation UI
      │
      ▼
Application Logic
      │
      ▼
AI Orchestration
      │
      ├── Context
      ├── Session State
      ├── Instructions
      ├── Model Selection
      └── Token Management
      │
      ▼
AI Provider
      │
      ├── OpenAI
      └── OpenRouter
      │
      ▼
Processed Response
      │
      ▼
Conversation State
```

This separation makes the AI layer independently testable and easier to evolve as models and prompting strategies change.

---

## Domain-Oriented Organization

The application contains a dedicated:

```text
src/domains/
```

layer.

This allows domain-specific concepts and behavior to remain separate from generic UI and infrastructure code.

A domain-oriented architecture helps prevent the application from becoming a collection of unrelated components with business logic scattered throughout the UI.

---

## Authentication

Authentication is implemented with Supabase and its server-side rendering support.

The project includes:

```text
@supabase/supabase-js
@supabase/ssr
```

The authentication architecture integrates with Next.js's server/client boundaries.

The general flow is:

```text
User
 │
 ▼
Authentication UI
 │
 ▼
Supabase Auth
 │
 ▼
Authenticated Session
 │
 ▼
Next.js Application
 │
 ├── Server-side access
 └── Client-side state
```

Authentication state can therefore be consumed from both server-oriented and client-oriented application code.

---

## Database

The application uses PostgreSQL through Supabase.

Prisma is used as the application's database ORM and schema layer.

Relevant dependencies include:

```text
@prisma/client
prisma
```

The project also includes Prisma migration and generation commands.

The database workflow is:

```text
Application
    │
    ▼
Prisma
    │
    ▼
PostgreSQL
    │
    ▼
Supabase
```

---

## Database Management

Generate the Prisma client:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Open Prisma Studio:

```bash
npm run db:studio
```

The application generates the Prisma client automatically during installation and production builds.

---

## State Management

The application uses **Zustand** for client-side state.

This is used to manage state that needs to persist across components without introducing a large global Redux-style architecture.

The project also includes persistence functionality through browser storage.

The general model is:

```text
Server / Database
       │
       ▼
Application Logic
       │
       ▼
Zustand Store
       │
       ▼
React Components
```

This allows server-backed data and transient UI state to be handled separately.

---

## Session Management

Conversation/session state is an important part of the application.

The project includes dedicated session-related infrastructure and client-side persistence.

Because conversational data can be sensitive, the application also includes a dedicated crypto layer:

```text
src/lib/crypto/
```

This provides a boundary for encryption-related functionality rather than spreading cryptographic operations throughout the UI.

---

## Client-Side Encryption

The application includes Web Crypto-based functionality for handling sensitive client-side data.

The conceptual model is:

```text
Sensitive Data
      │
      ▼
Crypto Layer
      │
      ▼
Encrypted Representation
      │
      ▼
Client Storage / Transport
```

This keeps cryptographic operations behind a dedicated abstraction.

---

## Payments

Stripe is integrated into the application for payment-related functionality.

The project uses both:

```text
@stripe/stripe-js
@stripe/react-stripe-js
stripe
```

This provides both client-side payment functionality and server-side Stripe integration.

Payment functionality is kept separate from the core conversational UI and domain logic.

---

## Internationalization

The application supports:

```text
English
French
Arabic
```

Arabic includes RTL support.

Internationalization is implemented with:

- i18next
- react-i18next
- next-i18n-router
- i18next-resources-to-backend

The application therefore supports localized content while keeping the underlying component architecture shared.

---

## UI Architecture

The UI is built from reusable components using:

- Radix UI primitives
- Tailwind CSS
- Lucide React
- Custom application components

Radix provides accessible behavioral primitives while the application controls the visual presentation through Tailwind and its own component layer.

This approach allows consistent interaction patterns without coupling the application to a single visual component library.

---

## Forms & Validation

Structured forms use:

```text
React Hook Form
+
Zod
```

with:

```text
@hookform/resolvers
```

The general validation flow is:

```text
User Input
    │
    ▼
React Hook Form
    │
    ▼
Zod Schema
    │
    ├── Valid
    │     │
    │     ▼
    │   Application Logic
    │
    └── Invalid
          │
          ▼
      Validation Errors
```

This provides runtime validation in addition to TypeScript's compile-time guarantees.

---

## Server Actions

The application contains a dedicated:

```text
src/app/actions/
```

area for server-side application operations.

This allows operations that require server-side privileges, database access, or protected credentials to remain outside client-side bundles.

The conceptual boundary is:

```text
Client Component
      │
      ▼
Server Action
      │
      ├── Validation
      ├── Authentication
      ├── Database
      ├── AI
      └── External Services
```

---

## Testing

The project has a multi-layer testing setup.

### Unit / Component Testing

Vitest is used for unit and component-level tests.

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:coverage
```

### UI Test Runner

```bash
npm run test:ui
```

### End-to-End Testing

Playwright is included for browser-level testing.

This allows the project to test the application beyond isolated React components.

---

## Type Safety

TypeScript is used throughout the application.

Type checking can be run independently:

```bash
npm run typecheck
```

This provides a separate validation step from ESLint.

The combination of:

```text
TypeScript
+
Zod
+
Prisma
```

provides type safety across several application boundaries:

```text
Database
    │
    ▼
Prisma Types
    │
    ▼
Application
    │
    ▼
Runtime Validation
    │
    ▼
User Input / External Data
```

---

## Code Quality

The project uses ESLint and Prettier.

Run ESLint:

```bash
npm run lint
```

Automatically fix lint issues:

```bash
npm run lint:fix
```

Format the project:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

---

## Performance

The project includes:

- Next.js production optimization
- Bundle analyzer
- Vercel Analytics
- Vercel Speed Insights

Bundle analysis can be run with:

```bash
npm run build:analyze
```

This makes it possible to inspect client bundle composition and identify opportunities for reducing frontend cost.

---

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL/Supabase project
- Required AI provider credentials
- Stripe configuration when payment functionality is enabled

### Install

```bash
npm install
```

### Environment

Create a local environment file:

```bash
cp .env.example .env.local
```

Populate the required values for the services used by the application.

Do not commit production secrets or API keys.

### Start development

```bash
npm run dev
```

---

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Generate Prisma client and build production application |
| `npm run start` | Start production server |
| `npm test` | Run Vitest |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:ui` | Open Vitest UI |
| `npm run test:coverage` | Generate test coverage |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Automatically fix ESLint issues |
| `npm run format` | Format the project |
| `npm run format:check` | Check formatting |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run build:analyze` | Analyze the Next.js bundle |

---

## Project Structure

```text
innuora
│
├── src
│   │
│   ├── app
│   │   ├── actions
│   │   └── routes / layouts
│   │
│   ├── components
│   │   └── UI and feature components
│   │
│   ├── config
│   │   └── Application configuration
│   │
│   ├── constants
│   │   └── Shared constants
│   │
│   ├── content
│   │   └── Application content
│   │
│   ├── domains
│   │   └── Domain-specific logic
│   │
│   ├── hooks
│   │   └── Reusable React hooks
│   │
│   ├── lib
│   │   ├── ai
│   │   ├── crypto
│   │   └── Infrastructure/services
│   │
│   ├── locales
│   │   └── Translation resources
│   │
│   ├── stores
│   │   └── Zustand stores
│   │
│   ├── types
│   │   └── Shared TypeScript types
│   │
│   └── middleware.ts
│
├── prisma
│   └── Database schema and migrations
│
├── public
│   └── Static assets
│
├── tests
│   └── Test infrastructure
│
└── configuration
```

---

## Engineering Highlights

Innuora brings together several areas of modern full-stack development:

- Next.js App Router
- React 19
- TypeScript
- Supabase
- PostgreSQL
- Prisma
- Server Actions
- AI provider integration
- AI application orchestration
- OpenAI
- OpenRouter
- Zustand
- Stripe
- Web Crypto
- Internationalization
- RTL support
- Zod validation
- React Hook Form
- Vitest
- Testing Library
- Playwright
- ESLint
- Prettier
- Tailwind CSS
- Radix UI
- Vercel Analytics
- Vercel Speed Insights

The application is particularly representative of **full-stack product engineering around an AI-powered product**, where the challenge extends beyond calling an LLM API and includes authentication, persistence, session management, validation, payments, security, localization, testing, and production infrastructure.

---

## Related Repositories

### Innuora Web

Public-facing website:

https://github.com/mdinacer/innuora-web

### Innuora Mobile

Mobile application repository:

https://github.com/mdinacer/innuora-app

---

## Project Status

Innuora is an independent product development project.

The repository represents the main web application and its supporting full-stack infrastructure.

It is maintained as a product-oriented engineering project demonstrating modern frontend, backend, AI integration, and application architecture.

---

## Repository

https://github.com/mdinacer/innuora

---

## License

No explicit open-source license is currently defined for this repository.

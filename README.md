# Mirael - Internal Development

**AI-Powered Therapeutic Chat Platform**

Internal development repository for Mirael - a Next.js 15 application providing personalized therapeutic conversations using Cognitive Behavioral Therapy (CBT) methodologies.

## 📋 Project Info

- **Environment**: Development/Internal
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Team Access**: Internal only

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Access to team environment variables
- Supabase account credentials

### Local Development Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Ask team lead for environment variables
   ```

3. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── app/          # Next.js routes
├── components/   # UI components
├── lib/          # Business logic
├── stores/       # State management
└── locales/      # Translations (EN/AR/FR)
```

**Detailed structure**: See [PROJECT_MODULES_ANALYSIS.md](./PROJECT_MODULES_ANALYSIS.md)

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run lint         # Run ESLint
npm run db:studio    # Open Prisma Studio
```

## 🔧 Key Technologies

- **Next.js 15** - App Router, React 18, TypeScript
- **Supabase** - Database, Auth, Edge Functions  
- **AI**: OpenAI + OpenRouter APIs
- **State**: Zustand with persistence
- **UI**: Tailwind CSS + Radix UI
- **Security**: WebCrypto encryption

## 📝 Development Notes

### Core Modules
- **Authentication**: Supabase auth with role-based access
- **AI Chat**: CBT-focused therapeutic conversations
- **Session Management**: Encrypted session storage and sync
- **Internationalization**: EN/AR/FR with RTL support

### Important Files
- `src/lib/ai/mirael-core/v2/` - Core AI/CBT engine
- `src/lib/crypto/` - Client-side encryption
- `src/app/actions/` - Server actions
- `prisma/schema.prisma` - Database schema

### Environment Variables Needed
Ask team lead for:
- Database credentials
- Supabase keys
- OpenAI/OpenRouter API keys
- Encryption keys

## 🔄 Deployment

**Staging**: Auto-deploy from `develop` branch  
**Production**: Manual deploy from `main` branch

Environment variables are managed in Vercel dashboard.

---

**Internal Development Repository**  
*For team use only*

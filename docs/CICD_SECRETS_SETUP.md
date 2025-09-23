# CI/CD Secrets Configuration Guide

## Overview

This document outlines the required repository secrets for the Innuora CI/CD pipeline to function properly. All secrets should be added to your GitHub repository settings under **Settings > Secrets and variables > Actions**.

## Required Repository Secrets

### 🗄️ Database Configuration

#### Staging Environment
- `STAGING_DATABASE_URL`: PostgreSQL connection string for staging database
  - Format: `postgresql://username:password@host:port/database`
  - Example: `postgresql://user:pass@staging-db.example.com:5432/innuora_staging`

- `STAGING_DIRECT_URL`: Direct PostgreSQL connection (for Prisma migrations)
  - Usually same as `STAGING_DATABASE_URL` but may use connection pooling bypass
  - Format: `postgresql://username:password@host:port/database`

#### Production Environment
- `PRODUCTION_DATABASE_URL`: PostgreSQL connection string for production database
  - Format: `postgresql://username:password@host:port/database`
  - Example: `postgresql://user:pass@prod-db.example.com:5432/innuora_prod`

- `PRODUCTION_DIRECT_URL`: Direct PostgreSQL connection for production
  - Format: `postgresql://username:password@host:port/database`

### 🔐 Authentication & Supabase

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
  - Format: `https://your-project-id.supabase.co`
  - This is public, used in client-side code

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
  - Format: `eyJ...` (JWT token)
  - This is public, used for client-side authentication

- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (private)
  - Format: `eyJ...` (JWT token)
  - Used for server-side operations with full permissions

### 🤖 AI Services

- `OPENAI_API_KEY`: OpenAI API key for GPT models
  - Format: `sk-...`
  - Required for AI conversation features

- `OPEN_ROUTER_API_KEY`: OpenRouter API key for alternative AI models
  - Format: `sk-or-...`
  - Required for free AI model options

### 💳 Stripe Payment Configuration

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
  - Format: `pk_live_...` (production) or `pk_test_...` (test mode)
  - This is public, used in client-side code

- `STRIPE_SECRET_KEY`: Stripe secret key
  - Format: `sk_live_...` (production) or `sk_test_...` (test mode)
  - Used for server-side payment processing

- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
  - Format: `whsec_...`
  - Used to verify webhook authenticity

#### Stripe Product Price IDs
- `STRIPE_PRICE_STARTER`: Price ID for starter credit package
  - Format: `price_...`
  - Example: `price_1S9bxgCkl61wF9R3477zZcna`

- `STRIPE_PRICE_REGULAR`: Price ID for regular credit package
  - Format: `price_...`

- `STRIPE_PRICE_PREMIUM`: Price ID for premium credit package
  - Format: `price_...`

### 🔒 Security

- `ENCRYPTION_KEY`: 32-character encryption key for client-side data encryption
  - Format: 32 characters (letters, numbers, symbols)
  - Example: `your-32-character-encryption-key!`
  - Used for encrypting sensitive user data

### 📊 Optional: Monitoring & Notifications

- `SLACK_WEBHOOK_URL`: Slack webhook for deployment notifications
  - Format: `https://hooks.slack.com/services/...`
  - Used by database migration workflow

- `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`: Vercel Analytics ID
  - Format: `prj_...`
  - Optional for analytics tracking

## GitHub Environments

The repository should have two environments configured:

### 🧪 Staging Environment
- Name: `staging`
- Secrets: All staging-specific secrets (database URLs, etc.)
- Used for: Development branch deployments

### 🚀 Production Environment
- Name: `production`
- Secrets: All production-specific secrets
- Protection rules: Require review, restrict to main branch
- Used for: Main branch deployments

## Current Workflow Overview

### 1. CI Pipeline (`ci.yml`)
**Triggers**: Push/PR to main or dev branches
**Purpose**: Run tests, linting, type checking, and build verification
**Secrets Used**:
- All secrets with fallbacks to test values
- Ensures build works with real configuration

### 2. Deploy Health Check (`deploy.yml`)
**Triggers**: Push to main or dev branches
**Purpose**: Verify deployment health and notify via commit comments
**Domains**:
- Staging: `https://dev.innuora.com`
- Production: `https://www.innuora.com`

### 3. Database Migration (`db-migrate.yml`)
**Triggers**: Manual workflow dispatch
**Purpose**: Run database migrations on staging/production
**Features**:
- Environment selection (staging/production)
- Production confirmation requirement
- Slack notifications
- Multiple migration actions (deploy, reset, seed, generate)

## Adding Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name from the list above
5. Paste the secret value and click **Add secret**

## Environment Setup in GitHub

1. Go to **Settings** > **Environments**
2. Create two environments: `staging` and `production`
3. For production environment, add protection rules:
   - ✅ Required reviewers (add yourself)
   - ✅ Restrict pushes to main branch only
4. Add environment-specific secrets to each environment

## Verifying Setup

After adding all secrets, you can verify the setup by:

1. **Running CI Pipeline**: Push to dev branch and check if build succeeds
2. **Database Migration**: Run the database migration workflow manually
3. **Health Checks**: Push to main and verify health check comments appear

## Security Best Practices

- ✅ Never commit secrets to the repository
- ✅ Use environment-specific secrets (staging vs production)
- ✅ Rotate secrets regularly
- ✅ Use least-privilege access for service accounts
- ✅ Monitor secret usage in GitHub Actions logs
- ✅ Set up environment protection rules for production

## Troubleshooting

### Build Failures
- Check if all required secrets are present
- Verify secret names match exactly (case-sensitive)
- Ensure database connectivity from GitHub Actions runners

### Database Migration Issues
- Verify database URLs are accessible
- Check Prisma schema is up to date
- Ensure proper database permissions

### Deployment Health Check Failures
- Verify domain configuration (DNS)
- Check if health API endpoint exists (`/api/health`)
- Ensure application is properly deployed

## Next Steps

1. Add all secrets to GitHub repository
2. Set up staging and production environments
3. Configure Vercel deployment with proper environment variables
4. Test CI/CD pipeline with a test commit
5. Run database migration to staging environment
6. Verify production deployment process

---

**Last Updated**: $(date)
**Environment**: GitHub Actions CI/CD
**Project**: Innuora - AI Emotional Companion
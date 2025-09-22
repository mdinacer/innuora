# CI/CD Implementation Guide for Mirael

This guide provides a comprehensive approach to implementing Continuous Integration and Continuous Deployment (CI/CD) for the Mirael therapeutic AI platform.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [GitHub Actions CI/CD Setup](#github-actions-cicd-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Strategies](#deployment-strategies)
7. [Security Considerations](#security-considerations)
8. [Monitoring and Rollback](#monitoring-and-rollback)
9. [Best Practices](#best-practices)

## Overview

### Project Stack
- **Frontend**: Next.js 15 with TypeScript
- **Testing**: Vitest with 228 comprehensive tests
- **Package Manager**: pnpm
- **Database**: Prisma ORM
- **Deployment Target**: Vercel (recommended for Next.js)

### CI/CD Goals
- Automated testing on every pull request
- Automated deployments to staging and production
- Security scanning and vulnerability checks
- Performance monitoring and rollback capabilities
- Zero-downtime deployments

## Prerequisites

### Required Accounts and Tools
- GitHub repository with admin access
- Vercel account (or preferred hosting platform)
- Environment variables properly configured
- Database access for staging and production

### Repository Structure Verification
```
mirael-rewrite-clean/
├── .github/
│   └── workflows/
├── src/
├── tests/
├── package.json
├── vitest.config.ts
├── next.config.js
├── prisma/
└── docs/
```

## GitHub Actions CI/CD Setup

### 1. Create GitHub Actions Workflows

Create the following workflow files in `.github/workflows/`:

#### Main CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Generate Prisma client
        run: pnpm prisma generate
        
      - name: Run type checking
        run: pnpm run typecheck
        
      - name: Run linting
        run: pnpm run lint
        
      - name: Run tests
        run: pnpm test --run --coverage
        env:
          # Add test environment variables here
          NODE_ENV: test
          
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          fail_ci_if_error: false
          
      - name: Build application
        run: pnpm run build
        env:
          # Add build environment variables here
          NODE_ENV: production

  security:
    name: Security Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run security audit
        run: pnpm audit --audit-level moderate
        
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

#### Production Deployment Workflow (`.github/workflows/deploy-production.yml`)

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run database migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          
      - name: Run post-deployment tests
        run: pnpm run test:e2e
        env:
          BASE_URL: ${{ secrets.PRODUCTION_URL }}
```

#### Staging Deployment Workflow (`.github/workflows/deploy-staging.yml`)

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run database migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
          
      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          
      - name: Comment PR with preview URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployment is ready! Check it out at the Vercel preview URL.'
            })
```

## Environment Configuration

### 1. GitHub Secrets Setup

Navigate to your GitHub repository → Settings → Secrets and Variables → Actions, and add:

#### Required Secrets
```
# Vercel Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Database URLs
PRODUCTION_DATABASE_URL=your_production_db_url
STAGING_DATABASE_URL=your_staging_db_url

# Application URLs
PRODUCTION_URL=https://your-production-domain.com
STAGING_URL=https://your-staging-domain.vercel.app

# API Keys and Services
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_app_url

# Security Scanning
SNYK_TOKEN=your_snyk_token (optional)
```

### 2. Environment Variables per Environment

#### Production Environment Variables
```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
DATABASE_URL=${PRODUCTION_DATABASE_URL}
NEXTAUTH_URL=${PRODUCTION_URL}
OPENAI_API_KEY=${OPENAI_API_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
```

#### Staging Environment Variables
```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging
DATABASE_URL=${STAGING_DATABASE_URL}
NEXTAUTH_URL=${STAGING_URL}
OPENAI_API_KEY=${OPENAI_API_KEY}
STRIPE_SECRET_KEY=${STRIPE_TEST_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_TEST_WEBHOOK_SECRET}
```

## Testing Strategy

### 1. Test Pipeline Integration

Update `package.json` to include CI-specific scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest --run --coverage --reporter=json --reporter=default",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit",
    "lint": "eslint \"src/**/*.+(ts|tsx)\"",
    "lint:fix": "eslint \"src/**/*.+(ts|tsx)\" --fix",
    "build": "pnpx prisma generate && next build",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "prisma db seed"
  }
}
```

### 2. Test Coverage Requirements

Configure Vitest coverage in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/.next/**'
      ]
    }
  }
})
```

### 3. Branch Protection Rules

Configure branch protection in GitHub:

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - Require status checks before merging
   - Require branches to be up to date
   - Required status checks: `test`, `security`
   - Require review from code owners
   - Dismiss stale reviews when new commits are pushed

## Deployment Strategies

### 1. Vercel Deployment Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2. Database Migration Strategy

Create a database migration workflow (`.github/workflows/db-migrate.yml`):

```yaml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to migrate'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  migrate:
    name: Run Database Migration
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: '9'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets[format('{0}_DATABASE_URL', upper(github.event.inputs.environment))] }}
          
      - name: Verify migration
        run: pnpm prisma db pull --print
        env:
          DATABASE_URL: ${{ secrets[format('{0}_DATABASE_URL', upper(github.event.inputs.environment))] }}
```

## Security Considerations

### 1. Secrets Management
- Never commit secrets to the repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Use different secrets for staging and production

### 2. Dependency Security
- Enable Dependabot alerts
- Use `pnpm audit` in CI pipeline
- Consider using Snyk or similar tools

### 3. Code Security
- Implement ESLint security rules
- Use SonarCloud for code quality
- Enable CodeQL analysis

Create `.github/workflows/codeql.yml`:

```yaml
name: "CodeQL"

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 6 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript' ]
        
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}
          
      - name: Autobuild
        uses: github/codeql-action/autobuild@v2
        
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

## Monitoring and Rollback

### 1. Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Add health checks here
    const checks = {
      database: await checkDatabase(),
      redis: await checkRedis(),
      external_apis: await checkExternalAPIs(),
    };
    
    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
    
    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    }, {
      status: allHealthy ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 503
    });
  }
}

async function checkDatabase() {
  // Implement database health check
  return { status: 'healthy', latency: '5ms' };
}

async function checkRedis() {
  // Implement Redis health check
  return { status: 'healthy', latency: '2ms' };
}

async function checkExternalAPIs() {
  // Implement external API health checks
  return { status: 'healthy', apis: ['openai', 'stripe'] };
}
```

### 2. Rollback Strategy

Create a rollback workflow (`.github/workflows/rollback.yml`):

```yaml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - staging
          - production
      deployment_id:
        description: 'Deployment ID to rollback to'
        required: true
        type: string

jobs:
  rollback:
    name: Rollback Deployment
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - name: Rollback Vercel deployment
        run: |
          vercel rollback ${{ github.event.inputs.deployment_id }} --token ${{ secrets.VERCEL_TOKEN }}
          
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "🔄 Deployment rollback completed",
              attachments: [{
                color: "warning",
                fields: [{
                  title: "Environment",
                  value: "${{ github.event.inputs.environment }}",
                  short: true
                }, {
                  title: "Rolled back to",
                  value: "${{ github.event.inputs.deployment_id }}",
                  short: true
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Best Practices

### 1. Git Workflow
- Use feature branches for all changes
- Require pull request reviews
- Use conventional commit messages
- Tag releases with semantic versioning

### 2. Testing Best Practices
- Maintain high test coverage (>80%)
- Include integration tests for critical paths
- Use parallel test execution
- Fail fast on test failures

### 3. Deployment Best Practices
- Deploy to staging first
- Use feature flags for gradual rollouts
- Monitor key metrics after deployment
- Have a rollback plan ready

### 4. Performance Monitoring
- Set up monitoring alerts
- Track Core Web Vitals
- Monitor API response times
- Set up error tracking (Sentry)

## Implementation Checklist

### Phase 1: Basic CI/CD Setup
- [ ] Create GitHub Actions workflows
- [ ] Configure GitHub Secrets
- [ ] Set up Vercel project
- [ ] Test deployment pipeline

### Phase 2: Advanced Features
- [ ] Add security scanning
- [ ] Implement health checks
- [ ] Set up monitoring
- [ ] Create rollback procedures

### Phase 3: Optimization
- [ ] Add performance monitoring
- [ ] Implement feature flags
- [ ] Set up staging environment
- [ ] Add end-to-end tests

### Phase 4: Maintenance
- [ ] Document procedures
- [ ] Train team members
- [ ] Schedule regular reviews
- [ ] Plan disaster recovery

## Conclusion

This CI/CD implementation provides a robust, secure, and scalable deployment pipeline for the Mirael therapeutic AI platform. The setup ensures code quality, security, and reliability while enabling rapid and safe deployments.

For questions or issues with the CI/CD setup, refer to the troubleshooting section or consult the team lead.
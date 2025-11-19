-- CreateEnum
CREATE TYPE "public"."AiOperationType" AS ENUM ('DIRECTIVE', 'MEMORY_ANALYSIS', 'REFLECTION', 'SESSION_WELLNESS');

-- CreateEnum
CREATE TYPE "public"."LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'AUDIT');

-- CreateEnum
CREATE TYPE "public"."CreditTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'user', 'tester');

-- CreateEnum
CREATE TYPE "public"."AgeGroup" AS ENUM ('Age18_24', 'Age25_34', 'Age35_44', 'Age45_54', 'Age55Plus');

-- CreateEnum
CREATE TYPE "public"."IdentityConnectionLevel" AS ENUM ('authentic', 'conflicted', 'disconnected', 'lost');

-- CreateEnum
CREATE TYPE "public"."CopingMechanism" AS ENUM ('shutdown', 'self_critical', 'overwhelmed', 'push_through');

-- CreateEnum
CREATE TYPE "public"."SocialPressureSource" AS ENUM ('family', 'friends', 'work_or_school', 'romantic', 'cultural_or_religious', 'self');

-- CreateEnum
CREATE TYPE "public"."EmotionalConcern" AS ENUM ('anxiety', 'self_worth', 'overthinking', 'loneliness', 'burnout', 'mood_swings', 'identity_crisis', 'other');

-- CreateEnum
CREATE TYPE "public"."EmotionalAspirations" AS ENUM ('clarity', 'calm', 'confidence', 'self_compassion', 'connection', 'direction', 'not_sure');

-- CreateEnum
CREATE TYPE "public"."ThemeMode" AS ENUM ('light', 'dark', 'system');

-- CreateEnum
CREATE TYPE "public"."UserAccountStatus" AS ENUM ('active', 'inactive', 'deleted', 'locked', 'banned');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled', 'unpaid', 'paused', 'trialing', 'incomplete', 'incomplete_expired');

-- CreateEnum
CREATE TYPE "public"."RenewalStatus" AS ENUM ('pending', 'processed', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "public"."UserTier" AS ENUM ('FREE', 'STARTER', 'REGULAR', 'PREMIUM');

-- CreateEnum
CREATE TYPE "public"."DirectiveIntent" AS ENUM ('contain', 'validate', 'gently_explore', 'reframe', 'anchor');

-- CreateEnum
CREATE TYPE "public"."DirectiveStance" AS ENUM ('grounding', 'steady', 'exploratory', 'nurturing', 'directive');

-- CreateEnum
CREATE TYPE "public"."DirectiveTone" AS ENUM ('calm', 'warm', 'curious', 'firm', 'light');

-- CreateEnum
CREATE TYPE "public"."DirectiveRiskLevel" AS ENUM ('none', 'low', 'moderate');

-- CreateEnum
CREATE TYPE "public"."CrisisLevel" AS ENUM ('none', 'mild', 'moderate', 'high', 'immediate');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "auth_id" TEXT NOT NULL,
    "role" "public"."UserRole" DEFAULT 'user',
    "tier" "public"."UserTier" DEFAULT 'FREE',
    "credits_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "public"."UserAccountStatus" DEFAULT 'active',
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "encryption_salt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "age_group" "public"."AgeGroup",
    "identity_connection" "public"."IdentityConnectionLevel",
    "coping_mechanism" "public"."CopingMechanism",
    "social_pressure_sources" "public"."SocialPressureSource"[] DEFAULT ARRAY[]::"public"."SocialPressureSource"[],
    "emotional_concerns" "public"."EmotionalConcern"[] DEFAULT ARRAY[]::"public"."EmotionalConcern"[],
    "emotional_aspirations" "public"."EmotionalAspirations"[] DEFAULT ARRAY[]::"public"."EmotionalAspirations"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "auto_save" BOOLEAN NOT NULL DEFAULT false,
    "theme" "public"."ThemeMode" DEFAULT 'system',
    "locale" TEXT DEFAULT 'en',
    "font_size" TEXT DEFAULT 'medium',
    "enable_animation" BOOLEAN NOT NULL DEFAULT false,
    "analytics_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "share_improvements" BOOLEAN NOT NULL DEFAULT true,
    "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "operation" TEXT NOT NULL,
    "level" "public"."LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "errorCode" TEXT,
    "session_id" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "autoUpdateTitle" BOOLEAN NOT NULL DEFAULT false,
    "persistOnCloud" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL,
    "messages" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_contexts" (
    "session_id" TEXT NOT NULL,
    "relational_trace" JSONB,
    "session_wellness" JSONB,
    "factual_memory" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_contexts_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "public"."reflection_directives" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "intent" "public"."DirectiveIntent" NOT NULL,
    "stance" "public"."DirectiveStance" NOT NULL,
    "tone" "public"."DirectiveTone" NOT NULL,
    "allow_psychoeducation" BOOLEAN NOT NULL,
    "allow_curiosity" BOOLEAN NOT NULL,
    "risk_level" "public"."DirectiveRiskLevel" NOT NULL,
    "crisis" "public"."CrisisLevel" NOT NULL,
    "cognitive_patterns" TEXT[],
    "emotional_themes" TEXT[],
    "distortions_detected" TEXT[],
    "implicit_needs" TEXT[],
    "rationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflection_directives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_operation_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "operation" "public"."AiOperationType" NOT NULL,
    "model" TEXT NOT NULL,
    "message_id" TEXT,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "credits_charged" DECIMAL(10,2) NOT NULL,
    "raw_cost_usd" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_operation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."credit_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."CreditTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "session_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "stripe_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMP(3),
    "plan_id" TEXT NOT NULL,
    "credits_per_period" INTEGER NOT NULL,
    "price_amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "trial_start" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_renewals" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "credits_granted" INTEGER NOT NULL,
    "amount_paid_cents" INTEGER NOT NULL,
    "invoice_id" TEXT,
    "payment_intent_id" TEXT,
    "status" "public"."RenewalStatus" NOT NULL DEFAULT 'pending',
    "processed_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_renewals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "public"."users"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_configs_user_id_key" ON "public"."user_configs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "public"."audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_operation_created_at_idx" ON "public"."audit_logs"("operation", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_level_created_at_idx" ON "public"."audit_logs"("level", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_errorCode_idx" ON "public"."audit_logs"("errorCode");

-- CreateIndex
CREATE INDEX "audit_logs_session_id_idx" ON "public"."audit_logs"("session_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "sessions_user_id_created_at_idx" ON "public"."sessions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "sessions_user_id_updated_at_idx" ON "public"."sessions"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "session_contexts_session_id_idx" ON "public"."session_contexts"("session_id");

-- CreateIndex
CREATE INDEX "ai_operation_logs_user_id_timestamp_idx" ON "public"."ai_operation_logs"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "ai_operation_logs_session_id_timestamp_idx" ON "public"."ai_operation_logs"("session_id", "timestamp");

-- CreateIndex
CREATE INDEX "ai_operation_logs_operation_timestamp_idx" ON "public"."ai_operation_logs"("operation", "timestamp");

-- CreateIndex
CREATE INDEX "ai_operation_logs_timestamp_idx" ON "public"."ai_operation_logs"("timestamp");

-- CreateIndex
CREATE INDEX "credit_transactions_user_id_created_at_idx" ON "public"."credit_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_user_id_type_created_at_idx" ON "public"."credit_transactions"("user_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_reason_created_at_idx" ON "public"."credit_transactions"("reason", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_type_idx" ON "public"."credit_transactions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_id_key" ON "public"."subscriptions"("stripe_id");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_configs" ADD CONSTRAINT "user_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("auth_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_contexts" ADD CONSTRAINT "session_contexts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reflection_directives" ADD CONSTRAINT "reflection_directives_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."session_contexts"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_operation_logs" ADD CONSTRAINT "ai_operation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_operation_logs" ADD CONSTRAINT "ai_operation_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_renewals" ADD CONSTRAINT "subscription_renewals_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_renewals" ADD CONSTRAINT "subscription_renewals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

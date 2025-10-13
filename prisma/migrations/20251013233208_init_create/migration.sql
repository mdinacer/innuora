-- CreateEnum
CREATE TYPE "AiOperationType" AS ENUM ('ANALYSIS', 'RESPONSE', 'MEMORY_UPDATE', 'MEMORY_RECALL', 'SESSION_WELLNESS', 'SESSION_SUMMARY', 'TITLE_UPDATE', 'DIAGNOSTIC');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'AUDIT');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user', 'tester');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('Age18_24', 'Age25_34', 'Age35_44', 'Age45_54', 'Age55Plus');

-- CreateEnum
CREATE TYPE "IdentityConnectionLevel" AS ENUM ('authentic', 'conflicted', 'disconnected', 'lost');

-- CreateEnum
CREATE TYPE "CopingMechanism" AS ENUM ('shutdown', 'self_critical', 'overwhelmed', 'push_through');

-- CreateEnum
CREATE TYPE "SocialPressureSource" AS ENUM ('family', 'friends', 'work_or_school', 'romantic', 'cultural_or_religious', 'self');

-- CreateEnum
CREATE TYPE "EmotionalConcern" AS ENUM ('anxiety', 'self_worth', 'overthinking', 'loneliness', 'burnout', 'mood_swings', 'identity_crisis', 'other');

-- CreateEnum
CREATE TYPE "EmotionalAspirations" AS ENUM ('clarity', 'calm', 'confidence', 'self_compassion', 'connection', 'direction', 'not_sure');

-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('light', 'dark', 'system');

-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('active', 'inactive', 'deleted', 'locked', 'banned');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled', 'unpaid', 'paused', 'trialing', 'incomplete', 'incomplete_expired');

-- CreateEnum
CREATE TYPE "RenewalStatus" AS ENUM ('pending', 'processed', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('FREE', 'STARTER', 'REGULAR', 'PREMIUM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "auth_id" TEXT NOT NULL,
    "role" "UserRole" DEFAULT 'user',
    "tier" "UserTier" DEFAULT 'FREE',
    "credits_balance" INTEGER NOT NULL DEFAULT 0,
    "status" "UserAccountStatus" DEFAULT 'active',
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "encryption_salt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "age_group" "AgeGroup",
    "identity_connection" "IdentityConnectionLevel",
    "coping_mechanism" "CopingMechanism",
    "social_pressure_sources" "SocialPressureSource"[] DEFAULT ARRAY[]::"SocialPressureSource"[],
    "emotional_concerns" "EmotionalConcern"[] DEFAULT ARRAY[]::"EmotionalConcern"[],
    "emotional_aspirations" "EmotionalAspirations"[] DEFAULT ARRAY[]::"EmotionalAspirations"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "auto_save" BOOLEAN NOT NULL DEFAULT false,
    "theme" "ThemeMode" DEFAULT 'system',
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
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "operation" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
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
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "autoUpdateTitle" BOOLEAN NOT NULL DEFAULT false,
    "persist_on_cloud" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL,
    "encrypted_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_contexts" (
    "session_id" TEXT NOT NULL,
    "encrypted_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_contexts_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "ai_operation_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "operation" "AiOperationType" NOT NULL,
    "model" TEXT NOT NULL,
    "message_id" TEXT,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "credits_charged" INTEGER NOT NULL,
    "raw_cost_usd" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_operation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "session_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "stripe_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
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
CREATE TABLE "subscription_renewals" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "credits_granted" INTEGER NOT NULL,
    "amount_paid_cents" INTEGER NOT NULL,
    "invoice_id" TEXT,
    "payment_intent_id" TEXT,
    "status" "RenewalStatus" NOT NULL DEFAULT 'pending',
    "processed_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_renewals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "users"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_configs_user_id_key" ON "user_configs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_operation_created_at_idx" ON "audit_logs"("operation", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_level_created_at_idx" ON "audit_logs"("level", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_errorCode_idx" ON "audit_logs"("errorCode");

-- CreateIndex
CREATE INDEX "audit_logs_session_id_idx" ON "audit_logs"("session_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "sessions_user_id_created_at_idx" ON "sessions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "sessions_user_id_updated_at_idx" ON "sessions"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "session_contexts_session_id_idx" ON "session_contexts"("session_id");

-- CreateIndex
CREATE INDEX "ai_operation_logs_user_id_timestamp_idx" ON "ai_operation_logs"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "ai_operation_logs_session_id_timestamp_idx" ON "ai_operation_logs"("session_id", "timestamp");

-- CreateIndex
CREATE INDEX "ai_operation_logs_operation_timestamp_idx" ON "ai_operation_logs"("operation", "timestamp");

-- CreateIndex
CREATE INDEX "ai_operation_logs_timestamp_idx" ON "ai_operation_logs"("timestamp");

-- CreateIndex
CREATE INDEX "credit_transactions_user_id_created_at_idx" ON "credit_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_user_id_type_created_at_idx" ON "credit_transactions"("user_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_reason_created_at_idx" ON "credit_transactions"("reason", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_type_idx" ON "credit_transactions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_id_key" ON "subscriptions"("stripe_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_configs" ADD CONSTRAINT "user_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("auth_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_contexts" ADD CONSTRAINT "session_contexts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_operation_logs" ADD CONSTRAINT "ai_operation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_operation_logs" ADD CONSTRAINT "ai_operation_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_renewals" ADD CONSTRAINT "subscription_renewals_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_renewals" ADD CONSTRAINT "subscription_renewals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

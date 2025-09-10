-- CreateEnum
CREATE TYPE "public"."PointsTransactionType" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'user', 'tester');

-- CreateEnum
CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('free', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('active', 'canceled', 'past_due');

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
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "auth_id" TEXT NOT NULL,
    "role" "public"."UserRole" DEFAULT 'user',
    "points_balance" INTEGER NOT NULL DEFAULT 0,
    "points_consumed" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."UserAccountStatus" DEFAULT 'active',
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan" "public"."SubscriptionPlan" DEFAULT 'free',
    "status" "public"."SubscriptionStatus" DEFAULT 'active',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "auto_save" BOOLEAN NOT NULL DEFAULT false,
    "theme" "public"."ThemeMode" DEFAULT 'system',
    "locale" TEXT DEFAULT 'en',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "summary" BYTEA,
    "analysis" BYTEA,
    "key_id" TEXT,
    "enc_alg" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."points_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."PointsTransactionType" DEFAULT 'credit',
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feedbacks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_feature_flags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_ref" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_adjustments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."testers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "occupation" TEXT,
    "struggles" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "public"."users"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "public"."subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_configs_user_id_key" ON "public"."user_configs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "public"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "points_transactions_user_id_idx" ON "public"."points_transactions"("user_id");

-- CreateIndex
CREATE INDEX "points_transactions_created_at_idx" ON "public"."points_transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_feature_flags_user_id_flag_key" ON "public"."user_feature_flags"("user_id", "flag");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "public"."payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "public"."payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "testers_email_key" ON "public"."testers"("email");

-- CreateIndex
CREATE INDEX "testers_email_idx" ON "public"."testers"("email");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_configs" ADD CONSTRAINT "user_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."points_transactions" ADD CONSTRAINT "points_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_feature_flags" ADD CONSTRAINT "user_feature_flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_adjustments" ADD CONSTRAINT "admin_adjustments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_adjustments" ADD CONSTRAINT "admin_adjustments_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

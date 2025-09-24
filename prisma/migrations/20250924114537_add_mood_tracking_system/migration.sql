-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled', 'unpaid', 'paused', 'trialing', 'incomplete', 'incomplete_expired');

-- CreateEnum
CREATE TYPE "public"."RenewalStatus" AS ENUM ('pending', 'processed', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "public"."EmotionCategory" AS ENUM ('joy', 'gratitude', 'calm', 'confident', 'neutral', 'worried', 'sad', 'angry', 'overwhelmed', 'exhausted');

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

-- CreateTable
CREATE TABLE "public"."mood_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "mood_value" INTEGER NOT NULL,
    "emotions" "public"."EmotionCategory"[] DEFAULT ARRAY[]::"public"."EmotionCategory"[],
    "notes" TEXT,
    "context" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_id_key" ON "public"."subscriptions"("stripe_id");

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_renewals" ADD CONSTRAINT "subscription_renewals_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_renewals" ADD CONSTRAINT "subscription_renewals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mood_entries" ADD CONSTRAINT "mood_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mood_entries" ADD CONSTRAINT "mood_entries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

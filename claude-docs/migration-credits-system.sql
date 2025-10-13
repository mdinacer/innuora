-- Migration: Replace Points System with Credits System
-- Date: 2024-09-19
-- Description: Remove points-related fields and models, implement credits system

-- Step 1: Remove unused models and their data
DROP TABLE IF EXISTS "public"."admin_adjustments";
DROP TABLE IF EXISTS "public"."payments";
DROP TABLE IF EXISTS "public"."user_feature_flags";
DROP TABLE IF EXISTS "public"."feedbacks";
DROP TABLE IF EXISTS "public"."subscriptions";

-- Step 2: Remove points transaction table
DROP TABLE IF EXISTS "public"."points_transactions";

-- Step 3: Remove unused enums
DROP TYPE IF EXISTS "public"."PaymentStatus";
DROP TYPE IF EXISTS "public"."SubscriptionStatus";
DROP TYPE IF EXISTS "public"."SubscriptionPlan";
DROP TYPE IF EXISTS "public"."PointsTransactionType";

-- Step 4: Create new credit transaction type enum
CREATE TYPE "public"."CreditTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- Step 5: Create credit transactions table
CREATE TABLE "public"."credit_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."CreditTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "session_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create indexes for credit transactions
CREATE INDEX "credit_transactions_user_id_idx" ON "public"."credit_transactions"("user_id");
CREATE INDEX "credit_transactions_created_at_idx" ON "public"."credit_transactions"("created_at");
CREATE INDEX "credit_transactions_type_idx" ON "public"."credit_transactions"("type");
CREATE INDEX "credit_transactions_reason_idx" ON "public"."credit_transactions"("reason");

-- Step 7: Add foreign key constraint
ALTER TABLE "public"."credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Remove points-related columns from users table
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "points_balance";
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "points_consumed";

-- Step 9: Add credits balance column to users table
ALTER TABLE "public"."users" ADD COLUMN "credits_balance" INTEGER NOT NULL DEFAULT 0;

-- Step 10: Optional - Migrate any existing points data to credits (1:1 conversion)
-- If there were any points in the old system, this would convert them:
-- UPDATE "public"."users" SET "credits_balance" = COALESCE(old_points_balance, 0);

-- Step 11: Create initial credit balance for existing users (optional welcome bonus)
-- UPDATE "public"."users" SET "credits_balance" = 100 WHERE "credits_balance" = 0;

-- Verification queries (run after migration):
-- SELECT COUNT(*) FROM "public"."credit_transactions";
-- SELECT AVG("credits_balance") FROM "public"."users";
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%point%';
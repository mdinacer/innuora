/*
  Warnings:

  - You are about to drop the column `points_balance` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `points_consumed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `admin_adjustments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feedbacks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `points_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_feature_flags` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."CreditTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- DropForeignKey
ALTER TABLE "public"."admin_adjustments" DROP CONSTRAINT "admin_adjustments_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."admin_adjustments" DROP CONSTRAINT "admin_adjustments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."feedbacks" DROP CONSTRAINT "feedbacks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."points_transactions" DROP CONSTRAINT "points_transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_feature_flags" DROP CONSTRAINT "user_feature_flags_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "points_balance",
DROP COLUMN "points_consumed",
ADD COLUMN     "credits_balance" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."admin_adjustments";

-- DropTable
DROP TABLE "public"."feedbacks";

-- DropTable
DROP TABLE "public"."payments";

-- DropTable
DROP TABLE "public"."points_transactions";

-- DropTable
DROP TABLE "public"."subscriptions";

-- DropTable
DROP TABLE "public"."user_feature_flags";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."PointsTransactionType";

-- DropEnum
DROP TYPE "public"."SubscriptionPlan";

-- DropEnum
DROP TYPE "public"."SubscriptionStatus";

-- CreateTable
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

-- CreateIndex
CREATE INDEX "credit_transactions_user_id_idx" ON "public"."credit_transactions"("user_id");

-- CreateIndex
CREATE INDEX "credit_transactions_created_at_idx" ON "public"."credit_transactions"("created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_type_idx" ON "public"."credit_transactions"("type");

-- CreateIndex
CREATE INDEX "credit_transactions_reason_idx" ON "public"."credit_transactions"("reason");

-- AddForeignKey
ALTER TABLE "public"."credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

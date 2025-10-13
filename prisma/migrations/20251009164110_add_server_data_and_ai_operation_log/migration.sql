/*
  Warnings:

  - You are about to drop the column `modelCode` on the `sessions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AiOperationType" AS ENUM ('ANALYSIS', 'RESPONSE', 'MEMORY_UPDATE', 'MEMORY_RECALL', 'SESSION_WELLNESS', 'SESSION_SUMMARY', 'TITLE_UPDATE', 'DIAGNOSTIC');

-- DropIndex
DROP INDEX "public"."audit_logs_level_idx";

-- DropIndex
DROP INDEX "public"."audit_logs_operation_idx";

-- DropIndex
DROP INDEX "public"."audit_logs_user_id_idx";

-- DropIndex
DROP INDEX "public"."credit_transactions_created_at_idx";

-- DropIndex
DROP INDEX "public"."credit_transactions_reason_idx";

-- DropIndex
DROP INDEX "public"."credit_transactions_user_id_idx";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "modelCode",
ADD COLUMN     "server_data" JSONB;

-- DropEnum
DROP TYPE "public"."ModelCode";

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

-- CreateIndex
CREATE INDEX "ai_operation_logs_user_id_timestamp_idx" ON "ai_operation_logs"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "ai_operation_logs_session_id_timestamp_idx" ON "ai_operation_logs"("session_id", "timestamp");

-- CreateIndex
CREATE INDEX "ai_operation_logs_operation_timestamp_idx" ON "ai_operation_logs"("operation", "timestamp");

-- CreateIndex
CREATE INDEX "ai_operation_logs_timestamp_idx" ON "ai_operation_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_operation_created_at_idx" ON "audit_logs"("operation", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_level_created_at_idx" ON "audit_logs"("level", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_user_id_created_at_idx" ON "credit_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_user_id_type_created_at_idx" ON "credit_transactions"("user_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_reason_created_at_idx" ON "credit_transactions"("reason", "created_at");

-- CreateIndex
CREATE INDEX "sessions_user_id_created_at_idx" ON "sessions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "sessions_user_id_updated_at_idx" ON "sessions"("user_id", "updated_at");

-- AddForeignKey
ALTER TABLE "ai_operation_logs" ADD CONSTRAINT "ai_operation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_operation_logs" ADD CONSTRAINT "ai_operation_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

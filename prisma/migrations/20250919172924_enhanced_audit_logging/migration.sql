/*
  Enhanced Audit Logging Schema Migration
  
  This migration:
  1. Creates the LogLevel enum
  2. Adds new structured columns for better logging
  3. Migrates existing data from 'action' column to new structure
  4. Drops the old 'action' column
  5. Adds performance indexes
*/

-- CreateEnum
CREATE TYPE "public"."LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'AUDIT');

-- Add new columns with temporary defaults
ALTER TABLE "public"."audit_logs" 
ADD COLUMN "errorCode" TEXT,
ADD COLUMN "ip_address" TEXT,
ADD COLUMN "level" "public"."LogLevel" DEFAULT 'AUDIT',
ADD COLUMN "message" TEXT DEFAULT '',
ADD COLUMN "operation" TEXT DEFAULT '',
ADD COLUMN "session_id" TEXT,
ADD COLUMN "user_agent" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- Migrate existing data
UPDATE "public"."audit_logs" 
SET 
  "operation" = CASE 
    WHEN "action" LIKE '%signup%' THEN 'user_signup'
    WHEN "action" LIKE '%signin%' THEN 'user_signin' 
    WHEN "action" LIKE '%signout%' THEN 'user_signout'
    WHEN "action" LIKE '%session_created%' THEN 'session_create'
    WHEN "action" LIKE '%session_deleted%' THEN 'session_delete'
    WHEN "action" LIKE '%session_updated%' THEN 'session_update'
    ELSE LOWER(REPLACE("action", ' ', '_'))
  END,
  "message" = "action",
  "level" = CASE 
    WHEN "action" LIKE '%ERROR%' THEN 'ERROR'::public."LogLevel"
    WHEN "action" LIKE '%WARN%' THEN 'WARN'::public."LogLevel"
    ELSE 'AUDIT'::public."LogLevel"
  END
WHERE "operation" = '' OR "message" = '';

-- Extract session_id from metadata if available
UPDATE "public"."audit_logs" 
SET "session_id" = ("metadata"->>'sessionId')
WHERE "metadata"->>'sessionId' IS NOT NULL;

-- Extract error codes from metadata if available  
UPDATE "public"."audit_logs"
SET "errorCode" = ("metadata"->>'errorCode')
WHERE "metadata"->>'errorCode' IS NOT NULL;

-- Make columns NOT NULL after data migration
ALTER TABLE "public"."audit_logs" 
ALTER COLUMN "level" SET NOT NULL,
ALTER COLUMN "message" SET NOT NULL,
ALTER COLUMN "operation" SET NOT NULL;

-- Remove defaults after migration
ALTER TABLE "public"."audit_logs" 
ALTER COLUMN "level" DROP DEFAULT,
ALTER COLUMN "message" DROP DEFAULT,
ALTER COLUMN "operation" DROP DEFAULT;

-- Drop old column
ALTER TABLE "public"."audit_logs" DROP COLUMN "action";

-- CreateIndex
CREATE INDEX "audit_logs_level_idx" ON "public"."audit_logs"("level");

-- CreateIndex
CREATE INDEX "audit_logs_operation_idx" ON "public"."audit_logs"("operation");

-- CreateIndex
CREATE INDEX "audit_logs_errorCode_idx" ON "public"."audit_logs"("errorCode");

-- CreateIndex
CREATE INDEX "audit_logs_session_id_idx" ON "public"."audit_logs"("session_id");

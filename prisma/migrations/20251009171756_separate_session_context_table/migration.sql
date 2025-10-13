/*
  Warnings:

  - You are about to drop the column `server_data` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."sessions" DROP COLUMN "server_data";

-- CreateTable
CREATE TABLE "public"."session_contexts" (
    "session_id" TEXT NOT NULL,
    "encrypted_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_contexts_pkey" PRIMARY KEY ("session_id")
);

-- CreateIndex
CREATE INDEX "session_contexts_session_id_idx" ON "public"."session_contexts"("session_id");

-- AddForeignKey
ALTER TABLE "public"."session_contexts" ADD CONSTRAINT "session_contexts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

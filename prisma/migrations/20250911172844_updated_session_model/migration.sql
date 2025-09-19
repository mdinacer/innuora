/*
  Warnings:

  - Added the required column `metadata` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."sessions" ADD COLUMN     "aiSuggestedTitle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "memory" BYTEA,
ADD COLUMN     "messages" BYTEA,
ADD COLUMN     "metadata" JSONB NOT NULL,
ADD COLUMN     "modelCode" TEXT NOT NULL DEFAULT 'M1',
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

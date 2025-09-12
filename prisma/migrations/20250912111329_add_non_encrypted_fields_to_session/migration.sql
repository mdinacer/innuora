/*
  Warnings:

  - Added the required column `metadata` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ModelCode" AS ENUM ('M1', 'M2', 'M3');

-- AlterTable
ALTER TABLE "public"."sessions" ADD COLUMN     "autoUpdateTitle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB NOT NULL,
ADD COLUMN     "modelCode" "public"."ModelCode" NOT NULL DEFAULT 'M1',
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

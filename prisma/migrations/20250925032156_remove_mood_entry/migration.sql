/*
  Warnings:

  - You are about to drop the `mood_entries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."mood_entries" DROP CONSTRAINT "mood_entries_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mood_entries" DROP CONSTRAINT "mood_entries_user_id_fkey";

-- DropTable
DROP TABLE "public"."mood_entries";

-- DropEnum
DROP TYPE "public"."EmotionCategory";

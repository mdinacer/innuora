-- AlterTable
ALTER TABLE "public"."sessions" ADD COLUMN     "persist_on_cloud" BOOLEAN NOT NULL DEFAULT false;

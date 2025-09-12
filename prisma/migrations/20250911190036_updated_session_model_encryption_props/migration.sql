/*
  Warnings:

  - You are about to drop the column `aiSuggestedTitle` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `analysis` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `key_id` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `memory` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `messages` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `modelCode` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `auth_tag` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encrypted_data` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Made the column `enc_alg` on table `sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."sessions" DROP COLUMN "aiSuggestedTitle",
DROP COLUMN "analysis",
DROP COLUMN "key_id",
DROP COLUMN "memory",
DROP COLUMN "messages",
DROP COLUMN "metadata",
DROP COLUMN "modelCode",
DROP COLUMN "subtitle",
DROP COLUMN "summary",
DROP COLUMN "title",
ADD COLUMN     "auth_tag" BYTEA NOT NULL,
ADD COLUMN     "encrypted_data" BYTEA NOT NULL,
ADD COLUMN     "iv" BYTEA NOT NULL,
ALTER COLUMN "enc_alg" SET NOT NULL,
ALTER COLUMN "enc_alg" SET DEFAULT 'AES-256-GCM';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "encryption_salt" TEXT;

/*
  Warnings:

  - You are about to drop the column `auth_tag` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `enc_alg` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `encrypted_data` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."sessions" DROP COLUMN "auth_tag",
DROP COLUMN "enc_alg",
DROP COLUMN "iv",
DROP COLUMN "encrypted_data",
ADD COLUMN     "encrypted_data" JSONB NOT NULL;

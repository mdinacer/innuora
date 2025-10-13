-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('FREE', 'STARTER', 'REGULAR', 'PREMIUM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tier" "UserTier" DEFAULT 'FREE';

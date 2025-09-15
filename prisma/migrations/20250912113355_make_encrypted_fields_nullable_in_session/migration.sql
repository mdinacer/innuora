-- AlterTable
ALTER TABLE "public"."sessions" ALTER COLUMN "enc_alg" DROP NOT NULL,
ALTER COLUMN "auth_tag" DROP NOT NULL,
ALTER COLUMN "encrypted_data" DROP NOT NULL,
ALTER COLUMN "iv" DROP NOT NULL;

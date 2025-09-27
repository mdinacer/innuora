-- AlterTable
ALTER TABLE "public"."user_configs" ADD COLUMN     "analytics_opt_in" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enable_animation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "font_size" TEXT DEFAULT 'medium',
ADD COLUMN     "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "share_improvements" BOOLEAN NOT NULL DEFAULT true;

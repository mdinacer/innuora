import { ThemeMode } from "@prisma/client";
import z from "zod";

export const UserConfigSchema = z.object({
  autoSave: z.boolean().default(false),
  theme: z.enum(ThemeMode),
  locale: z.enum(["en", "ar", "fr"]),
  fontSize: z.enum(["small", "medium", "large"]),
  analyticsOptIn: z.boolean().default(false),
  shareImprovements: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

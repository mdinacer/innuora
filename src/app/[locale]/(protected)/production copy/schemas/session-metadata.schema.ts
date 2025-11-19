import z from "zod";

export const SessionMetadataSchema = z.object({
  messageCount: z.number().int().nonnegative(),
  creditsUsed: z.number().nonnegative(),
  activeDurationMs: z.number().int().nonnegative(),

  lastActiveAt: z
    .union([z.date(), z.string()])
    .optional()
    .transform((v) => (typeof v === "string" ? new Date(v) : v)),

  extra: z.record(z.string(), z.unknown()).optional(),
});

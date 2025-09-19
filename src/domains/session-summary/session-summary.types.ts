import z from "zod";

export const SessionSummarySchema = z.object({
  summary: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

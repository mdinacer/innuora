import z from "zod";

export const SessionWellnessSchema = z.object({
  suggest_conclusion: z.boolean(),
  reason: z.enum(["length", "progress", "repetition", "fatigue", "natural_end"]).optional(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
});

export type SessionWellness = z.infer<typeof SessionWellnessSchema>;

export interface SessionWellnessContext {
  messageCount: number;
  activeDurationMinutes: number;
  recentAnalyses: Array<{
    intensity: string;
    crisis: string;
    therapeutic_readiness: string;
    themes: Array<{ theme: string; frequency: string }>;
  }>;
  lastUserMessage: string;
}

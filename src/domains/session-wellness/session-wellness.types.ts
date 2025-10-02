import z from "zod";

export const SessionWellnessSchema = z.object({
  suggest_conclusion: z.boolean(),
  should_end: z.boolean(),
  reasons: z.array(
    z.enum(["natural_end", "productive_loop_complete", "unproductive_loop", "length", "safety", "crisis"])
  ),
  loop_assessment: z.enum(["productive", "unproductive", "none"]).optional(),
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

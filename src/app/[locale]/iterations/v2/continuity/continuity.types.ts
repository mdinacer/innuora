import { z } from "zod";

export const ContinuityAnalysisSchema = z.object({
  core_topic_trace: z.array(z.string()).max(3),
  stagnation_flag: z.enum(["none", "repetition", "avoidance_loop"]),
  emotional_momentum: z.enum(["rising", "falling", "plateau"]),
  angle_history: z.array(z.string()).max(4),
  recommended_topic: z.string(),
  recommended_depth: z.enum(["low", "medium", "high"]),
  question_permission: z.boolean(),
  rationale: z.string(),
});

export type ContinuityAnalysis = z.infer<typeof ContinuityAnalysisSchema>;

export const INITIAL_CONTINUITY_ANALYSIS: ContinuityAnalysis = {
  core_topic_trace: [], // no prior themes
  stagnation_flag: "none", // cannot stagnate yet
  emotional_momentum: "plateau", // neutral baseline
  angle_history: [], // no angles used yet
  recommended_topic: "opening", // neutral, non-binding label
  recommended_depth: "low", // safest entry depth
  question_permission: true, // allow question if needed
  rationale: "Initial round. No history available; defaults applied.",
};

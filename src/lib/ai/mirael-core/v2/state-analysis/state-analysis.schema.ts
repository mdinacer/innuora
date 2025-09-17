import z from "zod";

import {
  CRISIS_LEVEL_MAP,
  EMOTION_INTENSITY_MAP,
  USER_STATE_MAP,
} from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.types";
import { SESSION_MODULES } from "@/lib/ai/shared/session-modules";

export const StateAnalysisSchema = z.object({
  core_module: z.enum(SESSION_MODULES).nullable(),
  process_module: z.enum(SESSION_MODULES).nullable(),
  utility_module: z.enum(SESSION_MODULES).nullable(),

  intensity: z.enum(EMOTION_INTENSITY_MAP),
  crisis: z.enum(CRISIS_LEVEL_MAP),

  distortions: z.array(
    z.object({
      type: z.string(),
      severity: z.enum(["mild", "moderate", "severe"]),
    })
  ),

  themes: z.array(
    z.object({
      theme: z.string(),
      frequency: z.enum(["occasional", "frequent", "pervasive"]),
    })
  ),

  core_beliefs: z.array(
    z.object({
      belief: z.string(),
    })
  ),

  silent_rules: z.array(
    z.object({
      rule: z.string(),
      rigidity: z.enum(["flexible", "moderate", "rigid"]),
    })
  ),

  behavioral_patterns: z.array(
    z.object({
      type: z.enum(["avoidance", "safety_behaviors", "perfectionism", "procrastination", "isolation", "rumination"]),
      severity: z.enum(["mild", "moderate", "severe"]),
    })
  ),

  state: z.enum(USER_STATE_MAP),
  therapeutic_readiness: z.enum(["resistant", "ambivalent", "ready", "engaged"]),

  update_memory: z.boolean(),
  recall_memory: z.boolean(),
});

// === Type inferred from schema ===
export type StateAnalysis = z.infer<typeof StateAnalysisSchema>;

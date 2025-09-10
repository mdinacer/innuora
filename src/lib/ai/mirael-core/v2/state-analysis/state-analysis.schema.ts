import z from "zod";

import {
  CRISIS_LEVEL_MAP,
  EMOTION_INTENSITY_MAP,
  USER_STATE_MAP,
} from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.types";
import { SESSION_MODULES } from "@/lib/ai/shared/session-modules";

// === Zod Schema ===
export const StateAnalysisSchema = z.object({
  core_module: z.enum(SESSION_MODULES).nullable(),
  process_module: z.enum(SESSION_MODULES).nullable(),
  utility_module: z.enum(SESSION_MODULES).nullable(),
  intensity: z.enum(EMOTION_INTENSITY_MAP),
  crisis: z.enum(CRISIS_LEVEL_MAP),
  distortions: z.array(z.string()),
  themes: z.array(z.string()),
  core_beliefs: z.array(z.string()),
  silent_rules: z.array(z.string()),
  state: z.enum(USER_STATE_MAP),
  update_memory: z.boolean(),
  recall_memory: z.boolean(),
});

// === Type inferred from schema ===
export type StateAnalysis = z.infer<typeof StateAnalysisSchema>;

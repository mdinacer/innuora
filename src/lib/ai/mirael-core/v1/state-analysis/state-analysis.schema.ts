import z from "zod";

import {
  CRISIS_LEVEL_MAP,
  EMOTION_INTENSITY_MAP,
  USER_STATE_MAP,
} from "@/lib/ai/mirael-core/v1/state-analysis/state-analysis.types";
import { SESSION_MODULES } from "@/lib/ai/shared/session-modules";

// === Zod Schema ===
export const StateAnalysisSchema = z.object({
  primary_module: z.enum(SESSION_MODULES),
  secondary_module: z.enum(SESSION_MODULES).nullable(),
  intensity: z.enum(EMOTION_INTENSITY_MAP),
  crisis: z.enum(CRISIS_LEVEL_MAP),
  distortions: z.array(z.string()),
  themes: z.array(z.string()),
  state: z.enum(USER_STATE_MAP),
});

// === Type inferred from schema ===
export type StateAnalysis = z.infer<typeof StateAnalysisSchema>;

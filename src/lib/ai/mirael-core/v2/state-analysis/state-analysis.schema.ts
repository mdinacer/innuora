import z from "zod";

import {
  CRISIS_LEVEL_MAP,
  EMOTION_INTENSITY_MAP,
  USER_STATE_MAP,
} from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.types";
import { SESSION_MODULES } from "@/lib/ai/shared/session-modules";

// === Enhanced Zod Schema for CBT Analysis ===
// export const StateAnalysisSchema = z.object({
//   core_module: z.enum(SESSION_MODULES).nullable(),
//   process_module: z.enum(SESSION_MODULES).nullable(),
//   utility_module: z.enum(SESSION_MODULES).nullable(),
//   module_confidence: z.number().min(0).max(100),
//   selection_rationale: z.string(),
//   competing_modules: z.array(
//     z.object({
//       module: z.string(),
//       confidence: z.number().min(0).max(100),
//       rationale: z.string(),
//     })
//   ),
//   intensity: z.enum(EMOTION_INTENSITY_MAP),
//   crisis: z.enum(CRISIS_LEVEL_MAP),
//   distortions: z.array(
//     z.object({
//       type: z.string(),
//       confidence: z.number().min(0).max(100),
//       evidence: z.string(),
//       severity: z.enum(["mild", "moderate", "severe"]),
//     })
//   ),
//   beck_triad: z.object({
//     self: z.number().min(-3).max(3),
//     world: z.number().min(-3).max(3),
//     future: z.number().min(-3).max(3),
//     rationale: z.string(),
//   }),
//   themes: z.array(
//     z.object({
//       theme: z.string(),
//       confidence: z.number().min(0).max(100),
//       frequency: z.enum(["occasional", "frequent", "pervasive"]),
//     })
//   ),
//   core_beliefs: z.array(
//     z.object({
//       belief: z.string(),
//       confidence: z.number().min(0).max(100),
//       evidence: z.string(),
//     })
//   ),
//   silent_rules: z.array(
//     z.object({
//       rule: z.string(),
//       confidence: z.number().min(0).max(100),
//       rigidity: z.enum(["flexible", "moderate", "rigid"]),
//     })
//   ),
//   behavioral_patterns: z.array(
//     z.object({
//       type: z.enum(["avoidance", "safety_behaviors", "perfectionism", "procrastination", "isolation", "rumination"]),
//       confidence: z.number().min(0).max(100),
//       severity: z.enum(["mild", "moderate", "severe"]),
//       evidence: z.string(),
//     })
//   ),
//   defense_mechanisms: z.array(
//     z.object({
//       type: z.enum(["denial", "projection", "rationalization", "intellectualization"]),
//       confidence: z.number().min(0).max(100),
//     })
//   ),
//   depression_markers: z.array(
//     z.object({
//       marker: z.enum([
//         "hopelessness",
//         "worthlessness",
//         "guilt",
//         "fatigue",
//         "concentration",
//         "sleep",
//         "appetite",
//         "psychomotor",
//         "suicidal",
//       ]),
//       present: z.boolean(),
//       severity: z.enum(["mild", "moderate", "severe"]),
//     })
//   ),
//   state: z.enum(USER_STATE_MAP),
//   therapeutic_readiness: z.enum(["resistant", "ambivalent", "ready", "engaged"]),
//   update_memory: z.boolean(),
//   recall_memory: z.boolean(),
//   memory_importance: z.number().min(0).max(100),
//   uncertainty_indicators: z.array(z.string()),
//   evidence_strength: z.enum(["weak", "moderate", "strong"]),
//   session_complexity: z.enum(["simple", "moderate", "complex"]),
// });

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

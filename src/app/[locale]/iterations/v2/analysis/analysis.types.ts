import { z } from "zod";

// grouped enums for compactness and clarity
const Enums = {
  emotional_theme: z.enum([
    "overwhelm",
    "pressure",
    "guilt",
    "resentment",
    "fatigue",
    "frustration",
    "self_blame",
    "anxiety",
    "irritation",
    "disconnection",
    "uncertainty",
    "none",
  ]),

  pressure_pattern: z.enum([
    "perfectionism",
    "responsibility_inflation",
    "self_minimization",
    "internal_criticism",
    "comparative_pressure",
    "avoidance_loop",
    "emotional_suppression",
    "overfunctioning",
    "rigid_expectations",
    "none",
  ]),

  distortion_category: z.enum([
    "all_or_nothing",
    "catastrophizing",
    "emotional_reasoning",
    "mind_reading",
    "labeling",
    "should_statements",
    "self_downing",
    "minimization",
    "none",
  ]),

  readiness_level: z.enum(["low", "medium", "high"]),
  crisis: z.enum(["none", "acute"]),

  yes_no: z.enum(["yes", "no"]),
};

export const AnalysisSchema = z
  .object({
    emotional_theme: Enums.emotional_theme,
    emotional_intensity: z.number().int().min(1).max(10),
    pressure_pattern: Enums.pressure_pattern,
    distortion_category: Enums.distortion_category,
    readiness_level: Enums.readiness_level,
    crisis: Enums.crisis,

    allow_psychoeducation: Enums.yes_no,
    allow_next_action: Enums.yes_no,

    internal_logic: z.string(),
    clarity_insight: z.string(),
    micro_question: z.string(),
  })
  .strict();

export type Analysis = z.infer<typeof AnalysisSchema>;

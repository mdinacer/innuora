import { z } from "zod";

// export interface ReflectionDirective {
//   intent: "contain" | "validate" | "gently_explore" | "reframe" | "anchor";
//   stance: "grounding" | "steady" | "exploratory" | "nurturing" | "directive";
//   tone: "calm" | "warm" | "curious" | "firm" | "light";

//   allow_psychoeducation: boolean;
//   allow_curiosity: boolean;

//   risk_level: "none" | "low" | "moderate";
//   crisis: "none" | "mild" | "moderate" | "high" | "immediate";

//   cognitive_patterns: string[];
//   emotional_themes: string[];
//   distortions_detected: string[];
//   implicit_needs: string[];

//   rationale: string;
// }

export const ReflectionDirectiveSchema = z.object({
  intent: z.enum(["contain", "validate", "gently_explore", "reframe", "anchor"]),
  stance: z.enum(["grounding", "steady", "exploratory", "nurturing", "directive"]),
  tone: z.enum(["calm", "warm", "curious", "firm", "light"]),

  allow_psychoeducation: z.boolean(),
  allow_curiosity: z.boolean(),

  risk_level: z.enum(["none", "low", "moderate"]),
  crisis: z.enum(["none", "mild", "moderate", "high", "immediate"]),

  cognitive_patterns: z.array(z.string()).default([]),
  emotional_themes: z.array(z.string()).default([]),
  distortions_detected: z.array(z.string()).default([]),
  implicit_needs: z.array(z.string()).default([]),

  rationale: z.string(),
});

export type ReflectionDirective = z.infer<typeof ReflectionDirectiveSchema>;

export const FALLBACK_REFLECTION_DIRECTIVE: ReflectionDirective = {
  intent: "validate",
  stance: "steady",
  tone: "calm",

  allow_psychoeducation: false,
  allow_curiosity: false,

  risk_level: "low",
  crisis: "none",

  cognitive_patterns: [],
  emotional_themes: [],
  distortions_detected: [],
  implicit_needs: [],

  rationale: "Fallback: maintain calm, steady validation. Do not explore, interpret, or provide psychoeducation.",
};

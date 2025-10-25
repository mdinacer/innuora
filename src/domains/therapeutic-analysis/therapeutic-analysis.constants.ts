/**
 * Therapeutic Analysis Constants
 *
 * Module classifications for therapeutic analysis.
 * NOTE: These are used ONLY for background therapeutic analysis (diagnostics, insights).
 * The holistic conversation engine does NOT use these modules for response generation.
 */

export const SESSION_MODULES = [
  "behavioral_activation",
  "behavioral",
  "cognitive",
  "core_beliefs",
  "crisis",
  "curiosity",
  "first_time",
  "guidance",
  "mindfulness",
  "overwhelm",
  "pattern_why",
  "pattern",
  "psychoeducation",
  "reframing",
  "resistance_overwhelm",
  "resistance_pushback",
  "shoulds",
  "validate",
  "values_clarification",
  "reflective_catalyst",
] as const;

export type SessionModule = (typeof SESSION_MODULES)[number];

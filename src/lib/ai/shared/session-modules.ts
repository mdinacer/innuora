export const SESSION_MODULES = {
  BEHAVIORAL: "behavioral", //Behavioral Experiment (Micro-Actions)
  BEHAVIORAL_ACTIVATION: "behavioral_activation", // Depression & Low Energy States
  COGNITIVE: "cognitive", // Cognitive reframing
  CORE_BELIEFS: "core_beliefs", // Core Beliefs & Self-Criticism
  CRISIS: "crisis", // High risk, override all
  FIRST_TIME: "first_time", // Onboarding/initiation
  GUIDANCE: "guidance",
  MINDFULNESS: "mindfulness", // Rumination & Emotional Regulation
  OVERWHELM: "overwhelm", // Emotional flooding/freeze
  PATTERN: "pattern", // Deep pattern recognition
  PSYCHOEDUCATION: "psychoeducation", // Clarity/explanation needed
  REFRAMING: "reframing", // Positive Reframing
  RESISTANCE_OVERWHELM: "resistance_overwhelm", // Shutdown/flooding avoidance
  RESISTANCE_PUSHBACK: "resistance_pushback", // Pushback against AI insight
  SHOULDS: "shoulds", // Silent Rules & Shoulds
  VALIDATE: "validate", // Emotional validation
  VALUES_CLARIFICATION: "values_clarification", // Meaning-Making & Agency Building
} as const;

export const CORE_MODULES = {
  BEHAVIORAL_ACTIVATION: SESSION_MODULES.BEHAVIORAL_ACTIVATION,
  COGNITIVE: SESSION_MODULES.COGNITIVE,
  CORE_BELIEFS: SESSION_MODULES.CORE_BELIEFS,
  CRISIS: SESSION_MODULES.CRISIS,
  MINDFULNESS: SESSION_MODULES.MINDFULNESS,
  REFRAMING: SESSION_MODULES.REFRAMING,
  SHOULDS: SESSION_MODULES.SHOULDS,
  VALUES_CLARIFICATION: SESSION_MODULES.VALUES_CLARIFICATION,
} as const;
export const PROCESS_MODULES = {
  OVERWHELM: SESSION_MODULES.OVERWHELM,
  RESISTANCE_OVERWHELM: SESSION_MODULES.RESISTANCE_OVERWHELM,
  RESISTANCE_PUSHBACK: SESSION_MODULES.RESISTANCE_PUSHBACK,
  VALIDATE: SESSION_MODULES.VALIDATE,
} as const;
export const UTILITY_MODULES = {
  GUIDANCE: SESSION_MODULES.GUIDANCE,
  PATTERN: SESSION_MODULES.PATTERN,
  PSYCHOEDUCATION: SESSION_MODULES.PSYCHOEDUCATION,
} as const;

export type SessionModule = (typeof SESSION_MODULES)[keyof typeof SESSION_MODULES];
export type CoreModule = (typeof CORE_MODULES)[keyof typeof CORE_MODULES];
export type ProcessModule = (typeof PROCESS_MODULES)[keyof typeof PROCESS_MODULES];
export type UtilityModule = (typeof UTILITY_MODULES)[keyof typeof UTILITY_MODULES];

export const IN_SCOPE_CHALLENGES = [
  "Cognitive Distortions",
  "Negative Core Beliefs",
  "Silent Rules & Shoulds",
  "Internal Pressure",
  "Emotional Dysregulation",
  "Self-Worth & Identity",
  "Overwhelm & Burnout",
  "Avoidance Patterns",
  "Relational Pain",
  "Meaning & Agency",
] as const;

export const OUT_OF_SCOPE_CHALLENGES = [
  "Acute Risk (suicidal ideation, self-harm, violence)",
  "Complex Trauma (PTSD, abuse, dissociation, panic attacks)",
  "Personality Disorders (BPD, NPD, etc.)",
  "Psychosis Spectrum (delusions, hallucinations)",
  "Addiction / Substance Use (especially with physical dependency)",
  "Legal/Forensic Issues (abuse reporting, custody conflict, etc.)",
  "Medical / Neurocognitive Issues (cognitive decline, serious illness)",
] as const;

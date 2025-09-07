export const SESSION_MODULES = {
  BEHAVIORAL: "behavioral", //Behavioral Experiment (Micro-Actions)
  COGNITIVE: "cognitive", // Cognitive reframing
  CORE_BELIEFS: "core_beliefs", // Core Beliefs & Self-Criticism
  CRISIS: "crisis", // High risk, override all
  FIRST_TIME: "first_time", // Onboarding/initiation
  GUIDANCE: "guidance",
  OVERWHELM: "overwhelm", // Emotional flooding/freeze
  PATTERN: "pattern", // Deep pattern recognition
  PSYCHOEDUCATION: "psychoeducation", // Clarity/explanation needed
  REFRAMING: "reframing", // Positive Reframing
  RESISTANCE_OVERWHELM: "resistance_overwhelm", // Shutdown/flooding avoidance
  RESISTANCE_PUSHBACK: "resistance_pushback", // Pushback against AI insight
  SHOULDS: "shoulds", // Silent Rules & Shoulds
  VALIDATE: "validate", // Emotional validation
} as const;

export const CORE_MODULES = {
  COGNITIVE: "cognitive", // Cognitive reframing
  CORE_BELIEFS: "core_beliefs", // Core Beliefs & Self-Criticism
  CRISIS: "crisis", // High risk, override all
  REFRAMING: "reframing", // Positive Reframing
  SHOULDS: "shoulds", // Silent Rules & Shoulds
};
export const PROCESS_MODULES = {
  OVERWHELM: "overwhelm", // Emotional flooding/freeze
  RESISTANCE_OVERWHELM: "resistance_overwhelm", // Shutdown/flooding avoidance
  RESISTANCE_PUSHBACK: "resistance_pushback", // Pushback against AI insight
  VALIDATE: "validate", // Emotional validation
};
export const UTILITY_MODULES = {
  GUIDANCE: "guidance",
  PATTERN: "pattern", // Deep pattern recognition
  PSYCHOEDUCATION: "psychoeducation", // Clarity/explanation needed
};

export type SessionModule = (typeof SESSION_MODULES)[keyof typeof SESSION_MODULES];

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

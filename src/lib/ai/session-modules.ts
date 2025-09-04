export const SESSION_MODULES = {
  CRISIS: "crisis", // High risk, override all
  VALIDATE: "validate", // Emotional validation
  RESISTANCE_PUSHBACK: "resistance_pushback", // Pushback against AI insight
  RESISTANCE_OVERWHELM: "resistance_overwhelm", // Shutdown/flooding avoidance
  PSYCHOEDUCATION: "psychoeducation", // Clarity/explanation needed
  COGNITIVE: "cognitive", // Cognitive reframing
  PATTERN: "pattern", // Deep pattern recognition
  OVERWHELM: "overwhelm", // Emotional flooding/freeze
  GUIDANCE: "guidance",
  FIRST_TIME: "first_time", // Onboarding/initiation
} as const;

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

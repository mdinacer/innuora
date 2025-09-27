export const SESSION_MODULES = {
  BEHAVIORAL_ACTIVATION: "behavioral_activation", // Depression & Low Energy States
  BEHAVIORAL: "behavioral", //Behavioral Experiment (Micro-Actions)
  COGNITIVE: "cognitive", // Cognitive reframing
  CORE_BELIEFS: "core_beliefs", // Core Beliefs & Self-Criticism
  CRISIS: "crisis", // High risk, override all
  CURIOSITY: "curiosity", // Natural conversation engagement & information extraction
  FIRST_TIME: "first_time", // Onboarding/initiation
  GUIDANCE: "guidance",
  MINDFULNESS: "mindfulness", // Rumination & Emotional Regulation
  OVERWHELM: "overwhelm", // Emotional flooding/freeze
  PATTERN_WHY: "pattern_why",
  PATTERN: "pattern", // Deep pattern recognition
  PSYCHOEDUCATION: "psychoeducation", // Clarity/explanation needed
  REFRAMING: "reframing", // Positive Reframing
  RESISTANCE_OVERWHELM: "resistance_overwhelm", // Shutdown/flooding avoidance
  RESISTANCE_PUSHBACK: "resistance_pushback", // Pushback against AI insight
  SHOULDS: "shoulds", // Silent Rules & Shoulds
  VALIDATE: "validate", // Emotional validation
  VALUES_CLARIFICATION: "values_clarification", // Meaning-Making & Agency Building
} as const;

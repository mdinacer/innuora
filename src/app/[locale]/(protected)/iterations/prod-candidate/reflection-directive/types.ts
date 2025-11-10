export interface MemoryCue {
  entities?: string[];
  themes?: string[];
  people?: string[];
}

export interface ReflectionDirective {
  intent: "contain" | "validate" | "gently_explore" | "reframe" | "anchor";
  stance: "grounding" | "steady" | "exploratory" | "nurturing" | "directive";
  tone: "calm" | "warm" | "curious" | "firm" | "light";

  allow_psychoeducation: boolean;
  allow_curiosity: boolean;

  risk_level: "none" | "low" | "moderate";
  crisis: "none" | "mild" | "moderate" | "high" | "immediate";

  cognitive_patterns?: string[];
  emotional_themes?: string[];
  distortions_detected?: string[];
  implicit_needs?: string[];

  // update_memory: boolean;
  // recall_memory: boolean;
  // memory_cues?: MemoryCue[];

  rationale: string;
}

export const DEFAULT_REFLECTION_DIRECTIVE: ReflectionDirective = {
  intent: "contain",
  stance: "grounding",
  tone: "calm",
  allow_psychoeducation: false,
  allow_curiosity: false,
  risk_level: "none",
  crisis: "none",
  cognitive_patterns: [],
  emotional_themes: [],
  distortions_detected: [],
  implicit_needs: ["safety", "validation"],
  // update_memory: false,
  // recall_memory: false,
  // memory_cues: [],
  rationale:
    "Initial exchange: establish emotional safety and containment with a calm, grounding stance before any exploration.",
};

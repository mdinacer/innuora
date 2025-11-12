export interface ReflectionDirective {
  intent: "contain" | "validate" | "gently_explore" | "reframe" | "anchor";
  stance: "grounding" | "steady" | "exploratory" | "nurturing" | "directive";
  tone: "calm" | "warm" | "curious" | "firm" | "light";

  allow_psychoeducation: boolean;
  allow_curiosity: boolean;

  risk_level: "none" | "low" | "moderate";
  crisis: "none" | "mild" | "moderate" | "high" | "immediate";

  cognitive_patterns: string[];
  emotional_themes: string[];
  distortions_detected: string[];
  implicit_needs: string[];

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
  rationale:
    "Initial exchange — prioritize emotional containment and grounding. Create psychological safety before inviting exploration or insight.",
};

export type EmotionalReadingResult = {
  primary_emotion: string;
  driver: string;
  rhythm: string;
  contrast: string;
  felt_undertone: string;
};

export type RelationalStance = {
  stance: string;
  tone_intent: string;
  responsiveness: string;
  goal_for_next_layer: string;
  warmth_level: number;
  meta: {
    accuracy: number;
    drift: string;
  };
};

export type ReflectiveExpressionMeta = {
  stance: string;
  tone_intent: string;
  goal_for_next_layer: string;
  accuracy: number;
  drift: string;
};

export type ReflectiveExpressionResponse = {
  reflection: string;
  meta: ReflectiveExpressionMeta;
  psychoeducational_thread?: {
    type: "lived" | "observed" | "read" | "none";
    content: string;
  };
};

export type RelationalTrace = {
  last_theme: string;
  tone_shift: string;
  unresolved_thread: string;
};

export interface SessionWellness {
  phase: "opening" | "exploration" | "deep_reflection" | "resolution" | "closure";
  closure_state: "continue" | "near_closure" | "ready_to_end";
  tone_recommendation: "containment" | "validation" | "closure" | "redirect";
  rationale: string;
}

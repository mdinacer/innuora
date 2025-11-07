import crypto from "crypto";
import { ChatCompletionMessageParam } from "openai/resources";

import { SessionDynamicsMatrix } from "@/domains/session-dynamics/session-dynamics.types";
import { InnuoraAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { RelationalTrace } from "../types/reflection.types";

/** ─────────────────────────────────────────────
 * Deterministic context hash for caching
 * ───────────────────────────────────────────── */

/**
 * computeContextHash
 * Generates a stable SHA-256 fingerprint of the *semantic state*
 * — ignoring volatile, non-meaningful numeric noise or text drift.
 */
export function computeContextHash(
  analysis?: InnuoraAnalysis,
  relationalTrace?: RelationalTrace,
  sessionDynamics?: SessionDynamicsMatrix
): string {
  const stablePayload = {
    // Core emotional markers
    emotion: analysis?.emotion,
    intensity: analysis?.intensity,
    readiness: analysis?.readiness,
    theme: analysis?.theme,

    // Relational state
    stance: relationalTrace?.relational_stance,
    tone: relationalTrace?.tone,
    focus: relationalTrace?.focus,

    // Session evolution markers
    phase: sessionDynamics?.macro.session_phase,
    focus_axis: sessionDynamics?.macro.adaptive_focus,
    stability: Number(sessionDynamics?.macro.stability_index?.toFixed(2)) || 0,
    readiness_vector: Number(sessionDynamics?.meso.readiness_vector?.toFixed(2)) || 0,
    trend: sessionDynamics?.meso.trend,
  };

  const serialized = JSON.stringify(stablePayload);
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

/** ─────────────────────────────────────────────
 * Build contextual synthesis prompt (GPT-4o-mini)
 * ───────────────────────────────────────────── */
export function buildContextDirectivePrompt(
  sdm: SessionDynamicsMatrix,
  meta?: InnuoraAnalysis,
  trace?: RelationalTrace
): ChatCompletionMessageParam[] {
  const compactCapsule = {
    phase: sdm.macro.session_phase,
    focus: sdm.macro.adaptive_focus,
    stability: sdm.macro.stability_index,
    readiness_score: sdm.meso.readiness_vector,
    trend: sdm.meso.trend,
    emotion: meta?.emotion,
    intensity: meta?.intensity,
    readiness_label: meta?.readiness,
    theme: meta?.theme,
    tone: trace?.tone,
  };

  const prompts = [
    {
      role: "system",
      content: `
Write one concise, emotionally grounded directive (1–2 sentences) that captures what tone or stance should guide the next reflection.
Use calm, warm, clear language.
Output only the directive text.
    `.trim(),
    },
    {
      role: "user",
      content: JSON.stringify(compactCapsule),
    },
  ];

  return prompts as ChatCompletionMessageParam[];
}

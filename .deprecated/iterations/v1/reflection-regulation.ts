/**
 * Reflection Regulation Utilities
 * Cooldown logic, trace evolution, and psychoeducation gating
 * COPIED FROM: src/domains/conversation-engine/constants/reflection.utils.ts
 */

import type { InnuoraAnalysis, ReflectiveResponse, RelationalTrace } from "./types";

// Cooldown Configuration Constants
const COOLDOWN_CONFIG = {
  psychoeducation: {
    initialCooldown: 2.5, // Turns to wait after using psychoeducation
    decayFactor: 0.5, // How fast cooldown decreases per turn (50% per turn)
  },
  curiosity: {
    initialCooldown: 1.5, // Turns to wait after asking a question
    decayFactor: 0.4, // How fast cooldown decreases per turn (60% decay per turn)
  },
  activeThreshold: 0.25, // Below this value, cooldown is considered inactive
};

const SAFE_FALLBACK_TRACE: RelationalTrace = {
  relational_stance: "steady",
  tone: "warm",
  focus: "emotional presence",
  notes: "",
  psychoeducation_last_turn: false,
  curiosity_last_turn: false,
  used_lived_line: false,
  psychoedu_cooldown_remaining: 0,
  curiosity_cooldown_remaining: 0,
};

/**
 * Calculate cooldown value for next turn
 */
function calculateCooldown(
  wasUsedThisTurn: boolean,
  previousCooldown: number,
  config: { initialCooldown: number; decayFactor: number }
): number {
  if (wasUsedThisTurn) {
    return config.initialCooldown;
  }
  return Math.max(0, Number((previousCooldown * config.decayFactor).toFixed(2)));
}

/**
 * Trace evolution with fractional cooldown decay and progressive stance logic.
 */
export function updateTraceFromOutput(
  prev: RelationalTrace | undefined,
  reflectiveResponse: ReflectiveResponse
): RelationalTrace {
  const prevTrace = prev ?? SAFE_FALLBACK_TRACE;
  const nextTrace = reflectiveResponse?.next_relational_trace ?? SAFE_FALLBACK_TRACE;

  const hasNewPsychoedu = !!reflectiveResponse.psychoeducation?.content?.trim().length;
  const hasNewQuestion = !!reflectiveResponse.follow_up_question?.trim().length;

  const prevPsychoeduCooldown = prevTrace.psychoedu_cooldown_remaining ?? 0;
  const prevCuriosityCooldown = prevTrace.curiosity_cooldown_remaining ?? 0;

  const nextPsychoeduCooldown = calculateCooldown(
    hasNewPsychoedu,
    prevPsychoeduCooldown,
    COOLDOWN_CONFIG.psychoeducation
  );
  const nextCuriosityCooldown = calculateCooldown(hasNewQuestion, prevCuriosityCooldown, COOLDOWN_CONFIG.curiosity);

  const next: RelationalTrace = {
    ...prevTrace,
    relational_stance: nextTrace.relational_stance ?? prevTrace.relational_stance ?? "steady",
    tone: nextTrace.tone ?? prevTrace.tone ?? "warm",
    focus: nextTrace.focus ?? prevTrace.focus,
    notes: nextTrace.notes?.trim() || prevTrace.notes?.trim(),
    psychoeducation_last_turn: hasNewPsychoedu,
    curiosity_last_turn: hasNewQuestion,
    used_lived_line: !!nextTrace.used_lived_line,
    psychoedu_cooldown_remaining: nextPsychoeduCooldown,
    curiosity_cooldown_remaining: nextCuriosityCooldown,
  };

  if (next.used_lived_line && prevTrace.used_lived_line) next.used_lived_line = false;

  const stanceProgressionMap: Record<string, RelationalTrace["relational_stance"]> = {
    grounding: "steady",
    steady: "exploratory",
    exploratory: "nurturing",
    nurturing: "clarifying",
    clarifying: "steady",
  };

  const shouldProgress = !nextTrace.relational_stance && reflectiveResponse.signals?.crisis !== "acute";
  if (shouldProgress) {
    const current = prevTrace.relational_stance ?? "steady";
    next.relational_stance = stanceProgressionMap[current] ?? "steady";
  }

  if ((next.psychoedu_cooldown_remaining ?? 0) <= COOLDOWN_CONFIG.activeThreshold)
    next.psychoedu_cooldown_remaining = 0;
  if ((next.curiosity_cooldown_remaining ?? 0) <= COOLDOWN_CONFIG.activeThreshold)
    next.curiosity_cooldown_remaining = 0;

  return next;
}

function inferCuriosityAllowance(meta?: InnuoraAnalysis): boolean {
  if (!meta) return false;
  if (meta.intensity === "high") return false;
  if (meta.readiness === "avoidant") return false;
  return true;
}

function inferPsychoeducationAllowance(meta?: InnuoraAnalysis): boolean {
  if (!meta) return false;
  if (!meta.psychoedu_ready) return false;
  if (meta.intensity === "high") return false;
  if (meta.readiness === "avoidant") return false;
  return true;
}

/**
 * Phase-adaptive non-destructive gating.
 */
export function applyMetaGuidanceGating(
  response: ReflectiveResponse,
  meta: InnuoraAnalysis | undefined,
  prevTrace?: RelationalTrace
): ReflectiveResponse {
  if (!meta) return response;

  const trace = prevTrace ?? SAFE_FALLBACK_TRACE;
  const curiosityActive = (trace.curiosity_cooldown_remaining ?? 0) > COOLDOWN_CONFIG.activeThreshold;
  const psychoActive = (trace.psychoedu_cooldown_remaining ?? 0) > COOLDOWN_CONFIG.activeThreshold;

  const gated = { ...response };
  gated.meta = {
    ...gated.meta,
    curiosity_suppressed: curiosityActive,
    curiosity_suppression_reason: curiosityActive ? "Curiosity cooldown active." : undefined,
    psychoeducation_suppressed: psychoActive,
    psychoeducation_suppression_reason: psychoActive ? "Insight cooldown active." : undefined,
  };

  return gated;
}

/**
 * Build reflection directive with cooldown awareness
 */
export function buildReflectionDirective(analysis?: InnuoraAnalysis, relationalTrace?: RelationalTrace): string {
  const curiosityCooldown = relationalTrace?.curiosity_cooldown_remaining ?? 0;
  const psychoCooldown = relationalTrace?.psychoedu_cooldown_remaining ?? 0;

  const allowCuriosity = analysis?.allow_curiosity ?? inferCuriosityAllowance(analysis);
  const allowPsycho = analysis?.allow_psychoeducation ?? inferPsychoeducationAllowance(analysis);

  const readyForCuriosity = allowCuriosity && curiosityCooldown <= COOLDOWN_CONFIG.activeThreshold;
  const readyForPsycho = allowPsycho && psychoCooldown <= COOLDOWN_CONFIG.activeThreshold;

  const lines: string[] = ["### TURN DIRECTIVES"];

  lines.push(
    readyForPsycho
      ? "• Psychoeducation: allowed — one short, lived insight that normalizes her experience."
      : "• Psychoeducation: skip — stay with containment and reflection."
  );

  lines.push(
    readyForCuriosity
      ? "• Curiosity: allowed — end with one open question or gentle wondering."
      : "• Curiosity: skip — hold steady, no questions this turn."
  );

  lines.push("• Priority: containment first, then reflection; explore only if emotional steadiness allows.");

  return lines.join("\n");
}

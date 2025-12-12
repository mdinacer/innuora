/**
 * Phase Evaluation Domain - Public API
 *
 * Responsibility: Detect conversation phase and closure state
 */

// Actions
export { evaluateSessionPhase } from "./phase-evaluation.actions";

// Types
export type { SessionPhaseEvaluation, SessionPhase, ClosureState } from "./phase-evaluation.types";
export { SessionPhaseEvaluationSchema, SESSION_PHASES, CLOSURE_STATES } from "./phase-evaluation.types";

// Utils
export { buildSessionPhaseEvaluationInput } from "./phase-evaluation.utils";

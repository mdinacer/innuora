/**
 * Reflection Domain - Public API
 *
 * Responsibility: Compose therapeutic responses
 */

// Actions
export { composeContextualReflection } from "./reflection.actions";

// Types (re-export shared types + domain-specific)
export type {
  RelationalTrace,
  RelationalTraceApp,
  RelationalStance,
  RelationalTone,
  EngagementLevel,
  ResistanceLevel,
  Psychoeducation,
  PsychoeducationCategory,
  NextAction,
  NextActionType,
  ReflectiveResponse,
  CrisisLevel,
} from "./reflection.types";

// Runtime values (schemas, constants, etc.)
export {
  RelationalTraceSchema,
  RelationalTraceAppSchema,
  RELATIONAL_STANCES,
  RELATIONAL_TONES,
  ENGAGEMENT_LEVELS,
  RESISTANCE_LEVELS,
  SAFE_FALLBACK_TRACE,
  PsychoeducationSchema,
  PSYCHOEDU_CATEGORIES,
  NextActionSchema,
  NEXT_ACTION_TYPES,
  ReflectiveResponseSchema,
  CRISIS_LEVELS,
} from "./reflection.types";

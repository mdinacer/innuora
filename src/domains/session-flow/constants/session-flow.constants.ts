// =======================
// SESSION FLOW CONSTANTS
// =======================

import { SessionFlowState } from "@/domains/session-flow/types/session-flow-state.types";

export const SESSION_FLOW_DEFAULTS = {
  AUTO_ADVANCE_DELAY: 3000,
  STEP_TRANSITION_DELAY: 800,
  INPUT_VALIDATION_DELAY: 300,
  SAVE_DEBOUNCE_DELAY: 1000,
} as const;

export const SESSION_FLOW_LIMITS = {
  MAX_INPUT_LENGTH: 5000,
  MAX_STEPS_HISTORY: 100,
  MAX_LOGS: 50,
  MAX_REFLECTIONS: 20,
} as const;

export const createDefaultSessionFlowState = (): SessionFlowState => ({
  inputValues: {},
  currentStepId: null,
  hasStarted: false,
  hasEnded: false,
  logs: [],
  lastAccessedAt: null,
});

export const SESSION_FLOW_ERROR_MESSAGES = {
  STEP_NOT_FOUND: "Step not found in the flow",
  INVALID_INPUT: "Invalid input provided",
  VALIDATION_ERROR: "Validation failed",
  TRANSITION_ERROR: "Failed to transition to next step",
  INITIALIZATION_ERROR: "Failed to initialize session flow",
  SESSION_NOT_FOUND: "Session flow not found",
  FLOW_NOT_STARTED: "Flow has not been started",
  FLOW_ALREADY_ENDED: "Flow has already ended",
} as const;

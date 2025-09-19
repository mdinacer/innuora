// =======================
// SESSION FLOW STATE TYPES
// =======================

export interface SessionFlowState {
  inputValues: Record<string, any>;
  currentStepId: string | null;
  hasStarted: boolean;
  hasEnded: boolean;
  logs: string[];
  lastAccessedAt: number | null;
}

export interface SessionFlowEngineState {
  isTransitioning: boolean;
  lastError: Error | null;
  lastStepId: string | null;
}

export interface SessionFlowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Error types
export interface SessionFlowError {
  type: "STEP_NOT_FOUND" | "INVALID_INPUT" | "VALIDATION_ERROR" | "TRANSITION_ERROR" | "INITIALIZATION_ERROR";
  message: string;
  stepId?: string;
  context?: Record<string, any>;
}

// Loading states
export interface SessionFlowLoadingState {
  isInitializing: boolean;
  isTransitioning: boolean;
  isSaving: boolean;
  isValidating: boolean;
}

// Action results
export interface SessionFlowActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: SessionFlowError;
}

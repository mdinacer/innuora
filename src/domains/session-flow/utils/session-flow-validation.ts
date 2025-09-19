// =======================
// SESSION FLOW VALIDATION
// =======================

import { SESSION_FLOW_ERROR_MESSAGES, SESSION_FLOW_LIMITS } from "../constants/session-flow.constants";
import { SessionFlowError, SessionFlowValidationResult } from "../types/session-flow-state.types";
import { FlowStep, OptionsContent, SessionFlow, StepType, UserInputContent } from "../types/session-flow.types";

export function validateSessionFlow(flow: SessionFlow): SessionFlowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate basic structure
  if (!flow.id) errors.push("Flow must have an ID");
  if (!flow.title) errors.push("Flow must have a title");
  if (!flow.steps || flow.steps.length === 0) errors.push("Flow must have at least one step");
  if (!flow.initialStepId) errors.push("Flow must have an initial step ID");

  // Validate initial step exists
  if (flow.initialStepId && !flow.steps.find((step) => step.id === flow.initialStepId)) {
    errors.push("Initial step ID does not exist in flow steps");
  }

  // Validate steps
  flow.steps.forEach((step) => {
    const stepErrors = validateFlowStep(step, flow.steps);
    errors.push(...stepErrors);
  });

  // Check for unreachable steps
  const reachableSteps = findReachableSteps(flow);
  const unreachableSteps = flow.steps.filter((step) => !reachableSteps.has(step.id));
  if (unreachableSteps.length > 0) {
    warnings.push(`Unreachable steps found: ${unreachableSteps.map((s) => s.id).join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateFlowStep(step: FlowStep, allSteps: FlowStep[]): string[] {
  const errors: string[] = [];

  if (!step.id) errors.push("Step must have an ID");
  if (!step.type) errors.push("Step must have a type");

  // Validate nextStepId exists (except for END steps)
  if (step.nextStepId && !allSteps.find((s) => s.id === step.nextStepId)) {
    errors.push(`Step ${step.id}: nextStepId "${step.nextStepId}" does not exist`);
  }

  // Type-specific validation
  switch (step.type) {
    case StepType.USER_INPUT:
      errors.push(...validateUserInputStep(step as Extract<FlowStep, { type: typeof StepType.USER_INPUT }>));
      break;
    case StepType.OPTIONS:
      errors.push(...validateOptionsStep(step as Extract<FlowStep, { type: typeof StepType.OPTIONS }>));
      break;
    case StepType.FLOW_END:
      if (step.nextStepId) {
        errors.push(`Step ${step.id}: FLOW_END steps should not have nextStepId`);
      }
      break;
    case StepType.BRANCH:
      const branchStep = step as Extract<FlowStep, { type: typeof StepType.BRANCH }>;
      if (!branchStep.content.whenTrueStepId) {
        errors.push(`Step ${step.id}: BRANCH step must have whenTrueStepId`);
      }
      if (!branchStep.content.whenFalseStepId) {
        errors.push(`Step ${step.id}: BRANCH step must have whenFalseStepId`);
      }
      break;
  }

  return errors;
}

function validateUserInputStep(step: Extract<FlowStep, { type: typeof StepType.USER_INPUT }>): string[] {
  const errors: string[] = [];
  const content = step.content as UserInputContent;

  if (!content.label) errors.push(`Step ${step.id}: USER_INPUT step must have a label`);
  if (!content.key) errors.push(`Step ${step.id}: USER_INPUT step must have a key`);

  if (content.charLimit && content.charLimit > SESSION_FLOW_LIMITS.MAX_INPUT_LENGTH) {
    errors.push(`Step ${step.id}: charLimit exceeds maximum allowed (${SESSION_FLOW_LIMITS.MAX_INPUT_LENGTH})`);
  }

  return errors;
}

function validateOptionsStep(step: Extract<FlowStep, { type: typeof StepType.OPTIONS }>): string[] {
  const errors: string[] = [];
  const content = step.content as OptionsContent;

  if (!content.label) errors.push(`Step ${step.id}: OPTIONS step must have a label`);
  if (!content.key) errors.push(`Step ${step.id}: OPTIONS step must have a key`);
  if (!content.options || content.options.length === 0) {
    errors.push(`Step ${step.id}: OPTIONS step must have at least one option`);
  }

  content.options?.forEach((option, index) => {
    if (!option.label) errors.push(`Step ${step.id}: Option ${index} must have a label`);
    if (option.value === undefined || option.value === null) {
      errors.push(`Step ${step.id}: Option ${index} must have a value`);
    }
  });

  return errors;
}

function findReachableSteps(flow: SessionFlow): Set<string> {
  const reachable = new Set<string>();
  const toVisit = [flow.initialStepId];

  while (toVisit.length > 0) {
    const stepId = toVisit.pop()!;
    if (reachable.has(stepId)) continue;

    reachable.add(stepId);
    const step = flow.steps.find((s) => s.id === stepId);

    if (step?.nextStepId) {
      toVisit.push(step.nextStepId);
    }

    // Handle branch steps
    if (step?.type === StepType.BRANCH) {
      const branchStep = step as Extract<FlowStep, { type: typeof StepType.BRANCH }>;
      toVisit.push(branchStep.content.whenTrueStepId);
      toVisit.push(branchStep.content.whenFalseStepId);
    }
  }

  return reachable;
}

export function validateUserInput(input: string, stepContent: UserInputContent): SessionFlowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input && stepContent.hint?.includes("required")) {
    errors.push("This field is required");
  }

  if (stepContent.charLimit && input.length > stepContent.charLimit) {
    errors.push(`Input exceeds character limit of ${stepContent.charLimit}`);
  }

  if (input.length > SESSION_FLOW_LIMITS.MAX_INPUT_LENGTH) {
    errors.push(`Input exceeds maximum allowed length of ${SESSION_FLOW_LIMITS.MAX_INPUT_LENGTH}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function createSessionFlowError(
  type: SessionFlowError["type"],
  message?: string,
  stepId?: string,
  context?: Record<string, any>
): SessionFlowError {
  return {
    type,
    message: message || SESSION_FLOW_ERROR_MESSAGES[type],
    stepId,
    context,
  };
}

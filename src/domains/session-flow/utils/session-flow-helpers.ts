// =======================
// SESSION FLOW HELPERS
// =======================

import { SessionFlowState } from "../types/session-flow-state.types";
import { AdvanceMode, FlowStep, SessionFlow, StepType } from "../types/session-flow.types";

export function createStepsMap(steps: FlowStep[]): Record<string, FlowStep> {
  return Object.fromEntries(steps.map((step) => [step.id, step]));
}

export function findStepById(steps: FlowStep[], stepId: string): FlowStep | undefined {
  return steps.find((step) => step.id === stepId);
}

export function findNextStep(currentStep: FlowStep, inputValues?: Record<string, any>): string | null {
  if (currentStep.type === StepType.BRANCH) {
    const branchStep = currentStep as Extract<FlowStep, { type: typeof StepType.BRANCH }>;
    const conditionResult = branchStep.content.condition(inputValues || {});
    return conditionResult ? branchStep.content.whenTrueStepId : branchStep.content.whenFalseStepId;
  }

  return currentStep.nextStepId || null;
}

export function isAutoAdvancingStep(step: FlowStep): boolean {
  return step.advanceMode === AdvanceMode.AUTO && "nextStepId" in step && !!step.nextStepId;
}

export function getAutoAdvanceDelay(step: FlowStep, flowDefault?: number, globalDefault: number = 3000): number {
  if (step.autoAdvanceDelay !== undefined) return step.autoAdvanceDelay;
  if (flowDefault !== undefined) return flowDefault;
  return globalDefault;
}

export function isFlowEndStep(step: FlowStep): boolean {
  return step.type === StepType.FLOW_END;
}

export function isUserInteractionStep(step: FlowStep): boolean {
  return step.type === StepType.USER_INPUT || step.type === StepType.OPTIONS;
}

export function canAdvanceToNextStep(step: FlowStep, inputValues: Record<string, any>): boolean {
  if (isFlowEndStep(step)) return false;

  if (isUserInteractionStep(step)) {
    const content = step.content as any;
    const key = content.key;
    return key ? inputValues[key] !== undefined : false;
  }

  return true;
}

export function getStepTitle(step: FlowStep): string {
  switch (step.type) {
    case StepType.TEXT:
      return typeof step.content === "string" ? step.content.slice(0, 50) + "..." : "Text Step";
    case StepType.PARAGRAPHS:
      return step.content.title || "Paragraphs Step";
    case StepType.USER_INPUT:
      return step.content.label || "User Input Step";
    case StepType.OPTIONS:
      return step.content.label || "Options Step";
    case StepType.ACTION:
      return step.content.prompt?.slice(0, 50) + "..." || "Action Step";
    case StepType.REFLECTION:
      return step.content.title || "Reflection Step";
    case StepType.BRANCH:
      return "Branch Step";
    case StepType.SYSTEM:
      return step.content.title || "System Step";
    case StepType.FLOW_END:
      return step.content.title || "End Step";
    default:
      return "Unknown Step";
  }
}

export function getStepProgress(
  currentStepId: string | null,
  flow: SessionFlow
): { current: number; total: number; percentage: number } {
  if (!currentStepId) {
    return { current: 0, total: flow.steps.length, percentage: 0 };
  }

  const currentIndex = flow.steps.findIndex((step) => step.id === currentStepId);
  const current = currentIndex >= 0 ? currentIndex + 1 : 0;
  const total = flow.steps.length;
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return { current, total, percentage };
}

export function extractInputValueFromStep(step: FlowStep): string | null {
  if (step.type === StepType.USER_INPUT) {
    return step.content.key;
  }
  if (step.type === StepType.OPTIONS) {
    return step.content.key;
  }
  return null;
}

export function sanitizeInputValues(inputValues: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(inputValues)) {
    if (value !== null && value !== undefined) {
      if (typeof value === "string") {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

export function updateSessionFlowTimestamp(state: SessionFlowState): SessionFlowState {
  return {
    ...state,
    lastAccessedAt: Date.now(),
  };
}

export function addLogEntry(state: SessionFlowState, message: string): SessionFlowState {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;

  return {
    ...state,
    logs: [...state.logs.slice(-49), logEntry], // Keep only last 50 logs
  };
}

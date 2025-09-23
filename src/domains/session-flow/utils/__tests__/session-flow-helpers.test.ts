/**
 * Unit tests for session-flow-helpers.ts
 * CORE UX FUNCTIONS - Tests session flow progression and user experience logic
 *
 * These tests protect against:
 * - Flow progression failures and infinite loops
 * - User input validation bypasses
 * - Step transition logic errors
 * - Progress calculation issues
 * - Input sanitization vulnerabilities
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SessionFlowState } from "../../types/session-flow-state.types";
import { AdvanceMode, FlowStep, SessionFlow, StepType } from "../../types/session-flow.types";
import {
  addLogEntry,
  canAdvanceToNextStep,
  createStepsMap,
  extractInputValueFromStep,
  findNextStep,
  findStepById,
  getAutoAdvanceDelay,
  getStepProgress,
  getStepTitle,
  isAutoAdvancingStep,
  isFlowEndStep,
  isUserInteractionStep,
  sanitizeInputValues,
  updateSessionFlowTimestamp,
} from "../session-flow-helpers";

// Mock Date for consistent testing
const mockDate = new Date("2024-01-15T10:30:00Z");

describe("Session Flow Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Sample test data
  const createMockSteps = (): FlowStep[] => [
    {
      id: "step-1",
      type: StepType.TEXT,
      content: "Welcome to the therapeutic session",
      advanceMode: AdvanceMode.AUTO,
      nextStepId: "step-2",
    },
    {
      id: "step-2",
      type: StepType.USER_INPUT,
      content: {
        label: "How are you feeling today?",
        key: "mood",
        placeholder: "Describe your mood...",
      },
      advanceMode: AdvanceMode.MANUAL,
      nextStepId: "step-3",
    },
    {
      id: "step-3",
      type: StepType.OPTIONS,
      content: {
        label: "Select your primary concern",
        key: "concern",
        options: [
          { value: "anxiety", label: "Anxiety" },
          { value: "depression", label: "Depression" },
          { value: "stress", label: "Stress" },
        ],
      },
      advanceMode: AdvanceMode.MANUAL,
      nextStepId: "step-4",
    },
    {
      id: "step-4",
      type: StepType.BRANCH,
      content: {
        condition: (inputs: Record<string, any>) => inputs.concern === "anxiety",
        whenTrueStepId: "anxiety-path",
        whenFalseStepId: "general-path",
      },
      advanceMode: AdvanceMode.AUTO,
    },
    {
      id: "anxiety-path",
      type: StepType.ACTION,
      content: {
        prompt: "Let's explore your anxiety patterns",
        action: "analyze_anxiety",
      },
      advanceMode: AdvanceMode.MANUAL,
      nextStepId: "end-step",
    },
    {
      id: "general-path",
      type: StepType.REFLECTION,
      content: {
        title: "General Reflection",
        questions: ["What brings you here today?"],
      },
      advanceMode: AdvanceMode.MANUAL,
      nextStepId: "end-step",
    },
    {
      id: "end-step",
      type: StepType.FLOW_END,
      content: {
        title: "Session Complete",
        message: "Thank you for sharing",
      },
      advanceMode: AdvanceMode.MANUAL,
    },
  ];

  const createMockFlow = (): SessionFlow => ({
    id: "test-flow",
    name: "Test Therapeutic Flow",
    description: "A test flow for unit testing",
    type: "deep",
    steps: createMockSteps(),
    initialStepId: "step-1",
    autoAdvanceDelay: 2000,
  });

  describe("createStepsMap", () => {
    it("should create a map from step ID to step object", () => {
      const steps = createMockSteps();
      const stepsMap = createStepsMap(steps);

      expect(Object.keys(stepsMap)).toHaveLength(7);
      expect(stepsMap["step-1"]).toEqual(steps[0]);
      expect(stepsMap["step-2"]).toEqual(steps[1]);
      expect(stepsMap["end-step"]).toEqual(steps[6]);
    });

    it("should handle empty steps array", () => {
      const stepsMap = createStepsMap([]);
      expect(stepsMap).toEqual({});
    });

    it("should handle duplicate step IDs by using the last occurrence", () => {
      const duplicateSteps: FlowStep[] = [
        {
          id: "duplicate",
          type: StepType.TEXT,
          content: "First",
          advanceMode: AdvanceMode.AUTO,
        },
        {
          id: "duplicate",
          type: StepType.TEXT,
          content: "Second",
          advanceMode: AdvanceMode.AUTO,
        },
      ];

      const stepsMap = createStepsMap(duplicateSteps);
      expect(stepsMap["duplicate"].content).toBe("Second");
    });
  });

  describe("findStepById", () => {
    const steps = createMockSteps();

    it("should find existing step by ID", () => {
      const step = findStepById(steps, "step-2");
      expect(step).toBeDefined();
      expect(step?.id).toBe("step-2");
      expect(step?.type).toBe(StepType.USER_INPUT);
    });

    it("should return undefined for non-existent step ID", () => {
      const step = findStepById(steps, "non-existent");
      expect(step).toBeUndefined();
    });

    it("should handle empty steps array", () => {
      const step = findStepById([], "any-id");
      expect(step).toBeUndefined();
    });

    it("should handle case-sensitive step IDs", () => {
      const step = findStepById(steps, "STEP-1"); // Wrong case
      expect(step).toBeUndefined();
    });
  });

  describe("findNextStep", () => {
    const steps = createMockSteps();

    it("should return nextStepId for regular steps", () => {
      const textStep = steps[0]; // step-1
      const nextStepId = findNextStep(textStep);
      expect(nextStepId).toBe("step-2");
    });

    it("should return null when nextStepId is not defined", () => {
      const endStep = steps[6]; // end-step
      const nextStepId = findNextStep(endStep);
      expect(nextStepId).toBeNull();
    });

    it("should handle branch step with true condition", () => {
      const branchStep = steps[3]; // step-4 (branch)
      const inputValues = { concern: "anxiety" };

      const nextStepId = findNextStep(branchStep, inputValues);
      expect(nextStepId).toBe("anxiety-path");
    });

    it("should handle branch step with false condition", () => {
      const branchStep = steps[3]; // step-4 (branch)
      const inputValues = { concern: "depression" };

      const nextStepId = findNextStep(branchStep, inputValues);
      expect(nextStepId).toBe("general-path");
    });

    it("should handle branch step with no input values", () => {
      const branchStep = steps[3]; // step-4 (branch)

      const nextStepId = findNextStep(branchStep);
      expect(nextStepId).toBe("general-path"); // condition should return false
    });

    it("should handle branch step with undefined input values", () => {
      const branchStep = steps[3]; // step-4 (branch)
      const inputValues = { otherKey: "value" };

      const nextStepId = findNextStep(branchStep, inputValues);
      expect(nextStepId).toBe("general-path"); // condition should return false
    });
  });

  describe("isAutoAdvancingStep", () => {
    it("should return true for auto-advancing step with nextStepId", () => {
      const autoStep: FlowStep = {
        id: "auto-step",
        type: StepType.TEXT,
        content: "Auto advancing text",
        advanceMode: AdvanceMode.AUTO,
        nextStepId: "next-step",
      };

      expect(isAutoAdvancingStep(autoStep)).toBe(true);
    });

    it("should return false for auto step without nextStepId", () => {
      const autoStepNoNext: FlowStep = {
        id: "auto-step",
        type: StepType.TEXT,
        content: "Auto step no next",
        advanceMode: AdvanceMode.AUTO,
      };

      expect(isAutoAdvancingStep(autoStepNoNext)).toBe(false);
    });

    it("should return false for manual step", () => {
      const manualStep: FlowStep = {
        id: "manual-step",
        type: StepType.USER_INPUT,
        content: { label: "Manual input", key: "input" },
        advanceMode: AdvanceMode.MANUAL,
        nextStepId: "next-step",
      };

      expect(isAutoAdvancingStep(manualStep)).toBe(false);
    });

    it("should return false for await step", () => {
      const awaitStep: FlowStep = {
        id: "await-step",
        type: StepType.ACTION,
        content: { prompt: "Awaiting action", action: "wait" },
        advanceMode: AdvanceMode.AWAIT,
        nextStepId: "next-step",
      };

      expect(isAutoAdvancingStep(awaitStep)).toBe(false);
    });
  });

  describe("getAutoAdvanceDelay", () => {
    it("should return step-specific delay when defined", () => {
      const stepWithDelay: FlowStep = {
        id: "step",
        type: StepType.TEXT,
        content: "Text",
        advanceMode: AdvanceMode.AUTO,
        autoAdvanceDelay: 5000,
      };

      const delay = getAutoAdvanceDelay(stepWithDelay, 2000, 3000);
      expect(delay).toBe(5000);
    });

    it("should return flow default when step delay is undefined", () => {
      const stepNoDelay: FlowStep = {
        id: "step",
        type: StepType.TEXT,
        content: "Text",
        advanceMode: AdvanceMode.AUTO,
      };

      const delay = getAutoAdvanceDelay(stepNoDelay, 2000, 3000);
      expect(delay).toBe(2000);
    });

    it("should return global default when both step and flow delays are undefined", () => {
      const stepNoDelay: FlowStep = {
        id: "step",
        type: StepType.TEXT,
        content: "Text",
        advanceMode: AdvanceMode.AUTO,
      };

      const delay = getAutoAdvanceDelay(stepNoDelay, undefined, 3000);
      expect(delay).toBe(3000);
    });

    it("should use default global value when not provided", () => {
      const stepNoDelay: FlowStep = {
        id: "step",
        type: StepType.TEXT,
        content: "Text",
        advanceMode: AdvanceMode.AUTO,
      };

      const delay = getAutoAdvanceDelay(stepNoDelay);
      expect(delay).toBe(3000); // Default global value
    });

    it("should handle zero delay values", () => {
      const stepZeroDelay: FlowStep = {
        id: "step",
        type: StepType.TEXT,
        content: "Text",
        advanceMode: AdvanceMode.AUTO,
        autoAdvanceDelay: 0,
      };

      const delay = getAutoAdvanceDelay(stepZeroDelay, 2000, 3000);
      expect(delay).toBe(0);
    });
  });

  describe("isFlowEndStep", () => {
    it("should return true for FLOW_END step type", () => {
      const endStep: FlowStep = {
        id: "end",
        type: StepType.FLOW_END,
        content: { title: "End", message: "Complete" },
        advanceMode: AdvanceMode.MANUAL,
      };

      expect(isFlowEndStep(endStep)).toBe(true);
    });

    it("should return false for non-FLOW_END step types", () => {
      const textStep: FlowStep = {
        id: "text",
        type: StepType.TEXT,
        content: "Text content",
        advanceMode: AdvanceMode.AUTO,
      };

      expect(isFlowEndStep(textStep)).toBe(false);
    });
  });

  describe("isUserInteractionStep", () => {
    it("should return true for USER_INPUT step type", () => {
      const inputStep: FlowStep = {
        id: "input",
        type: StepType.USER_INPUT,
        content: { label: "Input", key: "input" },
        advanceMode: AdvanceMode.MANUAL,
      };

      expect(isUserInteractionStep(inputStep)).toBe(true);
    });

    it("should return true for OPTIONS step type", () => {
      const optionsStep: FlowStep = {
        id: "options",
        type: StepType.OPTIONS,
        content: { label: "Options", key: "choice", options: [] },
        advanceMode: AdvanceMode.MANUAL,
      };

      expect(isUserInteractionStep(optionsStep)).toBe(true);
    });

    it("should return false for non-interaction step types", () => {
      const textStep: FlowStep = {
        id: "text",
        type: StepType.TEXT,
        content: "Text content",
        advanceMode: AdvanceMode.AUTO,
      };

      expect(isUserInteractionStep(textStep)).toBe(false);
    });
  });

  describe("canAdvanceToNextStep", () => {
    it("should return false for FLOW_END steps", () => {
      const endStep: FlowStep = {
        id: "end",
        type: StepType.FLOW_END,
        content: { title: "End", message: "Complete" },
        advanceMode: AdvanceMode.MANUAL,
      };

      const canAdvance = canAdvanceToNextStep(endStep, {});
      expect(canAdvance).toBe(false);
    });

    it("should return true for USER_INPUT step with required input provided", () => {
      const inputStep: FlowStep = {
        id: "input",
        type: StepType.USER_INPUT,
        content: { label: "Input", key: "mood" },
        advanceMode: AdvanceMode.MANUAL,
      };

      const inputValues = { mood: "happy" };
      const canAdvance = canAdvanceToNextStep(inputStep, inputValues);
      expect(canAdvance).toBe(true);
    });

    it("should return false for USER_INPUT step without required input", () => {
      const inputStep: FlowStep = {
        id: "input",
        type: StepType.USER_INPUT,
        content: { label: "Input", key: "mood" },
        advanceMode: AdvanceMode.MANUAL,
      };

      const inputValues = { otherKey: "value" };
      const canAdvance = canAdvanceToNextStep(inputStep, inputValues);
      expect(canAdvance).toBe(false);
    });

    it("should return true for OPTIONS step with required selection", () => {
      const optionsStep: FlowStep = {
        id: "options",
        type: StepType.OPTIONS,
        content: { label: "Choose", key: "choice", options: [] },
        advanceMode: AdvanceMode.MANUAL,
      };

      const inputValues = { choice: "option1" };
      const canAdvance = canAdvanceToNextStep(optionsStep, inputValues);
      expect(canAdvance).toBe(true);
    });

    it("should return true for non-interaction steps", () => {
      const textStep: FlowStep = {
        id: "text",
        type: StepType.TEXT,
        content: "Text content",
        advanceMode: AdvanceMode.AUTO,
      };

      const canAdvance = canAdvanceToNextStep(textStep, {});
      expect(canAdvance).toBe(true);
    });

    it("should handle step with undefined content key", () => {
      const inputStepNoKey: FlowStep = {
        id: "input",
        type: StepType.USER_INPUT,
        content: { label: "Input" }, // No key property
        advanceMode: AdvanceMode.MANUAL,
      };

      const canAdvance = canAdvanceToNextStep(inputStepNoKey, { someInput: "value" });
      expect(canAdvance).toBe(false);
    });
  });

  describe("getStepTitle", () => {
    it("should return truncated content for TEXT step", () => {
      const longTextStep: FlowStep = {
        id: "text",
        type: StepType.TEXT,
        content: "This is a very long text content that should be truncated when used as a title",
        advanceMode: AdvanceMode.AUTO,
      };

      const title = getStepTitle(longTextStep);
      expect(title).toBe("This is a very long text content that should be tr...");
      expect(title.length).toBeLessThanOrEqual(53); // 50 chars + "..."
    });

    it("should return title from PARAGRAPHS step content", () => {
      const paragraphsStep: FlowStep = {
        id: "paragraphs",
        type: StepType.PARAGRAPHS,
        content: {
          title: "Introduction Section",
          paragraphs: ["Para 1", "Para 2"],
        },
        advanceMode: AdvanceMode.AUTO,
      };

      const title = getStepTitle(paragraphsStep);
      expect(title).toBe("Introduction Section");
    });

    it("should return label from USER_INPUT step", () => {
      const inputStep: FlowStep = {
        id: "input",
        type: StepType.USER_INPUT,
        content: { label: "Tell us about your mood", key: "mood" },
        advanceMode: AdvanceMode.MANUAL,
      };

      const title = getStepTitle(inputStep);
      expect(title).toBe("Tell us about your mood");
    });

    it("should return label from OPTIONS step", () => {
      const optionsStep: FlowStep = {
        id: "options",
        type: StepType.OPTIONS,
        content: { label: "Select your preference", key: "pref", options: [] },
        advanceMode: AdvanceMode.MANUAL,
      };

      const title = getStepTitle(optionsStep);
      expect(title).toBe("Select your preference");
    });

    it("should return truncated prompt from ACTION step", () => {
      const actionStep: FlowStep = {
        id: "action",
        type: StepType.ACTION,
        content: {
          prompt: "This is a very long action prompt that should be truncated for display",
          action: "analyze",
        },
        advanceMode: AdvanceMode.AWAIT,
      };

      const title = getStepTitle(actionStep);
      expect(title).toBe("This is a very long action prompt that should be t...");
    });

    it("should return title from REFLECTION step", () => {
      const reflectionStep: FlowStep = {
        id: "reflection",
        type: StepType.REFLECTION,
        content: {
          title: "Personal Reflection",
          questions: ["Question 1"],
        },
        advanceMode: AdvanceMode.MANUAL,
      };

      const title = getStepTitle(reflectionStep);
      expect(title).toBe("Personal Reflection");
    });

    it("should return 'Branch Step' for BRANCH type", () => {
      const branchStep: FlowStep = {
        id: "branch",
        type: StepType.BRANCH,
        content: {
          condition: () => true,
          whenTrueStepId: "true-path",
          whenFalseStepId: "false-path",
        },
        advanceMode: AdvanceMode.AUTO,
      };

      const title = getStepTitle(branchStep);
      expect(title).toBe("Branch Step");
    });

    it("should return title from SYSTEM step", () => {
      const systemStep: FlowStep = {
        id: "system",
        type: StepType.SYSTEM,
        content: { title: "System Processing", action: "process" },
        advanceMode: AdvanceMode.AUTO,
      };

      const title = getStepTitle(systemStep);
      expect(title).toBe("System Processing");
    });

    it("should return title from FLOW_END step", () => {
      const endStep: FlowStep = {
        id: "end",
        type: StepType.FLOW_END,
        content: { title: "Session Complete", message: "Thank you" },
        advanceMode: AdvanceMode.MANUAL,
      };

      const title = getStepTitle(endStep);
      expect(title).toBe("Session Complete");
    });

    it("should return default titles when content fields are missing", () => {
      const stepsWithMissingTitles = [
        { type: StepType.PARAGRAPHS, content: { paragraphs: [] }, expected: "Paragraphs Step" },
        { type: StepType.USER_INPUT, content: { key: "input" }, expected: "User Input Step" },
        { type: StepType.OPTIONS, content: { key: "choice", options: [] }, expected: "Options Step" },
        { type: StepType.ACTION, content: { action: "act" }, expected: "undefined..." },
        { type: StepType.REFLECTION, content: { questions: [] }, expected: "Reflection Step" },
        { type: StepType.SYSTEM, content: { action: "sys" }, expected: "System Step" },
        { type: StepType.FLOW_END, content: { message: "Done" }, expected: "End Step" },
      ];

      stepsWithMissingTitles.forEach(({ type, content, expected }) => {
        const step: FlowStep = {
          id: "test",
          type,
          content,
          advanceMode: AdvanceMode.AUTO,
        };

        const title = getStepTitle(step);
        expect(title).toBe(expected);
      });
    });

    it("should return 'Unknown Step' for unrecognized step type", () => {
      const unknownStep = {
        id: "unknown",
        type: "unknown_type" as any,
        content: "Unknown content",
        advanceMode: AdvanceMode.AUTO,
      };

      const title = getStepTitle(unknownStep);
      expect(title).toBe("Unknown Step");
    });

    it("should return 'Text Step' for TEXT step with non-string content", () => {
      const textStepNonString: FlowStep = {
        id: "text",
        type: StepType.TEXT,
        content: { message: "Not a string" } as any, // Non-string content
        advanceMode: AdvanceMode.AUTO,
      };

      const title = getStepTitle(textStepNonString);
      expect(title).toBe("Text Step");
    });
  });

  describe("getStepProgress", () => {
    const flow = createMockFlow();

    it("should return correct progress for first step", () => {
      const progress = getStepProgress("step-1", flow);

      expect(progress).toEqual({
        current: 1,
        total: 7,
        percentage: 14, // Math.round(1/7 * 100)
      });
    });

    it("should return correct progress for middle step", () => {
      const progress = getStepProgress("step-3", flow);

      expect(progress).toEqual({
        current: 3,
        total: 7,
        percentage: 43, // Math.round(3/7 * 100)
      });
    });

    it("should return correct progress for last step", () => {
      const progress = getStepProgress("end-step", flow);

      expect(progress).toEqual({
        current: 7,
        total: 7,
        percentage: 100,
      });
    });

    it("should return zero progress for null currentStepId", () => {
      const progress = getStepProgress(null, flow);

      expect(progress).toEqual({
        current: 0,
        total: 7,
        percentage: 0,
      });
    });

    it("should return zero progress for non-existent step", () => {
      const progress = getStepProgress("non-existent", flow);

      expect(progress).toEqual({
        current: 0,
        total: 7,
        percentage: 0,
      });
    });

    it("should handle empty flow", () => {
      const emptyFlow: SessionFlow = {
        id: "empty",
        name: "Empty Flow",
        description: "No steps",
        type: "deep",
        steps: [],
        initialStepId: "none",
      };

      const progress = getStepProgress("any", emptyFlow);

      expect(progress).toEqual({
        current: 0,
        total: 0,
        percentage: 0,
      });
    });
  });

  describe("extractInputValueFromStep", () => {
    it("should return key for USER_INPUT step", () => {
      const inputStep: FlowStep = {
        id: "input",
        type: StepType.USER_INPUT,
        content: { label: "Input", key: "mood" },
        advanceMode: AdvanceMode.MANUAL,
      };

      const key = extractInputValueFromStep(inputStep);
      expect(key).toBe("mood");
    });

    it("should return key for OPTIONS step", () => {
      const optionsStep: FlowStep = {
        id: "options",
        type: StepType.OPTIONS,
        content: { label: "Choose", key: "choice", options: [] },
        advanceMode: AdvanceMode.MANUAL,
      };

      const key = extractInputValueFromStep(optionsStep);
      expect(key).toBe("choice");
    });

    it("should return null for non-input step types", () => {
      const textStep: FlowStep = {
        id: "text",
        type: StepType.TEXT,
        content: "Text content",
        advanceMode: AdvanceMode.AUTO,
      };

      const key = extractInputValueFromStep(textStep);
      expect(key).toBeNull();
    });

    it("should return null for BRANCH step", () => {
      const branchStep: FlowStep = {
        id: "branch",
        type: StepType.BRANCH,
        content: {
          condition: () => true,
          whenTrueStepId: "true",
          whenFalseStepId: "false",
        },
        advanceMode: AdvanceMode.AUTO,
      };

      const key = extractInputValueFromStep(branchStep);
      expect(key).toBeNull();
    });
  });

  describe("sanitizeInputValues", () => {
    it("should trim string values", () => {
      const inputValues = {
        mood: "  happy  ",
        concern: "\tanxiety\n",
        notes: "   some notes   ",
      };

      const sanitized = sanitizeInputValues(inputValues);

      expect(sanitized).toEqual({
        mood: "happy",
        concern: "anxiety",
        notes: "some notes",
      });
    });

    it("should preserve non-string values", () => {
      const inputValues = {
        rating: 7,
        isActive: true,
        options: ["option1", "option2"],
        metadata: { key: "value" },
      };

      const sanitized = sanitizeInputValues(inputValues);

      expect(sanitized).toEqual({
        rating: 7,
        isActive: true,
        options: ["option1", "option2"],
        metadata: { key: "value" },
      });
    });

    it("should exclude null and undefined values", () => {
      const inputValues = {
        validValue: "keep",
        nullValue: null,
        undefinedValue: undefined,
        emptyString: "",
        zeroValue: 0,
      };

      const sanitized = sanitizeInputValues(inputValues);

      expect(sanitized).toEqual({
        validValue: "keep",
        emptyString: "",
        zeroValue: 0,
      });
    });

    it("should handle empty input object", () => {
      const sanitized = sanitizeInputValues({});
      expect(sanitized).toEqual({});
    });

    it("should handle mixed valid and invalid values", () => {
      const inputValues = {
        text1: "  valid  ",
        text2: null,
        number: 42,
        text3: undefined,
        boolean: false,
        text4: "\n\ttrimmed\t\n",
      };

      const sanitized = sanitizeInputValues(inputValues);

      expect(sanitized).toEqual({
        text1: "valid",
        number: 42,
        boolean: false,
        text4: "trimmed",
      });
    });
  });

  describe("updateSessionFlowTimestamp", () => {
    it("should update lastAccessedAt with current timestamp", () => {
      const state: SessionFlowState = {
        inputValues: {},
        currentStepId: "step-1",
        hasStarted: true,
        hasEnded: false,
        logs: [],
        lastAccessedAt: null,
      };

      const updatedState = updateSessionFlowTimestamp(state);

      expect(updatedState.lastAccessedAt).toBe(mockDate.getTime());
      expect(updatedState).toEqual({
        ...state,
        lastAccessedAt: mockDate.getTime(),
      });
    });

    it("should preserve all other state properties", () => {
      const originalState: SessionFlowState = {
        inputValues: { mood: "happy", concern: "anxiety" },
        currentStepId: "step-3",
        hasStarted: true,
        hasEnded: false,
        logs: ["Started session", "Completed step-1"],
        lastAccessedAt: 1234567890,
      };

      const updatedState = updateSessionFlowTimestamp(originalState);

      expect(updatedState.inputValues).toEqual(originalState.inputValues);
      expect(updatedState.currentStepId).toBe(originalState.currentStepId);
      expect(updatedState.hasStarted).toBe(originalState.hasStarted);
      expect(updatedState.hasEnded).toBe(originalState.hasEnded);
      expect(updatedState.logs).toEqual(originalState.logs);
      expect(updatedState.lastAccessedAt).toBe(mockDate.getTime());
    });

    it("should not mutate original state", () => {
      const originalState: SessionFlowState = {
        inputValues: {},
        currentStepId: null,
        hasStarted: false,
        hasEnded: false,
        logs: [],
        lastAccessedAt: null,
      };

      const originalLastAccessed = originalState.lastAccessedAt;
      const updatedState = updateSessionFlowTimestamp(originalState);

      expect(originalState.lastAccessedAt).toBe(originalLastAccessed);
      expect(updatedState).not.toBe(originalState);
    });
  });

  describe("addLogEntry", () => {
    it("should add new log entry with timestamp", () => {
      const state: SessionFlowState = {
        inputValues: {},
        currentStepId: "step-1",
        hasStarted: true,
        hasEnded: false,
        logs: ["Previous entry"],
        lastAccessedAt: Date.now(),
      };

      const updatedState = addLogEntry(state, "User completed step-1");

      expect(updatedState.logs).toHaveLength(2);
      expect(updatedState.logs[0]).toBe("Previous entry");
      expect(updatedState.logs[1]).toMatch(/^\[2024-01-15T10:30:00\.000Z\] User completed step-1$/);
    });

    it("should maintain maximum 50 logs", () => {
      // Create state with 50 existing logs
      const existingLogs = Array.from({ length: 50 }, (_, i) => `Log entry ${i + 1}`);
      const state: SessionFlowState = {
        inputValues: {},
        currentStepId: "step-1",
        hasStarted: true,
        hasEnded: false,
        logs: existingLogs,
        lastAccessedAt: Date.now(),
      };

      const updatedState = addLogEntry(state, "New log entry");

      expect(updatedState.logs).toHaveLength(50);
      expect(updatedState.logs[0]).toBe("Log entry 2"); // First log was removed
      expect(updatedState.logs[49]).toMatch(/^\[2024-01-15T10:30:00\.000Z\] New log entry$/);
    });

    it("should preserve other state properties", () => {
      const originalState: SessionFlowState = {
        inputValues: { key: "value" },
        currentStepId: "step-2",
        hasStarted: true,
        hasEnded: false,
        logs: [],
        lastAccessedAt: 1234567890,
      };

      const updatedState = addLogEntry(originalState, "Test message");

      expect(updatedState.inputValues).toEqual(originalState.inputValues);
      expect(updatedState.currentStepId).toBe(originalState.currentStepId);
      expect(updatedState.hasStarted).toBe(originalState.hasStarted);
      expect(updatedState.hasEnded).toBe(originalState.hasEnded);
      expect(updatedState.lastAccessedAt).toBe(originalState.lastAccessedAt);
    });

    it("should not mutate original state", () => {
      const originalState: SessionFlowState = {
        inputValues: {},
        currentStepId: null,
        hasStarted: false,
        hasEnded: false,
        logs: ["Original log"],
        lastAccessedAt: null,
      };

      const originalLogsLength = originalState.logs.length;
      const updatedState = addLogEntry(originalState, "New log");

      expect(originalState.logs).toHaveLength(originalLogsLength);
      expect(originalState.logs[0]).toBe("Original log");
      expect(updatedState).not.toBe(originalState);
      expect(updatedState.logs).not.toBe(originalState.logs);
    });

    it("should handle empty message", () => {
      const state: SessionFlowState = {
        inputValues: {},
        currentStepId: null,
        hasStarted: false,
        hasEnded: false,
        logs: [],
        lastAccessedAt: null,
      };

      const updatedState = addLogEntry(state, "");

      expect(updatedState.logs).toHaveLength(1);
      expect(updatedState.logs[0]).toMatch(/^\[2024-01-15T10:30:00\.000Z\] $/);
    });

    it("should handle special characters in message", () => {
      const state: SessionFlowState = {
        inputValues: {},
        currentStepId: null,
        hasStarted: false,
        hasEnded: false,
        logs: [],
        lastAccessedAt: null,
      };

      const specialMessage = "User input: \"Hello 'world'\" & <script>alert()</script>";
      const updatedState = addLogEntry(state, specialMessage);

      expect(updatedState.logs[0]).toContain(specialMessage);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete flow progression workflow", () => {
      const flow = createMockFlow();
      const steps = flow.steps;

      // Start with first step
      let currentStep = findStepById(steps, flow.initialStepId);
      expect(currentStep?.id).toBe("step-1");
      expect(isAutoAdvancingStep(currentStep!)).toBe(true);

      // Auto-advance to user input step
      let nextStepId = findNextStep(currentStep!);
      currentStep = findStepById(steps, nextStepId!);
      expect(currentStep?.id).toBe("step-2");
      expect(isUserInteractionStep(currentStep!)).toBe(true);

      // Provide user input and advance
      const inputValues = { mood: "anxious" };
      expect(canAdvanceToNextStep(currentStep!, inputValues)).toBe(true);

      nextStepId = findNextStep(currentStep!, inputValues);
      currentStep = findStepById(steps, nextStepId!);
      expect(currentStep?.id).toBe("step-3");

      // Complete options step
      const fullInputs = { ...inputValues, concern: "anxiety" };
      expect(canAdvanceToNextStep(currentStep!, fullInputs)).toBe(true);

      nextStepId = findNextStep(currentStep!, fullInputs);
      currentStep = findStepById(steps, nextStepId!);
      expect(currentStep?.id).toBe("step-4");
      expect(currentStep?.type).toBe(StepType.BRANCH);

      // Branch should route to anxiety path
      nextStepId = findNextStep(currentStep!, fullInputs);
      expect(nextStepId).toBe("anxiety-path");

      currentStep = findStepById(steps, nextStepId!);
      expect(currentStep?.type).toBe(StepType.ACTION);

      // Final step should be end step
      nextStepId = findNextStep(currentStep!);
      currentStep = findStepById(steps, nextStepId!);
      expect(isFlowEndStep(currentStep!)).toBe(true);
      expect(canAdvanceToNextStep(currentStep!, {})).toBe(false);
    });

    it("should handle session state management throughout flow", () => {
      let state: SessionFlowState = {
        inputValues: {},
        currentStepId: "step-1",
        hasStarted: true,
        hasEnded: false,
        logs: [],
        lastAccessedAt: null,
      };

      // Update timestamp
      state = updateSessionFlowTimestamp(state);
      expect(state.lastAccessedAt).toBe(mockDate.getTime());

      // Add user input
      const userInput = { mood: "happy", notes: "  feeling good today  " };
      const sanitizedInput = sanitizeInputValues(userInput);
      state = {
        ...state,
        inputValues: { ...state.inputValues, ...sanitizedInput },
      };

      expect(state.inputValues.mood).toBe("happy");
      expect(state.inputValues.notes).toBe("feeling good today");

      // Log progression
      state = addLogEntry(state, "User provided mood input");
      state = addLogEntry(state, "Advancing to next step");

      expect(state.logs).toHaveLength(2);
      expect(state.logs[0]).toContain("User provided mood input");
      expect(state.logs[1]).toContain("Advancing to next step");

      // Track progress
      const flow = createMockFlow();
      const progress = getStepProgress(state.currentStepId, flow);
      expect(progress.current).toBe(1);
      expect(progress.percentage).toBe(14);
    });

    it("should handle error scenarios gracefully", () => {
      const flow = createMockFlow();

      // Non-existent step handling
      const nonExistentStep = findStepById(flow.steps, "non-existent");
      expect(nonExistentStep).toBeUndefined();

      const progress = getStepProgress("non-existent", flow);
      expect(progress.current).toBe(0);

      // Missing input validation
      const userInputStep = findStepById(flow.steps, "step-2")!;
      expect(canAdvanceToNextStep(userInputStep, {})).toBe(false);
      expect(canAdvanceToNextStep(userInputStep, { wrongKey: "value" })).toBe(false);

      // Invalid input sanitization
      const invalidInputs = {
        validInput: "good",
        nullInput: null,
        undefinedInput: undefined,
        emptyInput: "",
        whitespaceInput: "   trimmed   ",
      };

      const sanitized = sanitizeInputValues(invalidInputs);
      expect(sanitized).toEqual({
        validInput: "good",
        emptyInput: "",
        whitespaceInput: "trimmed",
      });
    });
  });
});

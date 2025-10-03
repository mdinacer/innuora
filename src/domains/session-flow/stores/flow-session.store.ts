// =======================
// UNIFIED FLOW SESSION STORE
// =======================

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { logger } from "@/lib/logging/unified-logger";
import { AppMessageVariant, ChatMessage, createAppMessage } from "@/types/flow-chat-messages.types";
import { FlowStep, SessionFlow, StepType } from "@/types/flow-session.types";

// =======================
// HELPER FUNCTIONS
// =======================

function createMessageFromStep(step: FlowStep): ChatMessage | null {
  switch (step.type) {
    case StepType.APP_MESSAGE:
      return createAppMessage(step.id, AppMessageVariant.TEXT, step.content);

    case StepType.PARAGRAPHS:
      return createAppMessage(step.id, AppMessageVariant.PARAGRAPHS, step.content);

    case StepType.USER_INPUT:
      return createAppMessage(step.id, AppMessageVariant.INPUT, step.content);

    case StepType.USER_SELECT:
      return createAppMessage(step.id, AppMessageVariant.SELECT, step.content);

    case StepType.END:
      return createAppMessage(step.id, AppMessageVariant.END, step.content);

    default:
      return null;
  }
}

// =======================
// STATE TYPES
// =======================

export interface FlowSessionState {
  currentStepId: string;
  responses: Record<string, any>;
  messages: ChatMessage[];
  isComplete: boolean;
  startedAt?: number;
}

interface FlowSessionStoreState {
  // State
  sessions: Record<string, FlowSessionState>;
  flows: Record<string, SessionFlow>; // Loaded flow definitions

  // Getters
  getSession: (sessionId: string) => FlowSessionState | undefined;
  getFlow: (sessionId: string) => SessionFlow | undefined;
  getCurrentStep: (sessionId: string) => FlowStep | undefined;

  // Session Management
  createSession: (sessionId: string, flow: SessionFlow) => void;
  deleteSession: (sessionId: string) => void;
  resetSession: (sessionId: string) => void;

  // Flow Control
  advance: (sessionId: string) => void;
  jumpToStep: (sessionId: string, stepId: string) => void;
  setResponse: (sessionId: string, key: string, value: any) => void;

  // Message Management
  addMessage: (sessionId: string, message: ChatMessage) => void;
  clearMessages: (sessionId: string) => void;
}

// =======================
// STORE IMPLEMENTATION
// =======================

export const useFlowSessionStore = create<FlowSessionStoreState>()(
  devtools(
    (set, get) => ({
      sessions: {},
      flows: {},

      // =======================
      // GETTERS
      // =======================

      getSession: (sessionId) => get().sessions[sessionId],

      getFlow: (sessionId) => get().flows[sessionId],

      getCurrentStep: (sessionId) => {
        const session = get().sessions[sessionId];
        const flow = get().flows[sessionId];
        if (!session || !flow) return undefined;

        return flow.steps.find((step) => step.id === session.currentStepId);
      },

      // =======================
      // SESSION MANAGEMENT
      // =======================

      createSession: (sessionId, flow) => {
        set(
          (state) => {
            if (state.sessions[sessionId]) {
              logger.logWarning("Flow session creation skipped - already exists", {
                operation: "flow-session.create",
                metadata: { sessionId, flowId: flow.id },
              });
              return state;
            }

            // Create initial message for first step
            const initialStep = flow.steps.find((s) => s.id === flow.initialStepId);
            const initialMessages: ChatMessage[] = [];

            if (initialStep) {
              const message = createMessageFromStep(initialStep);
              if (message) initialMessages.push(message);
            }

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  currentStepId: flow.initialStepId,
                  responses: {},
                  messages: initialMessages,
                  isComplete: false,
                  startedAt: Date.now(),
                },
              },
              flows: {
                ...state.flows,
                [sessionId]: flow,
              },
            };
          },
          false,
          "createSession"
        );
      },

      deleteSession: (sessionId) => {
        set(
          (state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [sessionId]: _, ...restSessions } = state.sessions;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [sessionId]: __, ...restFlows } = state.flows;
            return {
              sessions: restSessions,
              flows: restFlows,
            };
          },
          false,
          "deleteSession"
        );
      },

      resetSession: (sessionId) => {
        set(
          (state) => {
            const flow = state.flows[sessionId];
            if (!flow) {
              logger.logWarning("Cannot reset non-existent flow session", {
                operation: "flow-session.reset",
                metadata: { sessionId },
              });
              return state;
            }

            const initialStep = flow.steps.find((s) => s.id === flow.initialStepId);
            const initialMessages: ChatMessage[] = [];

            if (initialStep) {
              const message = createMessageFromStep(initialStep);
              if (message) initialMessages.push(message);
            }

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  currentStepId: flow.initialStepId,
                  responses: {},
                  messages: initialMessages,
                  isComplete: false,
                  startedAt: Date.now(),
                },
              },
            };
          },
          false,
          "resetSession"
        );
      },

      // =======================
      // FLOW CONTROL
      // =======================

      advance: (sessionId) => {
        set(
          (state) => {
            const session = state.sessions[sessionId];
            const flow = state.flows[sessionId];

            if (!session || !flow) {
              logger.logWarning("Cannot advance non-existent flow session", {
                operation: "flow-session.advance",
                metadata: { sessionId },
              });
              return state;
            }

            const currentStep = flow.steps.find((s) => s.id === session.currentStepId);
            if (!currentStep?.nextStepId) {
              logger.logWarning("No next step available in flow", {
                operation: "flow-session.advance",
                metadata: { sessionId, currentStepId: session.currentStepId },
              });
              return state;
            }

            const nextStep = flow.steps.find((s) => s.id === currentStep.nextStepId);
            if (!nextStep) {
              logger.logWarning("Next step not found in flow definition", {
                operation: "flow-session.advance",
                metadata: { sessionId, currentStepId: session.currentStepId, nextStepId: currentStep.nextStepId },
              });
              return state;
            }

            // Create message for next step
            const nextMessage = createMessageFromStep(nextStep);
            const newMessages = nextMessage ? [...session.messages, nextMessage] : session.messages;

            // Check if flow is ending
            const isComplete = nextStep.type === StepType.END;

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  currentStepId: nextStep.id,
                  messages: newMessages,
                  isComplete,
                },
              },
            };
          },
          false,
          "advance"
        );
      },

      jumpToStep: (sessionId, stepId) => {
        set(
          (state) => {
            const session = state.sessions[sessionId];
            const flow = state.flows[sessionId];

            if (!session || !flow) {
              logger.logWarning("Cannot jump in non-existent flow session", {
                operation: "flow-session.jumpToStep",
                metadata: { sessionId, targetStepId: stepId },
              });
              return state;
            }

            const targetStep = flow.steps.find((s) => s.id === stepId);
            if (!targetStep) {
              logger.logWarning("Target step not found in flow definition", {
                operation: "flow-session.jumpToStep",
                metadata: { sessionId, targetStepId: stepId },
              });
              return state;
            }

            // Create message for target step
            const message = createMessageFromStep(targetStep);
            const newMessages = message ? [...session.messages, message] : session.messages;

            const isComplete = targetStep.type === StepType.END;

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  currentStepId: stepId,
                  messages: newMessages,
                  isComplete,
                },
              },
            };
          },
          false,
          "jumpToStep"
        );
      },

      setResponse: (sessionId, key, value) => {
        set(
          (state) => {
            const session = state.sessions[sessionId];
            if (!session) {
              logger.logWarning("Cannot set response in non-existent flow session", {
                operation: "flow-session.setResponse",
                metadata: { sessionId, responseKey: key },
              });
              return state;
            }

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  responses: {
                    ...session.responses,
                    [key]: value,
                  },
                },
              },
            };
          },
          false,
          "setResponse"
        );
      },

      // =======================
      // MESSAGE MANAGEMENT
      // =======================

      addMessage: (sessionId, message) => {
        set(
          (state) => {
            const session = state.sessions[sessionId];
            if (!session) {
              logger.logWarning("Cannot add message to non-existent flow session", {
                operation: "flow-session.addMessage",
                metadata: { sessionId, messageType: message.type },
              });
              return state;
            }

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: [...session.messages, message],
                },
              },
            };
          },
          false,
          "addMessage"
        );
      },

      clearMessages: (sessionId) => {
        set(
          (state) => {
            const session = state.sessions[sessionId];
            if (!session) return state;

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: [],
                },
              },
            };
          },
          false,
          "clearMessages"
        );
      },
    }),
    { name: "FlowSessionStore" }
  )
);

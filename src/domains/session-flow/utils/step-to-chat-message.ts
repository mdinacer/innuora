import { ChatMessage, MessageOfType, MessageType } from "@/types/flow-chat-messages.types";
import { FlowStep, StepType } from "@/types/flow-session.types";
import { generateMessageId } from "./generate-id";

export interface MessageCreationOptions {
  id?: string;
  timestamp?: number;
  flowStepId?: string;
}

export const flowStepToChatMessage = (step: FlowStep, options: MessageCreationOptions = {}): ChatMessage => {
  const { id = generateMessageId(step.id), timestamp = Date.now(), flowStepId = step.id } = options;

  switch (step.type) {
    case StepType.TEXT:
      return {
        id,
        type: MessageType.TEXT,
        content: step.content,
        flowStepId,
        timestamp,
      } as MessageOfType<"text">;

    case StepType.PARAGRAPHS:
      return {
        id,
        type: MessageType.PARAGRAPHS,
        content: {
          ...step.content,
          manualAdvance: typeof step.content.buttonText !== "undefined",
        },
        flowStepId,
        timestamp,
      } as MessageOfType<"paragraphs">;

    case StepType.USER_INPUT:
      return {
        id,
        type: MessageType.USER_INPUT,
        content: step.content,
        flowStepId,
        timestamp,
      } as MessageOfType<"user_input">;

    case StepType.OPTIONS:
      return {
        id,
        type: MessageType.OPTIONS,
        content: step.content,
        flowStepId,
        timestamp,
      } as MessageOfType<"options">;

    case StepType.FLOW_END:
      return {
        id,
        type: MessageType.FLOW_END,
        content: step.content,
        flowStepId,
        timestamp,
      } as MessageOfType<"flow_end">;

    case StepType.SYSTEM:
      return {
        id,
        type: MessageType.SYSTEM,
        content: step.content,
        flowStepId,
        timestamp,
      } as MessageOfType<"system">;

    case StepType.ACTION:
      return {
        id,
        type: MessageType.ACTION,
        content: step.content,
        flowStepId,
        timestamp,
      } as MessageOfType<"action">;

    case StepType.REFLECTION:
      // For reflection steps, create a message with loading state
      return {
        id,
        type: MessageType.REFLECTION,
        content: {
          title: step.content.title,
          reflection: undefined, // Will be updated later
        },
        flowStepId,
        timestamp,
      } as MessageOfType<"reflection">;

    default:
      throw new Error(`Unsupported step type: ${(step as any).type}`);
  }
};

export const createUserMessage = (
  content: string | string[],
  options: MessageCreationOptions = {}
): MessageOfType<"user_message"> => {
  const { id = generateMessageId(), timestamp = Date.now() } = options;

  return {
    id,
    type: MessageType.USER_MESSAGE,
    content,
    timestamp,
  } as MessageOfType<"user_message">;
};

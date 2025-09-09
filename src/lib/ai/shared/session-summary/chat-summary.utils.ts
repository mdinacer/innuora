import { OpenChatMessage } from "@/types/open-chat-message.types";

interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export function estimateTokens(text: string): number {
  // More accurate token estimation (roughly 1 token ≈ 4 characters for English)
  return Math.ceil(text.length / 3.5);
}

export function validateMessages(messages: OpenChatMessage[]): ValidationResult {
  const warnings: string[] = [];

  if (!messages || messages.length === 0) {
    return { valid: false, error: "No messages provided" };
  }

  if (messages.length < 2) {
    return { valid: false, error: "Need at least 2 messages for meaningful summary" };
  }

  // Check for malformed messages
  const invalidMessages = messages.filter(
    (msg) => !msg.role || !msg.content?.trim() || !["user", "assistant"].includes(msg.role)
  );

  if (invalidMessages.length > 0) {
    return { valid: false, error: `${invalidMessages.length} invalid message(s) found` };
  }

  // Warnings for edge cases
  if (messages.length < 4) {
    warnings.push("Very short conversation - summary may lack context");
  }

  const avgMessageLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
  if (avgMessageLength < 20) {
    warnings.push("Messages are very short - may indicate low engagement");
  }

  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
}

export function smartTruncateMessages(
  messages: OpenChatMessage[],
  maxTokens: number
): {
  messages: OpenChatMessage[];
  truncated: boolean;
  originalCount: number;
} {
  let totalTokens = 0;
  const truncatedMessages: OpenChatMessage[] = [];

  // Process from most recent backwards to keep latest context
  for (let i = messages.length - 1; i >= 0; i--) {
    const messageTokens = estimateTokens(messages[i].content);

    // Always keep at least the last 2 messages if possible
    const shouldKeep = truncatedMessages.length < 2 || totalTokens + messageTokens <= maxTokens;

    if (shouldKeep) {
      truncatedMessages.unshift(messages[i]);
      totalTokens += messageTokens;
    } else {
      break;
    }
  }

  return {
    messages: truncatedMessages,
    truncated: truncatedMessages.length < messages.length,
    originalCount: messages.length,
  };
}

export function formatMessagesForSummary(messages: OpenChatMessage[]): string {
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Mirael";
      return `${role}: ${msg.content.trim()}`;
    })
    .join("\n");
}

export function getSummaryStats(messages: OpenChatMessage[]): {
  messageCount: number;
  estimatedTokens: number;
  avgMessageLength: number;
  userMessages: number;
  assistantMessages: number;
} {
  const totalContent = messages.reduce((sum, msg) => sum + msg.content.length, 0);
  const userMessages = messages.filter((msg) => msg.role === "user").length;

  return {
    messageCount: messages.length,
    estimatedTokens: estimateTokens(formatMessagesForSummary(messages)),
    avgMessageLength: Math.round(totalContent / messages.length),
    userMessages,
    assistantMessages: messages.length - userMessages,
  };
}

export function countCompleteRounds(messages: OpenChatMessage[]): number {
  let rounds = 0;
  for (let i = 0; i < messages.length - 1; i += 2) {
    if (messages[i]?.role === "user" && messages[i + 1]?.role === "assistant") {
      rounds++;
    }
  }
  return rounds;
}

export function getRecentMessages(
  messages: OpenChatMessage[],
  tokenBudget: number,
  maxRounds: number
): OpenChatMessage[] {
  const recent: OpenChatMessage[] = [];
  let totalTokens = 0;
  let roundsAdded = 0;

  // Work backwards from the last message
  for (let i = messages.length - 1; i >= 0 && roundsAdded < maxRounds; i--) {
    const message = messages[i];
    const messageTokens = estimateTokens(message.content);

    // Check if we can fit this message
    if (totalTokens + messageTokens <= tokenBudget) {
      recent.unshift(message);
      totalTokens += messageTokens;

      // Count rounds (when we add a user message that has a preceding assistant message)
      if (message.role === "user" && recent.length >= 2) {
        roundsAdded++;
      }
    } else {
      // If we can't fit this message, stop adding
      break;
    }
  }

  // Ensure we have complete rounds (remove incomplete round at the beginning)
  if (recent.length > 0 && recent[0].role === "assistant") {
    recent.shift(); // Remove incomplete round
  }

  return recent;
}

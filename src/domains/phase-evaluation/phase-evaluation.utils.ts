import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { ChatMessage } from "../conversation/conversation.types";
import { SessionPhaseEvaluation } from "./phase-evaluation.types";

export function buildSessionPhaseEvaluationInput(
  conversation: ChatMessage[],
  prevPhase: SessionPhaseEvaluation | null,
  windowSize = 8
): ChatCompletionMessageParam {
  // Select the most recent meaningful context (≈ 3–4 user turns)
  const recentWindow = conversation.slice(-windowSize);

  // Compact the dialogue for model readability
  const conversationSnippet = recentWindow.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

  // Build structured comparison context
  const previousContext = prevPhase
    ? `Previous phase: ${prevPhase.phase}\nPrevious closure_state: ${prevPhase.closure_state}`
    : "";

  return {
    role: "user",
    content: `
${previousContext}

──────────────────────────────
Recent conversation (latest ≈8 messages):

${conversationSnippet}

Analyze this window and output updated phase, closure_state, signals, rationale, and tone_recommendation.
`.trim(),
  };
}

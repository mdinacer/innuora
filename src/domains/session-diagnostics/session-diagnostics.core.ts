import {
  SessionDiagnosticsSchema,
  type SessionDiagnostics,
  type SessionDiagnosticsWithMetadata,
} from "./session-diagnostics.types";

/**
 * Validates and parses session diagnostics response from AI
 */
export function parseSessionDiagnostics(aiResponse: string): SessionDiagnostics {
  try {
    // Clean response - remove markdown code blocks if present
    const cleanedResponse = aiResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    // Validate against schema
    const result = SessionDiagnosticsSchema.parse(parsed);

    return result;
  } catch (error) {
    throw new Error(`Failed to parse session diagnostics: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Determines if session diagnostics should be regenerated
 */
export function shouldRegenerateSessionDiagnostics(
  sessionDiagnostics: SessionDiagnosticsWithMetadata | null,
  currentMessageCount: number,
  userRequestedRefresh: boolean,
  minimumMessagesRequired: number = 15
): { shouldRegenerate: boolean; reason: string } {
  // Manual refresh always regenerates
  if (userRequestedRefresh) {
    return { shouldRegenerate: true, reason: "user_requested" };
  }

  // First time generation - need minimum messages
  if (!sessionDiagnostics) {
    if (currentMessageCount < minimumMessagesRequired) {
      return {
        shouldRegenerate: false,
        reason: `insufficient_messages_${currentMessageCount}_of_${minimumMessagesRequired}`,
      };
    }
    return { shouldRegenerate: true, reason: "first_generation" };
  }

  // Check if enough new messages since last diagnostic
  const lastDiagnosticMessageCount = sessionDiagnostics.metadata.sessionMessageCount;
  const newMessagesSinceLastDiagnostic = currentMessageCount - lastDiagnosticMessageCount;

  if (newMessagesSinceLastDiagnostic >= 10) {
    return {
      shouldRegenerate: true,
      reason: `stale_diagnostic_${newMessagesSinceLastDiagnostic}_new_messages`,
    };
  }

  return { shouldRegenerate: false, reason: "up_to_date" };
}

/**
 * Estimates token cost for session diagnostics generation
 */
export function estimateSessionDiagnosticsCost(
  sessionSummaryLength: number,
  sessionMemoryLength: number,
  sessionAnalysisLength: number,
  promptLength: number = 1000, // Approximate prompt size
  expectedResponseLength: number = 1200 // Based on your testing
): { inputTokens: number; outputTokens: number; estimatedCostUSD: number } {
  // Rough token estimation (4 chars = 1 token)
  const inputTokens = Math.ceil(
    (sessionSummaryLength + sessionMemoryLength + sessionAnalysisLength + promptLength) / 4
  );

  const outputTokens = expectedResponseLength;

  // GPT 4.1 Mini pricing from your config
  const inputCostPer1K = 0.0004;
  const outputCostPer1K = 0.0016;

  const estimatedCostUSD = (inputTokens / 1000) * inputCostPer1K + (outputTokens / 1000) * outputCostPer1K;

  return {
    inputTokens,
    outputTokens,
    estimatedCostUSD,
  };
}

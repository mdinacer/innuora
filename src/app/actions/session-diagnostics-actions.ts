"use server";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { deductCredits } from "@/app/actions/credit-actions";
import { Session } from "@/domains/open-chat/open-chat.types";
import { combineToSessionAnalysis } from "@/domains/session-analysis/session-analysis.utils";
import { parseSessionDiagnostics } from "@/domains/session-diagnostics/session-diagnostics.core";
import {
  SESSION_DIAGNOSTICS_PROMPT,
  SESSION_SUMMARY_PROMPT,
} from "@/domains/session-diagnostics/session-diagnostics.prompts";
import {
  SessionDiagnosticsMetadata,
  SessionDiagnosticsWithMetadata,
} from "@/domains/session-diagnostics/session-diagnostics.types";
import { logger } from "@/lib/logging/unified-logger";

/**
 * Server action to generate session diagnostics from a session object
 * Now includes credit tracking for AI operations
 */
export async function generateSessionDiagnosticsAction(
  session: Session,
  userId?: string,
  authId?: string
): Promise<SessionDiagnosticsWithMetadata> {
  // 1. Get or generate session analysis
  let sessionAnalysisText: string;
  if (session.aggregatedAnalysis) {
    // Use existing aggregated analysis
    sessionAnalysisText = JSON.stringify(session.aggregatedAnalysis);
  } else {
    // Generate from analysisSnapshots
    if (session.analysisSnapshots.length === 0) {
      throw new Error("No analysis data available - session needs at least one therapeutic analysis");
    }
    const aggregatedAnalysis = combineToSessionAnalysis(session.analysisSnapshots);
    sessionAnalysisText = JSON.stringify(aggregatedAnalysis);
  }

  // 2. Generate session summary from messages
  const chatMessages = session.messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");

  const summaryPrompt = SESSION_SUMMARY_PROMPT.replace("{{chat_messages}}", chatMessages);
  const summaryPrompts = [{ role: "user" as const, content: summaryPrompt }];

  const summaryResponse = await processAiPromptsWithRetry(summaryPrompts, {});

  if (summaryResponse.error) {
    throw new Error(`Failed to generate summary: ${summaryResponse.error.message}`);
  }

  const sessionSummary = summaryResponse.data.message.trim();

  // 3. Get session memory
  const sessionMemory = session.memoryStore || "No memory available for this session.";

  // 4. Generate diagnostics
  const diagnosticsPrompt = SESSION_DIAGNOSTICS_PROMPT.replace("{{session_summary}}", sessionSummary)
    .replace("{{session_memory}}", sessionMemory)
    .replace("{{session_analysis}}", sessionAnalysisText);

  const diagnosticsPrompts = [{ role: "user" as const, content: diagnosticsPrompt }];
  const diagnosticsResponse = await processAiPromptsWithRetry(diagnosticsPrompts, {});

  if (diagnosticsResponse.error) {
    throw new Error(`Failed to generate diagnostics: ${diagnosticsResponse.error.message}`);
  }

  const diagnostics = parseSessionDiagnostics(diagnosticsResponse.data.message);

  const totalTokensUsed =
    (summaryResponse.data.modelTokenUsage?.usage?.total_tokens || 0) +
    (diagnosticsResponse.data.modelTokenUsage?.usage?.total_tokens || 0);
  const totalCreditsUsed =
    (summaryResponse.data.consumedCredits || 0) + (diagnosticsResponse.data.consumedCredits || 0);

  // Deduct credits for diagnostics generation
  if (authId && totalCreditsUsed > 0) {
    const deductResult = await deductCredits(authId, totalCreditsUsed, "ai_diagnostics", session.id, {
      operation: "session_diagnostics_generation",
      tokensUsed: totalTokensUsed,
      messageCount: session.messages.length,
      summaryTokens: summaryResponse.data.modelTokenUsage?.usage?.total_tokens || 0,
      diagnosticsTokens: diagnosticsResponse.data.modelTokenUsage?.usage?.total_tokens || 0,
    });

    if (deductResult.error) {
      logger.logWarning("Credit deduction failed for diagnostics generation", {
        operation: "session_diagnostics_credit_deduction_failed",
        sessionId: session.id,
        metadata: {
          authId,
          creditsUsed: totalCreditsUsed,
          error: deductResult.error.message,
        },
      });
    }
  }

  const metadata: SessionDiagnosticsMetadata = {
    generatedAt: new Date(),
    tokensUsed: totalTokensUsed,
    modelUsed: "M1",
    sessionMessageCount: session.messages.length,
    version: "1.0",
  };

  return {
    diagnostics,
    metadata,
  };
}

"use server";

import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import { MODELS_CODES_MAP, type ModelCode } from "@/domains/ai-conversation/ai-models";
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

/**
 * Server action to generate session diagnostics from a session object
 */
export async function generateSessionDiagnosticsAction(
  session: Session,
  modelCode: ModelCode = "M1",
  userId?: string
): Promise<SessionDiagnosticsWithMetadata> {
  const model = MODELS_CODES_MAP[modelCode];

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

  const summaryResponse = await SendPromptsToAi(summaryPrompts, model, {}, userId);

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
  const diagnosticsResponse = await SendPromptsToAi(diagnosticsPrompts, model, {}, userId);

  if (diagnosticsResponse.error) {
    throw new Error(`Failed to generate diagnostics: ${diagnosticsResponse.error.message}`);
  }

  const diagnostics = parseSessionDiagnostics(diagnosticsResponse.data.message);

  const metadata: SessionDiagnosticsMetadata = {
    generatedAt: new Date(),
    tokensUsed:
      (summaryResponse.data.modelTokenUsage?.usage?.total_tokens || 0) +
      (diagnosticsResponse.data.modelTokenUsage?.usage?.total_tokens || 0),
    modelUsed: modelCode,
    sessionMessageCount: session.messages.length,
    version: "1.0",
  };

  return {
    diagnostics,
    metadata,
  };
}

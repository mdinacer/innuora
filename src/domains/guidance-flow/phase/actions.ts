"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import { SESSION_PHASE_EVALUATION_PROMPT } from "@/domains/guidance-flow/phase/prompt";
import { SessionPhaseEvaluation, SessionPhaseEvaluationSchema } from "@/domains/guidance-flow/phase/types";
import { buildSessionPhaseEvaluationInput } from "@/domains/guidance-flow/phase/utils";
import { getSessionContext } from "@/lib/session/session-context-service";
import { parseJsonObjectWithValidation } from "@/lib/utils/parse-json";
import { OpenChatMessage } from "@/types/open-chat-message.types";

export async function evaluateSessionPhase(sessionId: string, userMessages: OpenChatMessage[], messagesWindowSize = 8) {
  const authenticatedUser = await getAuthenticatedUserContext();
  const sessionContext = await getSessionContext(sessionId!, authenticatedUser.id);

  const { sessionWellness } = sessionContext;

  const inputContext = buildSessionPhaseEvaluationInput(userMessages, sessionWellness, messagesWindowSize);

  const prompts: ChatCompletionMessageParam[] = [
    { role: "system", content: SESSION_PHASE_EVALUATION_PROMPT.instructions },
    inputContext,
  ];

  const aiResults = await processAiPromptsWithRetry(prompts, SESSION_PHASE_EVALUATION_PROMPT.options);
  if (aiResults.error) throw new Error(aiResults.error.message || "Wellness check failed");
  if (!aiResults.data) throw new Error("No wellness data returned");

  const parsedData = parseJsonObjectWithValidation<SessionPhaseEvaluation>(aiResults.data.message, {
    schema: SessionPhaseEvaluationSchema,
  });

  return {
    data: parsedData,
    tokenUsage: aiResults.data.modelTokenUsage,
    elapsedMs: aiResults.data.elapsedMs,
  };
}

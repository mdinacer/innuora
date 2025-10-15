"use server";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { TherapeuticAnalysisEngine } from "@/domains/therapeutic-analysis/therapeutic-analysis.engine";
import THERAPEUTIC_ANALYSIS_PROMPT from "@/domains/therapeutic-analysis/therapeutic-analysis.prompt";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import type { ActionResult } from "@/types/action-result";
import { AnalysisResult } from "@/types/analysis-result";

export async function analyzeUserInput(
  userInput: string,
  prevData: TherapeuticAnalysis[] = [],
  userId?: string,
  sessionId?: string,
  sessionMetadata?: { messageCount: number; activeDurationMs: number },
  recentMessages?: { role: "user" | "assistant"; content: string }[]
): Promise<ActionResult<AnalysisResult>> {
  return await logger.wrapOperation<AnalysisResult>(
    async () => {
      if (!userInput?.trim()) {
        logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("User input cannot be empty"), {
          operation: "therapeutic_analysis_analyze_user_input",
          userId,
          sessionId,
        });
      }

      const therapeuticAnalysisEngine = new TherapeuticAnalysisEngine();
      const analysisContextPrompt = therapeuticAnalysisEngine.getAnalysisContextPrompt(
        userInput,
        prevData,
        sessionMetadata,
        recentMessages
      );

      const prompts = [THERAPEUTIC_ANALYSIS_PROMPT, analysisContextPrompt];

      console.log(prompts);

      const result = await processAiPromptsWithRetry(prompts, {
        max_tokens: 2000,
      });

      // Unwrap ActionResult
      if (result.error) {
        logger.logErrorAndThrow(ERROR_CODES.CHAT_ANALYSIS_FAILED, new Error(result.error.message), {
          operation: "therapeutic_analysis_analyze_user_input",
          userId,
          sessionId,
        });
      }

      const response = result.data;
      if (!response) {
        throw new Error("AI response is null");
      }

      const { message, modelTokenUsage, consumedCredits } = response;

      const analysis = therapeuticAnalysisEngine.safeParseTherapeuticAnalysis(message);
      if (!analysis) {
        logger.logErrorAndThrow(
          ERROR_CODES.CHAT_ANALYSIS_FAILED,
          new Error("Failed to parse state analysis from AI response"),
          {
            operation: "therapeutic_analysis_analyze_user_input",
            userId,
            sessionId,
          }
        );
      }

      if (response.modelTokenUsage) {
        console.log("Therapeutical Analysis Token Usage", response.modelTokenUsage);

        logAiOperation({
          userId: userId || "",
          sessionId: sessionId || "",
          operation: "ANALYSIS",
          tokenUsage: response.modelTokenUsage,
          creditsCharged: response.consumedCredits || 0,
        }).catch((error) => {
          logger.logErrorAndThrow(ERROR_CODES.CHAT_ANALYSIS_FAILED, error, {
            operation: "therapeutic_analysis_analyze_user_input",
            userId,
            sessionId,
          });
        });
      }

      return { analysis: analysis!, modelTokenUsage, consumedCredits };
    },
    ERROR_CODES.CHAT_ANALYSIS_FAILED,
    {
      operation: "therapeutic_analysis_analyze_user_input",
      userId,
      sessionId,
      metadata: {
        prevDataLength: prevData.length,
        inputLength: userInput?.length || 0,
      },
    },
    "Therapeutic analysis completed successfully"
  );
}

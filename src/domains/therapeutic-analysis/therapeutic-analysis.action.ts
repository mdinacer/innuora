"use server";

import { SendPromptsToAiWithRetry } from "@/app/actions/ai-client-actions";
import { TherapeuticAnalysisEngine } from "@/domains/therapeutic-analysis/therapeutic-analysis.engine";
import THERAPEUTIC_ANALYSIS_PROMPT from "@/domains/therapeutic-analysis/therapeutic-analysis.prompt";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { AiModel } from "@/types/ai-model.types";
import { AnalysisResult } from "@/types/analysis-result";

export async function analyzeUserInput(
  userInput: string,
  prevData: TherapeuticAnalysis[] = [],
  model: AiModel
): Promise<AnalysisResult> {
  return await logger.wrapOperation<AnalysisResult>(
    async () => {
      if (!userInput?.trim()) {
        logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("User input cannot be empty"), {
          operation: "therapeutic_analysis_analyze_user_input",
        });
      }

      const therapeuticAnalysisEngine = new TherapeuticAnalysisEngine();
      const analysisContextPrompt = therapeuticAnalysisEngine.getAnalysisContextPrompt(userInput, prevData);

      const prompts = [THERAPEUTIC_ANALYSIS_PROMPT, analysisContextPrompt];

      const response = await SendPromptsToAiWithRetry(prompts, model);
      const { message, modelTokenUsage } = response;

      const analysis = therapeuticAnalysisEngine.safeParseTherapeuticAnalysis(message);
      if (!analysis) {
        logger.logErrorAndThrow(
          ERROR_CODES.CHAT_ANALYSIS_FAILED,
          new Error("Failed to parse state analysis from AI response"),
          {
            operation: "therapeutic_analysis_analyze_user_input",
            metadata: { model: model.apiPath },
          }
        );
      }

      return { analysis, modelTokenUsage };
    },
    ERROR_CODES.CHAT_ANALYSIS_FAILED,
    {
      operation: "therapeutic_analysis_analyze_user_input",
      metadata: { 
        model: model.apiPath, 
        prevDataLength: prevData.length,
        inputLength: userInput?.length || 0
      },
    },
    "Therapeutic analysis completed successfully"
  );
}

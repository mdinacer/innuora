"use server";

import { SendPromptsToAiWithRetry } from "@/app/actions/ai-client-actions";
import { TherapeuticAnalysisEngine } from "@/domains/therapeutic-analysis/therapeutic-analysis.engine";
import THERAPEUTIC_ANALYSIS_PROMPT from "@/domains/therapeutic-analysis/therapeutic-analysis.prompt";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { errorManager } from "@/lib/errors/error-manager";
import { AiModel } from "@/types/ai-model.types";
import { AnalysisResult } from "@/types/analysis-result";

export async function analyzeUserInput(
  userInput: string,
  prevData: TherapeuticAnalysis[] = [],
  model: AiModel
): Promise<AnalysisResult> {
  return await errorManager.wrapOperation<AnalysisResult>(
    async () => {
      if (!userInput?.trim()) {
        errorManager.handleError(ERROR_CODES.CHAT_INVALID_INPUT, new Error("User input cannot be empty"), {
          operation: "analyzeUserInput",
        });
      }

      const therapeuticAnalysisEngine = new TherapeuticAnalysisEngine();
      const analysisContextPrompt = therapeuticAnalysisEngine.getAnalysisContextPrompt(userInput, prevData);

      const prompts = [THERAPEUTIC_ANALYSIS_PROMPT, analysisContextPrompt];

      const response = await SendPromptsToAiWithRetry(prompts, model);
      const { message, modelTokenUsage } = response;

      const analysis = therapeuticAnalysisEngine.safeParseTherapeuticAnalysis(message);
      if (!analysis) {
        errorManager.handleError(
          ERROR_CODES.CHAT_ANALYSIS_FAILED,
          new Error("Failed to parse state analysis from AI response"),
          {
            operation: "analyzeUserInput",
            metadata: { model: model.apiPath },
          }
        );
        throw new Error("Unreachable");
      }

      return { analysis, modelTokenUsage };
    },
    ERROR_CODES.CHAT_ANALYSIS_FAILED,
    {
      operation: "analyzeUserInput",
      metadata: { model: model.apiPath, prevDataLength: prevData.length },
    }
  );
}

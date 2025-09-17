"use server";

import { SendPromptsToAiWithRetry } from "@/app/actions/ai-client-actions";
import { StateAnalysisEngine } from "@/lib/ai/mirael-core/v2/state-analysis";
import STATE_ANALYSIS_PROMPT from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.prompt";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { AnalysisResult } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { errorManager } from "@/lib/errors/error-manager";
import { AiModel } from "@/types/ai-model.types";

export async function analyzeUserInput(
  userInput: string,
  prevData: StateAnalysis[] = [],
  model: AiModel
): Promise<AnalysisResult> {
  return await errorManager.wrapOperation<AnalysisResult>(
    async () => {
      if (!userInput?.trim()) {
        errorManager.handleError(ERROR_CODES.CHAT_INVALID_INPUT, new Error("User input cannot be empty"), {
          operation: "analyzeUserInput",
        });
      }

      const stateAnalysisEngine = new StateAnalysisEngine();
      const analysisContextPrompt = stateAnalysisEngine.getAnalysisContextPrompt(userInput, prevData);

      const prompts = [STATE_ANALYSIS_PROMPT, analysisContextPrompt];

      const response = await SendPromptsToAiWithRetry(prompts, model);
      const { message, modelTokenUsage } = response;

      const analysis = stateAnalysisEngine.safeParseStateAnalysis(message);
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

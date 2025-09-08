"use server";

import { SendPromptsToAiWithRetry } from "@/app/actions/ai-client-actions";
import { AnalysisError, InvalidInputError, UserInputServiceError } from "@/errors/user-input.errors";
import { StateAnalysisEngine } from "@/lib/ai/mirael-core/v1/state-analysis";
import STATE_ANALYSIS_PROMPT from "@/lib/ai/mirael-core/v1/state-analysis/prompt.state-analysis";
import { StateAnalysis } from "@/lib/ai/mirael-core/v1/state-analysis/state-analysis.schema";
import { AnalysisResult } from "@/lib/ai/mirael-core/v1/state-analysis/state-analysis.types";
import { AiModel } from "@/types/ai-model.types";

export async function analyzeUserInput(
  userInput: string,
  prevData: StateAnalysis[] = [],
  model: AiModel
): Promise<AnalysisResult> {
  try {
    if (!userInput?.trim()) {
      throw new InvalidInputError("User input cannot be empty");
    }

    const stateAnalysisEngine = new StateAnalysisEngine();
    const analysisContextPrompt = stateAnalysisEngine.getAnalysisContextPrompt(userInput, prevData);

    const prompts = [STATE_ANALYSIS_PROMPT, analysisContextPrompt];

    console.log("Prompts:", prompts);

    const response = await SendPromptsToAiWithRetry(prompts, model);
    const { message, modelTokenUsage } = response;

    const analysis = stateAnalysisEngine.safeParseStateAnalysis(message);
    if (!analysis) {
      throw new AnalysisError("Failed to parse state analysis from AI response");
    }

    return { analysis, modelTokenUsage };
  } catch (error) {
    if (error instanceof UserInputServiceError) throw error;

    throw new AnalysisError(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

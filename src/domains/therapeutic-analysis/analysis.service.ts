/**
 * Analysis Service
 * Generates cognitive-emotional analysis using GPT-4.1-mini
 */

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { INNUORA_ANALYSIS_PROMPT } from "./analysis.prompt";
import { InnuoraAnalysis, SAFE_FALLBACK_ANALYSIS } from "./therapeutic-analysis.types";

export interface AnalysisServiceOutput {
  analysis: InnuoraAnalysis;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cachedTokens?: number;
  } | null;
  elapsedMs: number;
}

/**
 * Generates cognitive-emotional analysis
 *
 * @param input - Analysis generation parameters
 * @returns Cognitive-emotional analysis with token usage
 */
export async function generateAnalysis(userInput: string): Promise<AnalysisServiceOutput> {
  const start = performance.now();

  //const { userInput, messagesWindow } = input;

  // ─────────────────────────────
  // Build Analysis Prompts
  // ─────────────────────────────
  const prompts: ChatCompletionMessageParam[] = [
    INNUORA_ANALYSIS_PROMPT.messageParam,

    // Current user input
    { role: "user", content: userInput },
  ] as ChatCompletionMessageParam[];

  // ─────────────────────────────
  // Execute Model (GPT-4.1-mini)
  // ─────────────────────────────
  const aiResult = await processAiPromptsWithRetry(prompts, INNUORA_ANALYSIS_PROMPT.options);

  // Fallback on error (non-blocking)
  if (aiResult.error) {
    console.error(`[Analysis] Failed: ${aiResult.error.message}. Using fallback analysis.`);
    return {
      analysis: SAFE_FALLBACK_ANALYSIS,
      tokenUsage: null,
      elapsedMs: performance.now() - start,
    };
  }

  if (!aiResult.data) {
    console.error("[Analysis] No data returned. Using fallback analysis.");
    return {
      analysis: SAFE_FALLBACK_ANALYSIS,
      tokenUsage: null,
      elapsedMs: performance.now() - start,
    };
  }

  // Parse JSON response
  const analysis = parseJsonObject(aiResult.data.message) as InnuoraAnalysis;

  const elapsedMs = performance.now() - start;

  return {
    analysis,
    tokenUsage: aiResult.data.modelTokenUsage,
    elapsedMs,
  };
}

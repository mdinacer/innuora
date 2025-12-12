"use server";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { ModelTokenUsage, RelationalTrace } from "@/domains/shared-types";
import { parseJsonObjectWithValidation } from "@/lib/utils/parse-json";
import { REFLECTION_DIRECTIVE_PROMPT } from "./reflection-directive.prompts";
import {
  FALLBACK_REFLECTION_DIRECTIVE,
  ReflectionDirective,
  ReflectionDirectiveSchema,
} from "./reflection-directive.types";
import { buildReflectionDirectivePrompt } from "./reflection-directive.utils";

export interface AnalysisServiceOutput {
  data: ReflectionDirective;
  tokenUsage: ModelTokenUsage | null;
  elapsedMs: number;
}

export async function generateReflectionDirective(
  input: string,
  relationalTrace: RelationalTrace
): Promise<AnalysisServiceOutput> {
  const prompts = buildReflectionDirectivePrompt(input, relationalTrace);

  const aiResult = await processAiPromptsWithRetry(prompts, REFLECTION_DIRECTIVE_PROMPT.options);

  // Fallback on error (non-blocking)
  if (aiResult.error) {
    console.error(`[Analysis] Failed: ${aiResult.error.message}. Using fallback analysis.`);
    return {
      data: FALLBACK_REFLECTION_DIRECTIVE,
      tokenUsage: null,
      elapsedMs: 0,
    };
  }

  if (!aiResult.data) {
    console.error("[Analysis] No data returned. Using fallback analysis.");
    return {
      data: FALLBACK_REFLECTION_DIRECTIVE,
      tokenUsage: null,
      elapsedMs: 0,
    };
  }
  const parsedData = parseJsonObjectWithValidation<ReflectionDirective>(aiResult.data.message, {
    schema: ReflectionDirectiveSchema,
  });

  return {
    data: parsedData,
    tokenUsage: aiResult.data.modelTokenUsage,
    elapsedMs: aiResult.data.elapsedMs,
  };
}

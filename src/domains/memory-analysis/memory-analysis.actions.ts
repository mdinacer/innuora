"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { ModelTokenUsage } from "@/domains/shared-types";
import { parseJsonObjectWithValidation } from "@/lib/utils/parse-json";
import { MEMORY_ANALYSIS_PROMPT } from "./memory-analysis.prompts";
import { FactualMemory, MemoryAnalysis, MemoryAnalysisSchema } from "./memory-analysis.types";
import { buildMemoryIndex } from "./memory-analysis.utils";

export type MemoryAnalysisResult = {
  data: MemoryAnalysis | null;
  tokenUsage: ModelTokenUsage | null;
  elapsedMs: number;
};

export async function extractMemoryCues(input: string, factualMemory: FactualMemory[]): Promise<MemoryAnalysisResult> {
  const anchors = factualMemory.length > 0 ? buildMemoryIndex(factualMemory) : undefined;

  // Build anchor context block once, only if anchors exist
  const anchorContext = anchors
    ? [
        "---",
        "",
        "### Context for Recall",
        "",
        "Known anchors from previous messages (for recall only):",
        JSON.stringify(anchors, null, 2),
        "",
        "Use these anchors only to:",
        "- identify when a message is recalling a known person, place, or theme,",
        "- align normalization (use existing tokens instead of inventing new ones).",
        "",
        "Do NOT restate or re-extract these anchors unless new, unrelated information appears.",
        "",
        "---",
        "END OF ANCHORS CONTEXT",
      ].join("\n")
    : "";

  const systemContent = MEMORY_ANALYSIS_PROMPT.instructions.replace("{{ANCHORS}}", anchorContext);

  const prompts: ChatCompletionMessageParam[] = [
    { role: "system", content: systemContent },
    { role: "user", content: input.trim() },
  ];

  const aiResults = await processAiPromptsWithRetry(prompts, MEMORY_ANALYSIS_PROMPT.options);

  if (aiResults.error) {
    throw new Error(`Memory analysis failed: ${aiResults.error.message}`);
  }

  if (!aiResults.data) {
    throw new Error("No memory analysis output from AI");
  }

  const parsedData = parseJsonObjectWithValidation<MemoryAnalysis>(aiResults.data.message, {
    schema: MemoryAnalysisSchema,
  });

  return {
    data: parsedData,
    tokenUsage: aiResults.data.modelTokenUsage,
    elapsedMs: aiResults.data.elapsedMs,
  };
}

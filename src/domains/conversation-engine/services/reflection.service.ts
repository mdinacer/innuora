/**
 * Reflection Service
 * Generates therapeutic reflection responses using GPT-4o
 */

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { InnuoraAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { INNUORA_REFLECTION_INSTRUCTIONS, INNUORA_REFLECTION_PROMPT_OPTIONS } from "../constants/reflection.prompt";
import {
  applyMetaGuidanceGating,
  buildReflectionDirective,
  updateTraceFromOutput,
} from "../constants/reflection.utils";
import { ReflectiveResponse, RelationalTrace, SAFE_FALLBACK_TRACE } from "../types/reflection.types";

export interface ReflectionServiceInput {
  userInput: string;
  messagesWindow: OpenChatMessage[]; // Last 6-8 messages for context
  contextDirective: string | null; // From context synthesis
  prevAnalysis?: InnuoraAnalysis; // Last analysis for emotional gating
  relationalTrace?: RelationalTrace; // Current relational state
}

export interface ReflectionServiceOutput {
  response: ReflectiveResponse;
  nextTrace: RelationalTrace;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cachedTokens?: number;
  } | null;
  elapsedMs: number;
}

/**
 * Generates therapeutic reflection using reflection engine
 *
 * @param input - Reflection generation parameters
 * @returns Reflection response with updated relational trace
 */
export async function generateReflection(input: ReflectionServiceInput): Promise<ReflectionServiceOutput> {
  const start = performance.now();

  const { userInput, messagesWindow, contextDirective, prevAnalysis, relationalTrace } = input;

  // Use fallback trace if none provided
  const trace = relationalTrace || SAFE_FALLBACK_TRACE;

  // ─────────────────────────────
  // Build Prompts with Dynamic Gating
  // ─────────────────────────────
  const prompts: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: INNUORA_REFLECTION_INSTRUCTIONS,
    },

    // Add reflection directive if we have previous analysis
    ...(prevAnalysis
      ? [
          {
            role: "system" as const,
            content: buildReflectionDirective(prevAnalysis, trace),
          },
        ]
      : []),

    // Add relational trace notes for continuity
    ...(trace.notes
      ? [
          {
            role: "system" as const,
            content: `Relational context: ${trace.notes}. Maintain pacing and containment.`,
          },
        ]
      : []),

    // Add session directive from context synthesis
    ...(contextDirective
      ? [
          {
            role: "system" as const,
            content: `Session focus directive: ${contextDirective}. Stay aligned with this focus.`,
          },
        ]
      : []),

    // Add conversation window
    ...messagesWindow.map((m) => ({ role: m.role, content: m.content })),

    // Current user input
    { role: "user", content: userInput },
  ] as ChatCompletionMessageParam[];

  // ─────────────────────────────
  // Execute Model (GPT-4o)
  // ─────────────────────────────
  const aiResult = await processAiPromptsWithRetry(prompts, INNUORA_REFLECTION_PROMPT_OPTIONS);

  if (aiResult.error) {
    throw new Error(`Reflection generation failed: ${aiResult.error.message}`);
  }

  if (!aiResult.data) {
    throw new Error("No reflection output from AI");
  }

  // Parse JSON response
  const reflectiveResponse = parseJsonObject(aiResult.data.message) as ReflectiveResponse;

  // ─────────────────────────────
  // Apply Meta-Gating + Update Trace
  // ─────────────────────────────
  const gated = applyMetaGuidanceGating(reflectiveResponse, prevAnalysis, trace);
  const nextTrace = updateTraceFromOutput(trace, gated);

  const regulated: ReflectiveResponse = {
    ...gated,
    next_relational_trace: nextTrace,
  };

  const elapsedMs = performance.now() - start;

  return {
    response: regulated,
    nextTrace,
    tokenUsage: aiResult.data.modelTokenUsage,
    elapsedMs,
  };
}

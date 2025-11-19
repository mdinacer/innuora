"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { parseJsonObjectWithValidation } from "@/lib/utils/parse-json";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { FALLBACK_REFLECTION_DIRECTIVE, ReflectionDirective } from "../directive/types";
import { formatDirectiveForReflection } from "../directive/utils";
import { FactualMemory } from "../memory/types";
import { SessionPhaseEvaluation } from "../phase/types";
import { INNUORA_REFLECTION_PROMPT } from "./prompt";
import { ReflectiveResponse, ReflectiveResponseSchema, RelationalTrace, SAFE_FALLBACK_TRACE } from "./types";

export async function composeContextualReflection(
  input: string,
  messages: OpenChatMessage[] = [],
  relationalTrace: RelationalTrace | null,
  directive: ReflectionDirective | null,
  wellnessCheck: SessionPhaseEvaluation | null,
  matches: FactualMemory[] = [],
  messageWindowSize = 8
) {
  const conversationWindow = messages
    .filter(
      (msg): msg is OpenChatMessage & { role: "user" | "assistant" } => msg.role === "user" || msg.role === "assistant"
    )
    .slice(-messageWindowSize);

  const contextDirective = formatDirectiveForReflection(
    directive || FALLBACK_REFLECTION_DIRECTIVE,
    relationalTrace || SAFE_FALLBACK_TRACE,
    matches,
    wellnessCheck
  );

  const prompts = [
    INNUORA_REFLECTION_PROMPT.messageParam,
    ...(contextDirective
      ? [
          {
            role: "system",
            content: contextDirective,
          },
        ]
      : []),
    ...conversationWindow.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: input },
  ] as ChatCompletionMessageParam[];

  const aiResult = await processAiPromptsWithRetry(prompts, INNUORA_REFLECTION_PROMPT.options);

  if (aiResult.error) {
    throw new Error(`Reflection generation failed: ${aiResult.error.message}`);
  }

  if (!aiResult.data) {
    throw new Error("No reflection output from AI");
  }

  const parsedData = parseJsonObjectWithValidation<ReflectiveResponse>(aiResult.data.message, {
    schema: ReflectiveResponseSchema,
  });

  return {
    data: parsedData,
    tokenUsage: aiResult.data.modelTokenUsage,
    elapsedMs: aiResult.data.elapsedMs,
  };
}

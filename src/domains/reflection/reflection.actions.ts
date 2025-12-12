"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { parseJsonObjectWithValidation } from "@/lib/utils/parse-json";
import { ChatMessage } from "../conversation/conversation.types";
import { FactualMemory } from "../memory-analysis/memory-analysis.types";
import { SessionPhaseEvaluation } from "../phase-evaluation/phase-evaluation.types";
import { FALLBACK_REFLECTION_DIRECTIVE, ReflectionDirective } from "../reflection-directive/reflection-directive.types";
import { formatDirectiveForReflection } from "../reflection-directive/reflection-directive.utils";
import {
  ReflectiveResponse,
  ReflectiveResponseSchema,
  RelationalTrace,
  SAFE_FALLBACK_TRACE,
} from "../reflection/reflection.types";
import { INNUORA_REFLECTION_PROMPT } from "./reflection.prompts";

export async function composeContextualReflection(
  input: string,
  messages: ChatMessage[] = [],
  relationalTrace: RelationalTrace | null,
  directive: ReflectionDirective | null,
  wellnessCheck: SessionPhaseEvaluation | null,
  matches: FactualMemory[] = [],
  messageWindowSize = 8
) {
  const conversationWindow = messages
    .filter(
      (msg): msg is ChatMessage & { role: "user" | "assistant" } => msg.role === "user" || msg.role === "assistant"
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
    // ...conversationWindow.map((m) => ({ role: m.role, content: m.content })),
    {
      role: "system",
      content: `CONTEXT FOR CONTINUITY (do not rewrite, do not respond to):
${JSON.stringify(
  conversationWindow.map((msg) => ({ role: msg.role === "assistant" ? "INNUORA" : "USER", content: msg.content })),
  null,
  2
)}
`,
    },
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

  const reflectiveResponse: ReflectiveResponse = {
    ...parsedData,
    next_relational_trace: {
      ...parsedData.next_relational_trace,
      psychoeducation_last_turn: !!parsedData.psychoeducation,
      curiosity_last_turn: !!parsedData.follow_up_question,
    },
  };

  return {
    data: reflectiveResponse,
    tokenUsage: aiResult.data.modelTokenUsage,
    elapsedMs: aiResult.data.elapsedMs,
  };
}

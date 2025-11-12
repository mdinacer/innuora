import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { ReflectionDirective } from "../directive/types";
import { formatDirectiveForReflection } from "../directive/utils";
import { FactualMemory } from "../memory/types";
import { SessionWellness } from "../wellness/types";
import { INNUORA_REFLECTION_INSTRUCTIONS, INNUORA_REFLECTION_PROMPT_OPTIONS } from "./prompt";
import { ReflectiveResponse, RelationalTraceApp } from "./types";

export async function generateReflection(
  userInput: string,
  messages: OpenChatMessage[],
  lastDirective: ReflectionDirective | null,
  relationalTrace?: RelationalTraceApp,
  matches?: FactualMemory[],
  lastWellnessCheck?: SessionWellness
) {
  const messagesWindow = messages.slice(-8);

  const baseSystemPrompt: ChatCompletionMessageParam = {
    role: "system",
    content: INNUORA_REFLECTION_INSTRUCTIONS,
  };

  const hasContext = !!relationalTrace && !!lastDirective;
  const contextDirective = hasContext
    ? formatDirectiveForReflection(lastDirective, relationalTrace, matches, lastWellnessCheck)
    : null;

  const prompts: ChatCompletionMessageParam[] = [
    baseSystemPrompt,
    ...(contextDirective
      ? [
          {
            role: "system",
            content: contextDirective,
          },
        ]
      : []),
    ...messagesWindow.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userInput },
  ] as ChatCompletionMessageParam[];

  if (matches && matches.length > 0) {
    console.log("Recall Prompts: ", prompts);
  }

  const ai = await processAiPromptsWithRetry(prompts, INNUORA_REFLECTION_PROMPT_OPTIONS);
  if (ai.error) throw ai.error;
  if (!ai.data) throw new Error("No reflection output");

  console.log("Reflection details", {
    userInput,
    prompts,
    result: ai.data.message,
  });

  const data = parseJsonObject(ai.data.message) as ReflectiveResponse;

  if (!data.reflection) throw new Error("No reflection output");
  console.log("Reflection Data: ", {
    prompts,
    response: data,
  });

  return {
    data: data,
    nextTrace: data.next_relational_trace,
    tokenUsage: ai.data.modelTokenUsage,
    elapsedMs: ai.data.elapsedMs,
  };
}

"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import { GPT_3_5_TURBO_MODEL } from "@/domains/ai-conversation/ai-models";
import CHAT_MEMORY_BUILD_INSTRUCTIONS from "@/domains/session-memory/session-memory.prompt";
import { formatUserInputForMemory } from "@/domains/session-memory/session-memory.utils";

export async function generateSessionMemory(userInput: string) {
  if (!userInput) {
    throw new Error("User input is required");
  }

  const formattedUserMessage = formatUserInputForMemory(userInput);

  const prompt = {
    role: "system",
    content: CHAT_MEMORY_BUILD_INSTRUCTIONS.replace("{{user_message}}", formattedUserMessage),
  } as ChatCompletionMessageParam;

  const result = await SendPromptsToAi([prompt], GPT_3_5_TURBO_MODEL);

  return result;
}

"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import CHAT_MEMORY_INSTRUCTIONS from "@/lib/ai/shared/session-memory/session-memory.prompt";
import { formatUserInputForMemory } from "@/lib/ai/shared/session-memory/session-memory.utils";
import { GPT_3_5_TURBO_MODEL } from "@/lib/constants/ai-models";

export async function generateSessionMemory(userInput: string) {
  if (!userInput) {
    throw new Error("User input is required");
  }

  const formattedUserMessage = formatUserInputForMemory(userInput);

  const prompt = {
    role: "system",
    content: CHAT_MEMORY_INSTRUCTIONS.replace("{{user_message}}", formattedUserMessage),
  } as ChatCompletionMessageParam;

  const result = await SendPromptsToAi([prompt], GPT_3_5_TURBO_MODEL);

  return result;
}

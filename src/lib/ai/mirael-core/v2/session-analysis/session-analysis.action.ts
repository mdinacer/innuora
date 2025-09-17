"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import MIRAEL_CHAT_SUMMARIZATION_INSTRUCTIONS from "@/lib/ai/shared/prompts/prompt.summarization";
import { GPT_3_5_TURBO_MODEL } from "@/lib/constants/ai-models";
import { AppLocales } from "@/lib/i18n";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import SESSION_SUMMARY_INSTRUCTIONS from "./session-analysis.prompt";
import { SessionAnalysis } from "./session-analysis.types";

const LANGUAGES: Record<AppLocales, string> = {
  ar: "arabic",
  en: "english",
  fr: "french",
};

const MAX_MESSAGE_LENGTH = 800; // max characters per message

export async function getSessionSummary(
  sessionAnalysis: SessionAnalysis,
  sessionMemory: string | null,
  locale: AppLocales = "en"
) {
  const language = LANGUAGES[locale];

  const instruction = SESSION_SUMMARY_INSTRUCTIONS.replace("{{sessionMemory}}", sessionMemory ?? "")
    .replace("{{sessionsAnalysis}}", JSON.stringify(sessionAnalysis))
    .replace("{{lang}}", language);

  return await SendPromptsToAi(
    [
      {
        role: "system",
        content: instruction,
      } as ChatCompletionMessageParam,
    ],
    GPT_3_5_TURBO_MODEL
  );
}

function formatMessages(messages: OpenChatMessage[]): string {
  return messages
    .map((msg) => {
      let content = msg.content.trim();

      // Truncate if too long
      if (content.length > MAX_MESSAGE_LENGTH) {
        content = content.slice(0, MAX_MESSAGE_LENGTH) + "...";
      }

      return `- ${msg.role}: ${content}`;
    })
    .join("\n");
}
export async function getSessionMessagesSummary(
  messages: OpenChatMessage[],
  prevSummary?: string,
  locale: AppLocales = "en"
) {
  const language = LANGUAGES[locale];

  const formattedMessages = formatMessages(messages);

  const instruction = MIRAEL_CHAT_SUMMARIZATION_INSTRUCTIONS.replace("{{messages}}", formattedMessages)
    .replace("{{previous_summary}}", prevSummary ?? "")
    .replace("{{lang}}", language);

  return await SendPromptsToAi(
    [
      {
        role: "system",
        content: instruction,
      } as ChatCompletionMessageParam,
    ],
    GPT_3_5_TURBO_MODEL
  );
}

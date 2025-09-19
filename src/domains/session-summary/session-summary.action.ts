"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import { GPT_3_5_TURBO_MODEL } from "@/domains/ai-conversation/ai-models";
import { SessionAnalysis } from "@/domains/session-analysis/session-analysis.types";
import {
  MIRAEL_CHAT_SUMMARY_INSTRUCTIONS,
  SESSION_ADVANCED_SUMMARY_INSTRUCTIONS,
} from "@/domains/session-summary/session-summary.prompt";
import { formatChatMessages } from "@/domains/session-summary/session-summary.utils";
import { AppLocales } from "@/lib/i18n";
import { OpenChatMessage } from "@/types/open-chat-message.types";

const LANGUAGES: Record<AppLocales, string> = {
  ar: "arabic",
  en: "english",
  fr: "french",
};

export async function getSessionSummary(
  sessionAnalysis: SessionAnalysis,
  sessionMemory: string | null,
  locale: AppLocales = "en"
) {
  const language = LANGUAGES[locale];

  const instruction = SESSION_ADVANCED_SUMMARY_INSTRUCTIONS.replace("{{sessionMemory}}", sessionMemory ?? "")
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

export async function getSessionMessagesSummary(
  messages: OpenChatMessage[],
  prevSummary?: string,
  locale: AppLocales = "en"
) {
  const language = LANGUAGES[locale];

  const formattedMessages = formatChatMessages(messages);

  const instruction = MIRAEL_CHAT_SUMMARY_INSTRUCTIONS.replace("{{messages}}", formattedMessages)
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

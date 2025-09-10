"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import { GPT_3_5_TURBO_MODEL } from "@/lib/constants/ai-models";
import { AppLocales } from "@/lib/i18n";
import SESSION_SUMMARY_INSTRUCTIONS from "./session-analysis.prompt";
import { SessionAnalysis } from "./session-analysis.types";

const LANGUAGES: Record<AppLocales, string> = {
  ar: "arabic",
  en: "english",
  fr: "french",
};

export async function getSessionSummary(
  sessionAnalysis: SessionAnalysis,
  sessionMemory: string,
  locale: AppLocales = "en"
) {
  const language = LANGUAGES[locale];

  const instruction = SESSION_SUMMARY_INSTRUCTIONS.replace("{{sessionMemory}}", sessionMemory)
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

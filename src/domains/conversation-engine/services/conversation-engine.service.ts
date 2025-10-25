/**
 * Conversation Engine Service
 *
 * Simple helper to call holistic engine and parse JSON response.
 * Main orchestration (logging, credits, context) happens in server action.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */
import { Profile } from "@prisma/client";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { SecurityProtocolPrompt } from "@/domains/ai-conversation/prompts";
import { buildUserProfileContext } from "@/domains/ai-conversation/prompts/prompt.user-context";
import { AppLocales } from "@/lib/i18n";
import { HOLISTIC_ENGINE_PROMPTS } from "../constants/prompts";
import type { EngineInput, EngineOutput } from "../types";

/**
 * Calls holistic engine and parses JSON response.
 * Includes user profile context for personalization.
 * Thin wrapper - main logic is in server action.
 */
export async function generateHolisticResponse(input: EngineInput, locale: AppLocales, profile: Profile | null) {
  // Build system prompt with optional profile context
  // Use type assertion since we only support en/ar in HOLISTIC_ENGINE_PROMPTS
  const baseSystemPrompt = HOLISTIC_ENGINE_PROMPTS[locale as "en" | "ar"] || HOLISTIC_ENGINE_PROMPTS.en;
  const profileContext = profile ? `\n\n${buildUserProfileContext(profile, locale)}` : "";
  const systemPrompt = baseSystemPrompt + profileContext;

  // Build user prompt with engine inputs
  const userPrompt = `Engine Inputs (JSON):
${JSON.stringify(input, null, 2)}`;

  // Call AI with retry
  // IMPORTANT: SecurityProtocolPrompt MUST be included to protect against prompt injection attacks
  // Use GPT-4.1 (default) for human-like, empathetic conversation quality
  const result = await processAiPromptsWithRetry(
    [SecurityProtocolPrompt, { role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    {
      model: "default", // GPT-4.1 for best conversational quality
    }
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  const aiResponse = result.data;
  if (!aiResponse) {
    throw new Error("AI response is null");
  }

  // Parse JSON output
  const output = parseEngineOutput(aiResponse.message);

  return {
    output,
    modelTokenUsage: aiResponse.modelTokenUsage,
    consumedCredits: aiResponse.consumedCredits,
  };
}

/**
 * Parse and validate engine JSON output.
 */
function parseEngineOutput(content: string): EngineOutput {
  try {
    const parsed = JSON.parse(content);

    // Basic validation
    if (!parsed.reflection || !parsed.signals || !parsed.meta || !parsed.next_relational_trace) {
      throw new Error("Invalid engine output - missing required fields");
    }

    return parsed as EngineOutput;
  } catch (error) {
    throw new Error(`Failed to parse engine output: ${error instanceof Error ? error.message : String(error)}`);
  }
}

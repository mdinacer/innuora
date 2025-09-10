"use server";

import { Profile } from "@prisma/client";
import { ChatCompletionMessageParam } from "openai/resources";

import { SendPromptsToAiWithRetry } from "@/app/actions/ai-client-actions";
import { InvalidInputError, UserInputServiceError } from "@/errors/user-input.errors";
import { ModulesPromptBuilder } from "@/lib/ai/mirael-core/v2/modules-prompt-builder";
import { analyzeUserInput } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.action";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { ChatContextManager } from "@/lib/ai/shared/chat-context.manager";
import { LanguagePrompt, SecurityProtocolPrompt, TonePrompt } from "@/lib/ai/shared/prompts/";
import { MIRAEL_PERSONA_PROMPT_INSTRUCTIONS } from "@/lib/ai/shared/prompts/prompt.persona";
import { buildUserProfilePrompt } from "@/lib/ai/shared/prompts/prompt.user-context";
import { ModelCode, MODELS_CODES, MODELS_CODES_MAP } from "@/lib/constants/ai-models";
import { AppLocales } from "@/lib/i18n";
import { AiModel, ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { SESSION_MEMORY_REFERENCE_INSTRUCTIONS } from "../../shared/session-memory/session-memory.prompt";

interface HandleUserInputResult {
  analysis: StateAnalysis | null;
  response: string;
  tokenUsage: {
    analysisUsage: ModelTokenUsage | null;
    responseUsage: ModelTokenUsage | null;
  };
  cost: number;
}

/**
 * Builds the conversation prompts based on analysis and context
 */
async function buildConversationPrompts(
  userInput: string,
  analysis: StateAnalysis,
  messages: OpenChatMessage[],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales
): Promise<ChatCompletionMessageParam[]> {
  // Initialize services - can be done in parallel
  const [modulesPromptBuilder, messagesManager] = await Promise.all([
    Promise.resolve(new ModulesPromptBuilder()),
    Promise.resolve(new ChatContextManager()),
  ]);

  // Build prompts - some can be done in parallel
  const [modulesPrompt, chatHistoryPrompt] = await Promise.all([
    modulesPromptBuilder.buildModulesPrompt(analysis),
    Promise.resolve(messagesManager.buildChatHistoryPrompt(messages)),
  ]);

  // Get language and tone prompts (synchronous lookups)
  const languagePrompt = LanguagePrompt[locale];
  if (!languagePrompt) {
    throw new UserInputServiceError(`Unsupported locale: ${locale}`, "UNSUPPORTED_LOCALE");
  }

  const toneInstruction = TonePrompt[analysis.intensity];
  if (!toneInstruction) {
    throw new UserInputServiceError(`Unsupported intensity: ${analysis.intensity}`, "UNSUPPORTED_INTENSITY");
  }

  const profileContextPrompt = profile ? buildUserProfilePrompt(profile) : "";

  let memoryPrompt: ChatCompletionMessageParam | null = null;

  if (analysis.recall_memory && prevMemory) {
    const instructions = SESSION_MEMORY_REFERENCE_INSTRUCTIONS.replace("{{session_memory}}", prevMemory);
    memoryPrompt = {
      role: "assistant",
      content: instructions,
    } as ChatCompletionMessageParam;
  }

  const fullPersonaPrompt: ChatCompletionMessageParam = {
    role: "system",
    content: MIRAEL_PERSONA_PROMPT_INSTRUCTIONS.replace("{{TONE_DESCRIPTION}}", toneInstruction || "").replace(
      "{{LANGUAGE_RULES}}",
      (languagePrompt?.content as string | undefined) ?? ""
    ),
  };

  // Compose prompts efficiently
  return [
    SecurityProtocolPrompt,
    fullPersonaPrompt,
    ...(profileContextPrompt ? [profileContextPrompt] : []),
    modulesPrompt,
    ...(chatHistoryPrompt ? [chatHistoryPrompt] : []),
    ...(memoryPrompt ? [memoryPrompt] : []),
    { role: "user", content: userInput.trim() },
  ];
}

/**
 * Handles complete user input processing including analysis and response generation
 */
export async function handleUserInput(
  userInput: string,
  prevAnalysis: StateAnalysis[] = [],
  messages: OpenChatMessage[] = [],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales = "en",
  modelCode: ModelCode = MODELS_CODES.M1
): Promise<HandleUserInputResult> {
  try {
    // Early validation
    if (!userInput?.trim()) {
      throw new InvalidInputError("User input cannot be empty");
    }

    const aiModel = MODELS_CODES_MAP[modelCode] as AiModel;
    if (!aiModel) {
      throw new UserInputServiceError(`Unsupported model code: ${modelCode}`, "UNSUPPORTED_MODEL");
    }

    // Step 1: Analyze user input
    const analysisResult = await analyzeUserInput(userInput, prevAnalysis, aiModel);
    const { analysis, modelTokenUsage: analysisUsage } = analysisResult;

    // Step 2: Build conversation prompts
    const conversationPrompts = await buildConversationPrompts(
      userInput,
      analysis,
      messages,
      profile,
      prevMemory,
      locale
    );

    // Step 3: Generate AI response
    const miraelResponse = await SendPromptsToAiWithRetry(conversationPrompts, aiModel);

    // Step 4: Calculate total cost
    const totalCost = (analysisUsage?.costUSD || 0) + (miraelResponse.modelTokenUsage?.costUSD || 0);

    return {
      analysis,
      response: miraelResponse.message,
      tokenUsage: {
        analysisUsage,
        responseUsage: miraelResponse.modelTokenUsage,
      },
      cost: totalCost,
    };
  } catch (error) {
    console.error("Error handling user input:", error);

    // Re-throw known errors, wrap unknown ones
    if (error instanceof UserInputServiceError) {
      throw error;
    }

    throw new UserInputServiceError(
      `Unexpected error in user input handling: ${error instanceof Error ? error.message : "Unknown error"}`,
      "UNEXPECTED_ERROR"
    );
  }
}

/**
 * Validates user input before processing
 */
// function validateUserInput(input: string, maxLength: number = 800): void {
//   if (!input || typeof input !== "string") {
//     throw new InvalidInputError("Input must be a non-empty string");
//   }

//   if (input.trim().length === 0) {
//     throw new InvalidInputError("Input cannot be empty or whitespace only");
//   }

//   if (input.length > maxLength) {
//     // Adjust limit as needed
//     throw new InvalidInputError("Input exceeds maximum length limit");
//   }
// }

/**
 * Batch process multiple user inputs (useful for testing or bulk operations)
 */
// export async function handleBatchUserInputs(
//   inputs: Array<{
//     userInput: string;
//     prevAnalysis?: StateAnalysis[];
//     messages?: OpenChatMessage[];
//     profile: Profile | null;
//     prevMemory?: string;
//     locale?: AppLocales;
//     modelCode?: ModelCode;
//   }>
// ): Promise<HandleUserInputResult[]> {
//   const results = await Promise.allSettled(
//     inputs.map(async (input) => {
//       await validateUserInput(input.userInput);
//       return handleUserInput(
//         input.userInput,
//         input.prevAnalysis,
//         input.messages,
//         input.profile,
//         input.prevMemory,
//         input.locale,
//         input.modelCode
//       );
//     })
//   );

//   return results.map((result, index) => {
//     if (result.status === "fulfilled") {
//       return result.value;
//     } else {
//       console.error(`Batch processing failed for input ${index}:`, result.reason);
//       throw new UserInputServiceError(
//         `Batch processing failed for input ${index}: ${result.reason}`,
//         "BATCH_PROCESSING_ERROR"
//       );
//     }
//   });
// }

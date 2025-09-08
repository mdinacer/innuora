"use server";

import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import CHAT_HISTORY_INSTRUCTIONS from "@/lib/ai/shared/chat-summary/chat-summary.prompt";
import { SummaryConfig, SummaryResult } from "@/lib/ai/shared/chat-summary/chat-summary.types";
import {
  formatMessagesForSummary,
  smartTruncateMessages,
  validateMessages,
} from "@/lib/ai/shared/chat-summary/chat-summary.utils";
import { GPT_3_5_TURBO_MODEL } from "@/lib/constants/ai-models";
import { OpenChatMessage } from "@/types/open-chat-message.types";

const SUMMARY_CONFIGS: Record<string, SummaryConfig> = {
  compact: {
    wordRange: "80-120",
    includeMetadata: false,
    description: "Token-efficient for active conversations",
    maxInputTokens: 3000,
  },
  verbose: {
    wordRange: "120-180",
    includeMetadata: true,
    description: "Rich context for cross-session continuity",
    maxInputTokens: 4000,
  },
};

// Validation functions

function buildPrompt(
  messages: OpenChatMessage[],
  config: SummaryConfig,
  truncationInfo: { truncated: boolean; originalCount: number },
  prevSummary?: string
): string {
  const formattedMessages = formatMessagesForSummary(messages);

  let metadataInstructions = "";
  let outputFormat = "Continuity summary of the conversation so far.";

  if (config.includeMetadata) {
    metadataInstructions = `
- Generate a **Session Title**: short (max 6 words), distinct, and thematically representative.
- Generate a **Session Subtitle**: 1 concise sentence (max 15 words) with emotional nuance.
- Both must be anonymized (no personal names, places, or identifiers).`;

    outputFormat = `Return in JSON format:
{
  "summary": "",
  "title": "",
  "subtitle": ""
}`;
  }

  // Add truncation notice if applicable
  let chatMessagesWithContext = formattedMessages;
  if (truncationInfo.truncated) {
    chatMessagesWithContext = `[Note: Showing most recent ${messages.length} of ${truncationInfo.originalCount} total messages]\n\n${formattedMessages}`;
  }

  return CHAT_HISTORY_INSTRUCTIONS.replace("{{wordRange}}", config.wordRange)
    .replace("{{metadataInstructions}}", metadataInstructions)
    .replace("{{chatMessages}}", chatMessagesWithContext)
    .replace("{{prevSummary}}", prevSummary ?? "")
    .replace("{{outputFormat}}", outputFormat);
}

// export async function getChatSummary(messages: OpenChatMessage[], model: "compact" | "verbose" = "compact") {
//   if (!messages || messages.length === 0) return null;

//   const config = SUMMARY_MODES[model];
//   const formattedMessages = formatMessagesForSummary(messages);

//   let metadataInstructions = "";
//   let outputFormat = "Continuity summary of the conversation so far.";

//   if (config.includeMetadata) {
//     metadataInstructions = `
// Additionally, generate:
// - A **Session Title**: short (max 6 words), distinct, and thematically representative of the main struggle or focus.
// - A **Session Subtitle**: 1 concise sentence (max 15 words) that provides context or emotional nuance to the title.
// Both must be anonymized (no personal names, places, or identifiers).`;

//     outputFormat = `Return the result strictly in the following JSON format:
// {
//   "summary": "",
//   "title": "",
//   "subtitle": ""
// }`;
//   }

//   const prompt = CHAT_HISTORY_INSTRUCTIONS.replace("{{wordRange}}", config.wordRange)
//     .replace("{{metadataInstructions}}", metadataInstructions)
//     .replace("{{chatMessages}}", formattedMessages)
//     .replace("{{outputFormat}}", outputFormat);

//   return await SendPromptsToAi(
//     [
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//     GPT_3_5_TURBO_MODEL
//   );
// }

export async function getChatSummary(
  messages: OpenChatMessage[],
  prevSummary?: string,
  mode: "compact" | "verbose" = "compact"
): Promise<SummaryResult | null> {
  // 1. Validate input
  const validation = validateMessages(messages);
  if (!validation.valid) {
    console.warn(`Chat summary validation failed: ${validation.error}`);
    return null;
  }

  if (validation.warnings) {
    console.warn("Chat summary warnings:", validation.warnings);
  }

  // 2. Get configuration
  const config = SUMMARY_CONFIGS[mode];
  if (!config) {
    console.error(`Invalid summary mode: ${mode}`);
    return null;
  }

  // 3. Smart truncation if needed
  const truncationResult = smartTruncateMessages(messages, config.maxInputTokens);

  // 4. Build optimized prompt
  const prompt = buildPrompt(
    truncationResult.messages,
    config,
    {
      truncated: truncationResult.truncated,
      originalCount: truncationResult.originalCount,
    },
    prevSummary
  );

  console.log(`Generating ${mode} summary for ${truncationResult.messages.length}/${messages.length} messages`);

  // 5. Call AI service (placeholder - replace with your actual implementation)
  try {
    const aiResponse = await SendPromptsToAi(
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      GPT_3_5_TURBO_MODEL
    );

    // 6. Parse and return result
    if (config.includeMetadata) {
      try {
        const parsed = JSON.parse(aiResponse.message);
        return {
          ...parsed,
          modelTokenUsage: aiResponse.modelTokenUsage,
          metadata: {
            messageCount: messages.length,
            truncated: truncationResult.truncated,
          },
        };
      } catch (parseError) {
        console.error("Failed to parse verbose summary JSON:", parseError);
        return null;
      }
    } else {
      return {
        summary: aiResponse.message,
        modelTokenUsage: aiResponse.modelTokenUsage,
        metadata: {
          messageCount: messages.length,
          truncated: truncationResult.truncated,
        },
      };
    }
  } catch (error) {
    console.error("AI service error:", error);
    return null;
  }
}

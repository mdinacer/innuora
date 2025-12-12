import { ChatCompletionMessageParam } from "openai/resources";

import { AppLocales } from "@/lib/i18n";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { CHAT_HISTORY_PROMPT_LOCALIZED } from "../ai-conversation/prompts/prompt.chat-history";

const MAX_MESSAGE_LENGTH = 800; // max characters per message

export class ChatContextManager {
  locale: AppLocales;
  constructor(locale: AppLocales) {
    this.locale = locale;
  }
  buildChatHistoryPrompt(
    messages: OpenChatMessage[],
    roundsToKeep = 3,
    messagesPerRound = 2
  ): ChatCompletionMessageParam | null {
    const lastRounds = this.getLastRounds(messages, roundsToKeep, messagesPerRound);
    if (!lastRounds || lastRounds.length === 0) return null;

    const formattedMessages = this.formatMessages(lastRounds);

    return {
      role: "system",
      content: CHAT_HISTORY_PROMPT_LOCALIZED[this.locale].replace("{{formatted_messages}}", formattedMessages),
    };
  }

  private getLastRounds(messages: OpenChatMessage[], rounds = 3, messagesPerRound = 2): OpenChatMessage[] {
    const totalMessages = rounds * messagesPerRound; // 1 user + 1 assistant per round
    return messages.slice(-totalMessages);
  }

  private formatMessages(messages: OpenChatMessage[]): string {
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
}

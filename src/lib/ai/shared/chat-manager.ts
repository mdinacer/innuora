import { ChatCompletionMessageParam } from "openai/resources";

import { OpenChatMessage } from "@/types/open-chat-message.types";

export class ChatMessagesManager {
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
      content: `
## Conversation History (for context only)
- This is background memory, not for direct quoting.
- Maintain continuity, emotional flow, and awareness of prior patterns.
- Do not summarize or restate this history.
- Use it only to sound consistent, connected, and human.
${formattedMessages}
      `.trim(),
    };
  }

  private getLastRounds(messages: OpenChatMessage[], roundsToKeep = 3, messagesPerRound = 2): OpenChatMessage[] {
    if (!messages || messages.length === 0) return [];

    // Exclude last round (last N messages)
    const messagesExcludingLastRound = messages.slice(0, -messagesPerRound);

    // Pull last N rounds from what’s left
    const totalMessagesToExtract = roundsToKeep * messagesPerRound;
    return messagesExcludingLastRound.slice(-totalMessagesToExtract);
  }

  private formatMessages(messages: OpenChatMessage[]): string {
    return messages.map((msg) => `- ${msg.role}: ${msg.content.trim()}`).join("\n");
  }
}

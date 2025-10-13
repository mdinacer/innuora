import { ChatCompletionMessageParam } from "openai/resources";

import { OpenChatMessage } from "@/types/open-chat-message.types";

const MAX_MESSAGE_LENGTH = 800; // max characters per message

export class ChatContextManager {
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
- This is background memory; do not quote directly.
- Maintain continuity, emotional flow, and awareness of prior patterns.
- Integrate prior user and AI turns naturally to make the conversation feel connected.
- Avoid summarizing or restating the history.
- Use this context only to inform your style, tone, and continuity, not for new advice.

Response Variation Directive:
- Before writing, scan the last 2–3 assistant messages.
- Do NOT begin with the same syntactic pattern (e.g., “That [emotion]...”, “It’s like...”, “You’re...”) used in those responses.
- Vary sentence openings deliberately: start with a verb, sensory cue, question, or direct observation instead.
- If a metaphor was used in the last message, use a different mode this time (literal, reflective, sensory, or existential).
- Reuse emotional truth, not structure or metaphor.
- Maintain coherence and empathy, but avoid rhythmic repetition.
- Priority: linguistic freshness > stylistic consistency when both cannot coexist.
- If uncertain, err on the side of unexpected phrasing or silence before repeating a known pattern.

${formattedMessages}
  `.trim(),
    };
    //     return {
    //       role: "system",
    //       content: `
    // ## Conversation History (for context only)
    // - This is background memory; do not quote directly.
    // - Maintain continuity, emotional flow, and awareness of prior patterns.
    // - Integrate prior user and AI turns naturally to make the conversation feel connected.
    // - Avoid summarizing or restating the history.
    // - Use this context only to inform your style, tone, and continuity, not for new advice.
    // ${formattedMessages}
    //   `.trim(),
    //     };
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

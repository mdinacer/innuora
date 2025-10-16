import { OpenChatMessage } from "@/types/open-chat-message.types";

export function formatMessages(messages: OpenChatMessage[], maxLength = 800): string {
  return messages
    .map((msg) => {
      let content = msg.content.trim();

      // Truncate if too long
      if (content.length > maxLength) {
        content = content.slice(0, maxLength) + "...";
      }

      return `- ${msg.role}: ${content}`;
    })
    .join("\n");
}

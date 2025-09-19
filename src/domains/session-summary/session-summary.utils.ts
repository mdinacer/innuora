import { OpenChatMessage } from "@/types/open-chat-message.types";

const MAX_MESSAGE_LENGTH = 800; // max characters per message

export function formatChatMessages(messages: OpenChatMessage[]): string {
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

import { OpenChatMessage } from "@/types/open-chat-message.types";

const MAX_MESSAGE_LENGTH = 300; // adjust as needed

export function formatUserInputForMemory(userMessage: string): string {
  let content = userMessage.replace(/\s+/g, " ").trim();

  // Truncate if too long
  if (content.length > MAX_MESSAGE_LENGTH) {
    content = content.slice(0, MAX_MESSAGE_LENGTH).trim() + "...";
  }

  // Ensure it ends with a period
  if (!/[.!?]$/.test(content)) {
    content += ".";
  }

  return `User: ${content}`;
}
export function formatUserMessagesForMemory(messages: OpenChatMessage[]): string {
  return messages
    .filter((msg) => msg.role === "user") // only include user messages
    .map((msg) => {
      // Normalize spaces and line breaks
      let content = msg.content.replace(/\s+/g, " ").trim();

      // Truncate if too long
      if (content.length > MAX_MESSAGE_LENGTH) {
        content = content.slice(0, MAX_MESSAGE_LENGTH) + "...";
      }

      // Ensure it ends with a period
      if (!/[.!?]$/.test(content)) {
        content += ".";
      }

      return `User: ${content}`;
    })
    .join("\n");
}

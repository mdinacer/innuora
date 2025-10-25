/**
 * Conversation Window Service
 *
 * Retrieves last N messages for conversation context.
 */

import { getDecryptedStoreSession } from "@/domains/encrypted-session/encrypted-session.utils";
import type { ConversationWindow } from "../types";

export class ConversationWindowService {
  /**
   * Get last 6-10 messages for context window.
   * Retrieves from encrypted session store.
   */
  async getWindow(sessionId: string, limit: number = 8): Promise<ConversationWindow> {
    const session = await getDecryptedStoreSession(sessionId);

    if (!session?.messages) return [];

    // Get last N messages (user + assistant pairs, exclude system messages)
    const messages = session.messages.filter((msg) => msg.role === "user" || msg.role === "assistant").slice(-limit);

    return messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
  }
}

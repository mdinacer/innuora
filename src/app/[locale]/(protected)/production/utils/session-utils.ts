import { nanoid } from "nanoid";

import { useSessionStore } from "../stores/sessions-store";
import { ConversationSession } from "../types/session-runtime";
import { encryptSessionData } from "./encryption-utils";

export function getUniqueId(existingMap: Record<string, string>, prefix = "SESS"): string {
  const existingValues = new Set(Object.values(existingMap));
  let id;
  let attempts = 0;

  do {
    id = `${prefix}${nanoid(6)}`;
    attempts++;
    if (attempts > 100) {
      throw new Error("getUniqueId: too many attempts, possible collision storm");
    }
  } while (existingValues.has(id));

  return id;
}

export async function syncSession(session: ConversationSession) {
  const sessionStore = useSessionStore.getState();
  const { id: sessionId, messages } = session;

  const now = new Date();

  // Fast path: no messages → clear encrypted data
  if (messages.length === 0) {
    sessionStore.updateSession(sessionId, {
      messages: null,
      updatedAt: now,
    });
    return;
  }

  // Encrypt only messages (no need to recreate full object)
  const encryptedData = await encryptSessionData({ messages });

  sessionStore.updateSession(sessionId, {
    messages: encryptedData,
    updatedAt: now,
  });
}

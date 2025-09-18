import { Session } from "@/domains/open-chat/open-chat.types";

export function resetSessionData(session: Session): Session {
  return {
    id: session.id,
    userId: session.userId,
    title: session.title,
    subtitle: session.subtitle,
    messages: [],
    memoryStore: null,
    continuitySummary: null,
    aggregatedAnalysis: null,
    analysisSnapshots: [],
    modelCode: session.modelCode,
    autoUpdateTitle: session.autoUpdateTitle,
    persistOnCloud: session.persistOnCloud,
    metadata: {
      tokenUsage: [],
      messageCount: 0,
      tokenCount: 0,
      costUSD: 0,
    },
    createdAt: session.createdAt,
    updatedAt: new Date(), // Update timestamp when resetting
  };
}

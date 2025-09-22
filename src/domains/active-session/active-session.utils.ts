import { Session } from "@/domains/open-chat/open-chat.types";

export function getActiveSessionDuration(session: Session): {
  durationMs: number;
  durationMinutes: number;
  isExtended: boolean;
} {
  const durationMs = session.metadata.activeDurationMs || 0;
  const durationMinutes = Math.round(durationMs / 60000);
  const isExtended = durationMinutes > 45; // Consider 45+ minutes as extended

  return {
    durationMs,
    durationMinutes,
    isExtended,
  };
}

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
      creditsUsed: 0,
      activeDurationMs: 0,
      lastActiveAt: new Date(),
    },
    createdAt: session.createdAt,
    updatedAt: new Date(), // Update timestamp when resetting
  };
}

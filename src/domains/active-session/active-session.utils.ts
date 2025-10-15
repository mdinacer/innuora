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
    ...session,
    metadata: {
      ...session.metadata,
      messageCount: 0,
      activeDurationMs: 0,
      lastActiveAt: new Date(),
    },
    messages: [],
    updatedAt: new Date(), // Update timestamp when resetting
    //sessionDiagnostics: null,
    // NOTE: memoryStore, continuitySummary, aggregatedAnalysis, analysisSnapshots
    // are now stored server-side only and reset via server actions
  };
}

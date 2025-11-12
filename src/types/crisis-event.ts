export type CrisisEvent = {
  id: string;
  sessionId?: string; // Session ID (real id)
  detectedAt: number;
  resolvedAt?: number;
  level: "high" | "immediate" | "acute";
  confirmedSafe: boolean;
  confirmationTime?: number;
  source: "reflection" | "analysis";
  userAcknowledged?: boolean;
  notes?: string; // optional human or system summary
};

export type CrisisLevel = "none" | "low" | "moderate" | "high" | "immediate";
export type CrisisState = "none" | "detected" | "confirmed" | "safe";

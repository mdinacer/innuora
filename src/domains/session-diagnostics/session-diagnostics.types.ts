export type {
  SessionDiagnostics,
  ConfidenceLevel,
  CognitiveDistortion,
} from "@/domains/therapeutic-analysis/therapeutic-analysis.types";

export {
  SessionDiagnosticsSchema,
  CONFIDENCE_LEVEL_MAP,
  COGNITIVE_DISTORTION_MAP,
} from "@/domains/therapeutic-analysis/therapeutic-analysis.types";

export interface SessionDiagnosticsInput {
  sessionSummary: string;
  sessionMemory: string;
  sessionAnalysis: string;
}

export interface SessionDiagnosticsMetadata {
  generatedAt: Date;
  tokensUsed: number;
  modelUsed: string;
  sessionMessageCount: number;
  version: string; // For future prompt versioning
}

export interface SessionDiagnosticsWithMetadata {
  diagnostics: import("@/domains/therapeutic-analysis/therapeutic-analysis.types").SessionDiagnostics;
  metadata: SessionDiagnosticsMetadata;
}

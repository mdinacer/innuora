export type {
  CognitiveDistortion,
  ConfidenceLevel,
  SessionDiagnostics,
} from "@/domains/therapeutic-analysis/therapeutic-analysis.types";

export {
  COGNITIVE_DISTORTION_MAP,
  CONFIDENCE_LEVEL_MAP,
  SessionDiagnosticsSchema,
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

// NEW TYPES

type ConfidenceLevel = "high" | "medium" | "low";
type RigidityLevel = "flexible" | "moderate" | "rigid";
type DifficultyLevel = "gentle" | "moderate" | "challenging";
type ResourceDifficulty = "beginner" | "intermediate" | "advanced";

// Shared building blocks
type InsightItem = {
  title: string; // markdown string
  description: string; // markdown explanation
  confidence: ConfidenceLevel;
};

type RuleItem = {
  rule: string; // plain unspoken rule
  description: string; // markdown explanation
  rigidity: RigidityLevel;
  confidence: ConfidenceLevel;
};

type StepItem = {
  title: string; // concrete micro-step
  description: string; // markdown explanation
  difficulty: DifficultyLevel;
};

type ResourceItem = {
  category: string; // controlled taxonomy (e.g. "self-compassion")
  goal: string; // learning or practice outcome
  difficulty: ResourceDifficulty;
};

export type SessionDiagnosticsStd = {
  whats_happening: {
    text: string; // markdown string, observed patterns
    confidence: ConfidenceLevel;
  }[];
  hidden_rules: RuleItem[];
  why_heavy: InsightItem[];
  meta_patterns: InsightItem[];
  leverage_points: InsightItem[];
  where_to_start: StepItem[];
  relevant_resources: ResourceItem[];
};

/**
 * Core types for conversation flow (stripped of server infrastructure)
 */

export interface OpenChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RelationalTrace {
  relational_stance?: "grounding" | "steady" | "exploratory" | "clarifying" | "nurturing" | "directive";
  tone?: "warm" | "calm" | "curious" | "light" | "firm";
  focus?: string;
  notes?: string;
  psychoeducation_last_turn?: boolean;
  curiosity_last_turn?: boolean;
  used_lived_line?: boolean;
  psychoedu_cooldown_remaining?: number;
  curiosity_cooldown_remaining?: number;
}

export interface InnuoraAnalysis {
  intensity: "low" | "moderate" | "high";
  readiness: "avoidant" | "cautious" | "open" | "engaged" | "reflective";
  emotion: "sadness" | "anger" | "guilt" | "fear" | "shame" | "numbness" | "confusion" | "hope";
  distortion:
    | "none"
    | "catastrophizing"
    | "emotional reasoning"
    | "should statements"
    | "disqualifying positives"
    | "personalization"
    | "all-or-nothing thinking"
    | "over-control";
  theme: string;
  crisis_level: "none" | "low" | "moderate" | "high" | "immediate";
  allow_curiosity: boolean;
  allow_psychoeducation: boolean;
  psychoedu_ready: boolean;
  rationale: string;
  notes: string;
}

export interface SessionDynamicsMatrix {
  micro: InnuoraAnalysis;
  meso: {
    dominant_shift: string;
    emotional_vector: { valence: number; arousal: number };
    readiness_vector: number;
    trend: "rising" | "falling" | "stabilizing";
  };
  macro: {
    session_phase: "early" | "middle" | "closing";
    dominant_axis: string;
    adaptive_focus: string;
    stability_index: number;
    phase_confidence: number;
    duration_weight: number;
    emotional_diversity: number;
  };
}

export interface ReflectiveResponse {
  reflection: string;
  follow_up_question: string | null;
  psychoeducation: {
    category?: string;
    subject?: string;
    content: string;
    contextual_anchor: string;
  } | null;
  signals: {
    resistance: "none" | "sarcasm" | "dismissive" | "intellectualized";
    crisis: "none" | "acute";
  };
  next_relational_trace: RelationalTrace;
  next_action?: {
    type: "micro_task" | "cognitive_work";
    label: string;
    rationale: string;
    confidence: number;
  } | null;
}

export interface ContextLifecycle {
  directive?: string;
  hash?: string;
  generatedAt?: number;
  usageCount: number;
}

// ============================================================================
// Stage Inputs/Outputs
// ============================================================================

export interface ReflectionInput {
  userInput: string;
  messagesWindow: OpenChatMessage[];
  contextDirective: string | null;
  prevAnalysis?: InnuoraAnalysis;
  relationalTrace?: RelationalTrace;
}

export interface ReflectionOutput {
  response: ReflectiveResponse;
  nextTrace: RelationalTrace;
}

export interface AnalysisInput {
  userInput: string;
  messagesWindow: OpenChatMessage[];
  prevAnalyses: InnuoraAnalysis[];
}

export interface AnalysisOutput {
  analysis: InnuoraAnalysis;
}

export interface SynthesisInput {
  sessionDynamics: SessionDynamicsMatrix;
  recentAnalysis: InnuoraAnalysis;
  relationalTrace?: RelationalTrace;
  currentLifecycle: ContextLifecycle;
}

export interface SynthesisOutput {
  directive: string;
  lifecycle: ContextLifecycle;
  cached: boolean;
}

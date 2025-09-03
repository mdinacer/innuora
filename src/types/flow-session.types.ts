// =======================
// FLOW TYPES - SIMPLIFIED
// =======================

export type SessionType = "onboarding" | "deep" | "healing";
export type SessionPhase = "structured_flow" | "open_chat" | "closure";

// Consolidated enums
export const StepType = {
  TEXT: "text",
  PARAGRAPHS: "paragraphs",
  USER_INPUT: "user_input",
  OPTIONS: "options",
  ACTION: "action",
  REFLECTION: "reflection",
  BRANCH: "branch",
  SYSTEM: "system",
  FLOW_END: "flow_end",
} as const;

export const AdvanceMode = {
  AUTO: "auto",
  MANUAL: "manual",
  AWAIT: "await",
} as const;

export const MergeMode = {
  APPEND: "append",
  REPLACE: "replace",
} as const;

export const MergeTarget = {
  SESSION_SUMMARY: "session_summary",
  BELIEF_MAP: "belief_map",
  NONE: "none",
} as const;

export const SelectMode = {
  SINGLE: "single",
  MULTIPLE: "multiple",
} as const;

// Extract types
export type StepType = (typeof StepType)[keyof typeof StepType];
export type AdvanceMode = (typeof AdvanceMode)[keyof typeof AdvanceMode];
export type MergeMode = (typeof MergeMode)[keyof typeof MergeMode];
export type MergeTarget = (typeof MergeTarget)[keyof typeof MergeTarget];
export type SelectMode = (typeof SelectMode)[keyof typeof SelectMode];

// =======================
// CONTENT INTERFACES
// =======================

export interface UserOption {
  label: string;
  value: string;
  description?: string;
}

export interface ParagraphsContent {
  title: string;
  subtitle: string;
  paragraphs: string[];
  buttonText?: string;
}

export interface UserInputContent {
  label: string;
  key: string;
  placeholder?: string;
  hint?: string;
  charLimit?: number;
}

export interface OptionsContent {
  label: string;
  key: string;
  mode: SelectMode;
  options: UserOption[];
  hint?: string;
  maxSelected?: number;
}

export interface ReflectionContent {
  title: string;
  mergeMode?: MergeMode;
  mergeTarget?: MergeTarget;
  includeOnboardingData?: boolean;
  includeMirSummary?: boolean;
  includeChatSummary?: boolean;
  // prompt: (inputValues: Record<string, unknown>) => string;
}

export interface ActionContent {
  prompt: string;
  primary: { label: string; nextStepId: string };
  secondary: { label: string; nextStepId: string };
}

export interface FlowEndContent {
  title: string;
  message: string;
  primaryAction: string;
  secondaryAction?: string;
  shouldUpdateMirSummary?: boolean;
}

export interface BranchContent {
  condition: (inputValues: Record<string, unknown>) => boolean;
  whenTrueStepId: string;
  whenFalseStepId: string;
}

// =======================
// SYSTEM ACTIONS
// =======================

export type SystemAction =
  | { type: "reset_flow"; resetMessages?: boolean; resetInputs?: boolean; toStepId?: string }
  | { type: "log"; message: string }
  | { type: "delay"; ms: number }
  | { type: "callback"; name: string; args?: Record<string, any> }
  | { type: "wipe_messages" }
  | { type: "reset_input_values" };

export interface SystemContent {
  actions: SystemAction[];
  [key: string]: any;
}

// =======================
// FLOW STEP DEFINITION
// =======================

interface BaseStep {
  id: string;
  type: StepType;
  nextStepId?: string; // Optional for end steps and branch steps
  advanceMode?: AdvanceMode;
  autoAdvanceDelay?: number;
}

// Union type approach - simpler than separate interfaces
export type FlowStep = BaseStep &
  (
    | { type: typeof StepType.TEXT; content: string }
    | { type: typeof StepType.PARAGRAPHS; content: ParagraphsContent }
    | { type: typeof StepType.USER_INPUT; content: UserInputContent }
    | { type: typeof StepType.OPTIONS; content: OptionsContent }
    | { type: typeof StepType.ACTION; content: ActionContent }
    | { type: typeof StepType.REFLECTION; content: ReflectionContent; id: "reflection" }
    | { type: typeof StepType.BRANCH; content: BranchContent }
    | { type: typeof StepType.SYSTEM; content: SystemContent }
    | { type: typeof StepType.FLOW_END; content: FlowEndContent; id: "end" }
  );

export interface SessionFlow {
  id: string;
  //type: SessionType;
  title: string;
  subtitle: string;
  steps: FlowStep[];
  initialStepId: string;
  defaultAutoAdvanceDelay?: number;
}

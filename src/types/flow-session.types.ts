// =======================
// SIMPLIFIED FLOW TYPES
// =======================

// Step types - reduced from 9 to 5
export const StepType = {
  APP_MESSAGE: "app_message", // App says something (text or rich content)
  USER_INPUT: "user_input", // User types text
  USER_SELECT: "user_select", // User picks option(s)
  PARAGRAPHS: "paragraphs", // Rich content display
  END: "end", // Flow complete
} as const;

export type StepType = (typeof StepType)[keyof typeof StepType];

export const SelectMode = {
  SINGLE: "single",
  MULTIPLE: "multiple",
} as const;

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

export interface UserSelectContent {
  label: string;
  key: string;
  mode: SelectMode;
  options: UserOption[];
  hint?: string;
  maxSelected?: number;
}

export interface EndContent {
  title: string;
  message: string;
  primaryAction: string;
  secondaryAction?: string;
}

// =======================
// FLOW STEP DEFINITION
// =======================

interface BaseStep {
  id: string;
  type: StepType;
  nextStepId?: string;
  autoAdvanceDelay?: number; // For APP_MESSAGE auto-advance
}

export type FlowStep = BaseStep &
  (
    | { type: typeof StepType.APP_MESSAGE; content: string }
    | { type: typeof StepType.PARAGRAPHS; content: ParagraphsContent }
    | { type: typeof StepType.USER_INPUT; content: UserInputContent }
    | { type: typeof StepType.USER_SELECT; content: UserSelectContent }
    | { type: typeof StepType.END; content: EndContent; id: "end" }
  );

export interface SessionFlow {
  id: string;
  title: string;
  subtitle: string;
  steps: FlowStep[];
  initialStepId: string;
  defaultAutoAdvanceDelay?: number;
}

// Helper types
export type StepOfType<T extends StepType> = Extract<FlowStep, { type: T }>;
export type UserInputStep = StepOfType<typeof StepType.USER_INPUT | typeof StepType.USER_SELECT>;

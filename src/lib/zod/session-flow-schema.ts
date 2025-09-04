import { z } from "zod";

// =======================
// BASIC ENUMS AND TYPES
// =======================

export const SessionTypeSchema = z.enum(["onboarding", "deep", "healing"]);
export const SessionPhaseSchema = z.enum(["structured_flow", "open_chat", "closure"]);

export const StepTypeSchema = z.enum([
  "text",
  "paragraphs",
  "user_input",
  "options",
  "action",
  "reflection",
  "branch",
  "system",
  "flow_end",
]);

export const AdvanceModeSchema = z.enum(["auto", "manual", "await"]);
export const MergeModeSchema = z.enum(["append", "replace"]);
export const MergeTargetSchema = z.enum(["session_summary", "belief_map", "none"]);
export const SelectModeSchema = z.enum(["single", "multiple"]);

// =======================
// CONTENT SCHEMAS
// =======================

export const UserOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  description: z.string().optional(),
});

export const ParagraphsContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  paragraphs: z.array(z.string()),
  buttonText: z.string().optional(),
});

export const UserInputContentSchema = z.object({
  label: z.string(),
  key: z.string(),
  placeholder: z.string().optional(),
  hint: z.string().optional(),
  charLimit: z.number().optional(),
});

export const OptionsContentSchema = z.object({
  label: z.string(),
  key: z.string(),
  mode: SelectModeSchema,
  options: z.array(UserOptionSchema),
  hint: z.string().optional(),
  maxSelected: z.number().optional(),
});

export const ReflectionContentSchema = z.object({
  title: z.string(),
  mergeMode: MergeModeSchema.optional(),
  mergeTarget: MergeTargetSchema.optional(),
  includeOnboardingData: z.boolean().optional(),
  includeMirSummary: z.boolean().optional(),
  includeChatSummary: z.boolean().optional(),
});

export const ActionContentSchema = z.object({
  prompt: z.string(),
  primary: z.object({
    label: z.string(),
    nextStepId: z.string(),
  }),
  secondary: z.object({
    label: z.string(),
    nextStepId: z.string(),
  }),
});

export const FlowEndContentSchema = z.object({
  title: z.string(),
  message: z.string(),
  primaryAction: z.string(),
  secondaryAction: z.string().optional(),
  shouldUpdateMirSummary: z.boolean().optional(),
});

export const BranchContentSchema = z.object({
  condition: z.custom<(inputValues: Record<string, unknown>) => boolean>((val) => typeof val === "function"),
  whenTrueStepId: z.string(),
  whenFalseStepId: z.string(),
});

// =======================
// SYSTEM ACTIONS
// =======================

export const SystemActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("reset_flow"),
  }),
  z.object({
    type: z.literal("wipe_messages"),
  }),
  z.object({
    type: z.literal("reset_values"),
  }),
  z.object({
    type: z.literal("reset_session"),
  }),
  z.object({
    type: z.literal("restart_session"),
    resetValues: z.boolean().optional(),
    stepId: z.string().optional(),
  }),
  z.object({
    type: z.literal("callback"),
    name: z.string(),
    args: z.record(z.string(), z.any()).optional(),
  }),
]);

export const SystemContentSchema = z
  .object({
    title: z.string().optional(),
    message: z.string().optional(),
    actions: z.array(SystemActionSchema),
  })
  .loose(); // Allow additional properties with [key: string]: any

// =======================
// FLOW STEP SCHEMAS
// =======================

const BaseStepSchema = z.object({
  id: z.string(),
  type: StepTypeSchema,
  nextStepId: z.string().optional(),
  advanceMode: AdvanceModeSchema.optional(),
  autoAdvanceDelay: z.number().optional(),
});

export const FlowStepSchema = z.discriminatedUnion("type", [
  BaseStepSchema.extend({
    type: z.literal("text"),
    content: z.string(),
  }),
  BaseStepSchema.extend({
    type: z.literal("paragraphs"),
    content: ParagraphsContentSchema,
  }),
  BaseStepSchema.extend({
    type: z.literal("user_input"),
    content: UserInputContentSchema,
  }),
  BaseStepSchema.extend({
    type: z.literal("options"),
    content: OptionsContentSchema,
  }),
  BaseStepSchema.extend({
    type: z.literal("action"),
    content: ActionContentSchema,
  }),
  BaseStepSchema.extend({
    type: z.literal("reflection"),
    id: z.literal("reflection"),
    content: ReflectionContentSchema,
  }),
  BaseStepSchema.extend({
    type: z.literal("branch"),
    content: BranchContentSchema,
  }),
  BaseStepSchema.extend({
    type: z.literal("system"),
    content: SystemContentSchema,
  }),
  BaseStepSchema.extend({
    type: z.literal("flow_end"),
    id: z.literal("end"),
    content: FlowEndContentSchema,
  }),
]);

// =======================
// MAIN SESSION FLOW SCHEMA
// =======================

export const SessionFlowSchema = z.object({
  id: z.string(),
  //type: SessionTypeSchema,
  title: z.string(),
  subtitle: z.string(),
  steps: z.array(FlowStepSchema),
  initialStepId: z.string(),
  defaultAutoAdvanceDelay: z.number().optional(),
});

// =======================
// TYPE EXPORTS (inferred from schemas)
// =======================

export type SessionType = z.infer<typeof SessionTypeSchema>;
export type SessionPhase = z.infer<typeof SessionPhaseSchema>;
export type StepType = z.infer<typeof StepTypeSchema>;
export type AdvanceMode = z.infer<typeof AdvanceModeSchema>;
export type MergeMode = z.infer<typeof MergeModeSchema>;
export type MergeTarget = z.infer<typeof MergeTargetSchema>;
export type SelectMode = z.infer<typeof SelectModeSchema>;

export type UserOption = z.infer<typeof UserOptionSchema>;
export type ParagraphsContent = z.infer<typeof ParagraphsContentSchema>;
export type UserInputContent = z.infer<typeof UserInputContentSchema>;
export type OptionsContent = z.infer<typeof OptionsContentSchema>;
export type ReflectionContent = z.infer<typeof ReflectionContentSchema>;
export type ActionContent = z.infer<typeof ActionContentSchema>;
export type FlowEndContent = z.infer<typeof FlowEndContentSchema>;
export type BranchContent = z.infer<typeof BranchContentSchema>;
export type SystemAction = z.infer<typeof SystemActionSchema>;
export type SystemContent = z.infer<typeof SystemContentSchema>;
export type FlowStep = z.infer<typeof FlowStepSchema>;
export type SessionFlow = z.infer<typeof SessionFlowSchema>;

// =======================
// UTILITY FUNCTIONS
// =======================

/**
 * Validates a SessionFlow object
 */
export const validateSessionFlow = (data: unknown): SessionFlow => {
  return SessionFlowSchema.parse(data);
};

/**
 * Safely validates a SessionFlow object, returning success/error result
 */
export const safeValidateSessionFlow = (data: unknown) => {
  return SessionFlowSchema.safeParse(data);
};

/**
 * Validates a FlowStep object
 */
export const validateFlowStep = (data: unknown): FlowStep => {
  return FlowStepSchema.parse(data);
};

/**
 * Type guard to check if an object is a valid SessionFlow
 */
export const isSessionFlow = (data: unknown): data is SessionFlow => {
  return SessionFlowSchema.safeParse(data).success;
};

import { z } from "zod";

// =======================
// SIMPLIFIED ZSCHEMA FOR SESSION FLOW
// =======================

export const StepTypeSchema = z.enum(["app_message", "paragraphs", "user_input", "user_select", "end"]);

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

export const UserSelectContentSchema = z.object({
  label: z.string(),
  key: z.string(),
  mode: SelectModeSchema,
  options: z.array(UserOptionSchema),
  hint: z.string().optional(),
  maxSelected: z.number().optional(),
});

export const EndContentSchema = z.object({
  title: z.string(),
  message: z.string(),
  primaryAction: z.string(),
  secondaryAction: z.string().optional(),
});

// =======================
// FLOW STEP SCHEMAS
// =======================

const BaseStepSchema = z.object({
  id: z.string(),
  type: StepTypeSchema,
  nextStepId: z.string().optional(),
  autoAdvanceDelay: z.number().optional(),
});

export const FlowStepSchema = z.discriminatedUnion("type", [
  BaseStepSchema.extend({
    type: z.literal("app_message"),
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
    type: z.literal("user_select"),
    content: UserSelectContentSchema,
  }),
  BaseStepSchema.extend({
    type: z.literal("end"),
    id: z.literal("end"),
    content: EndContentSchema,
  }),
]);

// =======================
// SESSION FLOW SCHEMA
// =======================

export const SessionFlowSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  steps: z.array(FlowStepSchema),
  initialStepId: z.string(),
  defaultAutoAdvanceDelay: z.number().optional(),
});

// Export types
export type UserOption = z.infer<typeof UserOptionSchema>;
export type SessionFlow = z.infer<typeof SessionFlowSchema>;
export type FlowStep = z.infer<typeof FlowStepSchema>;

// Helper for safe validation
export function safeValidateSessionFlow(data: unknown) {
  return SessionFlowSchema.safeParse(data);
}

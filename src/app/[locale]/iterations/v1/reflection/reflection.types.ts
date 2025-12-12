import { z } from "zod";

const PsychoeducationSchema = z
  .object({
    category: z.enum([
      "belief-system",
      "emotional-pattern",
      "behavioral-pattern",
      "self-worth",
      "meaning-fatigue",
      "avoidance",
      "perfectionism",
      "boundary",
      "resilience",
      "regulation",
      "attachment-dynamics",
    ]),
    subject: z.string().nullable(),
    content: z.string(),
    contextual_anchor: z.string(),
  })
  .strict()
  .nullable();

const RelationalTraceSchema = z
  .object({
    relational_stance: z.enum(["grounding", "steady", "exploratory", "clarifying", "nurturing", "directive"]),
    tone: z.enum(["warm", "calm", "curious", "light", "firm"]),
    focus: z.string(),
    notes: z.string(),
    used_lived_line: z.boolean(),
    user_engagement: z.enum(["low", "moderate", "high"]),
    resistance: z.enum(["none", "sarcasm", "dismissive", "intellectualized"]),
  })
  .strict();

const NextActionSchema = z
  .object({
    type: z.enum(["micro_task", "cognitive_work"]),
    label: z.string(),
    rationale: z.string(),
    confidence: z.number().min(0).max(1),
  })
  .strict()
  .nullable();

export const ReflectionSchema = z
  .object({
    reflection: z.string(),
    follow_up_question: z.string().nullable(),
    psychoeducation: PsychoeducationSchema,
    crisis: z.enum(["none", "acute"]),
    next_relational_trace: RelationalTraceSchema,
    next_action: NextActionSchema,
  })
  .strict();

export type Psychoeducation = z.infer<typeof PsychoeducationSchema>;
export type RelationalTrace = z.infer<typeof RelationalTraceSchema>;
export type NextAction = z.infer<typeof NextActionSchema>;
export type Reflection = z.infer<typeof ReflectionSchema>;

export const INITIAL_RELATIONAL_TRACE: RelationalTrace = {
  relational_stance: "grounding",
  tone: "firm",
  focus: "orientation",
  notes: "first_round; establish_clarity_anchor",
  used_lived_line: false,
  user_engagement: "moderate",
  resistance: "none",
};

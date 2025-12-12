import { z } from "zod";

export const ReflectionMetadataSchema = z.object({
  topic: z.string().describe("English label for the underlying truth or conflict addressed."),
  depth: z.enum(["low", "medium", "high"]).describe("Depth level used in this reflection turn."),
  next_move: z.enum(["go_deeper", "shift_angle", "stabilize"]).describe("Instruction for the next reflection turn."),
  question_used: z.boolean().describe("True if a question was included."),
});

// Inferred TypeScript type (optional)
export type Metadata = z.infer<typeof ReflectionMetadataSchema>;

export const ReflectionSchema = z.object({
  reflection: z.string().describe("The core truth-mirror message, sharp and direct."),
  question: z.string().nullable().describe("Optional single incisive question that opens a new angle."),
  metadata: ReflectionMetadataSchema,
});

// Inferred TypeScript type (optional)
export type Reflection = z.infer<typeof ReflectionSchema>;

export const INITIAL_REFLECTION_METADATA: Metadata = {
  topic: "initial_opening", // English anchor for the first turn
  depth: "low", // Always start at low depth
  next_move: "shift_angle", // First turn should gently widen, not dive
  question_used: false, // First turn should avoid asking a question
} as const;

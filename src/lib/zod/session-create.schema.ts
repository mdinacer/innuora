import { z } from "zod";

export const SessionCreateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  aiSuggestedTitle: z.boolean().optional(),
  persistOnCloud: z.boolean().optional(),
});

export type SessionCreate = z.infer<typeof SessionCreateSchema>;

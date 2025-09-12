import { z } from "zod";

export const SessionCreateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  autoUpdateTitle: z.boolean().optional(),
  persistOnCloud: z.boolean().optional(),
});

export type SessionCreate = z.infer<typeof SessionCreateSchema>;

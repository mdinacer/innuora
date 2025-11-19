import { z } from "zod";

export const SessionCreateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  autoUpdateTitle: z.boolean().optional(),
  persistOnCloud: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type SessionCreate = z.infer<typeof SessionCreateSchema>;

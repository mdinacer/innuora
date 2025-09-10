import z from "zod";

import { CrisisLevel, EmotionalIntensity } from "../state-analysis/state-analysis.types";

export type SessionAnalysis = {
  intensity: EmotionalIntensity;
  crisis: CrisisLevel;
  distortions: string[];
  themes: string[];
  core_beliefs: string[];
  silent_rules: string[];
};

export const SessionSummarySchema = z.object({
  summary: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

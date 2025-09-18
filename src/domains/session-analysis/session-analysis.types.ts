import z from "zod";

import { CrisisLevel, EmotionalIntensity } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";

export type SessionAnalysis = {
  intensity: EmotionalIntensity; // highest intensity across snapshots
  crisis: CrisisLevel; // highest crisis level across snapshots

  distortions: {
    type: string;
    severity: "mild" | "moderate" | "severe";
    count: number; // optional: how many times it showed up
  }[];

  themes: {
    theme: string;
    frequency: "occasional" | "frequent" | "pervasive";
    count: number;
  }[];

  core_beliefs: {
    belief: string;
    count: number;
  }[];

  silent_rules: {
    rule: string;
    rigidity: "flexible" | "moderate" | "rigid";
    count: number;
  }[];
};
export const SessionSummarySchema = z.object({
  summary: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

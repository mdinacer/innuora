import z from "zod";

import { CrisisLevel, EmotionalIntensity } from "../state-analysis/state-analysis.types";

// export type SessionAnalysis = {
//   intensity: EmotionalIntensity;
//   crisis: CrisisLevel;
//   distortions: string[];
//   themes: string[];
//   core_beliefs: string[];
//   silent_rules: string[];
// };

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

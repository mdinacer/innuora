import { z } from "zod";

export const confidenceEnum = z.enum(["high", "medium", "low"]);
export const rigidityEnum = z.enum(["flexible", "moderate", "rigid"]);
export const difficultyEnum = z.enum(["gentle", "moderate", "challenging"]);
export const resourceCategoryEnum = z.enum([
  "cognitive-behavioral-therapy",
  "anxiety-management",
  "depression-support",
  "stress-management",
  "relationship-patterns",
  "self-compassion",
  "mindfulness-techniques",
  "mood-tracking",
]);

export const BasicDiagnosticSchema = z.object({
  whats_happening: z.array(
    z.object({
      text: z.string(),
      confidence: confidenceEnum,
    })
  ),
  hidden_rules: z.array(
    z.object({
      rule: z.string(),
      description: z.string(),
      rigidity: rigidityEnum,
      confidence: confidenceEnum,
    })
  ),
  why_heavy: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      confidence: confidenceEnum,
    })
  ),
  meta_patterns: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      confidence: confidenceEnum,
    })
  ),
  leverage_points: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      confidence: confidenceEnum,
    })
  ),
  where_to_start: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      difficulty: difficultyEnum,
    })
  ),
  relevant_resources: z.array(
    z.object({
      category: resourceCategoryEnum,
      goal: z.string(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    })
  ),
});

// Type for TypeScript
export type BasicDiagnostic = z.infer<typeof BasicDiagnosticSchema>;

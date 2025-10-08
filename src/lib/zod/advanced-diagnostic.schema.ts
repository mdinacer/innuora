import { z } from "zod";

const DiagnosticThemeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  trajectory: z.enum(["increasing", "stable", "decreasing"]),
  evidence: z.array(z.string()),
});

export type DiagnosticTheme = z.infer<typeof DiagnosticThemeSchema>;

const DiagnosticCognitiveDistortionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  frequency: z.number(),
  severity: z.enum(["low", "moderate", "high"]),
});

export type DiagnosticCognitiveDistortion = z.infer<typeof DiagnosticCognitiveDistortionSchema>;

export const AdvancedDiagnosticSchema = z.object({
  themes: z.array(DiagnosticThemeSchema),
  cognitive_distortions: z.array(DiagnosticCognitiveDistortionSchema),
  emotional_state: z.object({
    primary: z.string(),
    secondary: z.array(z.string()),
    congruence: z.enum(["aligned", "minimizing", "performing"]),
  }),
  risk_assessment: z.object({
    level: z.enum(["low", "moderate_concern", "high"]),
    notes: z.string(),
  }),
  therapist_focus: z.array(z.string()),
  clinical_interpretations: z.array(z.string()),
  treatment_recommendations: z.array(z.string()),
  professional_language: z.array(z.string()),
  clinical_insights: z.array(z.string()),
});

export type AdvancedDiagnostic = z.infer<typeof AdvancedDiagnosticSchema>;

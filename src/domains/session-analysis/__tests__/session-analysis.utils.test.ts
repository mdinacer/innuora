/**
 * Unit tests for session analysis utilities
 * Critical analytical accuracy - tests analysis aggregation and processing
 */

import { describe, expect, it } from "vitest";

import { CrisisLevel, TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { combineToSessionAnalysis } from "../session-analysis.utils";

describe("Session Analysis Utils", () => {
  describe("combineToSessionAnalysis", () => {
    it("should combine multiple therapeutic analyses correctly", () => {
      const analyses: TherapeuticAnalysis[] = [
        {
          core_module: "cognitive",
          process_module: null,
          utility_module: "mindfulness",
          intensity: "moderate",
          crisis: "mild",
          distortions: [
            { type: "Catastrophizing", severity: "moderate" },
            { type: "All-or-nothing", severity: "mild" },
          ],
          themes: [
            { theme: "Anxiety", frequency: "frequent" },
            { theme: "Self-doubt", frequency: "occasional" },
          ],
          core_beliefs: [{ belief: "Must do everything perfectly" }],
          silent_rules: [{ rule: "Success requires constant effort", rigidity: "rigid" }],
          behavioral_patterns: [{ type: "perfectionism", severity: "moderate" }],
          state: "returning",
          therapeutic_readiness: "ready",
          update_memory: true,
          recall_memory: false,
        },
        {
          core_module: "cognitive",
          process_module: "core_beliefs",
          utility_module: null,
          intensity: "high",
          crisis: "moderate",
          distortions: [
            { type: "Catastrophizing", severity: "severe" },
            { type: "Mind reading", severity: "moderate" },
          ],
          themes: [
            { theme: "Anxiety", frequency: "pervasive" },
            { theme: "Isolation", frequency: "frequent" },
          ],
          core_beliefs: [{ belief: "Not deserving of success" }],
          silent_rules: [{ rule: "Don't express disagreement", rigidity: "moderate" }],
          behavioral_patterns: [{ type: "avoidance", severity: "severe" }],
          state: "established",
          therapeutic_readiness: "engaged",
          update_memory: false,
          recall_memory: true,
        },
        {
          core_module: null,
          process_module: "behavioral_activation",
          utility_module: "mindfulness",
          intensity: "low",
          crisis: "none",
          distortions: [{ type: "Mind reading", severity: "mild" }],
          themes: [{ theme: "Growth", frequency: "occasional" }],
          core_beliefs: [{ belief: "Must do everything perfectly" }],
          silent_rules: [{ rule: "Success requires constant effort", rigidity: "rigid" }],
          behavioral_patterns: [{ type: "procrastination", severity: "mild" }],
          state: "first_time",
          therapeutic_readiness: "ambivalent",
          update_memory: true,
          recall_memory: false,
        },
      ];

      const result = combineToSessionAnalysis(analyses);

      // Should take highest intensity
      expect(result.intensity).toBe("high");

      // Should take highest crisis level
      expect(result.crisis).toBe("moderate");

      // Should aggregate distortions with counts
      expect(result.distortions).toHaveLength(3);
      const catastrophizing = result.distortions.find((d) => d.type === "Catastrophizing");
      const mindReading = result.distortions.find((d) => d.type === "Mind reading");
      const allOrNothing = result.distortions.find((d) => d.type === "All-or-nothing");

      expect(catastrophizing?.count).toBe(2);
      expect(mindReading?.count).toBe(2);
      expect(allOrNothing?.count).toBe(1);

      // Should aggregate themes with counts - we have 4 unique themes total
      expect(result.themes).toHaveLength(4);
      const anxiety = result.themes.find((t) => t.theme === "Anxiety");
      expect(anxiety?.count).toBe(2);

      // Should aggregate core beliefs with counts
      expect(result.core_beliefs).toHaveLength(2);
      const perfectionism = result.core_beliefs.find((cb) => cb.belief === "Must do everything perfectly");
      expect(perfectionism?.count).toBe(2);

      // Should aggregate silent rules with counts
      expect(result.silent_rules).toHaveLength(2);
      const workHarder = result.silent_rules.find((sr) => sr.rule === "Success requires constant effort");
      expect(workHarder?.count).toBe(2);
    });

    it("should handle single analysis correctly", () => {
      const singleAnalysis: TherapeuticAnalysis[] = [
        {
          core_module: "cognitive",
          process_module: null,
          utility_module: null,
          intensity: "moderate",
          crisis: "mild",
          distortions: [{ type: "Overgeneralization", severity: "moderate" }],
          themes: [{ theme: "Stress", frequency: "frequent" }],
          core_beliefs: [{ belief: "Must control everything" }],
          silent_rules: [{ rule: "Don't show weakness", rigidity: "rigid" }],
          behavioral_patterns: [{ type: "perfectionism", severity: "moderate" }],
          state: "returning",
          therapeutic_readiness: "ready",
          update_memory: true,
          recall_memory: false,
        },
      ];

      const result = combineToSessionAnalysis(singleAnalysis);

      expect(result.intensity).toBe("moderate");
      expect(result.crisis).toBe("mild");
      expect(result.distortions).toHaveLength(1);
      expect(result.distortions[0].count).toBe(1);
      expect(result.themes).toHaveLength(1);
      expect(result.themes[0].count).toBe(1);
      expect(result.core_beliefs).toHaveLength(1);
      expect(result.core_beliefs[0].count).toBe(1);
      expect(result.silent_rules).toHaveLength(1);
      expect(result.silent_rules[0].count).toBe(1);
    });

    it("should handle all intensity levels correctly", () => {
      const lowIntensity: TherapeuticAnalysis[] = [
        {
          core_module: null,
          process_module: null,
          utility_module: null,
          intensity: "low",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "first_time",
          therapeutic_readiness: "resistant",
          update_memory: false,
          recall_memory: false,
        },
      ];

      const moderateIntensity: TherapeuticAnalysis[] = [
        {
          core_module: null,
          process_module: null,
          utility_module: null,
          intensity: "moderate",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "returning",
          therapeutic_readiness: "ambivalent",
          update_memory: false,
          recall_memory: false,
        },
      ];

      const highIntensity: TherapeuticAnalysis[] = [
        {
          core_module: null,
          process_module: null,
          utility_module: null,
          intensity: "high",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "established",
          therapeutic_readiness: "engaged",
          update_memory: false,
          recall_memory: false,
        },
      ];

      expect(combineToSessionAnalysis(lowIntensity).intensity).toBe("low");
      expect(combineToSessionAnalysis(moderateIntensity).intensity).toBe("moderate");
      expect(combineToSessionAnalysis(highIntensity).intensity).toBe("high");
    });

    it("should handle all crisis levels correctly", () => {
      const crisisLevels: CrisisLevel[] = ["none", "mild", "moderate", "high", "immediate"];

      crisisLevels.forEach((level) => {
        const analysis: TherapeuticAnalysis[] = [
          {
            core_module: null,
            process_module: null,
            utility_module: null,
            intensity: "low",
            crisis: level,
            distortions: [],
            themes: [],
            core_beliefs: [],
            silent_rules: [],
            behavioral_patterns: [],
            state: "first_time",
            therapeutic_readiness: "resistant",
            update_memory: false,
            recall_memory: false,
          },
        ];

        expect(combineToSessionAnalysis(analysis).crisis).toBe(level);
      });
    });

    it("should prioritize higher crisis levels correctly", () => {
      const analyses: TherapeuticAnalysis[] = [
        {
          core_module: null,
          process_module: null,
          utility_module: null,
          intensity: "low",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "first_time",
          therapeutic_readiness: "resistant",
          update_memory: false,
          recall_memory: false,
        },
        {
          core_module: null,
          process_module: null,
          utility_module: null,
          intensity: "low",
          crisis: "immediate",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "first_time",
          therapeutic_readiness: "resistant",
          update_memory: false,
          recall_memory: false,
        },
        {
          core_module: null,
          process_module: null,
          utility_module: null,
          intensity: "low",
          crisis: "moderate",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "first_time",
          therapeutic_readiness: "resistant",
          update_memory: false,
          recall_memory: false,
        },
      ];

      const result = combineToSessionAnalysis(analyses);
      expect(result.crisis).toBe("immediate");
    });

    it("should handle empty arrays in therapeutic data", () => {
      const analyses: TherapeuticAnalysis[] = [
        {
          core_module: null,
          process_module: null,
          utility_module: null,
          intensity: "low",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "first_time",
          therapeutic_readiness: "resistant",
          update_memory: false,
          recall_memory: false,
        },
        {
          core_module: null,
          process_module: null,
          utility_module: null,
          intensity: "moderate",
          crisis: "mild",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "returning",
          therapeutic_readiness: "ambivalent",
          update_memory: false,
          recall_memory: false,
        },
      ];

      const result = combineToSessionAnalysis(analyses);

      expect(result.intensity).toBe("moderate");
      expect(result.crisis).toBe("mild");
      expect(result.distortions).toEqual([]);
      expect(result.themes).toEqual([]);
      expect(result.core_beliefs).toEqual([]);
      expect(result.silent_rules).toEqual([]);
    });

    it("should handle complex object aggregation correctly", () => {
      const analyses: TherapeuticAnalysis[] = [
        {
          core_module: "cognitive",
          process_module: null,
          utility_module: null,
          intensity: "low",
          crisis: "none",
          distortions: [
            {
              type: "Complex Distortion",
              severity: "moderate",
            },
          ],
          themes: [
            {
              theme: "Complex Theme",
              frequency: "frequent",
            },
          ],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "first_time",
          therapeutic_readiness: "resistant",
          update_memory: false,
          recall_memory: false,
        },
        {
          core_module: "cognitive",
          process_module: null,
          utility_module: null,
          intensity: "moderate",
          crisis: "mild",
          distortions: [
            {
              type: "Complex Distortion",
              severity: "moderate",
            },
          ],
          themes: [
            {
              theme: "Different Theme",
              frequency: "occasional",
            },
          ],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "returning",
          therapeutic_readiness: "ambivalent",
          update_memory: false,
          recall_memory: false,
        },
      ];

      const result = combineToSessionAnalysis(analyses);

      // Complex objects should be aggregated by their JSON representation
      expect(result.distortions).toHaveLength(1);
      expect(result.distortions[0].count).toBe(2);
      expect(result.distortions[0].type).toBe("Complex Distortion");
      expect(result.distortions[0]).toHaveProperty("severity", "moderate");

      expect(result.themes).toHaveLength(2);
      const complexTheme = result.themes.find((t) => t.theme === "Complex Theme");
      const differentTheme = result.themes.find((t) => t.theme === "Different Theme");
      expect(complexTheme?.count).toBe(1);
      expect(differentTheme?.count).toBe(1);
    });

    it("should throw error for empty analyses array", () => {
      expect(() => combineToSessionAnalysis([])).toThrow("No analyses provided");
    });

    it("should throw error for null/undefined analyses", () => {
      expect(() => combineToSessionAnalysis(null as any)).toThrow("No analyses provided");
      expect(() => combineToSessionAnalysis(undefined as any)).toThrow("No analyses provided");
    });

    it("should handle real-world session analysis scenario", () => {
      // Simulating a therapy session with multiple analysis points
      const sessionAnalyses: TherapeuticAnalysis[] = [
        // Beginning of session - mild anxiety
        {
          core_module: "cognitive",
          process_module: null,
          utility_module: "mindfulness",
          intensity: "low",
          crisis: "none",
          distortions: [{ type: "Anticipatory Anxiety", severity: "mild" }],
          themes: [{ theme: "Work Stress", frequency: "frequent" }],
          core_beliefs: [{ belief: "Must excel at everything" }],
          silent_rules: [{ rule: "Must be perfectly prepared", rigidity: "rigid" }],
          behavioral_patterns: [{ type: "perfectionism", severity: "moderate" }],
          state: "returning",
          therapeutic_readiness: "ready",
          update_memory: true,
          recall_memory: false,
        },
        // Middle of session - processing deeper issues
        {
          core_module: "cognitive",
          process_module: "core_beliefs",
          utility_module: null,
          intensity: "moderate",
          crisis: "mild",
          distortions: [
            { type: "Anticipatory Anxiety", severity: "moderate" },
            { type: "Catastrophizing", severity: "severe" },
            { type: "Imposter Syndrome", severity: "moderate" },
          ],
          themes: [
            { theme: "Work Stress", frequency: "pervasive" },
            { theme: "Self-Worth", frequency: "frequent" },
          ],
          core_beliefs: [{ belief: "Must excel at everything" }, { belief: "Not good enough as others" }],
          silent_rules: [
            { rule: "Must be perfectly prepared", rigidity: "rigid" },
            { rule: "Don't let others see struggles", rigidity: "moderate" },
          ],
          behavioral_patterns: [{ type: "avoidance", severity: "severe" }],
          state: "established",
          therapeutic_readiness: "engaged",
          update_memory: false,
          recall_memory: true,
        },
        // End of session - breakthrough moment
        {
          core_module: null,
          process_module: "behavioral_activation",
          utility_module: "mindfulness",
          intensity: "high",
          crisis: "moderate",
          distortions: [
            { type: "Catastrophizing", severity: "severe" },
            { type: "All-or-Nothing", severity: "moderate" },
          ],
          themes: [
            { theme: "Self-Worth", frequency: "pervasive" },
            { theme: "Childhood Patterns", frequency: "occasional" },
          ],
          core_beliefs: [{ belief: "Not good enough as others" }, { belief: "Others will leave if I'm not perfect" }],
          silent_rules: [
            { rule: "Don't let others see struggles", rigidity: "rigid" },
            { rule: "Keep feelings to yourself", rigidity: "rigid" },
          ],
          behavioral_patterns: [{ type: "isolation", severity: "severe" }],
          state: "established",
          therapeutic_readiness: "engaged",
          update_memory: true,
          recall_memory: true,
        },
      ];

      const result = combineToSessionAnalysis(sessionAnalyses);

      // Should capture the peak emotional intensity
      expect(result.intensity).toBe("high");

      // Should capture the highest crisis level reached
      expect(result.crisis).toBe("moderate");

      // Should have aggregated all unique distortions with proper counts
      expect(result.distortions).toHaveLength(4);
      expect(result.distortions.find((d) => d.type === "Anticipatory Anxiety")?.count).toBe(2);
      expect(result.distortions.find((d) => d.type === "Catastrophizing")?.count).toBe(2);
      expect(result.distortions.find((d) => d.type === "Imposter Syndrome")?.count).toBe(1);
      expect(result.distortions.find((d) => d.type === "All-or-Nothing")?.count).toBe(1);

      // Should have aggregated themes properly - we have 3 unique themes total
      expect(result.themes).toHaveLength(3);
      expect(result.themes.find((t) => t.theme === "Work Stress")?.count).toBe(2);
      expect(result.themes.find((t) => t.theme === "Self-Worth")?.count).toBe(2);
      expect(result.themes.find((t) => t.theme === "Childhood Patterns")?.count).toBe(1);

      // Should have aggregated core beliefs
      expect(result.core_beliefs).toHaveLength(3);
      expect(result.core_beliefs.find((cb) => cb.belief === "Must excel at everything")?.count).toBe(2);
      expect(result.core_beliefs.find((cb) => cb.belief === "Not good enough as others")?.count).toBe(2);
      expect(result.core_beliefs.find((cb) => cb.belief === "Others will leave if I'm not perfect")?.count).toBe(1);

      // Should have aggregated silent rules
      expect(result.silent_rules).toHaveLength(3);
      expect(result.silent_rules.find((sr) => sr.rule === "Must be perfectly prepared")?.count).toBe(2);
      expect(result.silent_rules.find((sr) => sr.rule === "Don't let others see struggles")?.count).toBe(2);
      expect(result.silent_rules.find((sr) => sr.rule === "Keep feelings to yourself")?.count).toBe(1);
    });

    it("should handle edge case with identical objects", () => {
      const identicalDistortion = { type: "Test", severity: "mild" as const };
      const identicalTheme = { theme: "Test", frequency: "occasional" as const };
      const identicalCoreBelief = { belief: "Test belief" };

      const analyses: TherapeuticAnalysis[] = [
        {
          core_module: null,
          process_module: null,
          utility_module: null,
          intensity: "low",
          crisis: "none",
          distortions: [identicalDistortion, identicalDistortion],
          themes: [identicalTheme],
          core_beliefs: [identicalCoreBelief, identicalCoreBelief, identicalCoreBelief],
          silent_rules: [],
          behavioral_patterns: [],
          state: "first_time",
          therapeutic_readiness: "resistant",
          update_memory: false,
          recall_memory: false,
        },
      ];

      const result = combineToSessionAnalysis(analyses);

      expect(result.distortions).toHaveLength(1);
      expect(result.distortions[0].count).toBe(2);

      expect(result.themes).toHaveLength(1);
      expect(result.themes[0].count).toBe(1);

      expect(result.core_beliefs).toHaveLength(1);
      expect(result.core_beliefs[0].count).toBe(3);

      expect(result.silent_rules).toEqual([]);
    });

    it("should maintain data integrity during aggregation", () => {
      const analyses: TherapeuticAnalysis[] = [
        {
          core_module: "cognitive",
          process_module: null,
          utility_module: null,
          intensity: "moderate",
          crisis: "mild",
          distortions: [
            {
              type: "Test Distortion",
              severity: "moderate",
            },
          ],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "returning",
          therapeutic_readiness: "ready",
          update_memory: false,
          recall_memory: false,
        },
        {
          core_module: "cognitive",
          process_module: null,
          utility_module: null,
          intensity: "low",
          crisis: "none",
          distortions: [
            {
              type: "Test Distortion",
              severity: "moderate",
            },
          ],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "first_time",
          therapeutic_readiness: "ambivalent",
          update_memory: false,
          recall_memory: false,
        },
      ];

      const result = combineToSessionAnalysis(analyses);

      expect(result.distortions).toHaveLength(1);
      expect(result.distortions[0].count).toBe(2);
      expect(result.distortions[0].type).toBe("Test Distortion");
      expect(result.distortions[0].severity).toBe("moderate");
    });
  });
});

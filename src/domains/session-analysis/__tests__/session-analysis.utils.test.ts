/**
 * Unit tests for session analysis utilities
 * Critical analytical accuracy - tests analysis aggregation and processing
 */

import { describe, expect, it } from "vitest";

import { CrisisLevel, EmotionalIntensity } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { SessionAnalysis } from "../session-analysis.types";
import { combineToSessionAnalysis } from "../session-analysis.utils";

// Simple TherapeuticAnalysis type used by combineToSessionAnalysis
type SimpleTherapeuticAnalysis = {
  intensity: EmotionalIntensity;
  crisis: CrisisLevel;
  distortions: Array<{ [key: string]: any }>;
  themes: Array<{ [key: string]: any }>;
  core_beliefs: Array<{ [key: string]: any }>;
  silent_rules: Array<{ [key: string]: any }>;
};

describe("Session Analysis Utils", () => {
  describe("combineToSessionAnalysis", () => {
    it("should combine multiple therapeutic analyses correctly", () => {
      const analyses: SimpleTherapeuticAnalysis[] = [
        {
          intensity: "moderate",
          crisis: "mild",
          distortions: [
            { name: "Catastrophizing", description: "Expecting worst case scenarios" },
            { name: "All-or-nothing", description: "Black and white thinking" },
          ],
          themes: [
            { name: "Anxiety", description: "Work-related stress" },
            { name: "Self-doubt", description: "Questioning abilities" },
          ],
          core_beliefs: [{ name: "Perfectionism", description: "Must do everything perfectly" }],
          silent_rules: [{ name: "Work harder", description: "Success requires constant effort" }],
        },
        {
          intensity: "high",
          crisis: "moderate",
          distortions: [
            { name: "Catastrophizing", description: "Expecting worst case scenarios" },
            { name: "Mind reading", description: "Assuming others' thoughts" },
          ],
          themes: [
            { name: "Anxiety", description: "Work-related stress" },
            { name: "Isolation", description: "Withdrawing from others" },
          ],
          core_beliefs: [{ name: "Unworthiness", description: "Not deserving of success" }],
          silent_rules: [{ name: "Avoid conflict", description: "Don't express disagreement" }],
        },
        {
          intensity: "low",
          crisis: "none",
          distortions: [{ name: "Mind reading", description: "Assuming others' thoughts" }],
          themes: [{ name: "Growth", description: "Learning new skills" }],
          core_beliefs: [{ name: "Perfectionism", description: "Must do everything perfectly" }],
          silent_rules: [{ name: "Work harder", description: "Success requires constant effort" }],
        },
      ];

      const result = combineToSessionAnalysis(analyses);

      // Should take highest intensity
      expect(result.intensity).toBe("high");

      // Should take highest crisis level
      expect(result.crisis).toBe("moderate");

      // Should aggregate distortions with counts
      expect(result.distortions).toHaveLength(3);
      const catastrophizing = result.distortions.find((d) => d.name === "Catastrophizing");
      const mindReading = result.distortions.find((d) => d.name === "Mind reading");
      const allOrNothing = result.distortions.find((d) => d.name === "All-or-nothing");

      expect(catastrophizing?.count).toBe(2);
      expect(mindReading?.count).toBe(2);
      expect(allOrNothing?.count).toBe(1);

      // Should aggregate themes with counts - we have 4 unique themes total
      expect(result.themes).toHaveLength(4);
      const anxiety = result.themes.find((t) => t.name === "Anxiety");
      expect(anxiety?.count).toBe(2);

      // Should aggregate core beliefs with counts
      expect(result.core_beliefs).toHaveLength(2);
      const perfectionism = result.core_beliefs.find((cb) => cb.name === "Perfectionism");
      expect(perfectionism?.count).toBe(2);

      // Should aggregate silent rules with counts
      expect(result.silent_rules).toHaveLength(2);
      const workHarder = result.silent_rules.find((sr) => sr.name === "Work harder");
      expect(workHarder?.count).toBe(2);
    });

    it("should handle single analysis correctly", () => {
      const singleAnalysis: SimpleTherapeuticAnalysis[] = [
        {
          intensity: "moderate",
          crisis: "mild",
          distortions: [{ name: "Overgeneralization", description: "Making broad conclusions" }],
          themes: [{ name: "Stress", description: "Workplace pressure" }],
          core_beliefs: [{ name: "Control", description: "Must control everything" }],
          silent_rules: [{ name: "Be strong", description: "Don't show weakness" }],
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
          intensity: "low",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
        },
      ];

      const moderateIntensity: TherapeuticAnalysis[] = [
        {
          intensity: "moderate",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
        },
      ];

      const highIntensity: TherapeuticAnalysis[] = [
        {
          intensity: "high",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
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
            intensity: "low",
            crisis: level,
            distortions: [],
            themes: [],
            core_beliefs: [],
            silent_rules: [],
          },
        ];

        expect(combineToSessionAnalysis(analysis).crisis).toBe(level);
      });
    });

    it("should prioritize higher crisis levels correctly", () => {
      const analyses: TherapeuticAnalysis[] = [
        {
          intensity: "low",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
        },
        {
          intensity: "low",
          crisis: "immediate",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
        },
        {
          intensity: "low",
          crisis: "moderate",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
        },
      ];

      const result = combineToSessionAnalysis(analyses);
      expect(result.crisis).toBe("immediate");
    });

    it("should handle empty arrays in therapeutic data", () => {
      const analyses: TherapeuticAnalysis[] = [
        {
          intensity: "low",
          crisis: "none",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
        },
        {
          intensity: "moderate",
          crisis: "mild",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
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
          intensity: "low",
          crisis: "none",
          distortions: [
            {
              name: "Complex Distortion",
              description: "Multi-faceted thinking pattern",
              severity: "moderate",
              triggers: ["work", "relationships"],
            },
          ],
          themes: [
            {
              name: "Complex Theme",
              description: "Intricate emotional pattern",
              frequency: "daily",
              impact: "significant",
            },
          ],
          core_beliefs: [],
          silent_rules: [],
        },
        {
          intensity: "moderate",
          crisis: "mild",
          distortions: [
            {
              name: "Complex Distortion",
              description: "Multi-faceted thinking pattern",
              severity: "moderate",
              triggers: ["work", "relationships"],
            },
          ],
          themes: [
            {
              name: "Different Theme",
              description: "Another pattern",
              frequency: "weekly",
              impact: "minor",
            },
          ],
          core_beliefs: [],
          silent_rules: [],
        },
      ];

      const result = combineToSessionAnalysis(analyses);

      // Complex objects should be aggregated by their JSON representation
      expect(result.distortions).toHaveLength(1);
      expect(result.distortions[0].count).toBe(2);
      expect(result.distortions[0].name).toBe("Complex Distortion");
      expect(result.distortions[0]).toHaveProperty("severity", "moderate");
      expect(result.distortions[0]).toHaveProperty("triggers");

      expect(result.themes).toHaveLength(2);
      const complexTheme = result.themes.find((t) => t.name === "Complex Theme");
      const differentTheme = result.themes.find((t) => t.name === "Different Theme");
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
          intensity: "low",
          crisis: "none",
          distortions: [{ name: "Anticipatory Anxiety", description: "Worrying about future events" }],
          themes: [{ name: "Work Stress", description: "Upcoming presentation anxiety" }],
          core_beliefs: [{ name: "Performance Standards", description: "Must excel at everything" }],
          silent_rules: [{ name: "Preparation", description: "Must be perfectly prepared" }],
        },
        // Middle of session - processing deeper issues
        {
          intensity: "moderate",
          crisis: "mild",
          distortions: [
            { name: "Anticipatory Anxiety", description: "Worrying about future events" },
            { name: "Catastrophizing", description: "Imagining worst outcomes" },
            { name: "Imposter Syndrome", description: "Feeling like a fraud" },
          ],
          themes: [
            { name: "Work Stress", description: "Upcoming presentation anxiety" },
            { name: "Self-Worth", description: "Questioning personal value" },
          ],
          core_beliefs: [
            { name: "Performance Standards", description: "Must excel at everything" },
            { name: "Inadequacy", description: "Not good enough as others" },
          ],
          silent_rules: [
            { name: "Preparation", description: "Must be perfectly prepared" },
            { name: "Hide Weakness", description: "Don't let others see struggles" },
          ],
        },
        // End of session - breakthrough moment
        {
          intensity: "high",
          crisis: "moderate",
          distortions: [
            { name: "Catastrophizing", description: "Imagining worst outcomes" },
            { name: "All-or-Nothing", description: "Success or complete failure" },
          ],
          themes: [
            { name: "Self-Worth", description: "Questioning personal value" },
            { name: "Childhood Patterns", description: "Repeating family dynamics" },
          ],
          core_beliefs: [
            { name: "Inadequacy", description: "Not good enough as others" },
            { name: "Abandonment Fear", description: "Others will leave if I'm not perfect" },
          ],
          silent_rules: [
            { name: "Hide Weakness", description: "Don't let others see struggles" },
            { name: "Emotional Control", description: "Keep feelings to yourself" },
          ],
        },
      ];

      const result = combineToSessionAnalysis(sessionAnalyses);

      // Should capture the peak emotional intensity
      expect(result.intensity).toBe("high");

      // Should capture the highest crisis level reached
      expect(result.crisis).toBe("moderate");

      // Should have aggregated all unique distortions with proper counts
      expect(result.distortions).toHaveLength(4);
      expect(result.distortions.find((d) => d.name === "Anticipatory Anxiety")?.count).toBe(2);
      expect(result.distortions.find((d) => d.name === "Catastrophizing")?.count).toBe(2);
      expect(result.distortions.find((d) => d.name === "Imposter Syndrome")?.count).toBe(1);
      expect(result.distortions.find((d) => d.name === "All-or-Nothing")?.count).toBe(1);

      // Should have aggregated themes properly - we have 3 unique themes total
      expect(result.themes).toHaveLength(3);
      expect(result.themes.find((t) => t.name === "Work Stress")?.count).toBe(2);
      expect(result.themes.find((t) => t.name === "Self-Worth")?.count).toBe(2);
      expect(result.themes.find((t) => t.name === "Childhood Patterns")?.count).toBe(1);

      // Should have aggregated core beliefs
      expect(result.core_beliefs).toHaveLength(3);
      expect(result.core_beliefs.find((cb) => cb.name === "Performance Standards")?.count).toBe(2);
      expect(result.core_beliefs.find((cb) => cb.name === "Inadequacy")?.count).toBe(2);
      expect(result.core_beliefs.find((cb) => cb.name === "Abandonment Fear")?.count).toBe(1);

      // Should have aggregated silent rules
      expect(result.silent_rules).toHaveLength(3);
      expect(result.silent_rules.find((sr) => sr.name === "Preparation")?.count).toBe(2);
      expect(result.silent_rules.find((sr) => sr.name === "Hide Weakness")?.count).toBe(2);
      expect(result.silent_rules.find((sr) => sr.name === "Emotional Control")?.count).toBe(1);
    });

    it("should handle edge case with identical objects", () => {
      const identicalObject = { name: "Test", description: "Same object" };

      const analyses: TherapeuticAnalysis[] = [
        {
          intensity: "low",
          crisis: "none",
          distortions: [identicalObject, identicalObject],
          themes: [identicalObject],
          core_beliefs: [identicalObject, identicalObject, identicalObject],
          silent_rules: [],
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
          intensity: "moderate",
          crisis: "mild",
          distortions: [
            {
              name: "Test Distortion",
              description: "Original description",
              metadata: { source: "user_input", confidence: 0.85 },
            },
          ],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
        },
        {
          intensity: "low",
          crisis: "none",
          distortions: [
            {
              name: "Test Distortion",
              description: "Original description",
              metadata: { source: "user_input", confidence: 0.85 },
            },
          ],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
        },
      ];

      const result = combineToSessionAnalysis(analyses);

      expect(result.distortions).toHaveLength(1);
      expect(result.distortions[0].count).toBe(2);
      expect(result.distortions[0].description).toBe("Original description");
      expect(result.distortions[0]).toHaveProperty("metadata");
      expect(result.distortions[0].metadata).toEqual({ source: "user_input", confidence: 0.85 });
    });
  });
});

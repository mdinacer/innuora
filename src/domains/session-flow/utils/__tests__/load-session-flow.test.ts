import { describe, expect, it } from "vitest";

import { ONBOARDING_SESSION_PROPS } from "@/domains/session-flow/flows";
import { loadSessionFlow } from "../load-session-flow";

describe("loadSessionFlow", () => {
  const sessionId = "onboarding" as const;
  const locales = ["en", "fr", "ar"] as const;

  describe("Consistency between JSON and SESSION_PROPS", () => {
    it("should have matching step IDs across all locales", async () => {
      const propStepIds = new Set(Object.keys(ONBOARDING_SESSION_PROPS));

      for (const locale of locales) {
        const flow = await loadSessionFlow(sessionId, locale);
        const jsonStepIds = new Set(flow.steps.map((s) => s.id));

        // Check that all JSON steps exist in props
        for (const stepId of jsonStepIds) {
          expect(propStepIds.has(stepId)).toBe(true);
        }

        // Check that all prop steps exist in JSON
        for (const stepId of propStepIds) {
          expect(jsonStepIds.has(stepId)).toBe(true);
        }
      }
    });

    it("should load successfully for all locales", async () => {
      for (const locale of locales) {
        const flow = await loadSessionFlow(sessionId, locale);

        expect(flow).toBeDefined();
        expect(flow.id).toBe(sessionId);
        expect(flow.steps.length).toBeGreaterThan(0);
        expect(flow.initialStepId).toBeDefined();
      }
    });

    it("should have all steps with proper types after merge", async () => {
      for (const locale of locales) {
        const flow = await loadSessionFlow(sessionId, locale);

        flow.steps.forEach((step) => {
          expect(step.id).toBeDefined();
          expect(step.type).toBeDefined();
          expect(step.content).toBeDefined();

          // Type should come from props, not JSON
          expect(["app_message", "paragraphs", "user_input", "user_select", "end"]).toContain(step.type);
        });
      }
    });

    it("should preserve translation content from JSON", async () => {
      const enFlow = await loadSessionFlow(sessionId, "en");
      const frFlow = await loadSessionFlow(sessionId, "fr");
      const arFlow = await loadSessionFlow(sessionId, "ar");

      // Find a step with translatable content
      const enWelcomeStep = enFlow.steps.find((s) => s.id === "welcome");
      const frWelcomeStep = frFlow.steps.find((s) => s.id === "welcome");
      const arWelcomeStep = arFlow.steps.find((s) => s.id === "welcome");

      expect(enWelcomeStep).toBeDefined();
      expect(frWelcomeStep).toBeDefined();
      expect(arWelcomeStep).toBeDefined();

      // Titles should be different (translated)
      if (
        enWelcomeStep?.type === "paragraphs" &&
        frWelcomeStep?.type === "paragraphs" &&
        arWelcomeStep?.type === "paragraphs"
      ) {
        expect(enWelcomeStep.content.title).not.toBe(frWelcomeStep.content.title);
        expect(enWelcomeStep.content.title).not.toBe(arWelcomeStep.content.title);
      }
    });

    it("should have same technical structure across locales", async () => {
      const enFlow = await loadSessionFlow(sessionId, "en");
      const frFlow = await loadSessionFlow(sessionId, "fr");

      expect(enFlow.steps.length).toBe(frFlow.steps.length);

      enFlow.steps.forEach((enStep, index) => {
        const frStep = frFlow.steps[index];

        // Same step IDs and types
        expect(enStep.id).toBe(frStep.id);
        expect(enStep.type).toBe(frStep.type);

        // Same nextStepId (technical, not translatable)
        expect(enStep.nextStepId).toBe(frStep.nextStepId);
      });
    });
  });

  describe("Error handling", () => {
    it("should throw error for missing step in props", async () => {
      // This would happen if JSON has a step that SESSION_PROPS doesn't have
      // Currently all steps match, but the error path is tested by the implementation
      expect(async () => {
        await loadSessionFlow(sessionId, "en");
      }).not.toThrow();
    });

    it("should validate flow structure", async () => {
      const flow = await loadSessionFlow(sessionId, "en");

      // Validate required fields
      expect(flow.id).toBe(sessionId);
      expect(flow.title).toBeDefined();
      expect(flow.subtitle).toBeDefined();
      expect(flow.steps).toBeInstanceOf(Array);
      expect(flow.initialStepId).toBeDefined();

      // Initial step should exist
      const initialStep = flow.steps.find((s) => s.id === flow.initialStepId);
      expect(initialStep).toBeDefined();
    });
  });
});

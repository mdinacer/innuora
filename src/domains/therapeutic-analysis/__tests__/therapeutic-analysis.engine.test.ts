/**
 * Unit tests for therapeutic analysis engine
 * Critical analytical processing - tests AI response parsing and context building
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { parseJsonObject } from "@/lib/utils/parse-json";
import { TherapeuticAnalysisEngine } from "../therapeutic-analysis.engine";
import { TherapeuticAnalysis } from "../therapeutic-analysis.types";

// Mock the parseJsonObject utility
vi.mock("@/lib/utils/parse-json", () => ({
  parseJsonObject: vi.fn(),
}));

const mockParseJsonObject = vi.mocked(parseJsonObject);

describe("TherapeuticAnalysisEngine", () => {
  let engine: TherapeuticAnalysisEngine;

  beforeEach(() => {
    engine = new TherapeuticAnalysisEngine();
    vi.clearAllMocks();
  });

  describe("safeParseTherapeuticAnalysis", () => {
    it("should parse valid therapeutic analysis response", () => {
      const validResponse = `{
        "core_module": "cognitive",
        "process_module": "reframing",
        "utility_module": "validate",
        "intensity": "moderate",
        "crisis": "mild",
        "distortions": [
          {"type": "Catastrophizing", "severity": "moderate"}
        ],
        "themes": [
          {"theme": "Anxiety", "frequency": "frequent"}
        ],
        "core_beliefs": [
          {"belief": "I must be perfect"}
        ],
        "silent_rules": [
          {"rule": "Work harder", "rigidity": "rigid"}
        ],
        "behavioral_patterns": [
          {"type": "avoidance", "severity": "moderate"}
        ],
        "state": "returning",
        "therapeutic_readiness": "ready",
        "update_memory": true,
        "recall_memory": false
      }`;

      const mockParsedObject = {
        core_module: "cognitive",
        process_module: "reframing",
        utility_module: "validate",
        intensity: "moderate",
        crisis: "mild",
        distortions: [{ type: "Catastrophizing", severity: "moderate" }],
        themes: [{ theme: "Anxiety", frequency: "frequent" }],
        core_beliefs: [{ belief: "I must be perfect" }],
        silent_rules: [{ rule: "Work harder", rigidity: "rigid" }],
        behavioral_patterns: [{ type: "avoidance", severity: "moderate" }],
        state: "returning",
        therapeutic_readiness: "ready",
        update_memory: true,
        recall_memory: false,
      };

      mockParseJsonObject.mockReturnValue(mockParsedObject);

      const result = engine.safeParseTherapeuticAnalysis(validResponse);

      expect(mockParseJsonObject).toHaveBeenCalledWith(validResponse);
      expect(result).toEqual(mockParsedObject);
      expect(result?.intensity).toBe("moderate");
      expect(result?.crisis).toBe("mild");
      expect(result?.distortions).toHaveLength(1);
      expect(result?.themes).toHaveLength(1);
      expect(result?.core_beliefs).toHaveLength(1);
      expect(result?.silent_rules).toHaveLength(1);
    });

    it("should handle JSON parsing errors gracefully", () => {
      const invalidResponse = "invalid json response";

      mockParseJsonObject.mockImplementation(() => {
        throw new Error("JSON parsing failed");
      });

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = engine.safeParseTherapeuticAnalysis(invalidResponse);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("Failed to parse AI response:", expect.any(Error));

      consoleSpy.mockRestore();
    });

    it("should handle schema validation errors gracefully", () => {
      const responseWithInvalidSchema = `{
        "intensity": "invalid_intensity",
        "crisis": "unknown_crisis",
        "distortions": "not_an_array",
        "themes": [],
        "core_beliefs": [],
        "silent_rules": []
      }`;

      const mockParsedObject = {
        intensity: "invalid_intensity",
        crisis: "unknown_crisis",
        distortions: "not_an_array",
        themes: [],
        core_beliefs: [],
        silent_rules: [],
      };

      mockParseJsonObject.mockReturnValue(mockParsedObject);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = engine.safeParseTherapeuticAnalysis(responseWithInvalidSchema);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("TherapeuticAnalysis validation failed:", expect.any(Object));

      consoleSpy.mockRestore();
    });

    it("should handle missing required fields", () => {
      const incompleteResponse = `{
        "intensity": "moderate",
        "crisis": "mild"
      }`;

      const mockParsedObject = {
        intensity: "moderate",
        crisis: "mild",
      };

      mockParseJsonObject.mockReturnValue(mockParsedObject);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = engine.safeParseTherapeuticAnalysis(incompleteResponse);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("TherapeuticAnalysis validation failed:", expect.any(Object));

      consoleSpy.mockRestore();
    });

    it("should handle edge case intensity and crisis levels", () => {
      const edgeCaseResponse = `{
        "core_module": null,
        "process_module": null,
        "utility_module": null,
        "intensity": "high",
        "crisis": "immediate",
        "distortions": [],
        "themes": [],
        "core_beliefs": [],
        "silent_rules": [],
        "behavioral_patterns": [],
        "state": "first_time",
        "therapeutic_readiness": "resistant",
        "update_memory": false,
        "recall_memory": false
      }`;

      const mockParsedObject = {
        core_module: null,
        process_module: null,
        utility_module: null,
        intensity: "high",
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
      };

      mockParseJsonObject.mockReturnValue(mockParsedObject);

      const result = engine.safeParseTherapeuticAnalysis(edgeCaseResponse);

      expect(result).not.toBeNull();
      expect(result?.intensity).toBe("high");
      expect(result?.crisis).toBe("immediate");
      expect(result?.distortions).toEqual([]);
      expect(result?.themes).toEqual([]);
      expect(result?.core_beliefs).toEqual([]);
      expect(result?.silent_rules).toEqual([]);
    });

    it("should handle complex therapeutic data structures", () => {
      const complexResponse = `{
        "core_module": "core_beliefs",
        "process_module": "cognitive",
        "utility_module": "psychoeducation",
        "intensity": "moderate",
        "crisis": "mild",
        "distortions": [
          {
            "type": "Catastrophizing",
            "severity": "severe"
          },
          {
            "type": "Mind Reading",
            "severity": "moderate"
          }
        ],
        "themes": [
          {
            "theme": "Performance Anxiety",
            "frequency": "pervasive"
          }
        ],
        "core_beliefs": [
          {
            "belief": "I must be perfect"
          }
        ],
        "silent_rules": [
          {
            "rule": "Never show weakness",
            "rigidity": "rigid"
          }
        ],
        "behavioral_patterns": [
          {
            "type": "perfectionism",
            "severity": "severe"
          },
          {
            "type": "avoidance",
            "severity": "moderate"
          }
        ],
        "state": "established",
        "therapeutic_readiness": "engaged",
        "update_memory": true,
        "recall_memory": true
      }`;

      const mockParsedObject = {
        core_module: "core_beliefs",
        process_module: "cognitive",
        utility_module: "psychoeducation",
        intensity: "moderate",
        crisis: "mild",
        distortions: [
          {
            type: "Catastrophizing",
            severity: "severe",
          },
          {
            type: "Mind Reading",
            severity: "moderate",
          },
        ],
        themes: [
          {
            theme: "Performance Anxiety",
            frequency: "pervasive",
          },
        ],
        core_beliefs: [
          {
            belief: "I must be perfect",
          },
        ],
        silent_rules: [
          {
            rule: "Never show weakness",
            rigidity: "rigid",
          },
        ],
        behavioral_patterns: [
          {
            type: "perfectionism",
            severity: "severe",
          },
          {
            type: "avoidance",
            severity: "moderate",
          },
        ],
        state: "established",
        therapeutic_readiness: "engaged",
        update_memory: true,
        recall_memory: true,
      };

      mockParseJsonObject.mockReturnValue(mockParsedObject);

      const result = engine.safeParseTherapeuticAnalysis(complexResponse);

      expect(result).not.toBeNull();
      expect(result?.distortions).toHaveLength(2);
      expect(result?.distortions[0]).toHaveProperty("severity", "severe");
      expect(result?.themes[0]).toHaveProperty("frequency", "pervasive");
      expect(result?.behavioral_patterns).toHaveLength(2);
      expect(result?.behavioral_patterns[0].type).toBe("perfectionism");
    });
  });

  describe("getAnalysisContextPrompt", () => {
    it("should create initial context prompt with no previous data", () => {
      const userInput = "I'm feeling anxious about my upcoming presentation.";
      const prevData: TherapeuticAnalysis[] = [];
      const sessionMetadata = {
        messageCount: 3,
        activeDurationMs: 180000, // 3 minutes
      };

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = engine.getAnalysisContextPrompt(userInput, prevData, sessionMetadata);

      expect(result.role).toBe("user");
      expect(typeof result.content).toBe("string");

      const content = JSON.parse(result.content as string);
      expect(content).toHaveProperty("current_message", userInput.trim());
      expect(content).toHaveProperty("session_context");
      expect(content.session_context).toEqual({
        message_count: 3,
        active_duration_minutes: 3,
      });

      expect(consoleSpy).toHaveBeenCalledWith("prevData", prevData);

      consoleSpy.mockRestore();
    });

    it("should create initial context prompt without session metadata", () => {
      const userInput = "I feel overwhelmed by work.";
      const prevData: TherapeuticAnalysis[] = [];

      const result = engine.getAnalysisContextPrompt(userInput, prevData);

      expect(result.role).toBe("user");

      const content = JSON.parse(result.content as string);
      expect(content).toHaveProperty("current_message", userInput.trim());
      expect(content).not.toHaveProperty("session_context");
    });

    it("should handle whitespace in user input", () => {
      const userInput = "  \n  I'm struggling with anxiety.  \n  ";
      const prevData: TherapeuticAnalysis[] = [];

      const result = engine.getAnalysisContextPrompt(userInput, prevData);

      const content = JSON.parse(result.content as string);
      expect(content.current_message).toBe("I'm struggling with anxiety.");
    });

    it("should create continuation context with previous data", () => {
      const userInput = "The anxiety is getting worse.";
      const prevData: TherapeuticAnalysis[] = [
        {
          core_module: "cognitive",
          process_module: "reframing",
          utility_module: "validate",
          intensity: "moderate",
          crisis: "mild",
          distortions: [{ type: "Catastrophizing", severity: "moderate" }],
          themes: [{ theme: "Work Stress", frequency: "frequent" }],
          core_beliefs: [{ belief: "Must be perfect" }],
          silent_rules: [{ rule: "Work harder", rigidity: "rigid" }],
          behavioral_patterns: [],
          state: "returning",
          therapeutic_readiness: "ready",
          update_memory: true,
          recall_memory: false,
        },
      ];
      const sessionMetadata = {
        messageCount: 8,
        activeDurationMs: 600000, // 10 minutes
      };

      const result = engine.getAnalysisContextPrompt(userInput, prevData, sessionMetadata);

      expect(result.role).toBe("user");
      expect(typeof result.content).toBe("string");

      // For continuation prompts, the structure includes previous context
      const content = JSON.parse(result.content as string);
      expect(content).toHaveProperty("current_message", userInput.trim());
      expect(content).toHaveProperty("previous_analyses");
      expect(content.previous_analyses).toHaveProperty("recentAnalyses");
      expect(content).toHaveProperty("session_context");
      expect(content.session_context).toEqual({
        message_count: 8,
        active_duration_minutes: 10,
      });
    });

    it("should handle multiple previous analyses", () => {
      const userInput = "I had a breakthrough moment.";
      const prevData: TherapeuticAnalysis[] = [
        {
          core_module: "behavioral",
          process_module: null,
          utility_module: "guidance",
          intensity: "low",
          crisis: "none",
          distortions: [],
          themes: [{ theme: "Growth", frequency: "occasional" }],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "returning",
          therapeutic_readiness: "ready",
          update_memory: false,
          recall_memory: true,
        },
        {
          core_module: "core_beliefs",
          process_module: "cognitive",
          utility_module: "validate",
          intensity: "moderate",
          crisis: "mild",
          distortions: [{ type: "Self-doubt", severity: "moderate" }],
          themes: [{ theme: "Confidence", frequency: "frequent" }],
          core_beliefs: [{ belief: "I am valuable" }],
          silent_rules: [],
          behavioral_patterns: [],
          state: "established",
          therapeutic_readiness: "engaged",
          update_memory: true,
          recall_memory: false,
        },
      ];

      const result = engine.getAnalysisContextPrompt(userInput, prevData);

      const content = JSON.parse(result.content as string);
      expect(content.previous_analyses).toHaveProperty("recentAnalyses");
      expect(content.previous_analyses.recentAnalyses).toHaveLength(2);
      expect(content.previous_analyses.recentAnalyses[0].intensity).toBe("low");
      expect(content.previous_analyses.recentAnalyses[1].intensity).toBe("moderate");
    });

    it("should handle edge case duration calculations", () => {
      const userInput = "Quick check-in.";
      const prevData: TherapeuticAnalysis[] = [];

      // Test very short duration
      const shortDuration = {
        messageCount: 1,
        activeDurationMs: 30000, // 30 seconds
      };

      const result1 = engine.getAnalysisContextPrompt(userInput, prevData, shortDuration);
      const content1 = JSON.parse(result1.content as string);
      expect(content1.session_context.active_duration_minutes).toBe(1); // Rounded to 1 minute

      // Test very long duration
      const longDuration = {
        messageCount: 50,
        activeDurationMs: 3600000, // 1 hour
      };

      const result2 = engine.getAnalysisContextPrompt(userInput, prevData, longDuration);
      const content2 = JSON.parse(result2.content as string);
      expect(content2.session_context.active_duration_minutes).toBe(60);

      // Test fractional duration rounding
      const fractionalDuration = {
        messageCount: 10,
        activeDurationMs: 150000, // 2.5 minutes
      };

      const result3 = engine.getAnalysisContextPrompt(userInput, prevData, fractionalDuration);
      const content3 = JSON.parse(result3.content as string);
      expect(content3.session_context.active_duration_minutes).toBe(3); // Rounded to 3 minutes
    });

    it("should handle empty user input", () => {
      const userInput = "";
      const prevData: TherapeuticAnalysis[] = [];

      const result = engine.getAnalysisContextPrompt(userInput, prevData);

      const content = JSON.parse(result.content as string);
      expect(content.current_message).toBe("");
    });

    it("should handle zero message count and duration", () => {
      const userInput = "First message.";
      const prevData: TherapeuticAnalysis[] = [];
      const sessionMetadata = {
        messageCount: 0,
        activeDurationMs: 0,
      };

      const result = engine.getAnalysisContextPrompt(userInput, prevData, sessionMetadata);

      const content = JSON.parse(result.content as string);
      expect(content.session_context).toEqual({
        message_count: 0,
        active_duration_minutes: 0,
      });
    });

    it("should maintain consistent structure for analysis continuity", () => {
      const userInput = "Testing consistency.";
      const prevData: TherapeuticAnalysis[] = [
        {
          core_module: "pattern",
          process_module: "mindfulness",
          utility_module: "psychoeducation",
          intensity: "high",
          crisis: "moderate",
          distortions: [{ type: "Test", severity: "moderate" }],
          themes: [{ theme: "Test", frequency: "frequent" }],
          core_beliefs: [{ belief: "Test belief" }],
          silent_rules: [{ rule: "Test rule", rigidity: "moderate" }],
          behavioral_patterns: [{ type: "rumination", severity: "moderate" }],
          state: "established",
          therapeutic_readiness: "engaged",
          update_memory: true,
          recall_memory: true,
        },
      ];

      const result = engine.getAnalysisContextPrompt(userInput, prevData);

      expect(result.role).toBe("user");
      expect(typeof result.content).toBe("string");

      const content = JSON.parse(result.content as string);
      expect(content).toHaveProperty("current_message");
      expect(content).toHaveProperty("previous_analyses");
      expect(content.previous_analyses).toHaveProperty("recentAnalyses");
      expect(Array.isArray(content.previous_analyses.recentAnalyses)).toBe(true);
    });
  });
});

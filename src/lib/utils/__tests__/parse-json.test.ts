/**
 * Unit tests for JSON parsing utilities
 * Critical data parsing - tests AI response extraction and validation
 */

import { describe, expect, it, vi } from "vitest";

import { parseJsonObject } from "../parse-json";

describe("JSON Parsing Utilities", () => {
  describe("parseJsonObject", () => {
    it("should parse valid JSON object", () => {
      const validJson = `{
        "name": "Test Object",
        "value": 42,
        "active": true,
        "items": ["item1", "item2"],
        "metadata": {
          "created": "2024-01-01",
          "tags": ["test", "parsing"]
        }
      }`;

      const result = parseJsonObject(validJson);

      expect(result).toEqual({
        name: "Test Object",
        value: 42,
        active: true,
        items: ["item1", "item2"],
        metadata: {
          created: "2024-01-01",
          tags: ["test", "parsing"],
        },
      });
    });

    it("should parse JSON wrapped in markdown code blocks", () => {
      const markdownWrappedJson = `Here's the analysis result:

\`\`\`json
{
  "analysis": "User shows signs of anxiety",
  "confidence": 0.85,
  "recommendations": ["breathing exercises", "mindfulness"]
}
\`\`\`

This completes the analysis.`;

      const result = parseJsonObject(markdownWrappedJson);

      expect(result).toEqual({
        analysis: "User shows signs of anxiety",
        confidence: 0.85,
        recommendations: ["breathing exercises", "mindfulness"],
      });
    });

    it("should extract JSON from mixed content", () => {
      const mixedContent = `
        The analysis reveals the following insights:
        
        {
          "emotional_state": "anxious",
          "intensity": "moderate",
          "triggers": ["work deadlines", "social events"],
          "coping_strategies": {
            "current": ["deep breathing"],
            "recommended": ["progressive muscle relaxation", "journaling"]
          }
        }
        
        Please review these findings carefully.
      `;

      const result = parseJsonObject(mixedContent);

      expect(result).toEqual({
        emotional_state: "anxious",
        intensity: "moderate",
        triggers: ["work deadlines", "social events"],
        coping_strategies: {
          current: ["deep breathing"],
          recommended: ["progressive muscle relaxation", "journaling"],
        },
      });
    });

    it("should handle nested complex objects", () => {
      const complexJson = `{
        "therapeutic_analysis": {
          "session_id": "sess_123",
          "user_profile": {
            "demographics": {
              "age_range": "25-35",
              "occupation": "software_engineer"
            },
            "history": {
              "previous_sessions": 5,
              "recurring_themes": ["work_stress", "perfectionism"]
            }
          },
          "current_analysis": {
            "mood": {
              "primary": "anxious",
              "secondary": ["overwhelmed", "frustrated"],
              "intensity_scale": 7
            },
            "cognitive_patterns": {
              "distortions": [
                {
                  "type": "catastrophizing",
                  "examples": ["What if I fail the presentation?", "Everyone will think I'm incompetent"],
                  "frequency": "daily"
                },
                {
                  "type": "all_or_nothing",
                  "examples": ["I have to be perfect or I'm a failure"],
                  "frequency": "weekly"
                }
              ],
              "thought_patterns": {
                "rumination": true,
                "future_focused_worry": true,
                "self_criticism": "high"
              }
            },
            "behavioral_observations": {
              "avoidance_behaviors": ["procrastination", "social_withdrawal"],
              "safety_behaviors": ["over_preparation", "seeking_reassurance"],
              "adaptive_behaviors": ["exercise", "talking_to_friends"]
            }
          }
        }
      }`;

      const result = parseJsonObject(complexJson);

      expect(result).toHaveProperty("therapeutic_analysis");
      expect(result.therapeutic_analysis).toHaveProperty("session_id", "sess_123");
      expect(result.therapeutic_analysis.user_profile.demographics).toEqual({
        age_range: "25-35",
        occupation: "software_engineer",
      });
      expect(result.therapeutic_analysis.current_analysis.cognitive_patterns.distortions).toHaveLength(2);
      expect(result.therapeutic_analysis.current_analysis.cognitive_patterns.distortions[0].type).toBe(
        "catastrophizing"
      );
    });

    it("should handle special characters and unicode", () => {
      const unicodeJson = `{
        "user_input": "I'm feeling anxious about my presentation 😰",
        "emotional_indicators": ["😟", "😨", "😰"],
        "multilingual_responses": {
          "english": "You're experiencing anxiety",
          "spanish": "Estás experimentando ansiedad",
          "french": "Vous ressentez de l'anxiété",
          "chinese": "你正在经历焦虑",
          "arabic": "أنت تشعر بالقلق"
        },
        "special_chars": "!@#$%^&*(){}[]|\\\\:;\\\"'<>,.?/~\`",
        "escaped_content": "User said: \\"I can't handle this anymore\\""
      }`;

      const result = parseJsonObject(unicodeJson);

      expect(result.user_input).toBe("I'm feeling anxious about my presentation 😰");
      expect(result.emotional_indicators).toEqual(["😟", "😨", "😰"]);
      expect(result.multilingual_responses.chinese).toBe("你正在经历焦虑");
      expect(result.special_chars).toBe("!@#$%^&*(){}[]|\\:;\"'<>,.?/~`");
      expect(result.escaped_content).toBe('User said: "I can\'t handle this anymore"');
    });

    it("should handle empty objects and null values", () => {
      const jsonWithNulls = `{
        "empty_object": {},
        "empty_array": [],
        "null_value": null,
        "zero_value": 0,
        "false_value": false,
        "empty_string": "",
        "nested_empty": {
          "inner_null": null,
          "inner_empty": {}
        }
      }`;

      const result = parseJsonObject(jsonWithNulls);

      expect(result.empty_object).toEqual({});
      expect(result.empty_array).toEqual([]);
      expect(result.null_value).toBeNull();
      expect(result.zero_value).toBe(0);
      expect(result.false_value).toBe(false);
      expect(result.empty_string).toBe("");
      expect(result.nested_empty.inner_null).toBeNull();
      expect(result.nested_empty.inner_empty).toEqual({});
    });

    it("should extract JSON from AI response with extra text", () => {
      const aiResponse = `Based on the user's input, I've analyzed their emotional state and cognitive patterns. Here's my detailed assessment:

\`\`\`json
{
  "emotional_assessment": {
    "primary_emotion": "anxiety",
    "intensity": "moderate",
    "contributing_factors": ["work_deadline", "perfectionist_tendencies"],
    "physical_symptoms": ["tension", "restlessness"],
    "cognitive_symptoms": ["racing_thoughts", "catastrophic_thinking"]
  },
  "therapeutic_recommendations": {
    "immediate": [
      {
        "technique": "deep_breathing",
        "duration": "5_minutes",
        "instructions": "Focus on slow, deep breaths to activate parasympathetic nervous system"
      },
      {
        "technique": "grounding_exercise",
        "duration": "3_minutes", 
        "instructions": "Use 5-4-3-2-1 technique to reconnect with present moment"
      }
    ],
    "ongoing": [
      {
        "strategy": "cognitive_restructuring",
        "frequency": "daily",
        "focus": "challenge catastrophic thoughts"
      },
      {
        "strategy": "progressive_muscle_relaxation",
        "frequency": "twice_daily",
        "focus": "reduce physical tension"
      }
    ]
  },
  "session_notes": {
    "progress_indicators": ["increased_self_awareness", "willingness_to_try_techniques"],
    "areas_for_improvement": ["thought_monitoring", "stress_management"],
    "next_session_focus": "building_coping_toolkit"
  }
}
\`\`\`

This analysis provides a comprehensive view of the user's current state and actionable recommendations for therapeutic intervention.`;

      const result = parseJsonObject(aiResponse);

      expect(result).toHaveProperty("emotional_assessment");
      expect(result).toHaveProperty("therapeutic_recommendations");
      expect(result).toHaveProperty("session_notes");
      expect(result.emotional_assessment.primary_emotion).toBe("anxiety");
      expect(result.therapeutic_recommendations.immediate).toHaveLength(2);
      expect(result.therapeutic_recommendations.immediate[0].technique).toBe("deep_breathing");
      expect(result.session_notes.progress_indicators).toContain("increased_self_awareness");
    });

    it("should handle multiple JSON blocks and extract the full JSON span", () => {
      const multipleJsonBlocks = `Here are analysis results:

{
  "primary_analysis": "anxiety_assessment",
  "confidence": 0.9,
  "details": "User shows clear signs of work-related anxiety",
  "secondary_analysis": {
    "coping_mechanisms": ["deep_breathing"],
    "effectiveness": "moderate"
  }
}

Some additional text after.`;

      const result = parseJsonObject(multipleJsonBlocks);

      // Should extract the complete JSON object
      expect(result).toEqual({
        primary_analysis: "anxiety_assessment",
        confidence: 0.9,
        details: "User shows clear signs of work-related anxiety",
        secondary_analysis: {
          coping_mechanisms: ["deep_breathing"],
          effectiveness: "moderate",
        },
      });
    });

    it("should handle whitespace and formatting variations", () => {
      const poorlyFormattedJson = `
      
      
        {
            "analysis_type"    :    "therapeutic_assessment"  ,
            "findings"         :    {
                "mood"         :    "anxious"    ,
                "severity"     :    "moderate"   ,
                "triggers"     :    [   "work"   ,   "social_situations"   ]
            }    ,
            "recommendations"  :    [
                "mindfulness_practice"  ,
                "cognitive_restructuring"
            ]
        }
        
        
      `;

      const result = parseJsonObject(poorlyFormattedJson);

      expect(result).toEqual({
        analysis_type: "therapeutic_assessment",
        findings: {
          mood: "anxious",
          severity: "moderate",
          triggers: ["work", "social_situations"],
        },
        recommendations: ["mindfulness_practice", "cognitive_restructuring"],
      });
    });

    it("should throw error for invalid JSON syntax", () => {
      const invalidJson = `{
        "incomplete": "object"
        "missing_comma": "value"
        "invalid": syntax
      }`;

      expect(() => parseJsonObject(invalidJson)).toThrow(/Failed to parse JSON/);
    });

    it("should throw error for non-object JSON", () => {
      const arrayJson = `["this", "is", "an", "array"]`;
      const stringJson = `"this is just a string"`;
      const numberJson = `42`;
      const booleanJson = `true`;

      // These should fail to find JSON boundaries since they don't contain braces
      expect(() => parseJsonObject(arrayJson)).toThrow(
        /Failed to parse JSON.*Malformed JSON: Unable to locate JSON boundaries/
      );
      expect(() => parseJsonObject(stringJson)).toThrow(
        /Failed to parse JSON.*Malformed JSON: Unable to locate JSON boundaries/
      );
      expect(() => parseJsonObject(numberJson)).toThrow(
        /Failed to parse JSON.*Malformed JSON: Unable to locate JSON boundaries/
      );
      expect(() => parseJsonObject(booleanJson)).toThrow(
        /Failed to parse JSON.*Malformed JSON: Unable to locate JSON boundaries/
      );
    });

    it("should throw error for malformed JSON boundaries", () => {
      const noBraces = `"analysis": "no surrounding braces"`;
      const missingOpenBrace = `"key": "value"}`;
      const missingCloseBrace = `{"key": "value"`;

      expect(() => parseJsonObject(noBraces)).toThrow(
        /Failed to parse JSON.*Malformed JSON: Unable to locate JSON boundaries/
      );
      expect(() => parseJsonObject(missingOpenBrace)).toThrow(
        /Failed to parse JSON.*Malformed JSON: Unable to locate JSON boundaries/
      );
      expect(() => parseJsonObject(missingCloseBrace)).toThrow(/Failed to parse JSON/);
    });

    it("should handle escaped quotes and special characters", () => {
      const escapedJson = `{
        "user_quote": "She said, \\"I'm really struggling with this\\"",
        "analysis_note": "User's use of \\"struggling\\" indicates difficulty",
        "therapy_response": "Let's explore what \\"struggling\\" means to you",
        "special_sequences": "Line1\\nLine2\\tTabbed\\rCarriageReturn",
        "file_path": "C:\\\\Users\\\\Documents\\\\therapy_notes.txt"
      }`;

      const result = parseJsonObject(escapedJson);

      expect(result.user_quote).toBe('She said, "I\'m really struggling with this"');
      expect(result.analysis_note).toBe('User\'s use of "struggling" indicates difficulty');
      expect(result.therapy_response).toBe('Let\'s explore what "struggling" means to you');
      expect(result.special_sequences).toBe("Line1\nLine2\tTabbed\rCarriageReturn");
      expect(result.file_path).toBe("C:\\Users\\Documents\\therapy_notes.txt");
    });

    it("should handle very large JSON objects", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        message: `This is message ${i} with some content`,
        timestamp: `2024-01-${String((i % 28) + 1).padStart(2, "0")}T10:00:00Z`,
        metadata: {
          processed: true,
          tags: [`tag${i}`, `category${i % 10}`],
          score: Math.random(),
        },
      }));

      const largeJsonString = JSON.stringify({
        session_data: {
          messages: largeArray,
          summary: {
            total_messages: largeArray.length,
            date_range: "2024-01-01 to 2024-01-28",
            analysis_complete: true,
          },
        },
      });

      const result = parseJsonObject(largeJsonString);

      expect(result.session_data.messages).toHaveLength(1000);
      expect(result.session_data.messages[0].id).toBe(0);
      expect(result.session_data.messages[999].id).toBe(999);
      expect(result.session_data.summary.total_messages).toBe(1000);
    });

    it("should log errors appropriately when parsing fails", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const invalidInput = "this is not json at all";

      expect(() => parseJsonObject(invalidInput)).toThrow();
      expect(consoleSpy).toHaveBeenCalledWith("JSON parsing error:", expect.any(Error), "\nInput text:", invalidInput);

      consoleSpy.mockRestore();
    });

    it("should handle real AI response formats", () => {
      const realAiResponse = `I understand you're feeling anxious about your upcoming presentation. Let me provide you with a therapeutic analysis and some recommendations.

\`\`\`json
{
  "session_analysis": {
    "timestamp": "2024-01-15T14:30:00Z",
    "user_state": {
      "primary_emotion": "anxiety",
      "intensity_level": 7,
      "physical_symptoms": ["increased heart rate", "sweating", "tension"],
      "cognitive_symptoms": ["racing thoughts", "catastrophic thinking", "difficulty concentrating"]
    },
    "situational_context": {
      "trigger_event": "upcoming_presentation",
      "setting": "workplace",
      "social_context": "professional_evaluation",
      "time_sensitivity": "presentation in 2 days"
    },
    "cognitive_analysis": {
      "identified_distortions": [
        {
          "type": "catastrophizing",
          "thought_example": "What if I mess up and everyone thinks I'm incompetent?",
          "likelihood_assessment": "low_probability_high_impact_thinking"
        },
        {
          "type": "fortune_telling",
          "thought_example": "I know I'm going to fail",
          "evidence_for": "limited",
          "evidence_against": "strong_track_record"
        }
      ],
      "underlying_beliefs": {
        "core_belief": "I must be perfect to be accepted",
        "conditional_belief": "If I make mistakes, people will reject me",
        "behavioral_rule": "I must prepare excessively to avoid any possibility of failure"
      }
    },
    "therapeutic_recommendations": {
      "immediate_interventions": [
        {
          "technique": "box_breathing",
          "duration": "10_minutes",
          "frequency": "as_needed",
          "purpose": "activate_parasympathetic_nervous_system"
        },
        {
          "technique": "thought_challenging",
          "focus": "catastrophic_predictions",
          "questions": ["What evidence supports this thought?", "What would I tell a friend in this situation?"],
          "purpose": "cognitive_restructuring"
        }
      ],
      "preparation_strategies": [
        {
          "strategy": "graduated_exposure",
          "steps": ["practice_in_mirror", "record_presentation", "practice_with_friend"],
          "purpose": "build_confidence_reduce_anxiety"
        },
        {
          "strategy": "visualization",
          "content": "successful_presentation_scenario",
          "duration": "15_minutes_daily",
          "purpose": "mental_rehearsal"
        }
      ]
    },
    "session_goals": {
      "short_term": ["reduce_immediate_anxiety", "challenge_catastrophic_thoughts"],
      "medium_term": ["develop_presentation_confidence", "practice_coping_strategies"],
      "long_term": ["address_perfectionist_tendencies", "build_resilience"]
    }
  }
}
\`\`\`

This analysis should help guide our therapeutic approach to your presentation anxiety.`;

      const result = parseJsonObject(realAiResponse);

      expect(result).toHaveProperty("session_analysis");
      expect(result.session_analysis.user_state.primary_emotion).toBe("anxiety");
      expect(result.session_analysis.user_state.intensity_level).toBe(7);
      expect(result.session_analysis.cognitive_analysis.identified_distortions).toHaveLength(2);
      expect(result.session_analysis.therapeutic_recommendations.immediate_interventions).toHaveLength(2);
      expect(result.session_analysis.therapeutic_recommendations.immediate_interventions[0].technique).toBe(
        "box_breathing"
      );
    });
  });
});

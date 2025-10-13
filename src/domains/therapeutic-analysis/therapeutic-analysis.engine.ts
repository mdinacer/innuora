import { ChatCompletionMessageParam } from "openai/resources";

import {
  AnalysisContext,
  AnalysisContextItem,
  TherapeuticAnalysis,
  TherapeuticAnalysisSchema,
} from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { parseJsonObject } from "@/lib/utils/parse-json";

export class TherapeuticAnalysisEngine {
  safeParseTherapeuticAnalysis(aiResponse: string): TherapeuticAnalysis | null {
    try {
      const parsedJSON = parseJsonObject(aiResponse);
      const parsedAnalysisResult = TherapeuticAnalysisSchema.safeParse(parsedJSON);
      if (!parsedAnalysisResult.success) {
        return null;
      }
      return parsedAnalysisResult.data;
    } catch {
      return null;
    }
  }

  getAnalysisContextPrompt(
    userInput: string,
    prevData: TherapeuticAnalysis[],
    sessionMetadata?: { messageCount: number; activeDurationMs: number },
    recentMessages?: { role: "user" | "assistant"; content: string }[]
  ): ChatCompletionMessageParam {
    const sessionContext = sessionMetadata
      ? {
          message_count: sessionMetadata.messageCount,
          active_duration_minutes: Math.round(sessionMetadata.activeDurationMs / 60000),
        }
      : null;

    // Include only recent user messages for lightweight context (not full conversation)
    // This helps understand follow-up references ("it", "that", "this") without bloating token usage
    const conversationContext =
      recentMessages && recentMessages.length > 0
        ? recentMessages.filter((msg) => msg.role === "user").slice(-2) // Last 2 user messages only
        : undefined;

    return prevData.length === 0
      ? {
          role: "user",
          content: JSON.stringify({
            current_message: userInput.trim(),
            ...(conversationContext && { recent_conversation: conversationContext }),
            ...(sessionContext && { session_context: sessionContext }),
          }),
        }
      : ({
          role: "user",
          content: JSON.stringify({
            current_message: userInput.trim(),
            ...(conversationContext && { recent_conversation: conversationContext }),
            previous_analyses: this.getAnalysisContext(prevData),
            ...(sessionContext && { session_context: sessionContext }),
            instructions: `
      You are provided with context from the user's previous messages.
      When analyzing the current message:
      - Use recent_conversation (previous user messages) to understand references like "it", "that", "this"
      - Consider if current_message is elaborating on or continuing a previous topic
      - Avoid marking follow-up elaborations as "low" value if they add therapeutic context
      - Use prior analyses for broader emotional patterns and recurring themes
      - Adjust intensity based on continuity or escalation of emotional load
      - Avoid overriding a module unless the emotional context clearly changes
      - Include cognitive distortions if detected, even if they were not present before
      - Aim for a nuanced, emotionally attuned analysis that respects the user's ongoing state
    `,
          }),
        } as ChatCompletionMessageParam);
  }

  private getAnalysisContext(prevData: TherapeuticAnalysis[]): AnalysisContext {
    if (!prevData || prevData.length === 0) {
      return { recentAnalyses: [], recurringThemes: [], distortions: [] };
    }

    const recent = prevData.slice(-3);

    const recentAnalyses: AnalysisContextItem[] = recent.map(
      ({ core_module, process_module, utility_module, intensity }) => ({
        core_module,
        process_module,
        utility_module,
        intensity,
      })
    );

    const themeCounts: Record<string, number> = {};
    const distortionsSet: Set<string> = new Set();

    recent.forEach(({ themes, distortions }) => {
      themes.forEach((themeObj) => {
        const themeText = typeof themeObj === "string" ? themeObj : themeObj.theme;
        themeCounts[themeText] = (themeCounts[themeText] || 0) + 1;
      });
      distortions.forEach((distortion) => {
        const distortionText = typeof distortion === "string" ? distortion : distortion.type;
        distortionsSet.add(distortionText);
      });
    });

    const recurringThemes = Object.entries(themeCounts)
      .filter(([, count]) => count > 1)
      .map(([theme]) => theme);

    return {
      recentAnalyses,
      recurringThemes,
      distortions: Array.from(distortionsSet),
    };
  }
}

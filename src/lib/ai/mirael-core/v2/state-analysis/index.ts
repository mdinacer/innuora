import { ChatCompletionMessageParam } from "openai/resources";

import { StateAnalysis, StateAnalysisSchema } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { AnalysisContext, AnalysisContextItem } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.types";
import { parseJsonObject } from "@/lib/ai/shared/parse-json";

export class StateAnalysisEngine {
  safeParseStateAnalysis(aiResponse: string): StateAnalysis | null {
    try {
      const parsedJSON = parseJsonObject(aiResponse);
      const parsedAnalysisResult = StateAnalysisSchema.safeParse(parsedJSON);
      if (!parsedAnalysisResult.success) {
        console.error("StateAnalysis validation failed:", parsedAnalysisResult.error);
        return null;
      }
      return parsedAnalysisResult.data;
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return null;
    }
  }

  getAnalysisContextPrompt(userInput: string, prevData: StateAnalysis[]): ChatCompletionMessageParam {
    console.log("prevData", prevData);
    return prevData.length === 0
      ? {
          role: "user",
          content: ` current_message: ${userInput.trim()}`,
        }
      : ({
          role: "user",
          content: JSON.stringify({
            current_message: userInput.trim(),
            previous_analyses: this.getAnalysisContext(prevData),
            instructions: `
      You are provided with context from the user’s previous messages.
      When analyzing the current message:
      - Use prior primary and secondary modules as context for trends and emotional patterns.
      - Note recurring themes across previous analyses.
      - Adjust intensity based on continuity or escalation of emotional load.
      - Avoid overriding a module unless the emotional context clearly changes.
      - Include cognitive distortions if detected, even if they were not present before.
      - Aim for a nuanced, emotionally attuned analysis that respects the user’s ongoing state.
    `,
          }),
        } as ChatCompletionMessageParam);
  }

  private getAnalysisContext(prevData: StateAnalysis[]): AnalysisContext {
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
        const themeText = typeof themeObj === 'string' ? themeObj : themeObj.theme;
        themeCounts[themeText] = (themeCounts[themeText] || 0) + 1;
      });
      distortions.forEach((distortion) => {
        const distortionText = typeof distortion === 'string' ? distortion : distortion.type;
        distortionsSet.add(distortionText);
      });
    });

    const recurringThemes = Object.entries(themeCounts)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, count]) => count > 1)
      .map(([theme]) => theme);

    return {
      recentAnalyses,
      recurringThemes,
      distortions: Array.from(distortionsSet),
    };
  }
}

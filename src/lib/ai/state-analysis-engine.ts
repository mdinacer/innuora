import { ChatCompletionMessageParam } from "openai/resources";

import { StateAnalysis, StateAnalysisSchema } from "@/lib/zod/state-analysis.schema";
import { AnalysisContext, AnalysisContextItem } from "@/types/state-analysis.types";

export class StateAnalysisEngine {
  safeParseStateAnalysis(aiResponse: string): StateAnalysis | null {
    try {
      const parsed = StateAnalysisSchema.safeParse(JSON.parse(aiResponse));
      if (!parsed.success) {
        console.error("StateAnalysis validation failed:", parsed.error);
        return null;
      }
      return parsed.data;
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

    const recentAnalyses: AnalysisContextItem[] = recent.map(({ primary_module, secondary_module, intensity }) => ({
      primary_module,
      secondary_module,
      intensity,
    }));

    const themeCounts: Record<string, number> = {};
    const distortionsSet: Set<string> = new Set();

    recent.forEach(({ themes, distortions }) => {
      themes.forEach((theme) => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
      distortions.forEach((d) => distortionsSet.add(d));
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

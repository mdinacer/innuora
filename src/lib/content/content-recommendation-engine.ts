import { SESSION_MODULES } from "@/domains/cbt-modules/constants";
import { ContentRecommendation, ContentRecommendationContext } from "@/types/content.types";
import { contentRegistry } from "./content-registry";

// =========================
// Content Recommendation Engine
// =========================

export class ContentRecommendationEngine {
  private static instance: ContentRecommendationEngine;

  static getInstance(): ContentRecommendationEngine {
    if (!ContentRecommendationEngine.instance) {
      ContentRecommendationEngine.instance = new ContentRecommendationEngine();
    }
    return ContentRecommendationEngine.instance;
  }

  /**
   * Get personalized content recommendations based on user context
   */
  getRecommendations(context: ContentRecommendationContext, limit: number = 5): ContentRecommendation[] {
    const allContent = contentRegistry.getAll();
    const recommendations: ContentRecommendation[] = [];

    // Filter out already completed content
    const availableContent = allContent.filter((item) => !context.completedContent?.includes(item.metadata.slug));

    for (const item of availableContent) {
      const score = this.calculateRelevanceScore(item, context);
      const reason = this.generateRecommendationReason(item, context);

      if (score > 0) {
        recommendations.push({
          slug: item.metadata.slug,
          title: item.metadata.title,
          category: item.metadata.category,
          relevanceScore: score,
          reason,
        });
      }
    }

    // Sort by relevance score and return top results
    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }

  /**
   * Get emergency/crisis content recommendations
   */
  getCrisisRecommendations(): ContentRecommendation[] {
    return contentRegistry
      .getAll()
      .filter((item) => item.metadata.intent === "emergency")
      .map((item) => ({
        slug: item.metadata.slug,
        title: item.metadata.title,
        category: item.metadata.category,
        relevanceScore: 1.0,
        reason: "Immediate support resource",
      }));
  }

  /**
   * Get content recommendations for specific CBT modules
   */
  getModuleBasedRecommendations(modules: string[]): ContentRecommendation[] {
    const allContent = contentRegistry.getAll();
    const recommendations: ContentRecommendation[] = [];

    for (const item of allContent) {
      if (item.metadata.relatedCbtModules) {
        const matchingModules = item.metadata.relatedCbtModules.filter((cbtModule: string) =>
          modules.includes(cbtModule)
        );

        if (matchingModules.length > 0) {
          recommendations.push({
            slug: item.metadata.slug,
            title: item.metadata.title,
            category: item.metadata.category,
            relevanceScore: matchingModules.length / modules.length,
            reason: `Supports ${matchingModules.join(", ")} techniques`,
          });
        }
      }
    }

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 3);
  }

  // =========================
  // Private Methods
  // =========================

  private calculateRelevanceScore(item: any, context: ContentRecommendationContext): number {
    let score = 0;

    // Base score for priority
    const priorityScores: Record<string, number> = { high: 0.3, medium: 0.2, low: 0.1 };
    score += priorityScores[item.metadata.priority] || 0.1;

    // CBT module matching
    if (context.cbtModules && item.metadata.relatedCbtModules) {
      const moduleMatches = item.metadata.relatedCbtModules.filter((cbtModule: string) =>
        context.cbtModules!.includes(cbtModule)
      );
      score += moduleMatches.length * 0.25;
    }

    // Emotion matching
    if (context.userEmotions && item.metadata.targetEmotions) {
      const emotionMatches = item.metadata.targetEmotions.filter((emotion: string) =>
        context.userEmotions!.some((userEmotion: string) => userEmotion.toLowerCase().includes(emotion.toLowerCase()))
      );
      score += emotionMatches.length * 0.2;
    }

    // Session theme matching
    if (context.sessionThemes && item.metadata.keywords) {
      const themeMatches = item.metadata.keywords.filter((keyword: string) =>
        context.sessionThemes!.some(
          (theme: string) =>
            theme.toLowerCase().includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(theme.toLowerCase())
        )
      );
      score += themeMatches.length * 0.15;
    }

    // Intent preference (actionable content gets higher score)
    if (item.metadata.intent === "actionable") {
      score += 0.1;
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private generateRecommendationReason(item: any, context: ContentRecommendationContext): string {
    const reasons: string[] = [];

    // CBT module matches
    if (context.cbtModules && item.metadata.relatedCbtModules) {
      const moduleMatches = item.metadata.relatedCbtModules.filter((cbtModule: string) =>
        context.cbtModules!.includes(cbtModule)
      );
      if (moduleMatches.length > 0) {
        reasons.push(`Supports your current ${moduleMatches[0]} work`);
      }
    }

    // Emotion matches
    if (context.userEmotions && item.metadata.targetEmotions) {
      const emotionMatches = item.metadata.targetEmotions.filter((emotion: string) =>
        context.userEmotions!.some((userEmotion: string) => userEmotion.toLowerCase().includes(emotion.toLowerCase()))
      );
      if (emotionMatches.length > 0) {
        reasons.push(`Helps with ${emotionMatches[0]}`);
      }
    }

    // Session theme matches
    if (context.sessionThemes && item.metadata.keywords) {
      const themeMatches = item.metadata.keywords.filter((keyword: string) =>
        context.sessionThemes!.some((theme: string) => theme.toLowerCase().includes(keyword.toLowerCase()))
      );
      if (themeMatches.length > 0) {
        reasons.push(`Related to your recent discussions about ${themeMatches[0]}`);
      }
    }

    // Default reason based on content type
    if (reasons.length === 0) {
      const defaultReasons: Record<string, string> = {
        actionable: "Practical techniques you can try",
        informational: "Educational content to deepen understanding",
        supportive: "Supportive guidance for your journey",
        therapeutic: "Therapeutic insights and tools",
        emergency: "Immediate support resource",
      };
      reasons.push(defaultReasons[item.metadata.intent] || "Recommended for you");
    }

    return reasons[0];
  }
}

// =========================
// Integration Helpers
// =========================

/**
 * Convert therapeutic analysis to recommendation context
 */
export function analysisToRecommendationContext(analysis: {
  core_module?: string | null;
  process_module?: string | null;
  utility_module?: string | null;
  themes?: Array<{ theme: string }>;
  distortions?: Array<{ type: string }>;
}): ContentRecommendationContext {
  const cbtModules: string[] = [];

  if (analysis.core_module) cbtModules.push(analysis.core_module);
  if (analysis.process_module) cbtModules.push(analysis.process_module);
  if (analysis.utility_module) cbtModules.push(analysis.utility_module);

  const sessionThemes = analysis.themes?.map((t) => t.theme) || [];
  const userEmotions = analysis.distortions?.map((d) => d.type) || [];

  return {
    cbtModules,
    sessionThemes,
    userEmotions,
  };
}

/**
 * Map CBT modules to user-friendly emotion categories
 */
export function mapCbtModulesToEmotions(modules: string[]): string[] {
  const moduleToEmotionMap: Record<string, string[]> = {
    [SESSION_MODULES.COGNITIVE]: ["negative thoughts", "overthinking"],
    [SESSION_MODULES.BEHAVIORAL_ACTIVATION]: ["depression", "low energy", "fatigue"],
    [SESSION_MODULES.MINDFULNESS]: ["anxiety", "racing thoughts", "overwhelm"],
    [SESSION_MODULES.CORE_BELIEFS]: ["self-criticism", "low self-worth"],
    [SESSION_MODULES.CRISIS]: ["crisis", "emergency", "suicidal thoughts"],
    [SESSION_MODULES.VALUES_CLARIFICATION]: ["lack of direction", "meaninglessness"],
  };

  const emotions: string[] = [];
  for (const cbtModule of modules) {
    if (moduleToEmotionMap[cbtModule]) {
      emotions.push(...moduleToEmotionMap[cbtModule]);
    }
  }

  return emotions;
}

// Export singleton instance
export const contentRecommendationEngine = ContentRecommendationEngine.getInstance();

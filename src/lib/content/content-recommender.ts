/**
 * Content Recommendation Engine
 *
 * Recommends guides and insights based on:
 * - User's therapeutic analysis patterns
 * - Detected cognitive distortions
 * - Emotional states
 * - CBT modules used in sessions
 */

import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { AppLocales } from "@/lib/i18n";
import { ContentRecommendation } from "@/types/content.types";
import { filterContent, getContentPreviews } from "./content-loader";

/**
 * Recommend content based on user's therapeutic analysis
 */
export function recommendContentFromAnalysis(
  analysis: TherapeuticAnalysis[],
  locale: AppLocales = "en",
  limit: number = 5
): ContentRecommendation[] {
  if (analysis.length === 0) {
    return [];
  }

  // Get most recent analysis
  const latestAnalysis = analysis[analysis.length - 1];

  // Extract relevant patterns
  const cbtModules: string[] = [];
  const emotions: string[] = [];
  const distortions: string[] = [];

  // Map analysis fields to content filters
  if (latestAnalysis.process_module) {
    cbtModules.push(latestAnalysis.process_module);
  }

  if (latestAnalysis.themes && latestAnalysis.themes.length > 0) {
    emotions.push(...latestAnalysis.themes.map((t) => t.theme));
  }

  if (latestAnalysis.distortions && latestAnalysis.distortions.length > 0) {
    distortions.push(...latestAnalysis.distortions.map((d) => d.type));
  }

  // Get all available content
  const allContent = getContentPreviews(locale);

  // Score and rank content
  const recommendations: ContentRecommendation[] = [];

  for (const content of allContent) {
    let score = 0;
    const matchedPatterns: string[] = [];
    const reasons: string[] = [];

    // Match CBT modules (high weight)
    if (content.relatedCbtModules) {
      const moduleMatches = content.relatedCbtModules.filter((module) => cbtModules.includes(module));
      if (moduleMatches.length > 0) {
        score += moduleMatches.length * 30;
        matchedPatterns.push(...moduleMatches);
        reasons.push(`Addresses ${moduleMatches.join(", ")} modules`);
      }
    }

    // Match emotions/themes (medium weight)
    if (content.targetEmotions) {
      const emotionMatches = content.targetEmotions.filter((emotion) =>
        emotions.some(
          (e) => e.toLowerCase().includes(emotion.toLowerCase()) || emotion.toLowerCase().includes(e.toLowerCase())
        )
      );
      if (emotionMatches.length > 0) {
        score += emotionMatches.length * 20;
        matchedPatterns.push(...emotionMatches);
        reasons.push(`Relevant to ${emotionMatches.join(", ")}`);
      }
    }

    // Match distortions by keywords in description (low weight)
    const distortionMatches = distortions.filter(
      (d) =>
        content.title.toLowerCase().includes(d.toLowerCase()) ||
        content.description.toLowerCase().includes(d.toLowerCase())
    );
    if (distortionMatches.length > 0) {
      score += distortionMatches.length * 15;
      matchedPatterns.push(...distortionMatches);
      reasons.push(`Helps with ${distortionMatches.join(", ")}`);
    }

    // Boost featured content
    if (content.featured) {
      score += 10;
    }

    // Boost based on priority
    if (content.priority === "high") {
      score += 15;
    } else if (content.priority === "medium") {
      score += 10;
    }

    // Only recommend if there's a match
    if (score > 0) {
      recommendations.push({
        content,
        relevanceScore: Math.min(score, 100),
        reason: reasons.join(" • "),
        matchedPatterns,
      });
    }
  }

  // Sort by relevance score and limit
  return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
}

/**
 * Recommend content based on specific cognitive distortions
 */
export function recommendContentForDistortions(
  distortions: string[],
  locale: AppLocales = "en",
  limit: number = 3
): ContentRecommendation[] {
  const allContent = getContentPreviews(locale);

  // Focus on CBT exercise guides
  const exerciseGuides = allContent.filter((c) => c.category === "cbt-exercises" && c.contentType === "guide");

  const recommendations: ContentRecommendation[] = [];

  for (const content of exerciseGuides) {
    let score = 0;
    const matchedPatterns: string[] = [];

    // Match distortion keywords in title/description
    const matches = distortions.filter(
      (d) =>
        content.title.toLowerCase().includes(d.toLowerCase()) ||
        content.description.toLowerCase().includes(d.toLowerCase())
    );

    if (matches.length > 0) {
      score = matches.length * 40;
      matchedPatterns.push(...matches);

      recommendations.push({
        content,
        relevanceScore: Math.min(score, 100),
        reason: `Exercise for ${matches.join(", ")} patterns`,
        matchedPatterns,
      });
    }
  }

  return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
}

/**
 * Get "getting started" content for new users
 */
export function getOnboardingContent(locale: AppLocales = "en"): ContentRecommendation[] {
  const gettingStartedContent = filterContent({
    locale,
    category: "getting-started",
  });

  return gettingStartedContent.map((content) => ({
    content,
    relevanceScore: 100,
    reason: "Essential guide for new users",
    matchedPatterns: ["onboarding"],
  }));
}

/**
 * Get content for specific emotions (e.g., anxiety, depression)
 */
export function recommendContentForEmotions(
  emotions: string[],
  locale: AppLocales = "en",
  limit: number = 5
): ContentRecommendation[] {
  const content = filterContent({
    locale,
    targetEmotions: emotions,
  });

  return content.slice(0, limit).map((item) => ({
    content: item,
    relevanceScore: 80,
    reason: `Helpful for ${emotions.join(", ")}`,
    matchedPatterns: emotions,
  }));
}

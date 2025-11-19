/**
 * Psychoeducation to Article Mapper
 *
 * Maps AI-generated psychoeducation content to relevant educational articles
 * from the content library. Uses category-based mapping with keyword scoring
 * to find the most relevant 2-3 articles.
 */

import { PsychoeducationCategory } from "@/domains/guidance-flow/reflection/types";
import { AppLocales } from "@/lib/i18n";
import { ContentCategory } from "@/types/content.types";
import type { ContentPreview } from "@/types/content.types";
import { filterContent, searchContent } from "./content-loader";

// ─────────────────────────────────────────────────────────────
// Category Mapping Configuration
// ─────────────────────────────────────────────────────────────

/**
 * Maps psychoeducation categories to content library categories
 * Each psychoeducation category maps to 1-3 relevant content categories
 */
const PSYCHOEDU_TO_CONTENT_CATEGORY_MAP: Record<PsychoeducationCategory, ContentCategory[]> = {
  "belief-system": ["cognitive-behavioral-therapy", "self-compassion"],
  "emotional-pattern": ["anxiety-management", "depression-support", "mood-tracking"],
  "behavioral-pattern": ["cognitive-behavioral-therapy", "stress-management"],
  "self-worth": ["self-compassion", "cognitive-behavioral-therapy"],
  "meaning-fatigue": ["depression-support", "self-compassion"],
  avoidance: ["anxiety-management", "cognitive-behavioral-therapy"],
  perfectionism: ["self-compassion", "cognitive-behavioral-therapy"],
  boundary: ["relationship-patterns", "self-compassion"],
  resilience: ["stress-management", "self-compassion"],
  regulation: ["mindfulness-techniques", "stress-management", "anxiety-management"],
  "attachment-dynamics": ["relationship-patterns", "self-compassion"],
};

// ─────────────────────────────────────────────────────────────
// Article Recommendation
// ─────────────────────────────────────────────────────────────

export interface PsychoeducationArticleRecommendation {
  slug: string;
  title: string;
  description: string;
  category: ContentCategory;
  relevanceScore: number;
  readingTime?: number;
}

export interface PsychoeducationArticleMapping {
  articles: PsychoeducationArticleRecommendation[];
  mappingMethod: "category" | "keyword" | "fallback";
}

/**
 * Recommend articles based on AI-generated psychoeducation content
 *
 * Strategy:
 * 1. Map psychoeducation category to content categories
 * 2. Get articles from those categories
 * 3. Score articles based on keyword relevance to subject
 * 4. Return top 2-3 articles
 */
export function recommendArticlesForPsychoeducation(
  category: PsychoeducationCategory | undefined,
  subject: string | undefined,
  locale: AppLocales = "en",
  limit: number = 3
): PsychoeducationArticleMapping {
  // Fallback: no category or subject provided
  if (!category && !subject) {
    return {
      articles: [],
      mappingMethod: "fallback",
    };
  }

  let articles: ContentPreview[] = [];
  let mappingMethod: "category" | "keyword" | "fallback" = "fallback";

  // Strategy 1: Category-based mapping (preferred)
  if (category && category in PSYCHOEDU_TO_CONTENT_CATEGORY_MAP) {
    const contentCategories = PSYCHOEDU_TO_CONTENT_CATEGORY_MAP[category];

    // Get all articles from mapped categories
    articles = contentCategories.flatMap((cat) =>
      filterContent({
        locale,
        category: cat,
        contentType: "article",
      })
    );

    mappingMethod = "category";
  }

  // Strategy 2: Keyword-based search (if category mapping failed or empty)
  if (articles.length === 0 && subject) {
    articles = searchContent(subject, locale);
    mappingMethod = "keyword";
  }

  // Score articles based on subject keyword relevance
  const scoredArticles = articles.map((article) => {
    let score = 0;

    // Base score from category match (only if category mapping was used)
    if (mappingMethod === "category") {
      score = 50;
    }

    // Keyword matching with subject
    if (subject) {
      const subjectLower = subject.toLowerCase();
      const keywords = subjectLower.split(" ").filter((w) => w.length > 3); // Filter out short words

      // Title matches (highest weight)
      keywords.forEach((keyword) => {
        if (article.title.toLowerCase().includes(keyword)) {
          score += 30;
        }
      });

      // Description matches (medium weight)
      keywords.forEach((keyword) => {
        if (article.description.toLowerCase().includes(keyword)) {
          score += 15;
        }
      });

      // Keyword array matches (low weight)
      if (article.targetEmotions) {
        keywords.forEach((keyword) => {
          if (article.targetEmotions?.some((emotion) => emotion.toLowerCase().includes(keyword))) {
            score += 10;
          }
        });
      }
    }

    // Priority boost
    if (article.priority === "high") {
      score += 20;
    } else if (article.priority === "medium") {
      score += 10;
    }

    // Featured boost
    if (article.featured) {
      score += 15;
    }

    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      category: article.category,
      relevanceScore: Math.min(score, 100),
      readingTime: article.readingTime,
    };
  });

  // Sort by relevance and limit
  const topArticles = scoredArticles
    .filter((a) => a.relevanceScore > 20) // Minimum threshold
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);

  return {
    articles: topArticles,
    mappingMethod: topArticles.length > 0 ? mappingMethod : "fallback",
  };
}

/**
 * Get article URL for client-side navigation
 */
export function getArticleUrl(slug: string, locale: AppLocales): string {
  return `/${locale}/content/${slug}`;
}

/**
 * Batch recommend articles for multiple psychoeducation items
 */
export function batchRecommendArticles(
  psychoeducationItems: Array<{
    category?: PsychoeducationCategory;
    subject?: string;
  }>,
  locale: AppLocales = "en",
  limitPerItem: number = 2
): PsychoeducationArticleMapping[] {
  return psychoeducationItems.map((item) =>
    recommendArticlesForPsychoeducation(item.category, item.subject, locale, limitPerItem)
  );
}

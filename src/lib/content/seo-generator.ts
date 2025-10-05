import { Metadata } from "next";

import { ContentMetadata } from "@/types/content.types";

// =========================
// SEO Metadata Generator
// =========================

export class SEOGenerator {
  /**
   * Generate Next.js 15 Metadata object from content metadata
   */
  static generateMetadata(contentMetadata: ContentMetadata): Metadata {
    const { title, description, keywords, category, slug } = contentMetadata;

    // Generate optimized title
    const seoTitle = this.generateSEOTitle(title);

    // Generate optimized description
    const seoDescription = this.generateSEODescription(description);

    // Generate canonical URL
    const canonicalUrl = `/content/${category}/${slug}`;

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: keywords.join(", "),

      // Open Graph
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        type: "article",
        siteName: "Innuora",
        url: canonicalUrl,
        images: [
          {
            url: `/api/og?title=${encodeURIComponent(title)}&category=${category}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },

      // Twitter Card
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: [`/api/og?title=${encodeURIComponent(title)}&category=${category}`],
      },

      // Canonical URL
      alternates: {
        canonical: canonicalUrl,
        languages: {
          en: `/en${canonicalUrl}`,
          ar: `/ar${canonicalUrl}`,
          fr: `/fr${canonicalUrl}`,
          "x-default": `/en${canonicalUrl}`,
        },
      },

      // Article metadata
      other: {
        "article:author": "Innuora",
        "article:section": this.getCategoryDisplayName(category),
        "article:tag": keywords.join(","),
      },

      // Robots
      robots: {
        index: !contentMetadata.draft,
        follow: true,
        googleBot: {
          index: !contentMetadata.draft,
          follow: true,
        },
      },
    };
  }

  /**
   * Generate structured data (JSON-LD) for articles
   */
  static generateStructuredData(contentMetadata: ContentMetadata, content?: string): object {
    const { title, description, keywords, category, slug, publishedAt, readingTime } = contentMetadata;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://innuora.com";
    const articleUrl = `${baseUrl}/content/${category}/${slug}`;

    const structuredData: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: description,
      image: `${baseUrl}/api/og?title=${encodeURIComponent(title)}&category=${category}`,
      url: articleUrl,
      datePublished: publishedAt?.toISOString(),
      dateModified: publishedAt?.toISOString(),
      author: {
        "@type": "Organization",
        name: "Innuora",
        url: baseUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "Innuora",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      keywords: keywords.join(", "),
      about: {
        "@type": "Thing",
        name: this.getCategoryDisplayName(category),
      },
    };

    // Add reading time if available
    if (readingTime) {
      structuredData.timeRequired = `PT${readingTime}M`;
    }

    // Add word count if content is provided
    if (content) {
      const wordCount = content.split(/\s+/).length;
      structuredData.wordCount = wordCount;
    }

    return structuredData;
  }

  /**
   * Generate sitemap entries for content
   */
  static generateSitemapEntry(contentMetadata: ContentMetadata): {
    url: string;
    lastModified: Date;
    priority: number;
    changeFrequency: "weekly" | "monthly" | "yearly";
  } {
    const { category, slug, priority, publishedAt } = contentMetadata;

    const priorityMap = {
      high: 0.8,
      medium: 0.6,
      low: 0.4,
    };

    return {
      url: `/content/${category}/${slug}`,
      lastModified: publishedAt || new Date(),
      priority: priorityMap[priority],
      changeFrequency: "monthly",
    };
  }

  // =========================
  // Private Helper Methods
  // =========================

  private static generateSEOTitle(title: string): string {
    // Ensure title includes brand and is under 60 characters
    const brandSuffix = " | Innuora";
    const maxLength = 60 - brandSuffix.length;

    if (title.length <= maxLength) {
      return `${title}${brandSuffix}`;
    }

    // Truncate title to fit with brand
    const truncated = title.substring(0, maxLength - 3) + "...";
    return `${truncated}${brandSuffix}`;
  }

  private static generateSEODescription(description: string): string {
    // Ensure description is under 160 characters
    const maxLength = 160;

    if (description.length <= maxLength) {
      return description;
    }

    // Truncate at word boundary
    const truncated = description.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + "...";
    }

    return truncated + "...";
  }

  private static getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      "cognitive-behavioral-therapy": "Cognitive Behavioral Therapy",
      "anxiety-management": "Anxiety Management",
      "depression-support": "Depression Support",
      "stress-management": "Stress Management",
      "relationship-patterns": "Relationship Patterns",
      "self-compassion": "Self-Compassion",
      "mindfulness-techniques": "Mindfulness Techniques",
      "mood-tracking": "Mood Tracking",
    };

    return categoryNames[category] || category.replace(/-/g, " ");
  }
}

// =========================
// Internal Linking Helper
// =========================

export class InternalLinkingHelper {
  /**
   * Generate internal linking suggestions for content
   */
  static generateLinkSuggestions(
    contentMetadata: ContentMetadata,
    availableContent: ContentMetadata[]
  ): Array<{
    anchor: string;
    url: string;
    title: string;
    relevance: number;
  }> {
    const suggestions: Array<{
      anchor: string;
      url: string;
      title: string;
      relevance: number;
    }> = [];

    const { keywords, relatedCbtModules, targetEmotions, category } = contentMetadata;

    for (const otherContent of availableContent) {
      if (otherContent.slug === contentMetadata.slug) continue;

      let relevance = 0;

      // Same category gets high relevance
      if (otherContent.category === category) {
        relevance += 0.3;
      }

      // Matching CBT modules
      if (relatedCbtModules && otherContent.relatedCbtModules) {
        const matchingModules = relatedCbtModules.filter((cbtModule: string) =>
          otherContent.relatedCbtModules!.includes(cbtModule)
        );
        relevance += matchingModules.length * 0.2;
      }

      // Matching emotions
      if (targetEmotions && otherContent.targetEmotions) {
        const matchingEmotions = targetEmotions.filter((emotion: string) =>
          otherContent.targetEmotions!.includes(emotion)
        );
        relevance += matchingEmotions.length * 0.15;
      }

      // Keyword overlap
      const keywordOverlap = keywords.filter((keyword: string) => otherContent.keywords.includes(keyword));
      relevance += keywordOverlap.length * 0.1;

      // Only suggest if relevance is significant
      if (relevance > 0.2) {
        suggestions.push({
          anchor: this.generateAnchorText(otherContent),
          url: `/content/${otherContent.category}/${otherContent.slug}`,
          title: otherContent.title,
          relevance,
        });
      }
    }

    // Sort by relevance and return top suggestions
    return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  private static generateAnchorText(contentMetadata: ContentMetadata): string {
    // Generate natural anchor text from title
    const { title, intent } = contentMetadata;

    if (intent === "actionable") {
      if (title.includes("How to")) {
        return title;
      }
      return `learn ${title.toLowerCase()}`;
    }

    if (title.includes("What is")) {
      return title;
    }

    return `${title.toLowerCase()} guide`;
  }
}

import { z } from "zod";

import { ContentMetadataSchema } from "@/types/content.types";

// =========================
// Content Validation
// =========================

export class ContentValidator {
  /**
   * Validate article frontmatter
   */
  static validateMetadata(metadata: unknown): {
    success: boolean;
    data?: any;
    errors?: string[];
  } {
    try {
      const validatedData = ContentMetadataSchema.parse(metadata);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ["Unknown validation error"] };
    }
  }

  /**
   * Validate content quality
   */
  static validateContentQuality(
    content: string,
    metadata: any
  ): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Length validation
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 800) {
      issues.push(`Content too short: ${wordCount} words (minimum 800)`);
      score -= 20;
    } else if (wordCount > 3000) {
      suggestions.push(`Consider breaking into multiple articles: ${wordCount} words`);
    }

    // Reading level check (simplified)
    const avgWordsPerSentence = this.calculateAvgWordsPerSentence(content);
    if (avgWordsPerSentence > 20) {
      issues.push("Sentences too complex (avg >20 words). Consider breaking down.");
      score -= 10;
    }

    // Keyword optimization
    const contentLower = content.toLowerCase();
    const keywordUsage = metadata.keywords.filter((keyword: string) => contentLower.includes(keyword.toLowerCase()));

    if (keywordUsage.length < metadata.keywords.length * 0.7) {
      suggestions.push("Consider using more of your target keywords in the content");
      score -= 5;
    }

    // Structure validation
    const headingCount = (content.match(/^#{1,6}\s/gm) || []).length;
    if (headingCount < 3) {
      issues.push("Add more headings for better structure and readability");
      score -= 10;
    }

    // Action-oriented content check
    if (metadata.intent === "actionable") {
      const actionWords = ["step", "how to", "technique", "exercise", "practice"];
      const hasActionContent = actionWords.some((word) => contentLower.includes(word));
      if (!hasActionContent) {
        issues.push("Actionable content should include specific techniques or exercises");
        score -= 15;
      }
    }

    // CBT integration check
    if (metadata.relatedCbtModules?.length > 0) {
      const cbtTerms = ["cognitive", "behavioral", "thought", "behavior", "cbt"];
      const hasCbtContent = cbtTerms.some((term) => contentLower.includes(term));
      if (!hasCbtContent) {
        suggestions.push("Consider explicitly connecting content to CBT principles");
      }
    }

    // Safety check for crisis content
    if (
      metadata.targetEmotions?.some((emotion: string) =>
        ["crisis", "suicidal", "self-harm", "emergency"].includes(emotion.toLowerCase())
      )
    ) {
      if (!content.includes("crisis") && !content.includes("emergency")) {
        issues.push("Crisis-related content must include safety resources and professional help guidance");
        score -= 25;
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  /**
   * Validate SEO optimization
   */
  static validateSEO(
    content: string,
    metadata: any
  ): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Title optimization
    if (metadata.title.length > 60) {
      issues.push("Title too long for SEO (>60 characters)");
      score -= 15;
    } else if (metadata.title.length < 30) {
      suggestions.push("Consider a longer, more descriptive title");
      score -= 5;
    }

    // Description optimization
    if (metadata.description.length > 160) {
      issues.push("Description too long for meta description (>160 characters)");
      score -= 10;
    } else if (metadata.description.length < 120) {
      suggestions.push("Consider a more detailed description");
    }

    // Primary keyword in title
    const primaryKeyword = metadata.keywords[0]?.toLowerCase();
    if (primaryKeyword && !metadata.title.toLowerCase().includes(primaryKeyword)) {
      issues.push("Primary keyword not in title");
      score -= 20;
    }

    // Keyword density
    const contentLower = content.toLowerCase();
    const wordCount = content.split(/\s+/).length;

    for (const keyword of metadata.keywords) {
      const keywordCount = (contentLower.match(new RegExp(keyword.toLowerCase(), "g")) || []).length;
      const density = (keywordCount / wordCount) * 100;

      if (density < 0.5) {
        suggestions.push(`Low keyword density for "${keyword}" (${density.toFixed(1)}%)`);
      } else if (density > 3) {
        issues.push(`Keyword stuffing detected for "${keyword}" (${density.toFixed(1)}%)`);
        score -= 15;
      }
    }

    // Internal linking opportunities
    const internalLinks = (content.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    if (internalLinks === 0) {
      suggestions.push("Add internal links to related content");
      score -= 5;
    }

    // Headings optimization
    const h1Count = (content.match(/^#\s/gm) || []).length;
    const h2Count = (content.match(/^##\s/gm) || []).length;

    if (h1Count !== 1) {
      issues.push(`Should have exactly 1 H1 heading (found ${h1Count})`);
      score -= 10;
    }

    if (h2Count < 2) {
      suggestions.push("Add more H2 headings for better structure");
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  // =========================
  // Helper Methods
  // =========================

  private static calculateAvgWordsPerSentence(content: string): number {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const totalWords = content.split(/\s+/).length;
    return sentences.length > 0 ? totalWords / sentences.length : 0;
  }

  /**
   * Comprehensive content validation
   */
  static validateComplete(
    metadata: unknown,
    content: string
  ): {
    overall: number;
    metadata: { success: boolean; data?: any; errors?: string[] };
    quality: { score: number; issues: string[]; suggestions: string[] };
    seo: { score: number; issues: string[]; suggestions: string[] };
  } {
    const metadataValidation = this.validateMetadata(metadata);

    if (!metadataValidation.success) {
      return {
        overall: 0,
        metadata: metadataValidation,
        quality: { score: 0, issues: ["Invalid metadata"], suggestions: [] },
        seo: { score: 0, issues: ["Invalid metadata"], suggestions: [] },
      };
    }

    const qualityValidation = this.validateContentQuality(content, metadataValidation.data);
    const seoValidation = this.validateSEO(content, metadataValidation.data);

    const overall = Math.round(qualityValidation.score * 0.6 + seoValidation.score * 0.4);

    return {
      overall,
      metadata: metadataValidation,
      quality: qualityValidation,
      seo: seoValidation,
    };
  }
}

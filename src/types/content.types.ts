import { z } from "zod";

// =========================
// Content System Types
// =========================

export const ContentCategorySchema = z.enum([
  // Guide categories
  "getting-started",
  "cbt-exercises",
  "self-help-tools",
  // Insight categories
  "pattern-recognition",
  "progress-tracking",
  "personalization",
  // Legacy article categories
  "cognitive-behavioral-therapy",
  "anxiety-management",
  "depression-support",
  "stress-management",
  "relationship-patterns",
  "self-compassion",
  "mindfulness-techniques",
  "mood-tracking",
]);

export type ContentCategory = z.infer<typeof ContentCategorySchema>;

// Specific guide and insight category types
export type GuideCategory = "getting-started" | "cbt-exercises" | "self-help-tools";
export type InsightCategory = "pattern-recognition" | "progress-tracking" | "personalization";

export const ContentTypeSchema = z.enum(["article", "guide", "insight"]);

export type ContentType = z.infer<typeof ContentTypeSchema>;

export const ContentIntentSchema = z.enum([
  "informational",
  "actionable",
  "supportive",
  "instructional",
  "analytical",
  "motivational",
  "therapeutic",
  "emergency",
]);

export type ContentIntent = z.infer<typeof ContentIntentSchema>;

// =========================
// Lightweight Content Metadata
// =========================

export const ContentMetadataSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(300),
  slug: z.string().min(1),
  category: ContentCategorySchema,
  contentType: ContentTypeSchema,
  intent: ContentIntentSchema,

  // SEO essentials
  keywords: z.array(z.string()),
  searchVolume: z.number().optional(),

  // Organization
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  featured: z.boolean().default(false),
  readingTime: z.number().optional(), // estimated minutes

  // AI integration hooks
  relatedCbtModules: z.array(z.string()).optional(),
  targetEmotions: z.array(z.string()).optional(),

  // Publishing
  publishedAt: z.date().optional(),
  updatedAt: z.date().optional(),
  draft: z.boolean().default(true),
});

export type ContentMetadata = z.infer<typeof ContentMetadataSchema>;

// =========================
// Content Item Structure
// =========================

export interface ContentItem extends ContentMetadata {
  body: string;
  locale: string;
}

// Content preview (without body, keywords, searchVolume) for lists
export type ContentPreview = Omit<ContentItem, "body" | "keywords" | "searchVolume">;

// =========================
// Content Filters
// =========================

export interface ContentFilters {
  locale?: "en" | "ar" | "fr";
  category?: ContentCategory;
  contentType?: ContentType;
  featured?: boolean;
  relatedCbtModules?: string[];
  targetEmotions?: string[];
}

// =========================
// Content Recommendation Types
// =========================

export interface ContentRecommendation {
  content: ContentPreview;
  relevanceScore: number; // 0-100
  reason: string;
  matchedPatterns: string[];
}

export interface ContentRecommendationContext {
  userEmotions?: string[];
  sessionThemes?: string[];
  cbtModules?: string[];
  completedContent?: string[];
}

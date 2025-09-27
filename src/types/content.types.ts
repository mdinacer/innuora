import { z } from "zod";

// =========================
// Content System Types
// =========================

export const ContentCategorySchema = z.enum([
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

export const ContentTypeSchema = z.enum(["article", "guide", "insight"]);

export type ContentType = z.infer<typeof ContentTypeSchema>;

export const ContentIntentSchema = z.enum(["informational", "actionable", "supportive", "therapeutic", "emergency"]);

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
  draft: z.boolean().default(true),
});

export type ContentMetadata = z.infer<typeof ContentMetadataSchema>;

// =========================
// Content Item Structure
// =========================

export interface ContentItem {
  metadata: ContentMetadata;
  excerpt?: string;
  // Full content will be loaded dynamically when needed
}

// =========================
// Content Recommendation Types
// =========================

export interface ContentRecommendation {
  slug: string;
  title: string;
  category: ContentCategory;
  relevanceScore: number;
  reason: string;
}

export interface ContentRecommendationContext {
  userEmotions?: string[];
  sessionThemes?: string[];
  cbtModules?: string[];
  completedContent?: string[];
}

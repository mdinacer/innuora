import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { ContentCategory, ContentMetadata } from "@/types/content.types";
import { contentRegistry } from "./content-registry";

/* eslint-disable @typescript-eslint/no-use-before-define */

// =========================
// Content Loader
// =========================

/**
 * Supported locales for content
 */
export const SUPPORTED_CONTENT_LOCALES = ["en", "ar", "fr"] as const;
export type SupportedContentLocale = (typeof SUPPORTED_CONTENT_LOCALES)[number];

/**
 * Loads content metadata from actual markdown files
 * and registers it with the content registry
 * Now supports multiple locales with fallback to English
 */
export async function initializeContentRegistry(): Promise<void> {
  // Check if already initialized
  if (contentRegistry.isInitialized()) {
    return;
  }

  // Clear any existing data (safety measure)
  contentRegistry.clear();

  try {
    // Get the content directory path - now using /en/ subdirectory as the source of truth
    const contentDir = path.join(process.cwd(), "src", "content", "articles", "en");

    // Check if content directory exists
    if (!fs.existsSync(contentDir)) {
      console.warn("English content directory not found, falling back to taxonomy");
      await initializeFromTaxonomy();
      return;
    }

    // Read all markdown files from English content directory for registry
    const categories = fs
      .readdirSync(contentDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    let totalArticles = 0;

    for (const category of categories) {
      const categoryDir = path.join(contentDir, category);
      const files = fs.readdirSync(categoryDir).filter((file) => file.endsWith(".md"));

      for (const file of files) {
        const filePath = path.join(categoryDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data: frontmatter, excerpt: fileExcerpt } = matter(fileContent, { excerpt: true });

        // Parse frontmatter into ContentMetadata
        const metadata: ContentMetadata = {
          title: frontmatter.title,
          description: frontmatter.description,
          slug: frontmatter.slug,
          category: frontmatter.category as ContentCategory,
          contentType: frontmatter.contentType || "article",
          intent: frontmatter.intent,
          keywords: frontmatter.keywords || [],
          searchVolume: frontmatter.searchVolume || 0,
          priority: frontmatter.priority || "medium",
          featured: frontmatter.featured || false,
          readingTime: frontmatter.readingTime || 8,
          draft: frontmatter.draft || false,
          relatedCbtModules: frontmatter.relatedCbtModules || [],
          targetEmotions: frontmatter.targetEmotions || [],
          publishedAt: frontmatter.publishedAt ? new Date(frontmatter.publishedAt) : new Date(),
        };

        // Only register non-draft articles for sitemap
        if (!metadata.draft) {
          const excerpt = fileExcerpt || generateExcerpt(metadata.title, metadata.category);
          contentRegistry.register(metadata, excerpt);
          totalArticles++;
        }
      }
    }

    // Mark as initialized
    contentRegistry.markInitialized();

    console.log(`Initialized content registry with ${totalArticles} published articles`);
  } catch (error) {
    console.error("Failed to initialize content registry:", error);
    // Fallback to taxonomy if file reading fails
    await initializeFromTaxonomy();
  }
}

/**
 * Load localized markdown content for a specific article
 * Falls back to English if the requested locale doesn't exist
 */
export function loadLocalizedContent(
  category: string,
  slug: string,
  locale: string = "en"
): { content: string; locale: string } | null {
  try {
    // Normalize locale to supported locale
    const normalizedLocale = normalizeLocale(locale);

    // Try to load content in requested locale
    const localizedPath = path.join(
      process.cwd(),
      "src",
      "content",
      "articles",
      normalizedLocale,
      category,
      `${slug}.md`
    );

    if (fs.existsSync(localizedPath)) {
      const fileContent = fs.readFileSync(localizedPath, "utf-8");
      const { content } = matter(fileContent);
      return { content, locale: normalizedLocale };
    }

    // Fallback to English if locale not found
    if (normalizedLocale !== "en") {
      const englishPath = path.join(process.cwd(), "src", "content", "articles", "en", category, `${slug}.md`);

      if (fs.existsSync(englishPath)) {
        const fileContent = fs.readFileSync(englishPath, "utf-8");
        const { content } = matter(fileContent);
        return { content, locale: "en" };
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to load content for ${category}/${slug} in locale ${locale}:`, error);
    return null;
  }
}

/**
 * Check if content exists in a specific locale
 */
export function contentExistsInLocale(category: string, slug: string, locale: string): boolean {
  const normalizedLocale = normalizeLocale(locale);
  const localizedPath = path.join(
    process.cwd(),
    "src",
    "content",
    "articles",
    normalizedLocale,
    category,
    `${slug}.md`
  );
  return fs.existsSync(localizedPath);
}

/**
 * Get available locales for a specific article
 */
export function getAvailableLocales(category: string, slug: string): SupportedContentLocale[] {
  const availableLocales: SupportedContentLocale[] = [];

  for (const locale of SUPPORTED_CONTENT_LOCALES) {
    if (contentExistsInLocale(category, slug, locale)) {
      availableLocales.push(locale);
    }
  }

  return availableLocales;
}

/**
 * Load localized metadata (title, description) from markdown frontmatter
 */
export function loadLocalizedMetadata(
  category: string,
  slug: string,
  locale: string = "en"
): { title: string; description: string } | null {
  try {
    const normalizedLocale = normalizeLocale(locale);
    const localizedPath = path.join(
      process.cwd(),
      "src",
      "content",
      "articles",
      normalizedLocale,
      category,
      `${slug}.md`
    );

    if (fs.existsSync(localizedPath)) {
      const fileContent = fs.readFileSync(localizedPath, "utf-8");
      const { data } = matter(fileContent);
      return { title: data.title || "", description: data.description || "" };
    }

    // Fallback to English
    if (normalizedLocale !== "en") {
      const englishPath = path.join(process.cwd(), "src", "content", "articles", "en", category, `${slug}.md`);
      if (fs.existsSync(englishPath)) {
        const fileContent = fs.readFileSync(englishPath, "utf-8");
        const { data } = matter(fileContent);
        return { title: data.title || "", description: data.description || "" };
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to load metadata for ${category}/${slug}:`, error);
    return null;
  }
}

/**
 * Normalize locale to supported locale (fallback to English)
 */
function normalizeLocale(locale: string): SupportedContentLocale {
  const normalized = locale.toLowerCase().split("-")[0]; // "en-US" -> "en"
  return SUPPORTED_CONTENT_LOCALES.includes(normalized as SupportedContentLocale)
    ? (normalized as SupportedContentLocale)
    : "en";
}

/**
 * Fallback: Load from taxonomy (legacy behavior)
 */
async function initializeFromTaxonomy(): Promise<void> {
  try {
    // Import the content taxonomy
    const { default: taxonomy } = await import("@/content/content-taxonomy.json");

    // Register all articles from taxonomy
    Object.entries(taxonomy.contentTaxonomy.primaryCategories).forEach(([categoryKey, categoryData]) => {
      const category = categoryKey as ContentCategory;

      categoryData.articles.forEach((articleData: any) => {
        const metadata: ContentMetadata = {
          title: articleData.title,
          description: `Learn about ${articleData.title.toLowerCase()}`,
          slug: articleData.slug,
          category,
          contentType: "article",
          intent: mapIntent(articleData.intent),
          keywords: articleData.keywords,
          searchVolume: categoryData.searchVolume,
          priority: categoryData.priority === "high" ? "high" : "medium",
          featured: false,
          readingTime: estimateReadingTime(articleData.title),
          draft: true, // All content starts as draft until written
          relatedCbtModules: inferCbtModules(category),
          targetEmotions: inferTargetEmotions(category),
          publishedAt: new Date(), // Add current date as placeholder
        };

        // Generate brief excerpt from title
        const excerpt = generateExcerpt(articleData.title, category);

        contentRegistry.register(metadata, excerpt);
      });
    });

    // Mark as initialized
    contentRegistry.markInitialized();

    console.log(`Initialized content registry with ${contentRegistry.getAll().length} articles from taxonomy`);
  } catch (error) {
    console.error("Failed to initialize content registry from taxonomy:", error);
  }
}

// =========================
// Helper Functions
// =========================

function mapIntent(intent: string): ContentMetadata["intent"] {
  // Handle compound intents by taking the first part
  const primaryIntent = intent.split("/")[0];

  const intentMap: Record<string, ContentMetadata["intent"]> = {
    informational: "informational",
    actionable: "actionable",
    supportive: "supportive",
    emergency: "emergency",
    instructional: "actionable",
    therapeutic: "therapeutic",
    advanced: "actionable",
    professional: "actionable",
    seasonal: "informational",
    motivational: "supportive",
    relationship: "supportive",
    recovery: "therapeutic",
    transformational: "therapeutic",
    analytical: "informational",
    innovative: "informational",
    educational: "informational",
    lifestyle: "actionable",
  };

  return intentMap[primaryIntent] || "informational";
}

function estimateReadingTime(title: string): number {
  // Estimate based on article type and complexity
  if (title.includes("Complete Guide") || title.includes("Step-by-Step")) {
    return 12; // Comprehensive guides
  }
  if (title.includes("Techniques") || title.includes("Strategies")) {
    return 8; // Practical articles
  }
  if (title.includes("What is") || title.includes("Understanding")) {
    return 6; // Educational articles
  }
  return 7; // Default
}

function inferCbtModules(category: ContentCategory): string[] {
  const moduleMap: Record<ContentCategory, string[]> = {
    "cognitive-behavioral-therapy": ["cognitive", "behavioral", "core_beliefs"],
    "anxiety-management": ["mindfulness", "behavioral_activation", "cognitive"],
    "depression-support": ["behavioral_activation", "cognitive", "values_clarification"],
    "stress-management": ["mindfulness", "cognitive", "behavioral"],
    "relationship-patterns": ["core_beliefs", "cognitive", "values_clarification"],
    "self-compassion": ["core_beliefs", "cognitive", "mindfulness"],
    "mindfulness-techniques": ["mindfulness", "cognitive"],
    "mood-tracking": ["behavioral_activation", "cognitive"],
  };

  return moduleMap[category] || [];
}

function inferTargetEmotions(category: ContentCategory): string[] {
  const emotionMap: Record<ContentCategory, string[]> = {
    "anxiety-management": ["anxiety", "worry", "panic"],
    "depression-support": ["sadness", "hopelessness", "fatigue"],
    "stress-management": ["overwhelm", "stress", "tension"],
    "relationship-patterns": ["loneliness", "rejection", "conflict"],
    "self-compassion": ["shame", "self-criticism", "guilt"],
    "mindfulness-techniques": ["racing thoughts", "emotional overwhelm"],
    "mood-tracking": ["mood swings", "emotional numbness"],
    "cognitive-behavioral-therapy": ["negative thoughts", "distorted thinking"],
  };

  return emotionMap[category] || [];
}

function generateExcerpt(title: string, category: ContentCategory): string {
  const categoryDescriptions: Record<ContentCategory, string> = {
    "cognitive-behavioral-therapy": "evidence-based CBT techniques",
    "anxiety-management": "practical anxiety relief strategies",
    "depression-support": "supportive approaches for depression",
    "stress-management": "effective stress reduction methods",
    "relationship-patterns": "healthy relationship dynamics",
    "self-compassion": "self-kindness and acceptance practices",
    "mindfulness-techniques": "present-moment awareness exercises",
    "mood-tracking": "emotional awareness and monitoring tools",
  };

  return `Discover ${categoryDescriptions[category]} in this comprehensive guide. Learn practical techniques you can apply immediately.`;
}

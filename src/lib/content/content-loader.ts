/**
 * Content Loader - File System Based
 *
 * Loads guides and insights from the content directory
 * Supports multi-language content with fallback to English
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { AppLocales } from "@/lib/i18n";
import { ContentFilters, ContentItem, ContentMetadata, ContentPreview } from "@/types/content.types";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

/**
 * Parse markdown file and extract metadata + content
 */
function parseContentFile(filePath: string, locale: AppLocales): ContentItem | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    return {
      ...(data as ContentMetadata),
      body: content,
      locale,
    };
  } catch (error) {
    console.error(`Failed to parse content file: ${filePath}`, error);
    return null;
  }
}

/**
 * Get all content files from a directory
 */
function getAllContentFiles(contentType: "guides" | "insights", locale: AppLocales): ContentItem[] {
  const contentPath = path.join(CONTENT_DIR, contentType, locale);

  if (!fs.existsSync(contentPath)) {
    return [];
  }

  const items: ContentItem[] = [];

  function walkDir(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith(".md")) {
        const item = parseContentFile(filePath, locale);
        if (item && !item.draft) {
          items.push(item);
        }
      }
    }
  }

  walkDir(contentPath);
  return items;
}

/**
 * Get all guides for a specific locale
 */
export function getAllGuides(locale: AppLocales = "en"): ContentItem[] {
  return getAllContentFiles("guides", locale);
}

/**
 * Get all insights for a specific locale
 */
export function getAllInsights(locale: AppLocales = "en"): ContentItem[] {
  return getAllContentFiles("insights", locale);
}

/**
 * Get all content (guides + insights) for a specific locale
 */
export function getAllContent(locale: AppLocales = "en"): ContentItem[] {
  return [...getAllGuides(locale), ...getAllInsights(locale)];
}

/**
 * Get content by slug with locale support and fallback
 */
export function getContentBySlug(
  slug: string,
  contentType: "guides" | "insights",
  locale: AppLocales = "en"
): ContentItem | null {
  const allContent = getAllContentFiles(contentType, locale);
  let content = allContent.find((item) => item.slug === slug);

  // Fallback to English if not found in requested locale
  if (!content && locale !== "en") {
    const englishContent = getAllContentFiles(contentType, "en");
    content = englishContent.find((item) => item.slug === slug);
    if (content) {
      content.locale = locale; // Keep requested locale for UI purposes
    }
  }

  return content || null;
}

/**
 * Get content previews (without body) for lists
 */
export function getContentPreviews(locale: AppLocales = "en"): ContentPreview[] {
  const allContent = getAllContent(locale);

  return allContent.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { body, keywords, searchVolume, ...preview } = item;
    return preview as ContentPreview;
  });
}

/**
 * Filter content based on criteria
 */
export function filterContent(filters: ContentFilters): ContentPreview[] {
  const locale = filters.locale || "en";
  let content = getContentPreviews(locale);

  if (filters.category) {
    content = content.filter((item) => item.category === filters.category);
  }

  if (filters.contentType) {
    content = content.filter((item) => item.contentType === filters.contentType);
  }

  if (filters.featured !== undefined) {
    content = content.filter((item) => item.featured === filters.featured);
  }

  if (filters.relatedCbtModules && filters.relatedCbtModules.length > 0) {
    content = content.filter(
      (item) =>
        item.relatedCbtModules && item.relatedCbtModules.some((module) => filters.relatedCbtModules!.includes(module))
    );
  }

  if (filters.targetEmotions && filters.targetEmotions.length > 0) {
    content = content.filter(
      (item) => item.targetEmotions && item.targetEmotions.some((emotion) => filters.targetEmotions!.includes(emotion))
    );
  }

  return content;
}

/**
 * Get featured content for a locale
 */
export function getFeaturedContent(locale: AppLocales = "en"): ContentPreview[] {
  return filterContent({ locale, featured: true });
}

/**
 * Get content by category
 */
export function getContentByCategory(category: string, locale: AppLocales = "en"): ContentPreview[] {
  return filterContent({ locale, category: category as any });
}

/**
 * Search content by keyword (title, description)
 */
export function searchContent(query: string, locale: AppLocales = "en"): ContentPreview[] {
  const allContent = getContentPreviews(locale);
  const lowerQuery = query.toLowerCase();

  return allContent.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      (item.relatedCbtModules && item.relatedCbtModules.some((module) => module.toLowerCase().includes(lowerQuery))) ||
      (item.targetEmotions && item.targetEmotions.some((emotion) => emotion.toLowerCase().includes(lowerQuery)))
  );
}

import { ContentCategory, ContentItem, ContentMetadata } from "@/types/content.types";

// =========================
// Content Registry
// =========================

/**
 * Lightweight content registry - metadata only
 * Full content will be loaded on-demand via MDX
 */
export class ContentRegistry {
  private static instance: ContentRegistry;
  private contentIndex: Map<string, ContentItem> = new Map();
  private categoryIndex: Map<ContentCategory, ContentItem[]> = new Map();
  private initialized: boolean = false;

  static getInstance(): ContentRegistry {
    if (!ContentRegistry.instance) {
      ContentRegistry.instance = new ContentRegistry();
    }
    return ContentRegistry.instance;
  }

  /**
   * Register content item (metadata only)
   */
  register(metadata: ContentMetadata, excerpt?: string): void {
    // Prevent duplicate registrations
    if (this.contentIndex.has(metadata.slug)) {
      return;
    }

    const item: ContentItem = {
      metadata,
      excerpt,
    };

    // Add to main index
    this.contentIndex.set(metadata.slug, item);

    // Add to category index
    if (!this.categoryIndex.has(metadata.category)) {
      this.categoryIndex.set(metadata.category, []);
    }
    this.categoryIndex.get(metadata.category)!.push(item);
  }

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Mark registry as initialized
   */
  markInitialized(): void {
    this.initialized = true;
  }

  /**
   * Clear all content (for testing)
   */
  clear(): void {
    this.contentIndex.clear();
    this.categoryIndex.clear();
    this.initialized = false;
  }

  /**
   * Get content by slug
   */
  getBySlug(slug: string): ContentItem | undefined {
    return this.contentIndex.get(slug);
  }

  /**
   * Get content by category
   */
  getByCategory(category: ContentCategory): ContentItem[] {
    return this.categoryIndex.get(category) || [];
  }

  /**
   * Get all content items
   */
  getAll(): ContentItem[] {
    return Array.from(this.contentIndex.values());
  }

  /**
   * Get featured content
   */
  getFeatured(): ContentItem[] {
    return this.getAll().filter((item) => item.metadata.featured);
  }

  /**
   * Search content by keywords
   */
  search(query: string): ContentItem[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAll().filter((item) => {
      const { title, description, keywords } = item.metadata;
      return (
        title.toLowerCase().includes(lowercaseQuery) ||
        description.toLowerCase().includes(lowercaseQuery) ||
        keywords.some((keyword) => keyword.toLowerCase().includes(lowercaseQuery))
      );
    });
  }

  /**
   * Get related content based on CBT modules or emotions
   */
  getRelated(item: ContentItem, limit: number = 3): ContentItem[] {
    const { relatedCbtModules, targetEmotions, category } = item.metadata;

    return this.getAll()
      .filter((other) => other.metadata.slug !== item.metadata.slug)
      .filter((other) => {
        // Same category gets priority
        if (other.metadata.category === category) return true;

        // Matching CBT modules
        if (relatedCbtModules && other.metadata.relatedCbtModules) {
          return relatedCbtModules.some((module) => other.metadata.relatedCbtModules!.includes(module));
        }

        // Matching target emotions
        if (targetEmotions && other.metadata.targetEmotions) {
          return targetEmotions.some((emotion) => other.metadata.targetEmotions!.includes(emotion));
        }

        return false;
      })
      .slice(0, limit);
  }
}

// Export singleton instance
export const contentRegistry = ContentRegistry.getInstance();

import { ContentCategory, ContentMetadata } from "@/types/content.types";
import { contentRegistry } from "./content-registry";

// =========================
// Content Loader
// =========================

/**
 * Loads content metadata from the content taxonomy
 * and registers it with the content registry
 */
export async function initializeContentRegistry(): Promise<void> {
  // Check if already initialized
  if (contentRegistry.isInitialized()) {
    return;
  }

  // Clear any existing data (safety measure)
  contentRegistry.clear();

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

    console.log(`Initialized content registry with ${contentRegistry.getAll().length} articles`);
  } catch (error) {
    console.error("Failed to initialize content registry:", error);
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

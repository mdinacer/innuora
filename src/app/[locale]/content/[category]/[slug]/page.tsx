import { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleLayout from "@/components/content/article-layout";
import { getAvailableLocales, initializeContentRegistry, loadLocalizedContent } from "@/lib/content/content-loader";
import { contentRegistry } from "@/lib/content/content-registry";
import { ContentCategory } from "@/types/content.types";

// =========================
// Page Props
// =========================

interface ContentPageProps {
  params: Promise<{
    locale: string;
    category: string;
    slug: string;
  }>;
}

// =========================
// Dynamic Metadata Generation (Next.js 15)
// =========================

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Initialize content registry if needed
  await initializeContentRegistry();

  // Get content item
  const contentItem = contentRegistry.getBySlug(slug);

  if (!contentItem) {
    return {
      title: "Content Not Found",
      description: "The requested content could not be found.",
    };
  }

  // Use SEOGenerator for comprehensive metadata
  const { SEOGenerator } = await import("@/lib/content/seo-generator");
  return SEOGenerator.generateMetadata(contentItem.metadata);
}

// =========================
// Static Params Generation
// =========================

export async function generateStaticParams() {
  await initializeContentRegistry();

  return contentRegistry.getAll().map((item) => ({
    category: item.metadata.category,
    slug: item.metadata.slug,
  }));
}

// =========================
// Page Component
// =========================

export default async function ContentPage({ params }: ContentPageProps) {
  const { locale, category, slug } = await params;

  // Initialize content registry
  await initializeContentRegistry();

  // Validate category
  const validCategories = [
    "cognitive-behavioral-therapy",
    "anxiety-management",
    "depression-support",
    "stress-management",
    "relationship-patterns",
    "self-compassion",
    "mindfulness-techniques",
    "mood-tracking",
  ];

  if (!validCategories.includes(category)) {
    notFound();
  }

  // Get content item
  const contentItem = contentRegistry.getBySlug(slug);

  if (!contentItem || contentItem.metadata.category !== category) {
    notFound();
  }

  // Load the actual markdown content in user's locale (with fallback to English)
  const contentResult = loadLocalizedContent(category, slug, locale);

  if (!contentResult) {
    notFound();
  }

  const { content: markdownContent, locale: actualLocale } = contentResult;

  // Get available locales for this article (for language switcher if needed)
  const availableLocales = getAvailableLocales(category, slug);

  // Get related content
  const relatedContent = contentRegistry.getRelated(contentItem);

  // Generate structured data for SEO
  const { SEOGenerator } = await import("@/lib/content/seo-generator");
  const structuredData = SEOGenerator.generateStructuredData(contentItem.metadata, markdownContent);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ArticleLayout
        contentItem={contentItem}
        relatedContent={relatedContent}
        category={category as ContentCategory}
        markdownContent={markdownContent}
        currentLocale={actualLocale}
        availableLocales={availableLocales}
      />
    </>
  );
}

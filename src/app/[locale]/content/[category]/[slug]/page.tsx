import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import matter from "gray-matter";

import ArticleLayout from "@/components/content/article-layout";
import { initializeContentRegistry } from "@/lib/content/content-loader";
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
  const { category, slug } = await params;

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

  // Load the actual markdown content
  let markdownContent = "";
  try {
    const filePath = path.join(process.cwd(), "src", "content", "articles", category, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { content } = matter(fileContent);
      markdownContent = content;
    }
  } catch {}

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
      />
    </>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";

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
  const { category, slug } = await params;

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

  const { title, description, keywords } = contentItem.metadata;

  return {
    title: `${title} | Innuora`,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "Innuora",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/content/${category}/${slug}`,
    },
  };
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

  // Get related content
  const relatedContent = contentRegistry.getRelated(contentItem);

  return (
    <ArticleLayout contentItem={contentItem} relatedContent={relatedContent} category={category as ContentCategory} />
  );
}

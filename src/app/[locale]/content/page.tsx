import { Metadata } from "next";

import ContentLibraryLayout from "@/components/content/content-library-layout";
import { initializeContentRegistry } from "@/lib/content/content-loader";
import { contentRegistry } from "@/lib/content/content-registry";

// =========================
// Page Props
// =========================

interface ContentLibraryPageProps {
  params: Promise<{
    locale: string;
  }>;
}

// =========================
// Metadata Generation
// =========================

export async function generateMetadata({ params }: ContentLibraryPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Content Library | Innuora",
    description:
      "Browse our comprehensive library of mental health articles, guides, and resources covering CBT, anxiety management, depression support, and more.",
    openGraph: {
      title: "Content Library | Innuora",
      description:
        "Browse our comprehensive library of mental health articles, guides, and resources covering CBT, anxiety management, depression support, and more.",
      type: "website",
      siteName: "Innuora",
    },
    alternates: {
      canonical: "/content",
      languages: {
        en: "/en/content",
        ar: "/ar/content",
        fr: "/fr/content",
      },
    },
  };
}

// =========================
// Page Component
// =========================

export default async function ContentLibraryPage({ params }: ContentLibraryPageProps) {
  // Initialize content registry
  await initializeContentRegistry();

  // Get all content organized by category
  const allContent = contentRegistry.getAll();
  const featuredContent = contentRegistry.getFeatured();

  // Group content by category
  const contentByCategory = allContent.reduce(
    (acc, item) => {
      const category = item.metadata.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, typeof allContent>
  );

  return (
    <ContentLibraryLayout
      contentByCategory={contentByCategory}
      featuredContent={featuredContent}
      totalArticles={allContent.length}
    />
  );
}

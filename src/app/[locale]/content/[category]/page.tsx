import { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryLayout from "@/components/content/category-layout";
import { initializeContentRegistry, loadLocalizedMetadata } from "@/lib/content/content-loader";
import { contentRegistry } from "@/lib/content/content-registry";
import { ContentCategory } from "@/types/content.types";

// =========================
// Page Props
// =========================

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    category: string;
  }>;
}

// =========================
// Category Metadata
// =========================

const categoryInfo: Record<string, { title: string; description: string }> = {
  "cognitive-behavioral-therapy": {
    title: "Cognitive Behavioral Therapy (CBT) Resources",
    description: "Learn evidence-based CBT techniques and strategies for mental health and emotional wellbeing.",
  },
  "anxiety-management": {
    title: "Anxiety Management Techniques",
    description: "Practical strategies and exercises to manage anxiety, worry, and panic effectively.",
  },
  "depression-support": {
    title: "Depression Support and Resources",
    description: "Understanding and coping with depression through proven therapeutic approaches.",
  },
  "stress-management": {
    title: "Stress Management Strategies",
    description: "Effective techniques for reducing stress and preventing burnout in daily life.",
  },
  "relationship-patterns": {
    title: "Healthy Relationship Patterns",
    description: "Understanding interpersonal dynamics and building healthier relationships.",
  },
  "self-compassion": {
    title: "Self-Compassion and Kindness",
    description: "Developing a kinder relationship with yourself through self-compassion practices.",
  },
  "mindfulness-techniques": {
    title: "Mindfulness and Meditation",
    description: "Present-moment awareness techniques and mindfulness practices for mental clarity.",
  },
  "mood-tracking": {
    title: "Mood Tracking and Emotional Awareness",
    description: "Understanding and monitoring your emotional patterns for better mental health.",
  },
};

// =========================
// Dynamic Metadata Generation
// =========================

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  const info = categoryInfo[category];

  if (!info) {
    return {
      title: "Category Not Found",
      description: "The requested content category could not be found.",
    };
  }

  return {
    title: `${info.title} | Innuora`,
    description: info.description,
    openGraph: {
      title: info.title,
      description: info.description,
      type: "website",
      siteName: "Innuora",
    },
    alternates: {
      canonical: `/content/${category}`,
    },
  };
}

// =========================
// Static Params Generation
// =========================

export async function generateStaticParams() {
  return Object.keys(categoryInfo).map((category) => ({
    category,
  }));
}

// =========================
// Page Component
// =========================

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = await params;

  // Validate category
  if (!categoryInfo[category]) {
    notFound();
  }

  // Initialize content registry
  await initializeContentRegistry();

  // Get content for this category
  const categoryContent = contentRegistry.getByCategory(category as ContentCategory);

  // Load localized metadata
  const localizedContent = categoryContent.map((item) => {
    const localizedMeta = loadLocalizedMetadata(item.metadata.category, item.metadata.slug, locale);
    if (localizedMeta) {
      return {
        ...item,
        metadata: {
          ...item.metadata,
          title: localizedMeta.title,
          description: localizedMeta.description,
        },
      };
    }
    return item;
  });

  const featuredContent = localizedContent.filter((item) => item.metadata.featured);

  return (
    <CategoryLayout
      category={category as ContentCategory}
      categoryInfo={categoryInfo[category]}
      content={localizedContent}
      featuredContent={featuredContent}
    />
  );
}

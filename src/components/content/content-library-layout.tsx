/* eslint-disable @typescript-eslint/no-use-before-define */
"use client";

import Link from "next/link";
import { BookOpen, Clock, Star, TrendingUp } from "lucide-react";

import { ContentCategory, ContentItem } from "@/types/content.types";

// =========================
// Component Props
// =========================

interface ContentLibraryLayoutProps {
  contentByCategory: Record<string, ContentItem[]>;
  featuredContent: ContentItem[];
  totalArticles: number;
}

// =========================
// Category Information
// =========================

const categoryInfo: Record<ContentCategory, { title: string; description: string; icon: string }> = {
  "cognitive-behavioral-therapy": {
    title: "Cognitive Behavioral Therapy",
    description: "Evidence-based CBT techniques and strategies",
    icon: "🧠",
  },
  "anxiety-management": {
    title: "Anxiety Management",
    description: "Practical strategies for managing anxiety and worry",
    icon: "🌊",
  },
  "depression-support": {
    title: "Depression Support",
    description: "Understanding and coping with depression",
    icon: "🌱",
  },
  "stress-management": {
    title: "Stress Management",
    description: "Techniques for reducing stress and preventing burnout",
    icon: "🧘",
  },
  "relationship-patterns": {
    title: "Healthy Relationships",
    description: "Building and maintaining healthy relationship patterns",
    icon: "💝",
  },
  "self-compassion": {
    title: "Self-Compassion",
    description: "Developing kindness and acceptance toward yourself",
    icon: "🤗",
  },
  "mindfulness-techniques": {
    title: "Mindfulness & Meditation",
    description: "Present-moment awareness and meditation practices",
    icon: "🧘‍♀️",
  },
  "mood-tracking": {
    title: "Mood Tracking",
    description: "Understanding and monitoring emotional patterns",
    icon: "📈",
  },
};

// =========================
// Content Library Layout
// =========================

export default function ContentLibraryLayout({
  contentByCategory,
  featuredContent,
  totalArticles,
}: ContentLibraryLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">Content Library</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-6">
            Explore our comprehensive collection of mental health resources, therapeutic guides, and practical tools to
            support your wellbeing journey.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              {totalArticles} articles
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              {Object.keys(contentByCategory).length} categories
            </div>
            {featuredContent.length > 0 && (
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                {featuredContent.length} featured
              </div>
            )}
          </div>
        </header>

        {/* Featured Content */}
        {featuredContent.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Featured Articles
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredContent.slice(0, 6).map((item) => (
                <FeaturedContentCard key={item.metadata.slug} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Browse by Category</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(contentByCategory).map(([category, articles]) => (
              <CategoryCard key={category} category={category as ContentCategory} articles={articles} />
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Personalized Support?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            While our content library provides valuable insights, our AI-powered therapeutic chat offers personalized
            guidance tailored to your specific needs and situation.
          </p>
          <Link
            href="/sessions"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start a Session
          </Link>
        </section>
      </div>
    </div>
  );
}

// =========================
// Featured Content Card
// =========================

interface FeaturedContentCardProps {
  item: ContentItem;
}

function FeaturedContentCard({ item }: FeaturedContentCardProps) {
  const { metadata, excerpt } = item;

  return (
    <Link
      href={`/content/${metadata.category}/${metadata.slug}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ring-2 ring-blue-500 ring-opacity-50"
    >
      <div className="p-6">
        {/* Featured Badge */}
        <div className="flex items-center mb-3">
          <Star className="w-4 h-4 text-yellow-500 mr-1" />
          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Featured</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-3">
          {metadata.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
          {excerpt || metadata.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="capitalize">{metadata.category.replace(/-/g, " ")}</span>
          {metadata.readingTime && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {metadata.readingTime} min
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// =========================
// Category Card
// =========================

interface CategoryCardProps {
  category: ContentCategory;
  articles: ContentItem[];
}

function CategoryCard({ category, articles }: CategoryCardProps) {
  const info = categoryInfo[category];
  const featuredCount = articles.filter((article) => article.metadata.featured).length;

  return (
    <Link
      href={`/content/${category}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 group"
    >
      {/* Icon and Title */}
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-3">{info.icon}</span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {info.title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{info.description}</p>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <BookOpen className="w-3 h-3 mr-1" />
          {articles.length} articles
        </div>
        {featuredCount > 0 && (
          <div className="flex items-center">
            <Star className="w-3 h-3 mr-1" />
            {featuredCount} featured
          </div>
        )}
      </div>
    </Link>
  );
}

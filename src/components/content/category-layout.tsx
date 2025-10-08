/* eslint-disable @typescript-eslint/no-use-before-define */
"use client";

import Link from "next/link";
import { BookOpen, Clock, Star, StarIcon } from "lucide-react";

import { ContentCategory, ContentItem } from "@/types/content.types";

// =========================
// Component Props
// =========================

interface CategoryLayoutProps {
  category: ContentCategory;
  categoryInfo: {
    title: string;
    description: string;
  };
  content: ContentItem[];
  featuredContent: ContentItem[];
}

// =========================
// Category Layout Component
// =========================

export default function CategoryLayout({ category, categoryInfo, content, featuredContent }: CategoryLayoutProps) {
  // Sort content by priority and reading time
  const sortedContent = [...content].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.metadata.priority];
    const bPriority = priorityOrder[b.metadata.priority];

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    return (a.metadata.readingTime || 0) - (b.metadata.readingTime || 0);
  });

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/content"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Content Library
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{category.replace(/-/g, " ")}</span>
        </nav>

        {/* Category Header */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{categoryInfo.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
            {categoryInfo.description}
          </p>

          {/* Category Stats */}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              {content.length} articles
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
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Articles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredContent.map((item) => (
                <ContentCard key={item.metadata.slug} item={item} featured />
              ))}
            </div>
          </section>
        )}

        {/* All Content */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Articles</h2>

          {sortedContent.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're working on creating comprehensive content for this category. Check back soon for helpful articles
                and guides.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedContent.map((item) => (
                <ContentCard key={item.metadata.slug} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// =========================
// Content Card Component
// =========================

interface ContentCardProps {
  item: ContentItem;
  featured?: boolean;
}

function ContentCard({ item, featured = false }: ContentCardProps) {
  const { metadata, excerpt } = item;

  return (
    <Link
      href={`/content/${metadata.category}/${metadata.slug}`}
      className={`block bg-inn-bg-card border border-inn-border-light rounded-2xl hover:shadow-[0_4px_20px] hover:shadow-inn-bg-accent/15 transition-all duration-200 overflow-hidden ${
        featured ? "ring-1 ring-inn-bg-accent/50 " : "hover:border-inn-bg-accent"
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {featured && (
              <div className="flex items-center mb-2">
                <StarIcon className="w-4 h-4 text-inn-bg-flame mr-1" />
                <span className="text-xs font-medium text-inn-bg-flame">Featured</span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
              {metadata.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
          {excerpt || metadata.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            <span className={`px-3 capitalize py-1 rounded-2xl ${getPriorityColor(metadata.priority)} font-medium`}>
              {metadata.priority}
            </span>
            <span className="capitalize text-sm">{metadata.intent}</span>
          </div>
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
// Helper Functions
// =========================

function getPriorityColor(priority: string): string {
  const colors = {
    high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  };

  return colors[priority as keyof typeof colors] || colors.medium;
}

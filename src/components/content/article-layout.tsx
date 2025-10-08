/* eslint-disable @typescript-eslint/no-use-before-define */
"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import Markdown from "markdown-to-jsx";

import { ContentCategory, ContentItem } from "@/types/content.types";

// =========================
// Component Props
// =========================

interface ArticleLayoutProps {
  contentItem: ContentItem;
  relatedContent: ContentItem[];
  category: ContentCategory;
  markdownContent: string;
  currentLocale?: string; // Actual locale used (for future language switcher)
  availableLocales?: string[]; // Available translations (for future language switcher)
}

// =========================
// Article Layout Component
// =========================

export default function ArticleLayout({ contentItem, relatedContent, category, markdownContent }: ArticleLayoutProps) {
  const { metadata } = contentItem;

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <Link
            href={`/content/${category}`}
            className="inline-flex items-center text-sm text-inn-bg-accent-dark hover:text-inn-bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {category.replace(/-/g, " ")}
          </Link>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm ">
            {/* Category Badge */}
            <span className="inline-flex items-center capitalize px-3 py-1 rounded-full bg-inn-bg-soft border-inn-border-light text-inn-bg-accent">
              <Tag className="w-4 h-4 mr-1" />
              {category.replace(/-/g, " ")}
            </span>

            {/* Reading Time */}
            {metadata.readingTime && (
              <span className="inline-flex items-center text-inn-text-secondary">
                <Clock className="w-4 h-4 mr-1" />
                {metadata.readingTime} min read
              </span>
            )}

            {/* Intent Badge */}
            <span className={`px-3 py-1 rounded capitalize text-xs font-medium ${getIntentColor(metadata.intent)}`}>
              {metadata.intent}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{metadata.title}</h1>

          <p className="text-lg text-inn-text-secondary leading-relaxed">{metadata.description}</p>
        </header>

        {/* Content Area */}
        <main className="border-inn-border-light border bg-inn-bg-card rounded-lg shadow-[0_2px_8px] shadow-inn-bg-accent/10 p-8 mb-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {markdownContent ? (
              <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{markdownContent}</Markdown>
            ) : (
              <div className="bg-inn-bg-soft border-l-4 border-inn-bg-accent p-4 mb-6">
                <h3 className="text-inn-text-primary font-semibold mb-2">Content Loading...</h3>
                <p className="text-inn-text-secondary">
                  Unable to load article content. Please check if the file exists.
                </p>
              </div>
            )}

            {/* Keywords */}
            {metadata.keywords.length > 0 && (
              <div className="mt-8 pt-6 border-t border-inn-border-light">
                <h4 className="text-sm font-semibold text-inn-text-secondary mb-3">Related Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {metadata.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-inn-bg-soft border border-inn-border-light text-inn-text-secondary capitalize rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Related Content */}
        {relatedContent.length > 0 && (
          <section className="bg-inn-bg-card border border-inn-border-light rounded-lg shadow-[0_2px_8px] shadow-inn-bg-accent/10 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedContent.map((item) => (
                <Link
                  key={item.metadata.slug}
                  href={`/content/${item.metadata.category}/${item.metadata.slug}`}
                  className="block p-4 border border-inn-border-light rounded-2xl bg-inn-bg-soft hover:shadow-[0_4px_20px] hover:shadow-inn-bg-accent/15 hover:border-inn-bg-accent transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {item.metadata.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{item.metadata.description}</p>
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <span className="capitalize">{item.metadata.category.replace(/-/g, " ")}</span>
                    {item.metadata.readingTime && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{item.metadata.readingTime} min</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// =========================
// Helper Functions
// =========================

function getIntentColor(intent: string): string {
  const colors = {
    informational: "bg-inn-bg-soft text-inn-bg-accent",
    actionable: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    supportive: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    therapeutic: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    emergency: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return colors[intent as keyof typeof colors] || colors.informational;
}

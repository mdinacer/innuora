"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { ContentRecommendation } from "@/types/content.types";

// =========================
// Component Props
// =========================

interface ContentRecommendationsProps {
  recommendations: ContentRecommendation[];
  title?: string;
  showReason?: boolean;
  limit?: number;
}

// =========================
// Content Recommendations Component
// =========================

export default function ContentRecommendations({
  recommendations,
  title = "Recommended for You",
  showReason = true,
  limit = 3,
}: ContentRecommendationsProps) {
  const displayRecommendations = recommendations.slice(0, limit);

  if (displayRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          {title}
        </h3>
        {recommendations.length > limit && (
          <Link
            href="/content"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            View all
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {displayRecommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.slug} recommendation={recommendation} showReason={showReason} />
        ))}
      </div>
    </div>
  );
}

// =========================
// Recommendation Card Component
// =========================

interface RecommendationCardProps {
  recommendation: ContentRecommendation;
  showReason: boolean;
}

function RecommendationCard({ recommendation, showReason }: RecommendationCardProps) {
  return (
    <Link href={`/content/${recommendation.category}/${recommendation.slug}`} className="block group">
      <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200">
        {/* Content Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {recommendation.title}
          </h4>

          {showReason && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{recommendation.reason}</p>}

          <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="capitalize">{recommendation.category.replace(/-/g, " ")}</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
              <span>{Math.round(recommendation.relevanceScore * 100)}% match</span>
            </div>
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0">
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// =========================
// Specialized Components
// =========================

/**
 * Crisis content recommendations with prominent styling
 */
export function CrisisContentRecommendations({ recommendations }: { recommendations: ContentRecommendation[] }) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Immediate Support Resources</h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            These resources can provide immediate help and guidance.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <Link
            key={recommendation.slug}
            href={`/content/${recommendation.category}/${recommendation.slug}`}
            className="block bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-700 hover:shadow-md transition-all duration-200"
          >
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">{recommendation.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{recommendation.reason}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Module-based recommendations for specific CBT techniques
 */
export function ModuleContentRecommendations({
  moduleName,
  recommendations,
}: {
  moduleName: string;
  recommendations: ContentRecommendation[];
}) {
  if (recommendations.length === 0) {
    return null;
  }

  const moduleDisplayNames: Record<string, string> = {
    cognitive: "Cognitive Techniques",
    behavioral_activation: "Behavioral Activation",
    mindfulness: "Mindfulness & Grounding",
    core_beliefs: "Core Beliefs Work",
    values_clarification: "Values & Meaning",
  };

  const displayName = moduleDisplayNames[moduleName] || moduleName;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">{displayName} Resources</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {recommendations.map((recommendation) => (
          <Link
            key={recommendation.slug}
            href={`/content/${recommendation.category}/${recommendation.slug}`}
            className="block bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
              {recommendation.title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{recommendation.reason}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

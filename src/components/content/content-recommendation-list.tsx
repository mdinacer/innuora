import { Lightbulb } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppLocales } from "@/lib/i18n";
import { ContentRecommendation } from "@/types/content.types";
import { ContentCard } from "./content-card";

interface ContentRecommendationListProps {
  recommendations: ContentRecommendation[];
  locale: AppLocales;
  title?: string;
  emptyMessage?: string;
}

/**
 * Display list of recommended content based on user patterns
 */
export function ContentRecommendationList({
  recommendations,
  locale,
  title = "Recommended Resources",
  emptyMessage = "No recommendations available yet. Complete more sessions to get personalized content.",
}: ContentRecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>No Recommendations Yet</AlertTitle>
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <div key={rec.content.slug} className="relative">
            <ContentCard content={rec.content} locale={locale} />
            {rec.relevanceScore > 70 && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-semibold">
                {rec.relevanceScore}% match
              </div>
            )}
            {rec.reason && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                <Lightbulb className="h-3 w-3 inline mr-1" />
                {rec.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

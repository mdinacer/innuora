import React, { useState } from "react";
import { ArrowRight, BookOpen, Clock, FileText, Headphones, Play, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContentRecommendation } from "@/domains/insights/content-ecosystem.types";

interface Props {
  recommendations: ContentRecommendation[];
  sourceInsightTitle: string;
  onContentAccess: (contentId: string, accessMethod: "click" | "bookmark") => void;
  onMarkAsHelpful: (contentId: string, isHelpful: boolean) => void;
}

const ContentRecommendations: React.FC<Props> = ({
  recommendations,
  sourceInsightTitle,
  onContentAccess,
  onMarkAsHelpful,
}) => {
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [helpfulMarks, setHelpfulMarks] = useState<Record<string, boolean>>({});

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="size-4" />;
      case "guided_exercise":
        return <Play className="size-4" />;
      case "audio_meditation":
        return <Headphones className="size-4" />;
      case "video_explanation":
        return <Play className="size-4" />;
      case "worksheet":
        return <FileText className="size-4" />;
      default:
        return <BookOpen className="size-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "article":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "guided_exercise":
        return "text-green-600 bg-green-50 border-green-200";
      case "audio_meditation":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "video_explanation":
        return "text-red-600 bg-red-50 border-red-200";
      case "worksheet":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-emerald-700 bg-emerald-100";
      case "intermediate":
        return "text-amber-700 bg-amber-100";
      case "advanced":
        return "text-red-700 bg-red-100";
      default:
        return "text-slate-700 bg-slate-100";
    }
  };

  const handleMarkHelpful = (contentId: string, isHelpful: boolean) => {
    setHelpfulMarks((prev) => ({ ...prev, [contentId]: isHelpful }));
    onMarkAsHelpful(contentId, isHelpful);
  };

  const featuredRecommendation = recommendations.find((r) => r.isRecommended) || recommendations[0];
  const otherRecommendations = recommendations.filter((r) => r.id !== featuredRecommendation?.id);

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Learn More About This</h3>
        <p className="text-sm text-slate-600 mb-4">
          Deepen your understanding of "{sourceInsightTitle}" with these resources
        </p>
      </div>

      {/* Featured Recommendation */}
      {featuredRecommendation && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg border ${getContentTypeColor(featuredRecommendation.type)}`}>
              {getContentTypeIcon(featuredRecommendation.type)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-1 bg-blue-600 text-white rounded">FEATURED</span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(featuredRecommendation.difficulty)}`}
                >
                  {featuredRecommendation.difficulty}
                </span>
                {featuredRecommendation.estimatedReadTime && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="size-3" />
                    {featuredRecommendation.estimatedReadTime} min read
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-slate-900 mb-2">{featuredRecommendation.title}</h4>
              <p className="text-sm text-slate-600 mb-3">{featuredRecommendation.summary}</p>

              <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded mb-4">
                <strong>Why this helps:</strong> {featuredRecommendation.recommendationReason}
              </div>

              {/* Key takeaways preview */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">What you'll learn:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {featuredRecommendation.keyTakeaways.slice(0, 3).map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => onContentAccess(featuredRecommendation.id, "click")}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  Start Reading
                  <ArrowRight className="size-4 ml-2" />
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Helpful?</span>
                  <button
                    onClick={() => handleMarkHelpful(featuredRecommendation.id, true)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      helpfulMarks[featuredRecommendation.id] === true
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600 hover:bg-green-50"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleMarkHelpful(featuredRecommendation.id, false)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      helpfulMarks[featuredRecommendation.id] === false
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600 hover:bg-red-50"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Other Recommendations */}
      {otherRecommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-900 mb-4">More Resources</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherRecommendations.slice(0, 4).map((content) => (
              <Card key={content.id} className="p-4 bg-white border-slate-200 hover:border-slate-300 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded border ${getContentTypeColor(content.type)}`}>
                      {getContentTypeIcon(content.type)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(content.difficulty)}`}
                      >
                        {content.difficulty}
                      </span>
                      {content.estimatedReadTime && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="size-3" />
                          {content.estimatedReadTime}min
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-900 mb-1 line-clamp-2">{content.title}</h5>
                    <p className="text-sm text-slate-600 line-clamp-2">{content.summary}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => onContentAccess(content.id, "click")}>
                      Read
                    </Button>

                    {content.relevanceScore > 80 && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="size-3 fill-current" />
                        <span className="text-xs">Highly Relevant</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          Content personalized based on your insight patterns • More resources added weekly
        </p>
      </div>
    </div>
  );
};

export default ContentRecommendations;

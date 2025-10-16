import Link from "next/link";
import { Clock, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLocales } from "@/lib/i18n";
import { ContentPreview } from "@/types/content.types";

interface ContentCardProps {
  content: ContentPreview;
  locale: AppLocales;
  showCategory?: boolean;
}

/**
 * Content card for displaying guides/insights in lists
 */
export function ContentCard({ content, locale, showCategory = true }: ContentCardProps) {
  const href = `/${locale}/${content.contentType === "guide" ? "guides" : "insights"}/${content.slug}`;

  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            {showCategory && (
              <Badge variant={content.contentType === "guide" ? "default" : "secondary"} className="capitalize">
                {content.category.replace("-", " ")}
              </Badge>
            )}
            {content.featured && (
              <Badge variant="outline" className="border-primary text-primary">
                Featured
              </Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2">{content.title}</CardTitle>
          <CardDescription className="line-clamp-2">{content.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{content.readingTime} min read</span>
            </div>
            {content.targetEmotions && content.targetEmotions.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span className="line-clamp-1">{content.targetEmotions.slice(0, 2).join(", ")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

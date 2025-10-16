import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Lightbulb, Tag } from "lucide-react";

import { MarkdownRenderer } from "@/components/content/markdown-renderer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllInsights, getContentBySlug } from "@/lib/content/content-loader";
import { AppLocales } from "@/lib/i18n";

interface InsightPageProps {
  params: Promise<{
    locale: AppLocales;
    slug: string;
  }>;
}

/**
 * Dynamic route for displaying individual insights
 * URL: /[locale]/insights/[slug]
 */
export default async function InsightPage({ params }: InsightPageProps) {
  const { locale, slug } = await params;
  const insight = getContentBySlug(slug, "insights", locale);

  if (!insight) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Back button */}
      <Link href={`/${locale}/sessions`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sessions
        </Button>
      </Link>

      {/* AI Insight indicator */}
      <Alert className="mb-6 border-primary">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>AI-Powered Insight</AlertTitle>
        <AlertDescription>
          This insight explains how Innuora's AI analyzes your patterns and personalizes your therapeutic experience.
        </AlertDescription>
      </Alert>

      {/* Article header */}
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="capitalize">
            {insight.category.replace("-", " ")}
          </Badge>
          {insight.featured && (
            <Badge variant="outline" className="border-primary text-primary">
              Featured
            </Badge>
          )}
          <Badge variant="default">Insight</Badge>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">{insight.title}</h1>
        <p className="text-xl text-muted-foreground">{insight.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{insight.readingTime} min read</span>
          </div>
          {insight.targetEmotions && insight.targetEmotions.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>{insight.targetEmotions.join(", ")}</span>
            </div>
          )}
        </div>
      </header>

      {/* Article content */}
      <Card className="p-8">
        <MarkdownRenderer content={insight.body} />
      </Card>

      {/* Related modules */}
      {insight.relatedCbtModules && insight.relatedCbtModules.length > 0 && (
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Related CBT Techniques</h3>
          <div className="flex gap-2 flex-wrap">
            {insight.relatedCbtModules.map((module) => (
              <Badge key={module} variant="outline">
                {module.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link href={`/${locale}/sessions`}>
          <Button size="lg">Explore Your Patterns in a Session →</Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Generate static params for all insights (for static generation)
 */
export async function generateStaticParams() {
  const locales: AppLocales[] = ["en", "ar", "fr"];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const insights = getAllInsights(locale);
    for (const insight of insights) {
      params.push({
        locale,
        slug: insight.slug,
      });
    }
  }

  return params;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: InsightPageProps) {
  const { locale, slug } = await params;
  const insight = getContentBySlug(slug, "insights", locale);

  if (!insight) {
    return {
      title: "Insight Not Found",
    };
  }

  return {
    title: insight.title,
    description: insight.description,
  };
}

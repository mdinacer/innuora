import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";

import { MarkdownRenderer } from "@/components/content/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllGuides, getContentBySlug } from "@/lib/content/content-loader";
import { AppLocales } from "@/lib/i18n";

interface GuidePageProps {
  params: Promise<{
    locale: AppLocales;
    slug: string;
  }>;
}

/**
 * Dynamic route for displaying individual guides
 * URL: /[locale]/guides/[slug]
 */
export default async function GuidePage({ params }: GuidePageProps) {
  const { locale, slug } = await params;
  const guide = getContentBySlug(slug, "guides", locale);

  if (!guide) {
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

      {/* Article header */}
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default" className="capitalize">
            {guide.category.replace("-", " ")}
          </Badge>
          {guide.featured && (
            <Badge variant="outline" className="border-primary text-primary">
              Featured
            </Badge>
          )}
          <Badge variant="secondary">Guide</Badge>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">{guide.title}</h1>
        <p className="text-xl text-muted-foreground">{guide.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{guide.readingTime} min read</span>
          </div>
          {guide.targetEmotions && guide.targetEmotions.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>{guide.targetEmotions.join(", ")}</span>
            </div>
          )}
        </div>
      </header>

      {/* Article content */}
      <Card className="p-8">
        <MarkdownRenderer content={guide.body} />
      </Card>

      {/* Related modules */}
      {guide.relatedCbtModules && guide.relatedCbtModules.length > 0 && (
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Related CBT Techniques</h3>
          <div className="flex gap-2 flex-wrap">
            {guide.relatedCbtModules.map((module) => (
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
          <Button size="lg">Practice This in a Session →</Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Generate static params for all guides (for static generation)
 */
export async function generateStaticParams() {
  const locales: AppLocales[] = ["en", "ar", "fr"];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const guides = getAllGuides(locale);
    for (const guide of guides) {
      params.push({
        locale,
        slug: guide.slug,
      });
    }
  }

  return params;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: GuidePageProps) {
  const { locale, slug } = await params;
  const guide = getContentBySlug(slug, "guides", locale);

  if (!guide) {
    return {
      title: "Guide Not Found",
    };
  }

  return {
    title: guide.title,
    description: guide.description,
  };
}

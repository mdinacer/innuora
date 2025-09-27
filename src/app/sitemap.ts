import { MetadataRoute } from "next";
import { Languages } from "next/dist/lib/metadata/types/alternative-urls-types";

import { APP_CONFIG } from "@/config/app";
import { initializeContentRegistry } from "@/lib/content/content-loader";
import { contentRegistry } from "@/lib/content/content-registry";
import { SEOGenerator } from "@/lib/content/seo-generator";

const baseUrl = APP_CONFIG.domains.primary;

const routes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/join", changeFrequency: "weekly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/eula", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
];

const locales = ["en", "fr", "ar"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Initialize content registry
  await initializeContentRegistry();

  // Get all content
  const allContent = contentRegistry.getAll();

  // Generate static route entries
  const staticRoutes = routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route.path.startsWith("/") ? route.path : "/" + route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: route.priority,
      alternates: {
        languages: {
          ...Object.fromEntries(locales.filter((l) => l !== locale).map((l) => [l, `${baseUrl}/${l}${route.path}`])),
          "x-default": `${baseUrl}/en${route.path}`,
        } as Languages<string>,
      },
    }))
  );

  // Get unique categories
  const categories = [...new Set(allContent.map((item) => item.metadata.category))];

  // Generate category page entries
  const categoryRoutes = categories.flatMap((category) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/content/${category}`,
      lastModified,
      changeFrequency: "weekly" as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: 0.8,
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.filter((l) => l !== locale).map((l) => [l, `${baseUrl}/${l}/content/${category}`])
          ),
          "x-default": `${baseUrl}/en/content/${category}`,
        } as Languages<string>,
      },
    }))
  );

  // Generate content article entries
  const contentRoutes = allContent.flatMap((item) => {
    const sitemapEntry = SEOGenerator.generateSitemapEntry(item.metadata);

    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${sitemapEntry.url}`,
      lastModified: sitemapEntry.lastModified,
      changeFrequency: sitemapEntry.changeFrequency,
      priority: sitemapEntry.priority,
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.filter((l) => l !== locale).map((l) => [l, `${baseUrl}/${l}${sitemapEntry.url}`])
          ),
          "x-default": `${baseUrl}/en${sitemapEntry.url}`,
        } as Languages<string>,
      },
    }));
  });

  return [...staticRoutes, ...categoryRoutes, ...contentRoutes];
}

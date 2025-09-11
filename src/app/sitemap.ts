import { MetadataRoute } from "next";

const baseUrl = "https://mirael.life";

const routes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/join", changeFrequency: "weekly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/eula", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
];

const locales = ["en", "fr", "ar"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: route.priority,
      alternates: {
        languages: {
          ...Object.fromEntries(locales.filter((l) => l !== locale).map((l) => [l, `${baseUrl}/${l}${route.path}`])),
          "x-default": `${baseUrl}/en${route.path}`,
        },
      },
    }))
  );
}

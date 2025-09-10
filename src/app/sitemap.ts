import { MetadataRoute } from "next";

const baseUrl = "https://mirael.life";

function makeUrl(path: string, priority: number, changeFrequency: "weekly" | "monthly" | "daily") {
  const url = `${baseUrl}${path}`;
  return {
    url,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: `${baseUrl}/en${path}`,
        fr: `${baseUrl}/fr${path}`,
        ar: `${baseUrl}/ar${path}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    makeUrl("", 1, "weekly"), // homepage
    makeUrl("/join", 0.8, "weekly"),
    makeUrl("/privacy", 0.5, "monthly"),
    makeUrl("/eula", 0.5, "monthly"),
    makeUrl("/terms", 0.5, "monthly"),
  ];
}

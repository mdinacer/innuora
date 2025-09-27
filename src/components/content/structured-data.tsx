import { SEOGenerator } from "@/lib/content/seo-generator";
import { ContentMetadata } from "@/types/content.types";

// =========================
// Structured Data Component
// =========================

interface StructuredDataProps {
  contentMetadata: ContentMetadata;
  content?: string;
}

/**
 * Component that renders JSON-LD structured data for SEO
 * Should be included in the head of content pages
 */
export default function StructuredData({ contentMetadata, content }: StructuredDataProps) {
  const structuredData = SEOGenerator.generateStructuredData(contentMetadata, content);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

// =========================
// Breadcrumb Structured Data
// =========================

interface BreadcrumbStructuredDataProps {
  category: string;
  categoryTitle: string;
  articleTitle?: string;
  articleSlug?: string;
}

export function BreadcrumbStructuredData({
  category,
  categoryTitle,
  articleTitle,
  articleSlug,
}: BreadcrumbStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://innuora.com";

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Content Library",
        item: `${baseUrl}/content`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryTitle,
        item: `${baseUrl}/content/${category}`,
      },
    ],
  };

  // Add article breadcrumb if provided
  if (articleTitle && articleSlug) {
    breadcrumbList.itemListElement.push({
      "@type": "ListItem",
      position: 3,
      name: articleTitle,
      item: `${baseUrl}/content/${category}/${articleSlug}`,
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbList, null, 2),
      }}
    />
  );
}

// =========================
// Organization Structured Data
// =========================

export function OrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://innuora.com";

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Innuora",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "AI-powered therapeutic chat platform providing personalized Cognitive Behavioral Therapy conversations",
    foundingDate: "2024",
    sameAs: [
      // Add social media URLs when available
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `${baseUrl}/contact`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organization, null, 2),
      }}
    />
  );
}

// =========================
// FAQ Structured Data (for future use)
// =========================

interface FAQStructuredDataProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqStructuredData, null, 2),
      }}
    />
  );
}

// =========================
// How-To Structured Data (for guide content)
// =========================

interface HowToStructuredDataProps {
  title: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
  totalTime?: string; // ISO 8601 duration format (e.g., "PT15M" for 15 minutes)
}

export function HowToStructuredData({ title, description, steps, totalTime }: HowToStructuredDataProps) {
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description: description,
    totalTime: totalTime,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(howToData, null, 2),
      }}
    />
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { BotIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { APP_CONFIG } from "@/config/app";
import initTranslations from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Conversation = {
  role: "user" | "generic" | "innuora";
  text: string;
};

export const metadata: Metadata = {
  title: `AI Emotional Companion for High-Functioning Women | ${APP_CONFIG.name}`,
  description:
    "Digital emotional companion for high-functioning women facing burnout, overwhelm, and perfectionism. Gain emotional clarity through reflective conversations that reveal patterns and challenge cognitive distortions.",
  keywords: [
    // Primary - Core problems this solves
    "emotional burnout support",
    "women burnout recovery",
    "high-functioning women support",
    "emotional overwhelm relief",
    "perfectionist burnout help",
    "emotional exhaustion support",
    "cognitive distortions help",
    "emotional clarity app",
    "overachiever stress relief",

    // Secondary - Specific features & benefits
    "safe space for women online",
    "emotional mirror app",
    "emotional reflection tool",
    "support for overwhelmed women",
    "silent rules therapy",
    "emotional patterns recognition",
    "self-criticism help",
    "internal pressure relief",
    "emotional validation app",

    // What this app uniquely provides
    "AI emotional companion",
    "digital emotional support",
    "emotional companion for women",
    "compassionate AI support",
    "emotional awareness tool",
    "gentle emotional guidance",
    "emotional safe space app",
    "emotional wellness companion",

    // Problem-focused long-tail
    "app for emotionally exhausted women",
    "support for high-functioning anxiety",
    "help with perfectionist tendencies",
    "emotional overwhelm support app",
    "safe space for emotional reflection",
    "support for women carrying expectations",
    "emotional clarity for working women",
    "help with silent emotional rules",
    "working women emotional support",
  ],
  openGraph: {
    title: `${APP_CONFIG.name} — Emotional AI Companion for High-Functioning Women`,
    description: `Navigate overwhelm and perfectionism with ${APP_CONFIG.name}, the AI companion for emotional clarity and insight.`,
    url: APP_CONFIG.domains.primary,
    siteName: APP_CONFIG.name,
    images: [{ url: "/og/app-cover.png", width: 1200, height: 630, alt: `${APP_CONFIG.name} Open Graph Cover` }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_CONFIG.name} — Emotional AI Companion`,
    description: `Gain clarity, process overwhelm, and manage perfectionism with ${APP_CONFIG.name}, the AI companion for emotional insight.`,
    images: ["/og/app-cover.png"],
    creator: APP_CONFIG.social.twitter.creator,
  },
  alternates: {
    canonical: APP_CONFIG.domains.canonical,
  },
};

interface ConversationCardProps {
  conversation: Conversation;
  label: string;
}

function ConversationCard({ conversation, label }: ConversationCardProps) {
  if (conversation.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="flex items-end gap-2 max-w-[95%] md:max-w-[80%]">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 text-base rtl:text-lg rtl:font-medium text-mir-text-primary">
            {conversation.text}
          </div>
          <div className="size-7 sm:size-9 font-sans rounded-full bg-mir-bg-secondary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            U
          </div>
        </div>
      </div>
    );
  }

  if (conversation.role === "innuora") {
    return (
      <div className="flex justify-start">
        <div className="flex items-start gap-3 sm:max-w-[85%] max-w-[95%]">
          <div className="size-7 font-sans sm:size-9 rounded-full bg-mir-bg-accent hidden sm:flex items-center justify-center text-white flex-shrink-0 text-sm font-semibold shadow-[0_2px_8px] shadow-black/5">
            I
          </div>
          <div className="flex flex-col sm:gap-1 gap-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-1.5 ltr:hidden rounded-full bg-mir-bg-accent" />
              <span className="text-sm font-medium rtl:font-arabic-body rtl:text-base text-mir-bg-accent rtl:font-semibold">
                {label}
              </span>
              <div className="w-1.5 h-1.5 rounded-full rtl:hidden bg-mir-bg-accent" />
            </div>
            <div
              className="rounded-2xl bg-mir-bg-accent text-white px-4 py-3 text-base  rtl:text-lg rtl:font-medium shadow-[0_4px_20px] shadow-black/8 
              [&>ol]:list-inside [&>ol]:list-decimal [&>p:not(:last-child)]:my-2 
              [&>ul]:list-inside [&>ul]:list-disc [&_*>li]:my-2"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                allowedElements={["p", "strong", "em", "a", "ul", "ol", "li", "br", "del", "u"]}
              >
                {conversation.text}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-3 sm:max-w-[85%] max-w-[95%]">
        <div className="size-7 sm:size-9 rounded-full bg-gray-400 hidden md:flex items-center justify-center text-white flex-shrink-0">
          <BotIcon className="size-4 shrink-0" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-500 px-1 rtl:font-arabic-body rtl:text-base">{label}</span>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 px-4 py-3 text-base rtl:text-lg rtl:font-medium text-gray-700 dark:text-gray-300">
            {conversation.text}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["pages"]);

  const { hero, howItHelps, demo, earlyAccess, faq } = {
    // TODO: Implement call-to-action buttons using these actions
    // actions: {
    //   requestAccess: t("homepage.actions.requestAccess"),
    //   testerSignIn: t("homepage.actions.testerSignIn"),
    // },
    hero: {
      badge: t("homepage.hero.badge"),
      title: t("homepage.hero.title"),
      subtitle: t("homepage.hero.subtitle", { app_name: APP_CONFIG.name }),
      cta: {
        join: t("homepage.hero.cta.join"),
        demo: t("homepage.hero.cta.demo"),
      },
      disclaimer: t("homepage.hero.disclaimer", { app_name: APP_CONFIG.name }),
    },
    howItHelps: {
      title: t("homepage.howItHelps.title", { app_name: APP_CONFIG.name }),
      subtitle: t("homepage.howItHelps.subtitle", { app_name: APP_CONFIG.name }),
      features: t("homepage.howItHelps.features", {
        returnObjects: true,
        defaultValue: [],
        app_name: APP_CONFIG.name,
      }) as {
        title: string;
        subtitle: string;
      }[],
    },
    demo: {
      title: t("homepage.demo.title", { app_name: APP_CONFIG.name }),
      subtitle: t("homepage.demo.subtitle", { app_name: APP_CONFIG.name }),
      conversation: t("homepage.demo.conversation", { returnObjects: true, defaultValue: [] }) as {
        role: string;
        text: string;
      }[],
      legend: {
        user: t("homepage.demo.legend.user"),
        generic: t("homepage.demo.legend.generic"),
        innuora: APP_CONFIG.name,
      },
      insights: {
        generic: {
          title: t("homepage.demo.insights.generic.title"),
          points: t("homepage.demo.insights.generic.points", { returnObjects: true, defaultValue: [] }) as string[],
        },
        innuora: {
          title: t("homepage.demo.insights.app.title", { app_name: APP_CONFIG.name }),
          points: t("homepage.demo.insights.app.points", { returnObjects: true, defaultValue: [] }) as string[],
        },
      },
    },
    earlyAccess: {
      title: t("homepage.earlyAccess.title", { app_name: APP_CONFIG.name }),
      subtitle: t("homepage.earlyAccess.subtitle", { app_name: APP_CONFIG.name }),
      cta: t("homepage.earlyAccess.cta"),
    },
    faq: {
      title: t("homepage.faq.title"),
      items: t("homepage.faq.items", { returnObjects: true, defaultValue: [], app_name: APP_CONFIG.name }) as {
        question: string;
        answer: string;
      }[],
    },
  };
  // Structured data for SEO
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_CONFIG.company.legalName,
    url: APP_CONFIG.domains.primary,
    logo: `${APP_CONFIG.domains.primary}/assets/icons/ios/512.png`,
    description: "AI companion for emotional clarity, self-reflection, and burnout recovery",
    foundingDate: APP_CONFIG.company.establishedYear,
    founder: {
      "@type": "Person",
      name: APP_CONFIG.company.founder,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: APP_CONFIG.contact.support,
      contactType: "customer support",
    },
    sameAs: [
      `https://twitter.com/${APP_CONFIG.social.twitter.handle.replace("@", "")}`,
      `https://linkedin.com/company/${APP_CONFIG.social.linkedin.replace("@", "")}`,
    ],
  };

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_CONFIG.name,
    url: APP_CONFIG.domains.primary,
    description: "AI companion for emotional clarity and burnout recovery for high-functioning women",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: APP_CONFIG.name,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="relative rtl:font-arabic-body pt-20 text-base rtl:text-lg font-sans min-h-screen w-screen standalone:w-full overflow-hidden  transition-all duration-300 ease-in text-mir-text-primary">
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* <!-- Hero --> */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-mir-bg-accent/25 bg-mir-bg-soft px-3 py-1 text-[13px] font-semibold text-mir-bg-accent">
          {hero.badge}
        </div>
        <h1
          className={cn(
            " text-4xl md:text-6xl rtl:md:text-7xl font-extrabold leading-tight rtl:leading-normal tracking-tight mb-4  rtl:font-arabic"
          )}
        >
          {hero.title}
        </h1>

        <p className="text-lg md:text-xl text-mir-text-secondary max-w-2xl mx-auto mb-8">{hero.subtitle}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-5">
          <Link
            href="#early-access"
            className="inline-flex justify-center rtl:pt-4 rounded-2xl bg-mir-bg-accent px-6 py-3 text-white font-semibold shadow hover:translate-y-[-1px] transition"
          >
            {hero.cta.join}
          </Link>
          <Link
            href="#demo"
            className="inline-flex justify-center rounded-2xl border border-mir-border-light bg-transparent rtl:pt-4 px-6 py-3 font-semibold text-mir-text-primary hover:text-mir-bg-accent hover:border-mir-bg-accent transition"
          >
            {hero.cta.demo}
          </Link>
        </div>
        <p className="text-sm text-mir-text-secondary max-w-xl mx-auto">
          <em>{hero.disclaimer}</em>
        </p>
      </section>

      {/* <!-- How it helps --> */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl rtl:md:text-5xl rtl:leading-loose font-bold mb-3 rtl:font-arabic">
            {howItHelps.title}
          </h2>
          <p className="text-[17px] rtl:text-xl text-mir-text-secondary max-w-3xl mx-auto">{howItHelps.subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {howItHelps.features.map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl rtl:font-arabic md:text-3xl rtl:leading-normal rtl:md:text-5xl font-bold mb-3 rtl:mb-5">
            {demo.title}
          </h2>
          <p className="text-base rtl:text-lg text-mir-text-secondary max-w-2xl mx-auto mb-4">{demo.subtitle}</p>
        </div>
        <div className="rounded-3xl border border-mir-border-light bg-mir-bg-card sm:p-8 p-4 shadow-md">
          <div className="flex justify-center items-center gap-4 pb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-mir-bg-accent"></div>
              <span className="font-medium">{demo.legend.innuora}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
              <span className="font-medium">{demo.legend.generic}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-mir-bg-secondary"></div>
              <span className="font-medium">{demo.legend.user}</span>
            </div>
          </div>
          <div
            className="space-y-6 max-h-[500px] overflow-y-auto rtl:pl-3 ltr:pr-3 overscroll-content overflow-x-hidden pr-2"
            id="conversationContainer"
          >
            {demo.conversation.map((conversation, index) => (
              <ConversationCard
                key={index}
                conversation={conversation as Conversation}
                label={demo.legend[conversation.role as keyof typeof demo.legend]}
              />
            ))}
          </div>

          {/* <!-- Conversation Insights --> */}
          <div className="mt-8 pt-6 border-t border-mir-border-light">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-mir-text-primary flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  {demo.insights.generic.title}
                </h4>
                <ul className="space-y-3 text-base list-inside text-primary/80 rtl:text-lg">
                  {demo.insights.generic.points.map((item, index) => (
                    <li key={index} className="list-item">
                      <ReactMarkdown components={{ p: ({ children }) => <>{children}</> }}>{item}</ReactMarkdown>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-mir-text-primary flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-mir-bg-accent"></div>
                  {demo.insights.innuora.title}
                </h4>
                <ul className="space-y-3 text-base text-primary/80 rtl:text-lg list-inside">
                  {demo.insights.innuora.points.map((item, index) => (
                    <li key={index} className="list-item">
                      <ReactMarkdown components={{ p: ({ children }) => <>{children}</> }}>{item}</ReactMarkdown>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <!-- Early Access CTA --> */}
      <section id="early-access" className="px-6 py-16">
        <div className="max-w-5xl mx-auto rounded-3xl p-10 text-center text-white bg-gradient-to-br from-[#FF6B5A] to-[#FF8A7A] rtl:to-mir-bg-accent-dark">
          <h2 className="text-3xl md:text-4xl  font-bold mb-3 rtl:mb-5 rtl:font-arabic">{earlyAccess.title}</h2>
          <p className="text-base md:text-lg rtl:font-medium max-w-2xl mx-auto mb-8">{earlyAccess.subtitle}</p>
          <Link
            href={"/join"}
            className="rounded-2xl bg-white px-6 py-3 font-semibold text-mir-bg-accent transition hover:translate-y-[-1px]"
          >
            {earlyAccess.cta}
          </Link>
        </div>
      </section>
      {/* <!-- FAQ (native details/summary for a11y, no extra JS needed) --> */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center rtl:font-arabic rtl:md:text-5xl">{faq.title}</h2>
        <div className="space-y-4">
          {faq.items.map((item, index) => (
            <details key={index} className="rounded-xl border border-mir-border-light bg-mir-bg-card p-4">
              <summary className="cursor-pointer select-none list-none rtl:font-arabic font-semibold">
                {item.question}
              </summary>
              <p className="mt-2 rtl:mt-3 text-primary">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* <!-- Footer --> */}
    </main>
  );
}

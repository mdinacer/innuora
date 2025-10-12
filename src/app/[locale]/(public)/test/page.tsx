import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BotIcon } from "lucide-react";
import Markdown from "markdown-to-jsx";

import BackgroundAnimation from "@/components/background-animation";
import { APP_CONFIG } from "@/config/app";
import initTranslations from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Conversation = {
  role: "user" | "generic" | "app";
  text: string;
};

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — Emotional Mirror & Clarity for High-Functioning Women`,
  description: `${APP_CONFIG.name} is a CBT-informed, privacy-first AI companion that helps high-functioning women identify cognitive distortions, surface silent rules, and regain emotional agency.`,
  keywords: [
    "emotional clarity",
    "mirael",
    "high-functioning women",
    "burnout support",
    "CBT companion",
    "privacy-first mental health",
    "emotional mirror",
    "zero-knowledge encryption",
  ],
  openGraph: {
    title: `${APP_CONFIG.name} — Emotional AI Companion`,
    description: `${APP_CONFIG.name} helps high-performing women transform emotional exhaustion into clarity using CBT-informed reflective conversation.`,
    url: APP_CONFIG.domains.primary,
    siteName: APP_CONFIG.name,
    images: [{ url: "/og/innuora-cover.png", width: 1200, height: 630, alt: `${APP_CONFIG.name} cover` }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_CONFIG.name} — Emotional Companion`,
    description: `${APP_CONFIG.name} helps uncover patterns, challenge internal pressure, and reduce overwhelm — private, evidence-informed.`,
    images: ["/og/innuora-cover.png"],
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
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-input px-4 py-3 text-base rtl:text-lg rtl:font-medium text-inn-text-primary">
            {conversation.text}
          </div>
          <div className="size-7 sm:size-9 font-sans rounded-full bg-inn-bg-secondary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            U
          </div>
        </div>
      </div>
    );
  }

  if (conversation.role === "app") {
    return (
      <div className="flex justify-start">
        <div className="flex items-start gap-3 sm:max-w-[85%] max-w-[95%]">
          <div className=" font-sans  rounded-full hidden sm:flex items-center justify-center text-white flex-shrink-0 text-sm font-semibold shadow-[0_2px_8px] shadow-black/5">
            <Image src="/assets/logo.png" alt="AI" width={24} height={24} className="object-cover object-center" />
          </div>
          <div className="flex flex-col sm:gap-1 gap-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-1.5 ltr:hidden rounded-full bg-inn-bg-accent" />
              <span className="text-sm font-medium rtl:font-arabic-body rtl:text-base text-inn-bg-accent rtl:font-semibold">
                {APP_CONFIG.name}
              </span>
              <div className="w-1.5 h-1.5 rounded-full rtl:hidden bg-inn-bg-accent" />
            </div>
            <div
              className="rounded-2xl bg-inn-bg-accent-dark text-white px-4 py-3 text-base rtl:text-lg rtl:font-medium shadow-[0_4px_20px] shadow-black/8 
              [&>ol]:list-inside [&>ol]:list-decimal [&>p:not(:last-child)]:my-2 
              [&>ul]:list-inside [&>ul]:list-disc [&_*>li]:my-2"
            >
              <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{conversation.text}</Markdown>
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

  // content (use translation fallback if keys missing)
  const hero = {
    badge: t
      ? t("homepage.hero.badge", { defaultValue: "Clinical · Private · Practical" })
      : "Clinical · Private · Practical",
    title: t
      ? t("homepage.hero.title", {
          defaultValue: `${APP_CONFIG.name} — An emotional mirror for high-functioning women`,
        })
      : `${APP_CONFIG.name} — An emotional mirror for high-functioning women`,
    subtitle: t
      ? t("homepage.hero.subtitle", {
          app_name: APP_CONFIG.name,
          defaultValue:
            "CBT-informed reflection that helps you name the pressure, clarify the cost, and find practical next steps.",
        })
      : "CBT-informed reflection that helps you name the pressure, clarify the cost, and find practical next steps.",
    cta: {
      join: t ? t("homepage.hero.cta.join", { defaultValue: "Request access" }) : "Request access",
      demo: t ? t("homepage.hero.cta.demo", { defaultValue: "See a demo" }) : "See a demo",
    },
    disclaimer: t
      ? t("homepage.hero.disclaimer", {
          app_name: APP_CONFIG.name,
          defaultValue: "Not a substitute for therapy. Designed for clarity, not diagnosis.",
        })
      : `Not a substitute for therapy. Designed for clarity, not diagnosis.`,
  };

  const howItHelps = {
    title: t
      ? t("homepage.howItHelps.title", { app_name: APP_CONFIG.name, defaultValue: "How Mirael helps" })
      : "How Mirael helps",
    subtitle: t
      ? t("homepage.howItHelps.subtitle", {
          app_name: APP_CONFIG.name,
          defaultValue: "Precision reflection, evidence-informed interventions, and privacy-first architecture.",
        })
      : "Precision reflection, evidence-informed interventions, and privacy-first architecture.",
    features:
      t && t("homepage.howItHelps.features", { returnObjects: true, defaultValue: [] })
        ? (t("homepage.howItHelps.features", { returnObjects: true }) as { title: string; subtitle: string }[])
        : [
            {
              title: "Emotional mirroring",
              subtitle: "Short, precise reflections that reveal hidden assumptions and silent rules.",
            },
            {
              title: "Distortion detection",
              subtitle: "CBT-informed pattern recognition identifies cognitive distortions in-session.",
            },
            {
              title: "Actionable shifts",
              subtitle: "Small, practical behavior or thought experiments to reduce internal pressure.",
            },
          ],
  };

  const demo = {
    title: t
      ? t("homepage.demo.title", { app_name: APP_CONFIG.name, defaultValue: "Demo conversation" })
      : "Demo conversation",
    subtitle: t
      ? t("homepage.demo.subtitle", {
          app_name: APP_CONFIG.name,
          defaultValue: "A short, representative exchange that demonstrates how Mirael operates.",
        })
      : "A short, representative exchange that demonstrates how Mirael operates.",
    conversation: (t && t("homepage.demo.conversation", { returnObjects: true, defaultValue: [] })) || [
      { role: "user", text: "I’m exhausted but I can’t stop taking on more." },
      {
        role: "app",
        text: "You’re carrying responsibility and it’s starting to feel heavy. Where do you notice it most in your day?",
      },
      { role: "user", text: "At work — I say yes to every request because I don’t want to disappoint." },
      {
        role: "app",
        text: "That’s a pattern of avoiding conflict by over-delivering. What would saying ‘no’ look like this week?",
      },
    ],
    legend: {
      user: t ? t("homepage.demo.legend.user", { defaultValue: "You" }) : "You",
      generic: t ? t("homepage.demo.legend.generic", { defaultValue: "Example" }) : "Example",
      innuora: APP_CONFIG.name,
    },
    insights: {
      generic: {
        title: t ? t("homepage.demo.insights.generic.title", { defaultValue: "What’s happening" }) : "What’s happening",
        points: (t && t("homepage.demo.insights.generic.points", { returnObjects: true, defaultValue: [] })) || [
          "Pattern: automatic 'yes' to requests.",
          "Cost: rising depletion and resentment.",
          "Opportunity: practice small boundary tests.",
        ],
      },
      innuora: {
        title: t
          ? t("homepage.demo.insights.app.title", {
              app_name: APP_CONFIG.name,
              defaultValue: `${APP_CONFIG.name} highlights`,
            })
          : `${APP_CONFIG.name} highlights`,
        points: (t && t("homepage.demo.insights.app.points", { returnObjects: true, defaultValue: [] })) || [
          "Named a pattern (people-pleasing).",
          "Offered one practical experiment (say no to 1 request).",
        ],
      },
    },
  };

  const earlyAccess = {
    title: t
      ? t("homepage.earlyAccess.title", { app_name: APP_CONFIG.name, defaultValue: "Join the private cohort" })
      : "Join the private cohort",
    subtitle: t
      ? t("homepage.earlyAccess.subtitle", {
          app_name: APP_CONFIG.name,
          defaultValue: "Priority access, research updates, and tools crafted for high-demand lives.",
        })
      : "Priority access, research updates, and tools crafted for high-demand lives.",
    cta: t ? t("homepage.earlyAccess.cta", { defaultValue: "Request access" }) : "Request access",
  };

  const faq = {
    title: t ? t("homepage.faq.title", { defaultValue: "Frequently asked questions" }) : "Frequently asked questions",
    items: (t && t("homepage.faq.items", { returnObjects: true, defaultValue: [], app_name: APP_CONFIG.name })) || [
      {
        question: "Is Mirael a replacement for therapy?",
        answer: "No. Mirael provides structured reflection and clarity, not clinical treatment.",
      },
      {
        question: "How private is my data?",
        answer: "All sensitive data is encrypted client-side; Mirael uses zero-knowledge encryption.",
      },
      {
        question: "Who designed the content?",
        answer: "Clinical psychologists contributed the CBT modules and validation exercises.",
      },
    ],
  };

  // Structured data
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_CONFIG.company.legalName,
    url: APP_CONFIG.domains.primary,
    logo: `${APP_CONFIG.domains.primary}/assets/icons/ios/512.png`,
    description: "AI companion for emotional clarity, self-reflection, and burnout recovery",
    foundingDate: APP_CONFIG.company.establishedYear,
    founder: { "@type": "Person", name: APP_CONFIG.company.founder },
    contactPoint: { "@type": "ContactPoint", email: APP_CONFIG.contact.support, contactType: "customer support" },
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
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: APP_CONFIG.name },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: Object.values(faq.items).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main className="relative rtl:font-arabic-body pt-20 text-base rtl:text-lg font-sans min-h-screen w-screen standalone:w-full overflow-hidden transition-all duration-300 ease-in text-inn-text-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <BackgroundAnimation />

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-inn-bg-accent/25 bg-inn-bg-soft px-3 py-1 text-[13px] font-semibold text-inn-bg-accent">
          {hero.badge}
        </div>

        <h1
          className={cn(
            " text-4xl md:text-6xl rtl:md:text-7xl font-extrabold leading-tight rtl:leading-normal tracking-tight mb-4  rtl:font-arabic"
          )}
        >
          {hero.title}
        </h1>

        <p className="text-lg md:text-xl text-inn-text-secondary max-w-2xl mx-auto mb-8">{hero.subtitle}</p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-5">
          <Link
            href="/join"
            className="inline-flex justify-center rounded-2xl bg-inn-bg-accent px-6 py-3 text-white font-semibold shadow hover:translate-y-[-1px] transition"
          >
            {hero.cta.join}
          </Link>
          <Link
            href="#demo"
            className="inline-flex justify-center rounded-2xl border border-inn-border-light bg-transparent px-6 py-3 font-semibold text-inn-text-primary hover:text-inn-bg-accent hover:border-inn-bg-accent transition-all"
          >
            {hero.cta.demo}
          </Link>
        </div>

        <p className="text-sm text-inn-text-secondary max-w-xl mx-auto">
          <em>{hero.disclaimer}</em>
        </p>
      </section>

      {/* How it helps */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl rtl:md:text-5xl font-bold mb-3 rtl:font-arabic">{howItHelps.title}</h2>
          <p className="text-[17px] rtl:text-xl text-inn-text-secondary max-w-3xl mx-auto">{howItHelps.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {howItHelps.features.map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-black/5"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-inn-text-secondary">{feature.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works (simple layout) */}
      <section className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">How Mirael works</h2>
          <p className="text-base rtl:text-lg text-inn-text-secondary max-w-2xl mx-auto">
            Fast, structured reflection — designed to surface what matters and point to one small next step.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6">
            <h4 className="font-semibold mb-2">1. Reflect</h4>
            <p className="text-inn-text-secondary">
              Tell Mirael what’s happening. Keep it brief — she mirrors what’s underneath.
            </p>
          </div>
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6">
            <h4 className="font-semibold mb-2">2. Detect</h4>
            <p className="text-inn-text-secondary">
              Mirael identifies distortions, silent rules, and emotional patterns in real time.
            </p>
          </div>
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6">
            <h4 className="font-semibold mb-2">3. Shift</h4>
            <p className="text-inn-text-secondary">
              Exit each exchange with a concise experiment or reframe you can try immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="relative max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{demo.title}</h2>
          <p className="text-base rtl:text-lg text-inn-text-secondary max-w-2xl mx-auto mb-4">{demo.subtitle}</p>
        </div>

        <div className="rounded-3xl border border-inn-border-light bg-inn-bg-card/40 backdrop-blur-sm sm:p-8 p-4 shadow-md">
          <div className="flex justify-center items-center gap-4 pb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-inn-bg-accent"></div>
              <span className="font-medium">{demo.legend.innuora}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
              <span className="font-medium">{demo.legend.generic}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-inn-bg-secondary"></div>
              <span className="font-medium">{demo.legend.user}</span>
            </div>
          </div>

          <div
            className="space-y-6 max-h-[420px] border-t border-t-inn-border-light pt-[6%] overflow-y-auto rtl:pl-3 ltr:pr-3 overscroll-content overflow-x-hidden pr-2"
            id="conversationContainer"
          >
            {Object.values(demo.conversation).map((conversation, index) => (
              <ConversationCard
                key={index}
                conversation={conversation as Conversation}
                label={(demo.legend as any)[conversation.role]}
              />
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-inn-border-light">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-inn-text-primary flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  {demo.insights.generic.title}
                </h4>
                <ul className="space-y-3 text-base list-inside text-primary/80 rtl:text-lg">
                  {Object.values(demo.insights.generic.points).map((item, index) => (
                    <li key={index} className="list-item">
                      <Markdown options={{ forceInline: true, disableParsingRawHTML: true }}>{item}</Markdown>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-inn-text-primary flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-inn-bg-accent"></div>
                  {demo.insights.innuora.title}
                </h4>
                <ul className="space-y-3 text-base text-primary/80 rtl:text-lg list-inside">
                  {Object.values(demo.insights.innuora.points).map((item, index) => (
                    <li key={index} className="list-item">
                      <Markdown options={{ forceInline: true, disableParsingRawHTML: true }}>{item}</Markdown>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Science */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Built on evidence. Designed for safety.</h2>
          <p className="text-[17px] text-inn-text-secondary max-w-3xl mx-auto">
            Clinical input, CBT modules, and privacy-by-design. We surface patterns — you keep control.
          </p>
        </div>

        <div className="flex justify-center gap-8 flex-wrap">
          <Image src="/assets/logos/cbt.png" alt="CBT" width={120} height={40} />
          <Image src="/assets/logos/gpt.png" alt="Model" width={120} height={40} />
          <Image src="/assets/logos/aes.png" alt="Encryption" width={120} height={40} />
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-inn-bg-soft py-16 px-6">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">Who Mirael serves</h2>
          <p className="text-inn-text-secondary max-w-2xl mx-auto mt-2">
            Practical clarity for people who perform — without burnout becoming the cost.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {[
            {
              title: "The Overextended Leader",
              text: "High responsibility, low replenishment — needs short, practical experiments.",
            },
            {
              title: "The Quiet Perfectionist",
              text: "Self-worth tied to output — needs pattern naming and manageable shifts.",
            },
            { title: "The Caregiver Professional", text: "Always holding others; lacks permission to be held." },
            {
              title: "The Exhausted Achiever",
              text: "Externally competent, internally depleted — needs micro-level change.",
            },
          ].map((p, i) => (
            <div key={i} className="rounded-2xl border border-inn-border-light bg-white p-6">
              <h4 className="font-semibold mb-2">{p.title}</h4>
              <p className="text-inn-text-secondary">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">What early users say</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "Mirael named a pattern I couldn't see. I tried the micro experiment — it worked.",
              author: "Product Manager, NY",
            },
            { quote: "Short, practical, surprisingly human. I used it between meetings.", author: "Team Lead, London" },
            { quote: "Clear, private, and actually useful. No judgement, just clarity.", author: "Consultant, Remote" },
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6">
              <p className="mb-4">“{t.quote}”</p>
              <div className="text-sm font-semibold text-inn-text-secondary">{t.author}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Early Access CTA */}
      <section id="early-access" className="relative px-6 py-16">
        <div className="max-w-5xl mx-auto rounded-3xl p-10 text-center text-white bg-gradient-to-br from-inn-bg-accent-dark to-inn-bg-accent rtl:to-inn-bg-accent-dark">
          <h2 className="text-3xl md:text-4xl  font-bold mb-3 rtl:mb-5 rtl:font-arabic">{earlyAccess.title}</h2>
          <p className="text-base md:text-lg rtl:font-medium max-w-2xl mx-auto mb-8">{earlyAccess.subtitle}</p>
          <Link
            href={"/join"}
            className="rounded-2xl bg-gradient-to-br from-inn-bg-flame to-inn-bg-flame-dark px-6 py-3 font-semibold text-white transition hover:translate-y-[-1px]"
          >
            {earlyAccess.cta}
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center rtl:font-arabic rtl:md:text-5xl">{faq.title}</h2>
        <div className="space-y-4">
          {Object.values(faq.items).map((item, index) => (
            <details key={index} className="rounded-xl border border-inn-border-light bg-inn-bg-card p-4">
              <summary className="cursor-pointer select-none list-none rtl:font-arabic font-semibold">
                {item.question}
              </summary>
              <p className="mt-2 rtl:mt-3 text-primary">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

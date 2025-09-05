import Link from "next/link";

import Footer from "@/components/footer";
import Header from "@/components/header";
import initTranslations, { AppLocales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["pages"]);

  const { hero, howItHelps, demo, earlyAccess, faq } = {
    hero: {
      badge: t("homepage.hero.badge"),
      title: t("homepage.hero.title"),
      subtitle: t("homepage.hero.subtitle"),
      cta: {
        join: t("homepage.hero.cta.join"),
        demo: t("homepage.hero.cta.demo"),
      },
      disclaimer: t("homepage.hero.disclaimer"),
    },
    howItHelps: {
      title: t("homepage.howItHelps.title"),
      subtitle: t("homepage.howItHelps.subtitle"),
      features: t("homepage.howItHelps.features", { returnObjects: true, defaultValue: [] }) as {
        title: string;
        subtitle: string;
      }[],
    },
    demo: {
      title: t("homepage.demo.title"),
      subtitle: t("homepage.demo.subtitle"),
      conversation: t("homepage.demo.conversation", { returnObjects: true, defaultValue: [] }) as {
        role: string;
        text: string;
      }[],
    },
    earlyAccess: {
      title: t("homepage.earlyAccess.title"),
      subtitle: t("homepage.earlyAccess.subtitle"),
      form: {
        placeholder: t("homepage.earlyAccess.form.placeholder"),
        button: t("homepage.earlyAccess.form.button"),
      },
    },
    faq: {
      title: t("homepage.faq.title"),
      items: t("homepage.faq.items", { returnObjects: true, defaultValue: [] }) as {
        question: string;
        answer: string;
      }[],
    },
  };
  return (
    <main className="relative rtl:font-arabic-body text-base rtl:text-lg font-sans min-h-screen w-screen overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
      {/* <!-- Header --> */}
      <Header
        locale={locale as AppLocales}
        sideContent={
          <Link
            href="#early-access"
            className="inline-flex items-center gap-2 rounded-2xl border border-mir-border-light px-4 py-2 text-sm font-medium text-mir-text-primary hover:text-mir-bg-accent hover:border-mir-bg-accent transition"
          >
            {earlyAccess.form.button}
          </Link>
        }
      />

      {/* <!-- Hero --> */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-mir-bg-accent/25 bg-mir-bg-soft px-3 py-1 text-[13px] font-semibold text-mir-bg-accent">
          {hero.badge}
        </div>
        <h1
          className={cn(
            "text-4xl md:text-6xl rtl:md:text-7xl font-extrabold leading-tight tracking-tight mb-4 rtl:font-arabic"
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
          <h2 className="text-3xl md:text-4xl rtl:md:text-5xl font-bold mb-3 rtl:font-arabic">{howItHelps.title}</h2>
          <p className="text-[17px] rtl:text-xl text-mir-text-secondary max-w-3xl mx-auto">{howItHelps.subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {howItHelps.features.map((feature, index) => (
            <div key={index} className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-subtle">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* <!-- Demo --> */}
      <section id="demo" className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl rtl:md:text-5xl font-bold mb-3 rtl:font-arabic">{demo.title}</h2>
          <p className="text-[17px] text-mir-text-secondary max-w-2xl mx-auto">{demo.subtitle}</p>
        </div>
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-card space-y-4">
          {demo.conversation.map((message, index) => (
            <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 rtl:font-medium py-3 text-base rtl:text-lg rtl:font-arabic-body",
                  message.role === "user"
                    ? "border border-mir-border-light bg-mir-bg-input"
                    : "bg-mir-bg-accent rtl:bg-mir-bg-accent-dark text-white"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* <!-- Early Access CTA --> */}
      <section id="early-access" className="px-6 py-16">
        <div className="max-w-5xl mx-auto rounded-3xl p-10 text-center text-white bg-gradient-to-br from-[#FF6B5A] to-[#FF8A7A] rtl:to-mir-bg-accent-dark">
          <h2 className="text-3xl md:text-4xl rtl:md:text-5xl font-bold mb-3 rtl:mb-5 rtl:font-arabic">
            {earlyAccess.title}
          </h2>
          <p className="text-base md:text-lg rtl:font-medium max-w-2xl mx-auto mb-8">{earlyAccess.subtitle}</p>
          <form id="waitlistForm" className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder={earlyAccess.form.placeholder}
              className="flex-1 rounded-2xl bg-white px-4 rtl:font-sans py-3 text-black placeholder:mir-text-secondary dark:placeholder:mir-text-secondary ring-0 border-0 outline-none"
            />
            <button
              type="submit"
              className="rounded-2xl bg-white px-6 py-3 font-semibold text-mir-bg-accent transition hover:translate-y-[-1px]"
            >
              {earlyAccess.form.button}
            </button>
          </form>
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
      <Footer locale={locale as AppLocales} />
    </main>
  );
}

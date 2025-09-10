import React from "react";
import Link from "next/link";

import initTranslations, { AppLocales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  locale: AppLocales;
}

export default async function JoinPageSuccess({ className, locale = "en" }: Props) {
  const { t } = await initTranslations(locale, ["pages"]);

  const pageData = {
    badge: t("joinSuccess.badge"),
    title: t("joinSuccess.title"),
    message: t("joinSuccess.message"),
    nextSteps: {
      title: t("joinSuccess.nextSteps.title"),
      steps: (t("joinSuccess.nextSteps.steps", {
        returnObjects: true,
        defaultValue: "",
      }) || []) as { title: string; description: string }[],
    },
    timeline: {
      title: t("joinSuccess.timeline.title"),
      description: t("joinSuccess.timeline.description"),
    },
    closingNote: t("joinSuccess.closingNote"),
    actions: {
      // follow: t("joinSuccess.actions.follow"),
      // contact: t("joinSuccess.actions.contact"),
      back: t("joinSuccess.actions.back"),
    },
  };
  return (
    <div className={cn("relative", className)}>
      {/* <!-- Success Section --> */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center animate-fade-in">
        {/* <!-- Success Message --> */}
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-green-500/25 bg-green-500/10 px-4 py-2 text-base font-semibold dark:text-[#6ee7b7] text-[#065f46]">
            {pageData.badge}
          </div>

          <h1 className="rtl:font-arabic text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-6">
            {pageData.title}
          </h1>

          <p className="text-lg text-mir-text-secondary max-w-2xl mx-auto mb-8">{pageData.message} </p>
        </div>
      </section>

      {/* <!-- What Happens Next --> */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-card animate-slide-up">
          <h2 className="rtl:font-arabic text-2xl font-bold mb-6 text-center">{pageData.nextSteps.title}</h2>

          <div className="space-y-6">
            {pageData.nextSteps.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-base",
                    index === pageData.nextSteps.steps.length - 1
                      ? "bg-[#10b981] dark:bg-[#10b981]"
                      : "bg-mir-bg-accent"
                  )}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-mir-text-secondary text-base">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* <!-- Timeline --> */}
          <div className="mt-8 pt-6 border-t border-mir-border-light">
            <div className="bg-mir-bg-soft rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-mir-bg-accent"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                <h4 className="font-semibold">{pageData.timeline.title}</h4>
              </div>
              <p className="text-base text-mir-text-secondary">{pageData.timeline.description}</p>
            </div>
          </div>
        </div>

        {/* <!-- Additional Information --> */}
        <div className="mt-8 text-center">
          <div>
            <Link
              href="/"
              className="inline-flex justify-center rtl:pt-4 rounded-2xl bg-mir-bg-accent px-6 py-3 text-white font-semibold shadow hover:translate-y-[-1px] transition"
            >
              {pageData.actions.back}
            </Link>
          </div>

          {/*           
          <p className="text-base text-mir-text-secondary max-w-lg mx-auto mb-6 ltr:italic">{pageData.closingNote}</p>

          <div className="flex justify-center gap-4">
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-mir-border-light bg-mir-bg-card text-base font-medium hover:translate-y-[-1px] transition-all duration-200 shadow-subtle"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l11.733 16h4.267l-11.733-16zm0 16l6.768-6.768m2.46-2.46l6.772-6.772"></path>
              </svg>
              {pageData.actions.follow}
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-mir-border-light bg-mir-bg-card text-base font-medium hover:translate-y-[-1px] transition-all duration-200 shadow-subtle"
            >
              <MailIcon className="size-4" />
              {pageData.actions.contact}
            </Link>
          </div> */}
        </div>
      </section>
    </div>
  );
}

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { TFunction } from "i18next";

import ResolvedCrisisConfirmation from "@/components/crisis/resolved-crisis-confirmation";
import initTranslations from "@/lib/i18n";

const CrisisContactFinder = dynamic(() => import("@/components/crisis/crisis-contact-finder"));

const getGroundingOptions = (t: TFunction) =>
  (t("crisis.grounding.options", { returnObjects: true, defaultValue: "" }) || []) as string[];

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["pages/crisis"]);

  return (
    <main className="min-h-screen flex flex-col sm:items-center sm:justify-center w-screen bg-background rtl:font-arabic-sans">
      <div className="max-w-5xl w-full bg-card sm:rounded-2xl sm:border sm:border-border mx-auto sm:p-8 p-6 space-y-6">
        {/* Opening */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl text-foreground">{t("crisis.title")}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">{t("crisis.intro")}</p>
        </div>

        {/* Gentle reminder to reach out */}
        <div className="rounded-lg bg-muted border border-border p-5 space-y-3">
          <h3 className="text-base font-semibold text-foreground">{t("crisis.grounding.heading")}</h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            {getGroundingOptions(t).map((option, i) => (
              <li className="list-item" key={i}>
                {option}
              </li>
            ))}
          </ul>
        </div>

        {/* Crisis contacts */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t("crisis.contacts.heading")}
          </h3>

          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">{t("crisis.contacts.us_hotline.name")}</p>
            <p className="text-sm text-muted-foreground">{t("crisis.contacts.us_hotline.details")}</p>

            <div className="flex sm:flex-row flex-col items-center gap-x-2">
              <p className="text-sm text-muted-foreground mt-3">{t("crisis.contacts.intl_prompt")}</p>

              <Link
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-base font-sans underline decoration-dotted text-primary hover:text-primary/80"
              >
                findahelpline.com
              </Link>
            </div>
          </div>
        </div>

        {/* Local help finder */}
        <Suspense fallback={<p className="text-sm text-center text-muted-foreground py-4">...</p>}>
          <CrisisContactFinder />
        </Suspense>

        {/* Disclaimer */}
        <div className="rounded-lg bg-accent/10 border border-accent/30 p-4">
          <p className="text-accent-foreground font-bold text-center font-serif-brand animate-pulse">
            {t("crisis.disclaimer.title")}{" "}
          </p>{" "}
          <p className="text-sm text-center text-accent-foreground/70 leading-relaxed">{t("crisis.disclaimer.text")}</p>
        </div>

        {/* Exit button */}
        <ResolvedCrisisConfirmation />
      </div>
    </main>
  );
}

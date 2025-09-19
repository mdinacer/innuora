import { Metadata } from "next";
import Link from "next/link";

import PoliciesFooter from "@/components/policies/policies.footer";
import appConfig from "@/constants/app-config/constants";
import initTranslations, { AppLocales } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Terms of Use - Mirael",
  description:
    "Read Mirael's Terms of Use to understand your rights and responsibilities when using our emotional AI companion platform.",
  keywords: [
    "Mirael terms of use",
    "terms and conditions",
    "user agreement",
    "legal terms",
    "emotional AI terms",
    "app terms",
  ],
  alternates: {
    canonical: "https://www.mirael.life/en/terms",
    languages: {
      en: "https://www.mirael.life/en/terms",
      fr: "https://www.mirael.life/fr/terms",
      ar: "https://www.mirael.life/ar/terms",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TermsOfUseRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["legal"]);

  const content = {
    title: t("terms.title"),
    effectiveDate: t("terms.effectiveDate"),
    version: t("terms.version"),

    intro: {
      headline: t("terms.intro.headline"),
      message: t("terms.intro.message"),
      note: t("terms.intro.note"),
    },

    contact: {
      title: t("terms.contact.title"),
      entity: t("terms.contact.entity"),
      support: t("terms.contact.support"),
      privacy: t("terms.contact.privacy"),
    },

    eligibility: {
      title: t("terms.eligibility.title"),
      ageRequirement: t("terms.eligibility.ageRequirement"),
      message: t("terms.eligibility.message"),
    },

    license: {
      title: t("terms.license.title"),
      permitted: {
        title: t("terms.license.permitted.title"),
        message: t("terms.license.permitted.message"),
      },
      restricted: {
        title: t("terms.license.restricted.title"),
        items: t("terms.license.restricted.items", { returnObjects: true, defaultValue: [] }) as string[],
      },
    },

    responsibilities: {
      title: t("terms.responsibilities.title"),
      sections: {
        accountSecurity: {
          title: t("terms.responsibilities.sections.account_security.title"),
          description: t("terms.responsibilities.sections.account_security.description"),
        },
        legalCompliance: {
          title: t("terms.responsibilities.sections.legal_compliance.title"),
          description: t("terms.responsibilities.sections.legal_compliance.description"),
        },
        prohibitedUses: {
          title: t("terms.responsibilities.sections.prohibited_uses.title"),
          description: t("terms.responsibilities.sections.prohibited_uses.description"),
          items: t("terms.responsibilities.sections.prohibited_uses.items", {
            returnObjects: true,
            defaultValue: [],
          }) as string[],
        },
      },
    },

    natureOfService: {
      title: t("terms.natureOfService.title"),
      message: t("terms.natureOfService.message"),
      disclaimer: t("terms.natureOfService.disclaimer"),
    },

    aiAndContent: {
      title: t("terms.ai_and_content.title"),
      sections: {
        generatedResponses: {
          title: t("terms.ai_and_content.sections.ai_generated_responses.title"),
          description: t("terms.ai_and_content.sections.ai_generated_responses.description"),
        },
        contentRights: {
          title: t("terms.ai_and_content.sections.content_rights.title"),
          description: t("terms.ai_and_content.sections.content_rights.description"),
        },
        contentModeration: {
          title: t("terms.ai_and_content.sections.content_moderation.title"),
          description: t("terms.ai_and_content.sections.content_moderation.description"),
        },
      },
    },

    fees: {
      title: t("terms.fees.title"),
      points: t("terms.fees.points", { returnObjects: true, defaultValue: [] }) as string[],
      refundPolicy: t("terms.fees.refundPolicy"),
    },

    termination: {
      title: t("terms.termination.title"),
      byUser: {
        title: t("terms.termination.by_user.title"),
        description: t("terms.termination.by_user.description"),
      },
      byUs: {
        title: t("terms.termination.by_us.title"),
        description: t("terms.termination.by_us.description"),
      },
      effect: {
        label: t("terms.termination.effect.label"),
        description: t("terms.termination.effect.description"),
      },
    },

    intellectualProperty: {
      title: t("terms.intellectualProperty.title"),
      ownership: t("terms.intellectualProperty.ownership"),
      branding: t("terms.intellectualProperty.branding"),
    },

    disclaimers: {
      title: t("terms.disclaimers.title"),
      asIsService: {
        title: t("terms.disclaimers.as_is_service.title"),
        description: t("terms.disclaimers.as_is_service.description"),
      },
      healthDisclaimer: {
        title: t("terms.disclaimers.health_disclaimer.title"),
        description: t("terms.disclaimers.health_disclaimer.description"),
      },
    },

    liability: {
      title: t("terms.liability.title"),
      message: t("terms.liability.message"),
      cap: {
        label: t("terms.liability.cap.label"),
        message: t("terms.liability.cap.message"),
      },
    },

    indemnification: {
      title: t("terms.indemnification.title"),
      message: t("terms.indemnification.message"),
    },

    governingLaw: {
      title: t("terms.governingLaw.title"),
      points: t("terms.governingLaw.points", { returnObjects: true, defaultValue: [] }) as string[],
    },

    additionalTerms: {
      title: t("terms.additional.title"),
      thirdPartyServices: {
        title: t("terms.additional.third_party_services.title"),
        description: t("terms.additional.third_party_services.description"),
      },
      exportControls: {
        title: t("terms.additional.export_controls.title"),
        description: t("terms.additional.export_controls.description"),
      },
    },

    changes: {
      title: t("terms.changes.title"),
      message: t("terms.changes.message"),
      note: t("terms.changes.note"),
    },

    entireAgreement: {
      title: t("terms.entireAgreement.title"),
      message: t("terms.entireAgreement.message"),
    },
  };
  return (
    <main className="relative font-sans rtl:font-arabic-body rtl:text-base min-h-screen pt-20 w-screen standalone:w-full overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
      {/* <!-- Hero Section --> */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl rtl:font-arabic md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
          {content.title}
        </h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-mir-bg-accent/25 bg-mir-bg-soft px-3 py-1 text-[13px] rtl:text-base font-semibold text-mir-bg-accent mb-8">
          {content.effectiveDate} • {content.version}
        </div>
      </section>

      {/* <!-- Agreement Notice --> */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-mir-bg-accent to-mir-bg-accent-dark">
          <h2 className="rtl:font-arabic text-2xl font-bold mb-3">{content.intro.headline}</h2>
          <p className="mb-4 opacity-90">{content.intro.message}</p>
          <p className="text-sm opacity-80">{content.intro.note}</p>
        </div>
      </section>

      {/* <!-- Main Content --> */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* <!-- Contact Information --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4 rtl:font-arabic">{content.contact.title}</h2>
            <div className="space-y-2 text-muted-foreground">
              <p className="space-x-2 rtl:space-x-reverse">
                <strong className="text-mir-text-primary">{content.contact.entity}</strong>
                <span>{appConfig.legalEntity}</span>
              </p>
              <p className="space-x-2 rtl:space-x-reverse">
                <strong className="text-mir-text-primary">{content.contact.support}</strong>
                <Link href="mailto:support@mirael.life" className="text-mir-bg-accent hover:underline">
                  {appConfig.emails.support}
                </Link>
              </p>
              <p className="space-x-2 rtl:space-x-reverse">
                <strong className="text-mir-text-primary">{content.contact.privacy}</strong>
                <Link href="mailto:privacy@mirael.life" className="text-mir-bg-accent hover:underline">
                  {appConfig.emails.privacy}
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Eligibility --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.eligibility.title}</h2>
            <div className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15 mb-4">
              <p className="text-sm font-semibold text-mir-text-primary space-x-2 rtl:space-x-reverse">
                <span>{content.eligibility.ageRequirement}</span> {appConfig.ageEligibility}
              </p>
            </div>
            <p className="text-muted-foreground">{content.eligibility.message}</p>
          </div>
        </section>

        {/* <!-- License --> */}
        <section className="mb-12">
          <h2 className="rtl:font-arabic text-2xl font-bold mb-6">{content.license.title}</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic text-xl font-semibold mb-3">{content.license.permitted.title}</h3>
              <p className="text-muted-foreground">{content.license.permitted.message}</p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic text-xl font-semibold mb-3">{content.license.restricted.title}</h3>
              <ul className="space-y-2 list-disc list-inside [&>li]:list-item text-muted-foreground">
                {content.license.restricted.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* <!-- User Responsibilities --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{content.responsibilities.title}</h2>
          <div className="space-y-6">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-xl font-semibold mb-3">
                {content.responsibilities.sections.accountSecurity.title}
              </h3>
              <p className="text-muted-foreground">{content.responsibilities.sections.accountSecurity.description}</p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-xl font-semibold mb-3">
                {content.responsibilities.sections.legalCompliance.title}
              </h3>
              <p className="text-muted-foreground">{content.responsibilities.sections.legalCompliance.description} </p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-xl font-semibold mb-3">
                {content.responsibilities.sections.prohibitedUses.title}
              </h3>
              <p className="text-muted-foreground mb-3">
                {content.responsibilities.sections.prohibitedUses.description}
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                {content.responsibilities.sections.prohibitedUses.items.map((item, index) => (
                  <li className="list-item" key={index}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* <!-- Nature of Service --> */}
        <section className="mb-12">
          <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-mir-bg-accent to-mir-bg-accent-dark">
            <h2 className="text-2xl font-bold mb-3">{content.natureOfService.title}</h2>
            <p className="mb-4 opacity-90">{content.natureOfService.message}</p>
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.1)] mt-4">
              <p className="text-sm opacity-90">{content.natureOfService.disclaimer} </p>
            </div>
          </div>
        </section>

        {/* <!-- AI and Content --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{content.aiAndContent.title}</h2>
          <div className="space-y-6">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-xl font-semibold mb-3">
                {content.aiAndContent.sections.generatedResponses.title}
              </h3>
              <p className="text-muted-foreground">{content.aiAndContent.sections.generatedResponses.description}</p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-xl font-semibold mb-3">
                {content.aiAndContent.sections.contentRights.title}
              </h3>
              <p className="text-muted-foreground">{content.aiAndContent.sections.contentRights.description} </p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-xl font-semibold mb-3">
                {content.aiAndContent.sections.contentModeration.title}
              </h3>
              <p className="text-muted-foreground">{content.aiAndContent.sections.contentModeration.description}</p>
            </div>
          </div>
        </section>

        {/* <!-- Fees and Payments --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">{content.fees.title}</h2>
            <div className="space-y-3 text-muted-foreground">
              {content.fees.points.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
              <div className="p-3 rounded-lg bg-mir-bg-input">
                <p className="text-sm">{content.fees.refundPolicy}</p>
              </div>
            </div>
          </div>
        </section>

        {/* <!-- Termination --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{content.termination.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-lg font-semibold mb-2">{content.termination.byUser.title}</h3>
              <p className="text-muted-foreground">{content.termination.byUser.description} </p>
            </div>
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-lg font-semibold mb-2">{content.termination.byUs.title}</h3>
              <p className="text-muted-foreground">{content.termination.byUs.description} </p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-mir-bg-soft border border-[rgba(255,107,90,0.15)]">
            <p className="text-sm text-muted-foreground">
              <strong>{content.termination.effect.label}</strong> {content.termination.effect.description}
            </p>
          </div>
        </section>

        {/* <!-- Intellectual Property --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">{content.intellectualProperty.title}</h2>
            <p className="text-muted-foreground mb-3">{content.intellectualProperty.ownership}</p>
            <p className="text-sm text-muted-foreground italic">{content.intellectualProperty.branding} </p>
          </div>
        </section>

        {/* <!-- Disclaimers --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{content.disclaimers.title}</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-xl font-semibold mb-3">{content.disclaimers.asIsService.title}</h3>
              <p className="text-muted-foreground">{content.disclaimers.asIsService.description}</p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-xl font-semibold mb-3">
                {content.disclaimers.healthDisclaimer.title}
              </h3>
              <p className="text-muted-foreground">{content.disclaimers.healthDisclaimer.description}</p>
            </div>
          </div>
        </section>

        {/* <!-- Limitation of Liability --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">{content.liability.title}</h2>
            <p className="text-muted-foreground mb-3">{content.liability.message}</p>
            <div className="p-4 rounded-xl bg-mir-bg-input">
              <p className="text-sm text-muted-foreground">
                <strong>{content.liability.cap.label}</strong> {content.liability.cap.message}
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Indemnification --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">{content.indemnification.title}</h2>
            <p className="text-muted-foreground">{content.indemnification.message} </p>
          </div>
        </section>

        {/* <!-- Governing Law --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">{content.governingLaw.title}</h2>
            <div className="space-y-3 text-muted-foreground">
              {content.governingLaw.points.map((point, index) => (
                <p key={index}>{point}</p>
              ))}
            </div>
          </div>
        </section>

        {/* <!-- Additional Terms --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{content.additionalTerms.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-lg font-semibold mb-2">
                {content.additionalTerms.thirdPartyServices.title}
              </h3>
              <p className="text-sm text-muted-foreground">{content.additionalTerms.thirdPartyServices.description}</p>
            </div>
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="rtl:font-arabic  text-lg font-semibold mb-2">
                {content.additionalTerms.exportControls.title}
              </h3>
              <p className="text-sm text-muted-foreground">{content.additionalTerms.exportControls.description}</p>
            </div>
          </div>
        </section>

        {/* <!-- Changes to Terms --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">{content.changes.title}</h2>
            <p className="text-muted-foreground mb-3">{content.changes.message}</p>
            <p className="text-sm text-muted-foreground italic">{content.changes.note} </p>
          </div>
        </section>

        {/* <!-- Entire Agreement --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">{content.entireAgreement.title}</h2>
            <p className="text-muted-foreground">{content.entireAgreement.message} </p>
          </div>
        </section>
      </div>
      <PoliciesFooter locale={locale as AppLocales} currentPage="terms" />
    </main>
  );
}

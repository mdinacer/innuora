import PoliciesFooter from "@/components/policies/policies.footer";
import appConfig from "@/lib/constants/app-config";
import initTranslations, { AppLocales } from "@/lib/i18n";

export const dynamic = "force-static";
export default async function EULARoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["legal"]);

  const content = {
    hero: {
      headline: t("eula.hero.headline"),
      description: t("eula.hero.description"),
      lastUpdated: t("eula.lastUpdated"),
    },
    notice: {
      title: t("eula.notice.title"),
      message: t("eula.notice.message"),
      warning: t("eula.notice.warning"),
    },
    acceptance: {
      title: t("eula.acceptance.title"),
      message: t("eula.acceptance.message"),
    },
    licenseGrant: {
      title: t("eula.licenseGrant.title"),
      message: t("eula.licenseGrant.message"),
    },
    licenseRestrictions: {
      title: t("eula.licenseRestrictions.title"),
      message: t("eula.licenseRestrictions.message"),
      items: t("eula.licenseRestrictions.items", { returnObjects: true, defaultValue: [] }) as string[],
    },
    intellectualProperty: {
      title: t("eula.intellectualProperty.title"),
      message: t("eula.intellectualProperty.message"),
    },
    updates: {
      title: t("eula.updates.title"),
      message: t("eula.updates.message"),
    },
    termination: {
      title: t("eula.termination.title"),
      message: t("eula.termination.message"),
      uponTermination: {
        label: t("eula.termination.uponTermination.label"),
        message: t("eula.termination.uponTermination.message"),
      },
    },
    disclaimer: {
      title: t("eula.disclaimer.title"),
      message: t("eula.disclaimer.message"),
      note: t("eula.disclaimer.note"),
    },
    liability: {
      title: t("eula.liability.title"),
      message: t("eula.liability.message"),
    },
    governingLaw: {
      title: t("eula.governingLaw.title"),
      message: t("eula.governingLaw.message"),
    },
    contact: {
      title: t("eula.contact.title"),
      message: t("eula.contact.message"),
      supportEmail: t("eula.contact.supportEmail"),
    },
    summary: {
      title: t("eula.summary.title"),
      message: t("eula.summary.message"),
      acknowledgment: t("eula.summary.acknowledgment"),
    },
  };
  return (
    <main className="relative font-sans rtl:font-arabic-body rtl:text-base min-h-screen pt-20 w-screen standalone:w-full overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
      {/* <!-- Hero Section --> */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="rtl:font-arabic text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
          {content.hero.headline}
        </h1>
        <p className="text-lg md:text-xl text-mir-text-secondary max-w-2xl mx-auto mb-6">{content.hero.description}</p>
        <div className="inline-flex items-center gap-2 rounded-full border border-mir-bg-accent/25 bg-mir-bg-soft px-3 py-1 text-[13px] font-semibold text-mir-bg-accent">
          {content.hero.lastUpdated}
        </div>
      </section>

      {/* <!-- Agreement Notice --> */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-mir-bg-accent to-mir-bg-accent-dark">
          <h2 className="rtl:font-arabic text-2xl font-bold mb-3">{content.notice.title}</h2>
          <p className="mb-4 opacity-90">{content.notice.message}</p>
          <p className="text-sm opacity-80">{content.notice.warning}</p>
        </div>
      </section>

      {/* <!-- Main Content --> */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* <!-- Acceptance of Agreement --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.acceptance.title}</h2>
            <p className="text-mir-text-secondary">{content.acceptance.message}</p>
          </div>
        </section>

        {/* <!-- License Grant --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.licenseGrant.title}</h2>
            <p className="text-mir-text-secondary">{content.licenseGrant.message}</p>
          </div>
        </section>

        {/* <!-- License Restrictions --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.licenseRestrictions.title}</h2>
            <p className="text-mir-text-secondary mb-4">{content.licenseRestrictions.message}</p>
            <ul className="space-y-3 text-mir-text-secondary">
              {content.licenseRestrictions.items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* <!-- Intellectual Property Ownership --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.intellectualProperty.title}</h2>
            <p className="text-mir-text-secondary">{content.intellectualProperty.message}</p>
          </div>
        </section>

        {/* <!-- Updates and Modifications --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.updates.title}</h2>
            <p className="text-mir-text-secondary">{content.updates.message}</p>
          </div>
        </section>

        {/* <!-- Termination --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.termination.title}</h2>
            <p className="text-mir-text-secondary mb-3">{content.termination.message}</p>
            <div className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
              <p className="text-sm text-mir-text-secondary">
                <strong>{content.termination.uponTermination.label}</strong>{" "}
                {content.termination.uponTermination.message}
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Disclaimer of Warranties --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.disclaimer.title}</h2>
            <p className="text-mir-text-secondary">{content.disclaimer.message}</p>
            <div className="mt-4 p-4 rounded-xl bg-mir-bg-input">
              <p className="text-sm text-mir-text-secondary">{content.disclaimer.note}</p>
            </div>
          </div>
        </section>

        {/* <!-- Limitation of Liability --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.liability.title}</h2>
            <p className="text-mir-text-secondary">{content.liability.message}</p>
          </div>
        </section>

        {/* <!-- Governing Law --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.governingLaw.title}</h2>
            <p className="text-mir-text-secondary">{content.governingLaw.message}</p>
          </div>
        </section>

        {/* <!-- Contact Information --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-4">{content.contact.title}</h2>
            <p className="text-mir-text-secondary mb-4">{content.contact.message}</p>
            <div className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
              <p className="font-medium text-mir-text-primary">{content.contact.supportEmail}</p>
              <a href={`mailto:${appConfig.emails.support}`} className="text-mir-bg-accent hover:underline">
                {appConfig.emails.support}
              </a>
            </div>
          </div>
        </section>

        {/* <!-- Summary Notice --> */}
        <section className="mb-12">
          <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-mir-bg-accent to-mir-bg-accent-dark">
            <h2 className="rtl:font-arabic text-2xl font-bold mb-3">{content.summary.title}</h2>
            <p className="mb-4 opacity-90">{content.summary.message}</p>
            <p className="text-sm opacity-80">{content.summary.acknowledgment}</p>
          </div>
        </section>
      </div>
      <PoliciesFooter locale={locale as AppLocales} currentPage="eula" />
    </main>
  );
}

import { Metadata } from "next";
import Link from "next/link";

import { APP_CONFIG } from "@/config/app";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["seo"]);

  return {
    title: t("seo:privacy.title"),
    description: t("seo:privacy.description"),
    alternates: {
      canonical: `${APP_CONFIG.domains.primary}/en/privacy`,
      languages: {
        en: `${APP_CONFIG.domains.primary}/en/privacy`,
        fr: `${APP_CONFIG.domains.primary}/fr/privacy`,
        ar: `${APP_CONFIG.domains.primary}/ar/privacy`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PrivacyPolicyRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["legal"]);

  const content = {
    title: t("privacy.title"),
    lastUpdated: t("privacy.lastUpdated"),
    intro: {
      title: t("privacy.intro.title"),
      message: t("privacy.intro.message", { app_name: APP_CONFIG.name }),
      note: t("privacy.intro.note", { app_name: APP_CONFIG.name }),
    },
    principles: {
      title: t("privacy.principles.title"),
      items: t("privacy.principles.items", { returnObjects: true, defaultValue: [] }) as string[],
    },
    dataWeCollect: {
      title: t("privacy.dataWeCollect.title"),
      table: {
        headers: t("privacy.dataWeCollect.table.headers", { returnObjects: true, defaultValue: [] }) as string[],
        rows: t("privacy.dataWeCollect.table.rows", { returnObjects: true, defaultValue: [] }) as string[][],
      },
    },
    howWeUse: {
      title: t("privacy.howWeUse.title"),
      paragraphs: t("privacy.howWeUse.paragraphs", {
        returnObjects: true,
        defaultValue: [],
        app_name: APP_CONFIG.name,
      }) as string[],
    },
    yourRights: {
      title: t("privacy.yourRights.title"),
      paragraphs: t("privacy.yourRights.paragraphs", {
        returnObjects: true,
        defaultValue: [],
        privacy_email: APP_CONFIG.contact.support,
      }) as string[],
    },
    children: {
      title: t("privacy.children.title"),
      note: t("privacy.children.note", { app_name: APP_CONFIG.name }),
    },
    contact: {
      title: t("privacy.contact.title"),
      message: t("privacy.contact.message"),
    },
  };
  return (
    <main className="relative font-sans rtl:font-arabic-body rtl:text-lg min-h-screen pt-20 w-screen standalone:w-full overflow-hidden bg-inn-bg-primary transition-all duration-300 ease-in text-inn-text-primary">
      {/* <!-- Hero Section --> */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4 rtl:font-arabic">
          {content.title}
        </h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-inn-bg-accent/25 bg-inn-bg-soft px-3 py-1 ltr:text-[13px] rtl:text-base font-semibold text-inn-bg-accent mb-8">
          {content.lastUpdated}
        </div>
      </section>

      {/* <!-- Intro Section --> */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-inn-bg-accent to-inn-bg-accent-dark">
          <h2 className="text-3xl font-bold mb-4 rtl:font-arabic">{content.intro.title}</h2>
          <div className="space-y-4 opacity-90">
            <p className="rtl:text-lg rtl:font-medium">{content.intro.message}</p>
            <div className="p-4 rounded-xl bg-white/10 mt-4">
              <p className="text-sm rtl:text-base opacity-90 ">{content.intro.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* <!-- Main Content --> */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* <!-- Key Principles --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-6 rtl:font-arabic">{content.principles.title}</h2>
            <div className="space-y-4">
              {content.principles.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-inn-bg-accent mt-2 flex-shrink-0"></div>
                  <p className="text-inn-text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* <!-- What We Collect --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 rtl:font-arabic">{content.dataWeCollect.title}</h2>
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card shadow-[0_2px_8px] shadow-black/5 overflow-hidden">
            {/* <!-- Desktop Table --> */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-inn-bg-input">
                  <tr>
                    {content.dataWeCollect.table.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 ltr:text-left rtl:text-right text-sm rtl:text-base font-semibold text-inn-text-primary"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-inn-border-light">
                  {content.dataWeCollect.table.rows.map((row, index) => {
                    if (row.length !== 3) return null;
                    const [header, description, storage] = row;
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 font-medium text-inn-text-primary">{header}</td>
                        <td className="px-6 py-4 text-inn-text-secondary">{description}</td>
                        <td className="px-6 py-4 text-inn-text-secondary">{storage}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* <!-- Mobile Cards --> */}
            <div className="md:hidden p-6 space-y-6">
              {content.dataWeCollect.table.rows.map((row, index) => {
                if (row.length !== 3) return null;
                const [header, description, storage] = row;
                const [, descriptionCol, storageCol] = content.dataWeCollect.table.headers;
                return (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold text-inn-text-primary">{header}</h3>
                    <p className="text-sm rtl:text-base text-inn-text-secondary">
                      <strong>{descriptionCol}: </strong>
                      {description}
                    </p>
                    <p className="text-sm rtl:text-base text-inn-text-secondary">
                      <strong>{storageCol}: </strong>
                      {storage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* <!-- How We Use Your Data --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4 rtl:font-arabic">{content.howWeUse.title}</h2>
            <div className="space-y-4 text-inn-text-secondary">
              {content.howWeUse.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* <!-- Your Rights --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4 rtl:font-arabic">{content.yourRights.title}</h2>
            <div className="space-y-4 text-inn-text-secondary">
              {content.yourRights.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* <!-- Children --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4 rtl:font-arabic">{content.children.title}</h2>
            <p className="text-inn-text-secondary">{content.children.note}</p>
          </div>
        </section>

        {/* <!-- Contact Us --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4 rtl:font-arabic">{content.contact.title}</h2>
            <p className="text-inn-text-secondary">
              {content.contact.message}{" "}
              <Link
                href={`mailto:${APP_CONFIG.contact.privacy}`}
                className="text-inn-bg-accent text-center hover:underline"
              >
                {APP_CONFIG.contact.privacy}
              </Link>
            </p>
          </div>
        </section>
      </div>

      {/* <PoliciesFooter locale={locale as AppLocales} currentPage="privacy" /> */}
    </main>
  );
}

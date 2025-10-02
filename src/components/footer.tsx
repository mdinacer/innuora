import Link from "next/link";

import { APP_CONFIG } from "@/config/app";
import initTranslations, { AppLocales } from "@/lib/i18n";

interface Props {
  locale?: AppLocales;
  showDisclaimer?: boolean;
}

export default async function Footer({ locale = "en", showDisclaimer = true }: Props) {
  const { t } = await initTranslations(locale, ["pages"]);

  const { disclaimer, links, copyright } = {
    disclaimer: {
      label: t("policies_footer.disclaimer.label"),
      message: t("policies_footer.disclaimer.message", { app_name: APP_CONFIG.name }),
    },
    links: {
      privacy: t("policies_footer.links.privacy"),
      terms: t("policies_footer.links.terms"),
      contact: t("policies_footer.links.contact"),
      help: t("policies_footer.links.help"),
      support: t("policies_footer.links.support"),
      eula: t("policies_footer.links.eula"),
    },
    copyright: t("policies_footer.copyright", { legal_name: APP_CONFIG.company.legalName }),
  };
  return (
    <footer className="relative border-t border-inn-border-light">
      <div className="max-w-6xl mx-auto px-6 py-10 text-center text-base rtl:text-lg text-inn-text-secondary">
        {showDisclaimer && (
          <p className="mb-3 text-primary">
            <span className="font-semibold">{disclaimer.label}</span>
            {disclaimer.message}
          </p>
        )}
        <div className="flex justify-center gap-6 flex-wrap mb-3">
          <Link href="/eula" className="hover:text-inn-text-primary">
            {links.eula}
          </Link>
          <Link href="/privacy" className="hover:text-inn-text-primary">
            {links.privacy}
          </Link>
          <Link href="/terms" className="hover:text-inn-text-primary">
            {links.terms}
          </Link>
          {/* <Link href="/contact" className="hover:text-inn-text-primary">
            {links.contact}
          </Link>
          <Link href="/help" className="hover:text-inn-text-primary">
            {links.help}
          </Link> */}
        </div>
        <p>{copyright}</p>
      </div>
    </footer>
  );
}

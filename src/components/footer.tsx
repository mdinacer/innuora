import Link from "next/link";

import initTranslations, { AppLocales } from "@/lib/i18n";

interface Props {
  locale?: AppLocales;
}

export default async function Footer({ locale = "en" }: Props) {
  const { t } = await initTranslations(locale, ["pages"]);

  const { disclaimer, links, copyright } = {
    disclaimer: {
      label: t("policies_footer.disclaimer.label"),
      message: t("policies_footer.disclaimer.message"),
    },
    links: {
      privacy: t("policies_footer.links.privacy"),
      terms: t("policies_footer.links.terms"),
      contact: t("policies_footer.links.contact"),
      help: t("policies_footer.links.help"),
      support: t("policies_footer.links.support"),
      eula: t("policies_footer.links.eula"),
    },
    copyright: t("policies_footer.copyright"),
  };
  return (
    <footer className="relative border-t border-mir-border-light">
      <div className="max-w-6xl mx-auto px-6 py-10 text-center text-base rtl:text-lg text-mir-text-secondary">
        <p className="mb-3 text-primary">
          <span className="font-semibold">{disclaimer.label}</span>
          {disclaimer.message}
        </p>
        <div className="flex justify-center gap-6 flex-wrap mb-3">
          <Link href="/eula" className="hover:text-mir-text-primary">
            {links.eula}
          </Link>
          <Link href="/privacy" className="hover:text-mir-text-primary">
            {links.privacy}
          </Link>
          <Link href="/terms" className="hover:text-mir-text-primary">
            {links.terms}
          </Link>
          <Link href="/contact" className="hover:text-mir-text-primary">
            {links.contact}
          </Link>
          <Link href="/help" className="hover:text-mir-text-primary">
            {links.help}
          </Link>
        </div>
        <p>{copyright}</p>
      </div>
    </footer>
  );
}

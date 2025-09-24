import Link from "next/link";

import initTranslations, { AppLocales } from "@/lib/i18n";

export default async function PoliciesFooter({
  currentPage,
  locale = "en",
}: {
  currentPage?: "privacy" | "terms" | "eula";
  locale?: AppLocales;
}) {
  const { t } = await initTranslations(locale, ["pages"]);

  const { questions, contactEmail, links, copyright } = {
    questions: t("policies_footer.questions", { currentPage: t(`policies_footer.links.${currentPage}`) }),
    contactEmail: t("policies_footer.contact_email"),
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
    <footer className="border-t border-inn-border-light">
      <div className="max-w-6xl mx-auto px-6 py-10 text-center text-sm text-inn-text-secondary">
        <p className="mb-3">
          <strong>{questions}</strong> {contactEmail}
          <a href="mailto:privacy@mirael.life" className="text-inn-bg-accent hover:underline">
            privacy@mirael.life
          </a>
        </p>

        <div className="flex justify-center text-inn-text-secondary [&>a]:hover:text-inn-bg-accent [&>a]:hover:underline [&>a]:hover:underline-offset-2 gap-6 flex-wrap mb-3">
          {currentPage !== "privacy" && <Link href="/privacy">{links.privacy}</Link>}
          {currentPage !== "terms" && <Link href="/terms">{links.terms}</Link>}
          {currentPage !== "eula" && <Link href="/eula">{links.eula}</Link>}
          <Link href="/contact">{links.contact}</Link>
          <Link href="/help">{links.help}</Link>
          <Link href="/support">{links.support}</Link>
        </div>
        <p>{copyright}</p>
      </div>
    </footer>
  );
}

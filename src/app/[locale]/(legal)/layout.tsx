import Link from "next/link";

import Header from "@/components/header";
import initTranslations, { AppLocales } from "@/lib/i18n";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return (
    <>
      <Header
        locale={locale as AppLocales}
        sideContent={
          <Link
            href="/"
            className="sm:inline-flex hidden items-center rtl:font-medium gap-2 rounded-2xl border border-mir-border-light px-4 py-2 text-sm rtl:text-base font-medium text-mir-text-primary hover:text-mir-bg-accent hover:border-mir-bg-accent transition"
          >
            {t("back-to-mirael")}
          </Link>
        }
      />
      {children}
    </>
  );
}

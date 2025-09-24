import Footer from "@/components/footer";
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
        className="fixed top-0 pointer-events-auto standalone:pt-safe standalone:inset-x-safe inset-x-0 bg-mir-bg-card/50 backdrop-blur-sm z-50"
        // sideContent={
        //   <Link
        //     href="/"
        //     className="sm:inline-flex hidden items-center rtl:font-medium gap-2 rounded-2xl border border-mir-border-light px-4 py-2 text-sm rtl:text-base font-medium text-mir-text-primary hover:text-mir-bg-accent hover:border-mir-bg-accent transition"
        //   >
        //     {t("back-to-app")}
        //   </Link>
        // }
      />
      {children}

      <Footer locale={locale as AppLocales} />
      <div className="hidden fixed bottom-0 inset-x-0 standalone:block h-[env(safe-area-inset-bottom)] z-40  backdrop-blur-md backdrop-saturate-150 bg-mir-bg-card/50"></div>
    </>
  );
}

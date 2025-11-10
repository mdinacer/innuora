import Footer from "@/components/footer";
import Header from "@/components/header";
import LanguageDropdown from "@/components/language-dropdown";
import { AppLocales } from "@/lib/i18n";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale = "en" } = await params;

  return (
    <>
      <Header
        className="fixed top-0 pointer-events-auto standalone:pt-safe backdrop-saturate-150 standalone:inset-x-safe inset-x-0 bg-background/80 backdrop-blur-sm z-50"
        sideContent={
          <div>
            <LanguageDropdown />
          </div>
        }
      />
      {children}

      <Footer locale={locale as AppLocales} />
      <div className="hidden fixed bottom-0 inset-x-0 standalone:block h-[env(safe-area-inset-bottom)] z-40  backdrop-blur-md backdrop-saturate-150 bg-card/50"></div>
    </>
  );
}

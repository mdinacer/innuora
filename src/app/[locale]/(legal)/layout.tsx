import Link from "next/link";
import { HomeIcon } from "lucide-react";

import Footer from "@/components/footer";
import Header from "@/components/header";
import LanguageDropdown from "@/components/language-dropdown";
import { buttonVariants } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app";
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
        sideContent={
          <div className=" inline-flex items-center gap-x-3">
            <Link className={buttonVariants({ variant: "outline" })} href={"/"}>
              <HomeIcon />
              {t("back-to-app", { app_name: APP_CONFIG.name })}
            </Link>
            <LanguageDropdown />
          </div>
        }
      />
      {children}

      <Footer locale={locale as AppLocales} showDisclaimer={false} />
      <div className="hidden fixed bottom-0 inset-x-0 standalone:block h-[env(safe-area-inset-bottom)] z-40  backdrop-blur-md backdrop-saturate-150 bg-mir-bg-card/50"></div>
    </>
  );
}

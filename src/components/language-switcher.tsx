"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { useIsMobile } from "@/hooks/use-mobile";
import { AppLocales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const getLanguages = (t: TFunction<"common", "languages">) => [
  { label: t("en"), abbreviation: "EN", value: "en" },
  { label: t("ar"), abbreviation: "AR", value: "ar" },
  { label: t("fr"), abbreviation: "FR", value: "fr" },
];

const LanguageSwitcher = () => {
  const {
    i18n: { language },
    t,
  } = useTranslation("common", { keyPrefix: "languages" });
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const changeLanguage = useCallback(
    async (locale: AppLocales) => {
      if (isSwitching) return;
      setIsSwitching(true);

      try {
        // Update URL with correct locale
        const segments = pathname.split("/").filter(Boolean);
        const currentLocale = segments[0];

        let newPath = "";
        if (["en", "ar", "fr"].includes(currentLocale)) {
          segments[0] = locale;
          newPath = `/${segments.join("/")}`;
        } else {
          newPath = `/${locale}${pathname}`;
        }

        await router.push(newPath); // wait for navigation
      } catch (err) {
        console.error("Error switching language:", err);
      } finally {
        // Let React finish render cycle before clearing
        setTimeout(() => setIsSwitching(false), 300);
      }
    },
    [isSwitching, pathname, router]
  );

  const languages = getLanguages(t);

  return (
    <>
      {isSwitching && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-inn-bg-primary/90 backdrop-blur-md animate-fade-in"></div>
      )}

      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-inn-border-light/50 bg-inn-bg-card/50 p-1">
        {languages.map((locale) => (
          <button
            key={locale.value}
            disabled={language === locale.value || isSwitching}
            onClick={() => changeLanguage(locale.value as AppLocales)}
            className={cn(
              "px-3 py-1.5 rtl:font-arabic rtl:font-medium text-sm font-medium text-inn-text-secondary hover:text-inn-text-primary transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              {
                "bg-inn-bg-accent text-white rounded-xl": locale.value === language,
              }
            )}
          >
            {isMobile ? locale.abbreviation : locale.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default LanguageSwitcher;

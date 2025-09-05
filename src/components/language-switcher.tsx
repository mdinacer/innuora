"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useIsMobile } from "@/hooks/use-mobile";
import { AppLocales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LOCALES = [
  {
    label: "English",
    abbreviation: "EN",
    value: "en",
  },
  {
    label: "العربية",
    abbreviation: "AR",
    value: "ar",
  },
  {
    label: "Français",
    abbreviation: "FR",
    value: "fr",
  },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isMobile = useIsMobile();

  const changeLanguage = (locale: AppLocales) => {
    if (isSwitching) return;
    setIsSwitching(true);
    // Change i18next language
    i18n.changeLanguage(locale);

    // Update URL - remove current locale and add new one
    const segments = pathname.split("/").filter(Boolean);
    const currentLocale = segments[0];

    let newPath = "";
    if (["en", "ar", "fr"].includes(currentLocale)) {
      // Replace current locale
      segments[0] = locale;
      newPath = `/${segments.join("/")}`;
    } else {
      // Add locale to path
      newPath = `/${locale}${pathname}`;
    }

    router.push(newPath);

    setIsSwitching(false);
  };

  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-mir-border-light bg-mir-bg-card p-1">
      {LOCALES.map((locale) => (
        <button
          key={locale.value}
          disabled={i18n.language === locale.value || isSwitching}
          onClick={() => changeLanguage(locale.value as AppLocales)}
          className={cn(
            "px-3 py-1.5 rtl:font-arabic  rtl:font-medium text-sm font-medium text-mir-text-secondary hover:text-mir-text-primary transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            {
              "bg-mir-bg-accent text-white rounded-xl": locale.value === i18n.language,
            }
          )}
        >
          {isMobile ? locale.abbreviation : locale.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

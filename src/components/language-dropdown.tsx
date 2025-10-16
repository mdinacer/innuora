"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppLocales } from "@/lib/i18n";
import i18nConfig from "@/lib/i18n/config";
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

const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();

  const currentPathname = usePathname();

  const isMobile = useIsMobile();

  const handleChange = useCallback(
    (newLocale: AppLocales) => {
      // set cookie for next-i18n-router
      setIsSwitching(true);
      const days = 30;
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = date.toUTCString();
      document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

      // redirect to the new locale path
      if (currentLocale === i18nConfig.defaultLocale && !i18nConfig.prefixDefault) {
        router.push("/" + newLocale + currentPathname);
      } else {
        router.push(currentPathname.replace(`/${currentLocale}`, `/${newLocale}`));
      }

      setIsSwitching(false);
      router.refresh();
    },
    [currentLocale, currentPathname, router]
  );
  return (
    <DropdownMenu dir={i18n.dir()}>
      <DropdownMenuTrigger asChild className="relative">
        <Button variant="outline" size="icon">
          <p className="capitalize font-bold font-sans">{i18n.language}</p>
          <span className="sr-only">Toggle Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            className={cn("font-medium", { "font-arabic ": locale.value === "ar" })}
            key={locale.value}
            disabled={i18n.language === locale.value || isSwitching}
            onClick={() => handleChange(locale.value as AppLocales)}
            aria-current={i18n.language === locale.value ? "true" : undefined}
          >
            {isMobile ? locale.abbreviation : locale.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageDropdown;

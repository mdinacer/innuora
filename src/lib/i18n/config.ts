import { ar, enUS, fr, Locale } from "date-fns/locale";
import { Config } from "next-i18n-router/dist/types";

import { AppLocales } from ".";

const i18nConfig = {
  locales: ["en", "ar", "fr"],
  defaultLocale: "en",
} satisfies Config;

export default i18nConfig;

export const fnsLocalesMap: Record<AppLocales, Locale> = {
  en: enUS,
  ar: ar,
  fr: fr,
};

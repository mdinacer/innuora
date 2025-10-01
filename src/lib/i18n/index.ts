import { Locale } from "date-fns";
import { ar, enUS, fr } from "date-fns/locale";
import { createInstance, i18n, Resource } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";

import config from "@/lib/i18n/config";

export type AppLocales = "en" | "ar" | "fr";

export const APP_NAMESPACES = {
  NS_COMMON: "common",
  NS_PAGES: "pages",
  NS_LEGAL: "legal",
  NS_SESSIONS: "sessions",
  NS_ERRORS: "errors",
} as const;

export type AppNamespace = (typeof APP_NAMESPACES)[keyof typeof APP_NAMESPACES];

export const i18nNamespaces = [
  APP_NAMESPACES.NS_COMMON,
  APP_NAMESPACES.NS_PAGES,
  APP_NAMESPACES.NS_SESSIONS,
  APP_NAMESPACES.NS_ERRORS,
];

export default async function initTranslations(
  locale: string,
  namespaces: string[],
  i18nInstance?: i18n,
  resources?: Resource
) {
  i18nInstance = i18nInstance || createInstance();

  i18nInstance.use(initReactI18next);

  if (!resources) {
    i18nInstance.use(
      resourcesToBackend((language: string, namespace: string) => import(`@/locales/${language}/${namespace}.json`))
    );
  }

  await i18nInstance.init({
    lng: locale,
    resources,
    fallbackLng: "en",
    supportedLngs: config.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    preload: resources ? [] : config.locales,
  });

  return {
    i18n: i18nInstance,
    resources: { [locale]: i18nInstance.services.resourceStore.data[locale] },
    //resources: i18nInstance.services.resourceStore.data,
    t: i18nInstance.t,
  };
}

export const FNS_LOCALES_MAP: Record<AppLocales, Locale> = {
  en: enUS,
  ar: ar,
  fr: fr,
};

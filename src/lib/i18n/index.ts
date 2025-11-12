import { Locale } from "date-fns";
import { ar, enUS, fr } from "date-fns/locale";
import { createInstance, i18n, Resource } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";

import config from "@/lib/i18n/config";

export type AppLocales = "en" | "ar" | "fr";

export const APP_NAMESPACES = {
  COMMON: "common",
  ERRORS: "errors",
  LEGAL: "legal",
  COUNTRIES: "countries",
  SESSIONS_ONBOARDING: "sessions/onboarding",
  PAGES_ACCOUNT: "pages/account",
  PAGES_AUTH: "pages/auth",
  PAGES_CRISIS: "pages/crisis",
  PAGES_CHAT_UI: "pages/chat-ui",
  PAGES_CLOUD_UPDATES: "pages/cloud_updates",
  PAGES_ERROR: "pages/error",
  PAGES_LOADING: "pages/loading",
  PAGES_SESSION_CHART: "pages/session_chart",
  PAGES_SESSION_DETAILS: "pages/session_details",
  PAGES_SESSION_NAMING: "pages/session_naming",
  PAGES_SESSIONS: "pages/sessions",
  PAGES_SETTINGS: "pages/settings",
  PAGES_POLICIES_FOOTER: "pages/policies_footer",
} as const;

export type AppNamespace = (typeof APP_NAMESPACES)[keyof typeof APP_NAMESPACES];

export const i18nNamespaces = [
  APP_NAMESPACES.COMMON,
  APP_NAMESPACES.ERRORS,
  APP_NAMESPACES.COUNTRIES,
  APP_NAMESPACES.SESSIONS_ONBOARDING,
  APP_NAMESPACES.PAGES_ACCOUNT,
  APP_NAMESPACES.PAGES_AUTH,
  APP_NAMESPACES.PAGES_CHAT_UI,
  APP_NAMESPACES.PAGES_CRISIS,
  APP_NAMESPACES.PAGES_CLOUD_UPDATES,
  APP_NAMESPACES.PAGES_ERROR,
  APP_NAMESPACES.PAGES_LOADING,
  APP_NAMESPACES.PAGES_SESSION_CHART,
  APP_NAMESPACES.PAGES_SESSION_DETAILS,
  APP_NAMESPACES.PAGES_SESSION_NAMING,
  APP_NAMESPACES.PAGES_SESSIONS,
  APP_NAMESPACES.PAGES_SETTINGS,
  APP_NAMESPACES.PAGES_POLICIES_FOOTER,
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

import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { geistMono, geistSans, METADATA, tajawal, VIEWPORT, zain } from "@/constants/app-config";

import "../globals.css";

import { notFound } from "next/navigation";
import { dir } from "i18next";

import AuthListener from "@/components/auth/auth-listener";
import { BackgroundGradientAnimation } from "@/components/background-gradient-animation";
import { DynamicEffects } from "@/components/dynamic-loaders";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { ThemeProvider } from "@/components/theme-provider";
import TranslationProvider from "@/components/translation-provider";
import { Toaster } from "@/components/ui/sonner";
import initTranslations, { i18nNamespaces } from "@/lib/i18n";
import i18nConfig from "@/lib/i18n/config";

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = METADATA;
export const viewport: Viewport = VIEWPORT;

export default async function RootLayout({
  params,
  children,
}: Readonly<{
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}>) {
  const { locale } = await params;

  if (!i18nConfig.locales.includes(locale)) {
    return notFound();
  }
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <body
        className={`relative standalone:p-safe ${geistSans.variable} ${geistMono.variable} ${zain.variable} ${tajawal.variable} ltr:font-sans rtl:font-arabic-body text-base rtl:text-lg antialiased scroll-smooth bg-inn-bg-primary`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TranslationProvider locale={locale} resources={resources} namespaces={i18nNamespaces}>
            <AuthListener />
            {/* <ServiceWorkerRegistration /> */}
            <DynamicEffects.BackgroundBeams className="hidden md:block" />
            <BackgroundGradientAnimation interactive={false} />
            {children}
            <Toaster />
            <PWAInstallPrompt variant="floating" autoShow showDelay={5000} />
          </TranslationProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}

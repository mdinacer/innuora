import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { geistMono, geistSans, tajawal, zain } from "@/lib/fonts";

import "../globals.css";

import { notFound } from "next/navigation";
import { dir } from "i18next";

import { BackgroundBeams } from "@/components/background-beams";
import { ThemeProvider } from "@/components/theme-provider";
import TranslationProvider from "@/components/translation-provider";
import { Toaster } from "@/components/ui/sonner";
import { METADATA } from "@/lib/constants/metadata";
import { VIEWPORT } from "@/lib/constants/viewport-config";
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
        className={`relative standalone:p-safe ${geistSans.variable} ${geistMono.variable} ${zain.variable} ${tajawal.variable} ltr:font-sans rtl:font-arabic-body text-base rtl:text-lg antialiased scroll-smooth bg-mir-bg-primary`}
      >
        <BackgroundBeams className="hidden md:block" />
        <TranslationProvider locale={locale} resources={resources} namespaces={i18nNamespaces}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
          {process.env.NODE_ENV === "production" && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </TranslationProvider>
      </body>
    </html>
  );
}

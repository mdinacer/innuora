import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../globals.css";

import { notFound } from "next/navigation";
import { dir } from "i18next";

import { ThemeProvider } from "@/components/theme-provider";
import TranslationProvider from "@/components/translation-provider";
import { METADATA } from "@/constants/metadata";
import { VIEWPORT } from "@/constants/viewport-config";
import initTranslations, { i18nNamespaces } from "@/lib/i18n";
import i18nConfig from "@/lib/i18n/config";

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth bg-mir-bg-primary`}>
        <TranslationProvider locale={locale} resources={resources} namespaces={i18nNamespaces}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}

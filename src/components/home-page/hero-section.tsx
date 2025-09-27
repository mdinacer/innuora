"use client";

import Link from "next/link";
import { ArrowRight, Heart, Shield, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const { t } = useTranslation("home");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 text-center lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-3xl">
          <Badge
            variant="outline"
            className="mb-6 inline-flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            <Zap className="h-3 w-3" />
            {t("hero.badge")}
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            {t("hero.title.line1")}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("hero.title.highlight")}
            </span>{" "}
            {t("hero.title.line2")}
          </h1>

          <p className="mb-8 text-lg leading-8 text-gray-600 dark:text-gray-300">{t("hero.description")}</p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/sign-up">
                {t("hero.cta.primary")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/sessions">{t("hero.cta.secondary")}</Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              {t("hero.features.privacy")}
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              {t("hero.features.therapeutic")}
            </div>
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute -top-4 -left-4 h-72 w-72 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-800" />
      <div className="absolute -bottom-8 -right-8 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl dark:bg-purple-800" />
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Heart, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export function CTASection() {
  const { t } = useTranslation("home.cta");

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-24">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("title")}</h2>
        <p className="mt-6 text-lg leading-8 text-blue-100">{t("subtitle")}</p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
            <Link href="/auth/sign-up">
              {t("primary")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/sessions">{t("secondary")}</Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t("features.privacy")}
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {t("features.therapeutic")}
          </div>
        </div>

        <p className="mt-6 text-xs text-blue-200">{t("disclaimer")}</p>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -left-4 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl" />
      <div className="absolute -bottom-8 -right-8 h-96 w-96 rounded-full bg-white opacity-10 blur-3xl" />
    </section>
  );
}

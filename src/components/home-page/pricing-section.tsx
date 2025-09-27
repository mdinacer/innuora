"use client";

import Link from "next/link";
import { Heart, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const plans = [
  {
    key: "starter",
    icon: Heart,
    gradient: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-200 dark:border-blue-800",
    popular: false,
  },
  {
    key: "regular",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
    borderColor: "border-purple-200 dark:border-purple-800",
    popular: true,
  },
  {
    key: "premium",
    icon: Star,
    gradient: "from-orange-500 to-red-500",
    borderColor: "border-orange-200 dark:border-orange-800",
    popular: false,
  },
] as const;

export function PricingSection() {
  const { t } = useTranslation("home.pricing");

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.key}
                className={`relative overflow-hidden ${plan.borderColor} ${
                  plan.popular ? "ring-2 ring-purple-500 dark:ring-purple-400 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 left-0">
                    <div className="flex justify-center">
                      <Badge className="rounded-b-md bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        {t("popular")}
                      </Badge>
                    </div>
                  </div>
                )}

                <CardHeader className={`text-center ${plan.popular ? "pt-8" : "pt-6"}`}>
                  <div className="flex justify-center mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${plan.gradient} shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(`${plan.key}.name`)}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{t(`${plan.key}.price`)}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">{t(`${plan.key}.unit`)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t(`${plan.key}.description`)}</p>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <Button
                    asChild
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : `bg-gradient-to-r ${plan.gradient} hover:opacity-90`
                    }`}
                  >
                    <Link href="/auth/sign-up">{t("getStarted")}</Link>
                  </Button>

                  <ul className="mt-6 space-y-3">
                    {/* {(t.raw(`${plan.key}.features`) as string[]).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))} */}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Value proposition */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("guarantee")}</p>
        </div>
      </div>
    </section>
  );
}

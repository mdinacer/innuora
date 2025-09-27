"use client";

import { Brain, Clock, Lock, MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    key: "ai_powered",
    icon: Brain,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    key: "zero_knowledge",
    icon: Lock,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    key: "cbt_focused",
    icon: MessageCircle,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    key: "adaptive_insights",
    icon: Sparkles,
    gradient: "from-orange-500 to-red-500",
  },
  {
    key: "progress_tracking",
    icon: TrendingUp,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    key: "available_247",
    icon: Clock,
    gradient: "from-teal-500 to-green-500",
  },
] as const;

export function FeaturesSection() {
  const { t } = useTranslation("home.features");

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.key}
                className="relative overflow-hidden border-0 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.gradient} shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t(`${feature.key}.title`)}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{t(`${feature.key}.description`)}</p>
                </CardContent>

                {/* Subtle hover effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100 dark:via-gray-700/5" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

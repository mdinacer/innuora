"use client";

import { BarChart3, Lightbulb, MessageSquare, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

const steps = [
  {
    key: "sign_up",
    icon: UserPlus,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    key: "start_conversation",
    icon: MessageSquare,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    key: "track_progress",
    icon: BarChart3,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    key: "get_insights",
    icon: Lightbulb,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
] as const;

export function HowItWorksSection() {
  const { t } = useTranslation("home.how_it_works");

  return (
    <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="relative">
                  {/* Step number */}
                  <div className="mb-4 flex items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${step.borderColor} ${step.bgColor}`}
                    >
                      <Icon className={`h-6 w-6 ${step.color}`} />
                    </div>
                    <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {index + 1}
                    </div>
                  </div>

                  {/* Step content */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(`${step.key}.title`)}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t(`${step.key}.description`)}</p>
                  </div>

                  {/* Connection line (hidden on last item) */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-16 hidden h-0.5 w-full bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600 lg:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

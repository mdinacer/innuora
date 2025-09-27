"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  "what_is_innuora",
  "how_different_therapy",
  "how_works",
  "data_private",
  "who_for",
  "crisis_help",
  "cost",
  "early_access",
] as const;

export function FAQSection() {
  const { t } = useTranslation("home.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faqKey, index) => {
            const isOpen = openIndex === index;
            return (
              <Card key={faqKey} className="overflow-hidden border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-6 h-auto text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{t(`items.${index}.question`)}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 shrink-0" />
                  )}
                </Button>

                {isOpen && (
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{t(`items.${index}.answer`)}</div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

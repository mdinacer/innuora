"use client";

import { Quote, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    key: "sarah",
    rating: 5,
    initials: "SJ",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    key: "maya",
    rating: 5,
    initials: "MR",
    gradient: "from-green-500 to-teal-500",
  },
  {
    key: "alex",
    rating: 5,
    initials: "AT",
    gradient: "from-orange-500 to-red-500",
  },
] as const;

export function TestimonialsSection() {
  const { t } = useTranslation("home.testimonials");

  return (
    <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.key} className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-4" />

                {/* Testimonial text */}
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{t(`${testimonial.key}.quote`)}"
                </blockquote>

                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={`bg-gradient-to-r ${testimonial.gradient} text-white text-sm font-medium`}
                    >
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{t(`${testimonial.key}.name`)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t(`${testimonial.key}.role`)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

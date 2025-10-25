"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcwIcon, XCircleIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  const { t } = useTranslation("pages/error");

  const handleGoBack = () => {
    router.push("/");
  };

  const { title, description, details, actions, helpText } = {
    title: t("title", { keyPrefix: "error" }),
    description: t("description", { keyPrefix: "error" }),
    details: {
      unknown: t("details.unknown", { keyPrefix: "error" }),
      messageFallback: t("details.messageFallback", { keyPrefix: "error" }),
      //idLabel: t("details.idLabel", { keyPrefix: "error" }),
    },
    actions: {
      tryAgain: t("actions.tryAgain", { keyPrefix: "error" }),
      goHome: t("actions.goHome", { keyPrefix: "error" }),
    },
    helpText: t("helpText", { keyPrefix: "error" }),
  };
  useEffect(() => {
    // console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen rtl:font-arabic-body bg-mir-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-mir-bg-card rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-mir-bg-accent/10 rounded-full animate-pulse" />
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-mir-bg-accent/15 rounded-full" />

        {/* Error icon */}
        <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
          <XCircleIcon className="size-10 text-destructive" />
        </div>

        {/* Error content */}
        <h1 className="text-2xl rtl:font-arabic font-bold text-mir-text-primary mb-3">{title}</h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{description} </p>

        {/* Error details */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-destructive rounded-xl p-4 mb-6 ltr:text-left rtl:text-right">
          <div className="font-mono rtl:font-arabic text-xs rtl:text-base font-semibold text-destructive mb-2">
            {error.digest ? t("details.idLabel", { keyPrefix: "error", digest: error.digest }) : details.unknown}
          </div>
          <div className="text-sm text-muted-foreground line-clamp-3">{error.message || details.messageFallback}</div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-mir-bg-accent text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCcwIcon className="size-4" />
            <span className="rtl:mt-1">{actions.tryAgain}</span>
          </button>

          <button
            onClick={handleGoBack}
            className="w-full hover:bg-mir-bg-soft text-mir-text-primary hover:text-white font-medium py-3 px-6 border border-mir-border-light/50 hover:border-mir-bg-accent/30 rounded-xl transition-all duration-300"
          >
            <span className="rtl:mt-1">{actions.goHome}</span>
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">{helpText}</p>
      </div>
    </div>
  );
}

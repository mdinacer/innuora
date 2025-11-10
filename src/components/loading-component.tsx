"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { APP_CONFIG } from "@/config/app";
import { cn } from "@/lib/utils";

interface LoadingComponentProps {
  className?: string;
  title?: string;
  subtitle?: string;
  loadedMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
}

export default function LoadingComponent({ isLoading = true, className, ...props }: LoadingComponentProps) {
  const { t } = useTranslation("pages/loading");

  // Simple lookups - no need for useMemo
  const title = props.title || t("title", { keyPrefix: "loading", app_name: APP_CONFIG.name });
  const subtitle = props.subtitle || t("subtitle", { keyPrefix: "loading" });
  const loadingMessage = props.loadingMessage || t("loadingMessage", { keyPrefix: "loading" });
  const loadedMessage = props.loadedMessage || t("loadedMessage", { keyPrefix: "loading" });
  return (
    <div className={cn("fixed inset-0 h-screen w-screen flex items-center justify-center z-[1000]", className)}>
      <div
        className={cn(
          "loading-container",
          "max-w-lg w-full m-5 bg-card/50 py-12 px-8",
          "rounded-3xl text-center relative overflow-hidden",
          "transition-all duration-300 ease-in",
          "shadow-[0_8px_30px] shadow-black/40",
          "before:absolute before:content-[''] before:-top-[50px] before:-right-[50px] before:size-30 before:bg-primary before:rounded-full before:opacity-5",
          "after:absolute after:content-[''] after:-bottom-[30px] after:-left-[30px] after:size-20 after:bg-primary after:rounded-full after:opacity-10",
          "sm:backdrop-blur-md sm:backdrop-saturate-150",
          "rtl:font-arabic-body"
        )}
      >
        <div className={cn("loading-content", "relative z-2 flex items-center justify-center flex-col")}>
          {/* <!-- Innuora Avatar with pulsing animation --> */}
          <div
            className={cn(
              "loading-avatar",
              "size-20 bg-primary rounded-3xl",
              "flex items-center justify-center",
              "text-[32px] font-bold text-white mb-6 relative",
              "font-sans"
            )}
          >
            M
          </div>

          {/* <!-- Loading text --> */}
          <h2
            className={cn(
              "loading-title",
              "rtl:font-arabic text-foreground text-2xl font-bold mb-2 rtl:mb-3 tracking-[-0.5px] "
            )}
          >
            {title}
          </h2>
          <p className={cn("loading-subtitle", "text-muted-foreground mb-8")}>{subtitle}</p>

          {/* <!-- Animated dots --> */}
          <div className={cn("loading-dots", "flex justify-center gap-2 mb-6")}>
            {/* <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div> */}
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "typing-dot",
                  "size-3 bg-primary rounded-full",
                  "animate-typing-bounce nth-[2]:delay-[0.2s] nth-[3]:delay-[0.4s]"
                )}
              ></div>
            ))}
          </div>

          {/* <!-- Progress bar --> */}
          <div className="loading-progress">
            <div className="loading-progress-bar"></div>
          </div>

          {/* <!-- Loading message --> */}
          <p className={cn("loading-message text-muted-foreground", { "animate-pulse duration-700": isLoading })}>
            {isLoading ? loadingMessage : loadedMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { RefreshCw, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface ChatErrorMessageProps {
  errorMessage: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Error message component for chat interface
 * Displays error with optional retry button (similar to ChatGPT UX)
 */
export const ChatErrorMessage: React.FC<ChatErrorMessageProps> = ({ errorMessage, onRetry, onDismiss, className }) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 mb-4 rounded-lg",
        "bg-red-50 dark:bg-red-900/20",
        "border border-red-200 dark:border-red-800",
        "animate-in fade-in-0 slide-in-from-top-2 duration-300",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <XCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />

      {/* Error Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">Something went wrong</p>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{errorMessage}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium",
              "bg-red-600 dark:bg-red-700 text-white",
              "hover:bg-red-700 dark:hover:bg-red-600",
              "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
              "transition-colors duration-200"
            )}
            aria-label="Retry message"
          >
            <RefreshCw className="size-3.5" />
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              "p-1.5 rounded-md text-red-600 dark:text-red-400",
              "hover:bg-red-100 dark:hover:bg-red-900/30",
              "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
              "transition-colors duration-200"
            )}
            aria-label="Dismiss error"
          >
            <XCircle className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};

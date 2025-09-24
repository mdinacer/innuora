"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition", {
  variants: {
    variant: {
      default: "bg-inn-bg-input text-inn-text-secondary",
      accent: "bg-inn-bg-soft border border-inn-bg-accent/25 text-inn-text-primary",
      neutral: "bg-inn-bg-input text-inn-text-primary",
      success:
        "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
      warning:
        "bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300",
      destructive: "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
      info: "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
      orange:
        "bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
    },
    size: {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-3 py-1",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, size, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant, size, className }))} {...props} />
));

Badge.displayName = "Badge";

export { Badge, badgeVariants };

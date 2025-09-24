"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-inn-bg-accent text-white shadow hover:translate-y-[-1px] hover:shadow-lg",
        secondary: "hover:bg-inn-bg-input text-inn-text-primary",
        outline: "border border-inn-border-light hover:bg-inn-bg-input",
        destructive:
          "text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950",
        warning:
          "text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-950",
        ghost: "hover:bg-inn-bg-input text-inn-text-secondary",
      },
      size: {
        sm: "px-3 py-1.5 text-base",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-base",
        icon: "p-2",
        full: "w-full p-3 justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

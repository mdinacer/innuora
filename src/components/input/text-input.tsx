"use client";

import React, { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  className?: string;
  label?: string;
  description?: string;
  error?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, containerClassName, label, description, error, ...props }, ref) => {
    const id = React.useId();
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={cn("mb-6", containerClassName)}>
        {label && (
          <label htmlFor={id} className="rtl:font-arabic-body block mb-2 font-semibold text-foreground">
            {label}{" "}
            {props.required && (
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={errorId || descriptionId}
          className={cn(
            "w-full py-3 px-4",
            "rounded-2xl border",
            "bg-secondary text-foreground",
            "text-base rtl:font-arabic-body",
            "transition-all duration-200 ease-in outline-none resize-none",
            "focus:shadow-[0_0_0_3px]",
            "placeholder:text-muted-foreground",
            error
              ? "border-destructive focus:shadow-destructive/10"
              : "border-border focus:border-primary focus:shadow-lg",
            { "mb-1": !!error || !!description },
            className
          )}
        />
        {error ? (
          <p id={errorId} className="mt-1 text-sm text-destructive">
            {error}
          </p>
        ) : description ? (
          <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;

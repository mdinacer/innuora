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
          <label htmlFor={id} className="rtl:font-arabic-body block mb-2 font-semibold text-inn-text-primary">
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
            "bg-inn-bg-input text-inn-text-primary",
            "text-base rtl:font-arabic-body",
            "transition-all duration-200 ease-in outline-none resize-none",
            "focus:shadow-[0_0_0_3px]",
            "placeholder:text-inn-text-secondary",
            error
              ? "border-destructive focus:shadow-destructive/10"
              : "border-inn-border-light focus:border-inn-bg-accent focus:shadow-inn-bg-accent/10",
            { "mb-1": !!error || !!description },
            className
          )}
        />
        {error ? (
          <p id={errorId} className="mt-1 text-sm text-destructive">
            {error}
          </p>
        ) : description ? (
          <p id={descriptionId} className="mt-1 text-sm text-inn-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;

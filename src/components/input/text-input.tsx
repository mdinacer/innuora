"use client";

import React, { forwardRef, useId } from "react";

type InputProps = React.ComponentPropsWithoutRef<"input">;

export interface TextInputProps extends Omit<InputProps, "id"> {
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, label, error, helperText, required, ...props }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className={className}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-mir-text-primary mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          {...props}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full rounded-2xl border px-4 py-3 text-mir-text-primary placeholder-mir-text-secondary outline-none transition 
            focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20
            ${error ? "border-red-500 focus:ring-red-500" : "border-mir-border-light bg-mir-bg-input"}`}
        />
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-mir-text-secondary">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
export default TextInput;

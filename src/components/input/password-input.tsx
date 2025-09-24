"use client";

import React, { forwardRef, useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

type InputProps = React.ComponentPropsWithoutRef<"input">;

export interface PasswordInputProps extends Omit<InputProps, "id" | "type"> {
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, helperText, required, ...props }, ref) => {
    const [isVisible, setVisible] = useState(false);
    const id = useId();
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className={className}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-inn-text-primary mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            {...props}
            id={id}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full rounded-2xl border px-4 py-3 text-inn-text-primary placeholder-inn-text-secondary outline-none transition 
            focus:border-inn-bg-accent focus:ring-2 focus:ring-inn-bg-accent focus:ring-opacity-20
            ${error ? "border-red-500 focus:ring-red-500" : "border-inn-border-light bg-inn-bg-input"}`}
            type={isVisible ? "text" : "password"}
          />
          <button
            onClick={() => setVisible((prev) => !prev)}
            type="button"
            id="togglePassword"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1  text-inn-text-secondary hover:text-inn-text-primary transition"
            aria-label="Toggle password visibility"
          >
            {isVisible ? <EyeOffIcon className="size-5 shrink-0" /> : <EyeIcon className="size-5 shrink-0" />}
          </button>
        </div>

        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-inn-text-secondary">
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

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;

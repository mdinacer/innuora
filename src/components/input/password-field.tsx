"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentPropsWithoutRef<"input">;

function checkPasswordStrength(password: string) {
  if (!password) return { score: 0, feedback: "Start typing to see strength" };

  let score = 0;

  // Length is king
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;

  // Variety adds resilience, but isn't required
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Cap at 4
  return { score: Math.min(score, 4) };
}

const PASSWORD_STRENGTH = {
  weak: { label: "Weak", message: "Try making it longer for safety", bg: "bg-[#ef4444]" },
  fair: { label: "Okay", message: "Stronger if you add a bit more length", bg: "bg-[#f59e0b]" },
  good: { label: "Good", message: "This works well - longer is even better", bg: "bg-[#3b82f6]" },
  strong: { label: "Strong", message: "Solid, memorable, and safe", bg: "bg-[#10b981]" },
} as const;

type StrengthKey = keyof typeof PASSWORD_STRENGTH;

const getPasswordStrength = (value?: string) => {
  if (!value) return { textContent: "", styles: { bg: "", width: "w-0" } };

  const { score } = checkPasswordStrength(value);

  const map: Record<number, StrengthKey> = {
    0: "weak",
    1: "weak",
    2: "fair",
    3: "good",
    4: "strong",
  };

  const key = map[score];
  const { label, message, bg } = PASSWORD_STRENGTH[key];

  return {
    textContent: `${label} - ${message}`,
    styles: { bg, width: `w-${(score / 4) * 100}` }, // dynamic width for smooth animation
  };
};
export interface Props<T extends FieldValues> extends InputProps {
  control: Control<T>;
  name: Path<T>;
  className?: string;
  label?: string;
  helperText?: string;
  showPasswordStrength?: boolean;
}

const PasswordField = <T extends FieldValues>({
  control,
  name,
  className,
  label,
  helperText,
  showPasswordStrength,
  ...props
}: Props<T>) => {
  const [isVisible, setVisible] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const passwordStrength = getPasswordStrength(field.value);
        return (
          <FormItem className={className}>
            {label && <FormLabel className="rtl:font-arabic-body rtl:text-lg rtl:mb-1">{label}</FormLabel>}
            <FormControl>
              <div className="relative">
                <input
                  aria-invalid={fieldState.invalid}
                  aria-describedby={label}
                  className="w-full rounded-2xl border border-inn-border-light bg-inn-bg-input px-4 py-3 ltr:pr-12 rtl:pl-12 text-inn-text-primary placeholder-inn-text-secondary outline-none transition focus:border-inn-bg-accent focus:ring-2 focus:ring-inn-bg-accent focus:ring-opacity-20"
                  {...field}
                  {...props}
                  type={isVisible ? "text" : "password"}
                />
                <button
                  onClick={() => setVisible((prev) => !prev)}
                  type="button"
                  className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 p-1 text-inn-text-secondary hover:text-inn-text-primary transition-all"
                  aria-label="Toggle password visibility"
                >
                  {isVisible ? <EyeOffIcon className="size-5 shrink-0" /> : <EyeIcon className="size-5 shrink-0" />}
                </button>
              </div>
            </FormControl>

            {/* <!-- Password Strength Indicator --> */}
            {showPasswordStrength && (
              <div className="mt-2">
                <div className="flex space-x-1 mb-1">
                  <div className="flex-1 h-1 bg-inn-border-light rounded-full">
                    <div
                      className={cn(
                        "password-strength bg-inn-border-light h-1 rounded-[2px] transition-all duration-300 ease-in-out",
                        passwordStrength?.styles?.bg,
                        passwordStrength?.styles?.width
                      )}
                    ></div>
                  </div>
                </div>
                <p id="strengthText" className="text-xs text-[var(--text-secondary)]">
                  {passwordStrength?.textContent || "Password strength will appear here"}
                </p>
              </div>
            )}

            {helperText && <FormDescription>{helperText}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default PasswordField;

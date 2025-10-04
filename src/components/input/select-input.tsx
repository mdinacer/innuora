"use client";

import React, { useMemo } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectInputProps<T extends object> {
  className?: string;
  containerClassName?: string;
  data: T[];
  description?: string;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
  labelExtractor: (item: T) => string;
  valueExtractor: (item: T) => string;
}

const SelectInput = <T extends object>({
  className = "w-[180px]",
  containerClassName,
  placeholder,
  label,
  description,
  error,
  required,
  data = [],
  labelExtractor,
  valueExtractor,
  ...props
}: SelectInputProps<T>) => {
  const id = React.useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const options = useMemo(
    () =>
      data.map((item) => ({
        label: labelExtractor(item),
        value: valueExtractor(item),
      })),
    [data, labelExtractor, valueExtractor]
  );

  return (
    <div className={cn("mb-6", containerClassName)}>
      {label && (
        <label htmlFor={id} className="rtl:font-arabic-body block mb-2 font-semibold text-inn-text-primary">
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <Select {...props}>
        <SelectTrigger
          id={id}
          className={cn("hover:border-inn-bg-accent", className)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : descriptionId}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const isSelected = option.value === props.value;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                className={cn("sm:hover:bg-inn-bg-secondary", isSelected ? "sm:bg-inn-bg-accent sm:text-white" : "")}
              >
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
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
};

export default SelectInput;

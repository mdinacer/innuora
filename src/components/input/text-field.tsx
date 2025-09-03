"use client";

import React from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type InputProps = React.ComponentProps<"input">;

interface Props<T extends FieldValues> extends Omit<InputProps, "value" | "onChange"> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  helperText?: string;
}

const TextField = <T extends FieldValues>({ control, name, label, helperText, ...props }: Props<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <input
              {...props}
              {...field}
              className={
                "w-full rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 pr-12 text-mir-text-primary placeholder-mir-text-secondary outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20"
              }
            />
          </FormControl>
          {helperText && <FormDescription>{helperText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TextField;

TextField.displayName = "TextField";

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
          {label && (
            <FormLabel className="rtl:font-arabic-body rtl:text-lg mb-1 font-semibold text-base">
              {label} {props.required && <span className="text-mir-bg-accent">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <input
              {...props}
              {...field}
              className={
                "w-full rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 ltr:pr-12 rtl:pl-12 text-primary placeholder:text-muted-foreground outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20 disabled:opacity-70 disabled:cursor-not-allowed"
              }
            />
          </FormControl>
          {helperText && <FormDescription className="text-base">{helperText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TextField;

TextField.displayName = "TextField";

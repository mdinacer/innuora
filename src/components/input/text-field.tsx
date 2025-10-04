"use client";

import React from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import TextInput from "@/components/input/text-input";
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
              {label} {props.required && <span className="text-inn-bg-accent">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <TextInput {...props} {...field} />
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

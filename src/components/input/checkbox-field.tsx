"use client";

import { CheckboxProps } from "@radix-ui/react-checkbox";
import { Control, FieldValues, Path } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface Props<T extends FieldValues> extends CheckboxProps {
  control: Control<T>;
  name: Path<T>;
  className?: string;
  label: React.ReactNode;
  description?: React.ReactNode;
}

const CheckboxField = <T extends FieldValues>({ className, name, control, label, description, ...props }: Props<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className={cn("flex items-start gap-3", className)}>
            <FormControl>
              <Checkbox
                {...props}
                {...field}
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:text-white data-[state=checked]:border-mir-bg-accent-dark data-[state=checked]:bg-mir-bg-accent"
              />
            </FormControl>
            <div className="grid gap-2">
              <FormLabel>{label}</FormLabel>
              {description && (
                <FormDescription className="text-mir-text-secondary text-sm">{description}</FormDescription>
              )}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CheckboxField;

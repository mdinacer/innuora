"use client";

import { Control, FieldValues, Path } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
}

const SwitchField = <T extends FieldValues>({ control, name, label, description }: Props<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg shrink-0 border p-4 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel className="rtl:text-lg rtl:mb-1">{label}</FormLabel>
            {description && <FormDescription className="rtl:text-base">{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="data-[state=checked]:bg-inn-bg-accent"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default SwitchField;

SwitchField.displayName = "SwitchField";

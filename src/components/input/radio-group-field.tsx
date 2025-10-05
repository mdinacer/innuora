"use client";

import { useMemo } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface Props<T extends FieldValues, Y extends object> {
  control: Control<T>;
  name: Path<T>;
  data: Y[];
  label?: string;
  helperText?: string;
  className?: string;
  labelExtractor: (item: Y) => string;
  valueExtractor: (item: Y) => string;
  descriptionExtractor?: (item: Y) => string;
}
const RadiogroupField = <T extends FieldValues, Y extends object>({
  control,
  name,
  label,
  helperText,
  data = [],
  className,
  labelExtractor,
  valueExtractor,
  descriptionExtractor,
}: Props<T, Y>) => {
  //   const { field, fieldState } = useController({ control, name });
  //   const { value, onChange } = field;
  const options = useMemo(
    () =>
      data.map((item) => ({
        label: labelExtractor(item),
        value: valueExtractor(item),
        description: descriptionExtractor ? descriptionExtractor(item) : undefined,
      })),
    [data, descriptionExtractor, labelExtractor, valueExtractor]
  );
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel className="rtl:font-arabic-body rtl:text-lg mb-1 font-semibold text-base">{label}</FormLabel>
          )}
          <FormControl>
            <div className={className}>
              {options.map((option) => (
                <label
                  key={option.value}
                  htmlFor={option.value}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-inn-bg-secondary cursor-pointer transition-all"
                >
                  <input
                    id={option.value}
                    checked={field.value === option.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    type="radio"
                    className={cn(
                      "appearance-none mt-0.5",
                      "size-5 border-2 border-inn-border-light rounded-full",
                      "bg-inn-bg-input cursor-pointer",
                      "transition-all duration-200 ease-in",
                      "relative shrink-0",
                      "after:content-[''] after:absolute",
                      "after:top-1/2 after:left-1/2",
                      "after:-translate-x-1/2 after:-translate-y-1/2",
                      "after:size-2.5 after:rounded-full",
                      " after:bg-inn-bg-accent",
                      "checked:after:block after:hidden"
                    )}
                    value={option.value}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-base">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-[var(--text-secondary)]">{option.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </FormControl>
          {helperText && <FormDescription className="text-base">{helperText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RadiogroupField;

RadiogroupField.displayName = "RadiogroupField";

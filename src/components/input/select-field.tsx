"use client";

import { useMemo } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props<T extends FieldValues, Y extends object> {
  control: Control<T>;
  name: Path<T>;
  data: Y[];
  label?: string;
  helperText?: string;
  className?: string;
  placeholder?: string;
  labelExtractor: (item: Y) => string;
  valueExtractor: (item: Y) => string;
  descriptionExtractor?: (item: Y) => string;
}

const SelectField = <T extends FieldValues, Y extends object>({
  control,
  name,
  label,
  helperText,
  data = [],
  className,
  placeholder,
  labelExtractor,
  valueExtractor,
  descriptionExtractor,
}: Props<T, Y>) => {
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
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          {label && (
            <FormLabel className="rtl:font-arabic-body rtl:text-lg mb-1 font-semibold text-base">{label}</FormLabel>
          )}
          <FormControl>
            <Select value={field.value ? String(field.value) : undefined} onValueChange={field.onChange}>
              <SelectTrigger
                className={cn(
                  "hover:border-inn-bg-accent sm:py-3 sm:px-4 !h-auto",
                  "bg-inn-bg-input rounded-2xl text-base",
                  className
                )}
                aria-invalid={!!error}
                aria-describedby={error ? error.message : undefined}
              >
                <div className="flex-1 items-start text-left">
                  {field.value ? options.find((option) => option.value === field.value)?.label : placeholder}
                </div>{" "}
                {/* <SelectValue
                  placeholder={placeholder}
                  className="flex flex-col items-start gap-y-0.5 sm:p-6 text-left"
                ></SelectValue> */}
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-inn-bg-card">
                {options.map((option) => {
                  const isSelected = option.value === field.value;
                  return (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={cn(
                        "sm:hover:bg-inn-bg-secondary h-auto rounded-2xl !px-4 !py-3",
                        isSelected ? "sm:bg-inn-bg-accent sm:text-white" : ""
                      )}
                    >
                      {option.description ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="font-medium text-base">{option.label}</div>
                          <div className="italic text-sm">{option.description}</div>
                        </div>
                      ) : (
                        option.label
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormControl>
          {helperText && <FormDescription className="text-base">{helperText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectField;

SelectField.displayName = "SelectField";

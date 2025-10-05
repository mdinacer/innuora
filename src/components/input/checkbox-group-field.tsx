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
  maxSelected?: number;
}
const CheckboxGroupField = <T extends FieldValues, Y extends object>({
  control,
  name,
  label,
  helperText,
  data = [],
  className,
  maxSelected,
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
              {options.map((option) => {
                const isSelected = Array.from(field.value).includes(option.value);
                const isDisabled = maxSelected ? !isSelected && field.value.length >= maxSelected : false;
                return (
                  <label
                    key={option.value}
                    htmlFor={option.value}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg hover:bg-inn-bg-secondary cursor-pointer transition-all",
                      { "opacity-50 cursor-not-allowed pointer-events-none": isDisabled }
                    )}
                  >
                    <input
                      disabled={isDisabled}
                      id={option.value}
                      checked={Array.from(field.value).includes(option.value)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          field.onChange([...field.value, option.value]);
                        } else {
                          field.onChange(Array.from(field.value).filter((value) => value !== option.value));
                        }
                      }}
                      type="checkbox"
                      className={cn(
                        "checkbox-custom mt-0.5",
                        "appearance-none size-5 border-2 border-inn-border-light",
                        "rounded-md bg-inn-bg-input cursor-pointer transition-all duration-200 ease-in relative shrink-0",
                        "hover:border-inn-bg-accent",
                        "checked:bg-inn-bg-accent checked:border-inn-bg-accent",
                        "after:content-[''] after:absolute after:left-[6px] after:top-[2px]",
                        "after:w-[5px] after:h-[10px]",
                        "after:border-solid after:border-white",
                        "after:border-r-[2px] after:border-b-[2px]",
                        "after:rotate-45",
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
                );
              })}
            </div>
          </FormControl>
          {helperText && <FormDescription className="text-base">{helperText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CheckboxGroupField;

CheckboxGroupField.displayName = "CheckboxGroupField";

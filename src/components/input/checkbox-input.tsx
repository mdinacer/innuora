"use client";

import { useId } from "react";
import { CheckboxProps } from "@radix-ui/react-checkbox";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props extends CheckboxProps {
  className?: string;
  label: string;
  description?: React.ReactNode;
}

const CheckboxInput: React.FC<Props> = ({ className, label, description, ...props }) => {
  const checkboxId = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={checkboxId}
        {...props}
        className="data-[state=checked]:text-white data-[state=checked]:border-inn-bg-accent-dark data-[state=checked]:bg-inn-bg-accent"
      />
      <div className="grid gap-2">
        <Label htmlFor={checkboxId}>{label}</Label>
        {description && <div className="text-inn-text-secondary text-sm">{description}</div>}
      </div>
    </div>
  );
};

export default CheckboxInput;

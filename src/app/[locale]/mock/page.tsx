"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants, Button as ShadButton } from "@/components/ui/button";

type ButtonVariants = "default" | "destructive" | "outline" | "secondary" | "ghost" | "accent" | "link";
const variants: ButtonVariants[] = ["default", "destructive", "outline", "secondary", "ghost", "accent", "link"];

const text = "السلام عليكم";
export default function Page() {
  return (
    <div dir="rtl" className="h-screen w-full flex items-center justify-center">
      <ModeToggle />
      <div className="h-[500px] max-w-4xl mx-auto flex flex-col-reverse">
        <div className="p-4 grid gap-4">
          {variants.map((variant) => (
            <ShadButton className="" key={variant} variant={variant as keyof typeof buttonVariants}>
              {variant} -{text}
            </ShadButton>
          ))}
        </div>
      </div>
    </div>
  );
}

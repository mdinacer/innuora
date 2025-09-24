"use client";

import { useEffect, useMemo, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const ChatUIThemeToggle = () => {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ensures component only renders after mount
  }, []);

  const currentTheme = useMemo(() => resolvedTheme || theme || "light", [resolvedTheme, theme]);

  if (!mounted) return null; // prevent SSR rendering mismatch
  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className={cn(
        "theme-toggle",
        "size-9 bg-inn-bg-input",
        "flex items-center justify-center",
        "border-none rounded-xl cursor-pointer",
        "transition-all duration-300 ease-in",
        "hover:bg-inn-border-light hover:scale-105"
      )}
    >
      {currentTheme === "dark" ? (
        <MoonIcon className="size-5 fill-current" />
      ) : (
        <SunIcon className="size-5 fill-current" />
      )}
    </button>
  );
};

export default ChatUIThemeToggle;

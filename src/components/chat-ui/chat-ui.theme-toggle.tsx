"use client";

import { useEffect, useMemo, useState } from "react";
import { LucideIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "../ui/button";

const ChatUIThemeToggle = () => {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ensures component only renders after mount
  }, []);

  const currentTheme = useMemo(() => resolvedTheme || theme || "light", [resolvedTheme, theme]);

  const Icon: LucideIcon = currentTheme === "dark" ? MoonIcon : SunIcon;

  if (!mounted) return null; // prevent SSR rendering mismatch
  return (
    <Button variant={"ghost"} size={"icon"} onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}>
      <Icon className="size-5 fill-current" />
    </Button>
  );
};

export default ChatUIThemeToggle;

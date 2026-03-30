"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

const btnClass =
  "inline-flex h-10 min-h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-800 transition hover:border-accent/40 hover:bg-accent/5 dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:hover:border-accent/45 dark:hover:bg-white/10";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    return <div className="h-10 w-10 shrink-0" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={btnClass}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
      ) : (
        <Moon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
      )}
    </button>
  );
}

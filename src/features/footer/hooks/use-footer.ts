"use client";

import { useTheme } from "next-themes";

export function useFooter() {
  const currentYear = new Date().getFullYear();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // During SSR, theme will be undefined
  const isDark = theme === "dark";

  return {
    currentYear,
    isDark,
    toggleTheme,
  };
}

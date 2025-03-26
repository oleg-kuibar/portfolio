import { useTheme } from "next-themes"

export function useFooter() {
  const currentYear = new Date().getFullYear()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    document.documentElement.classList.toggle("dark")
    // This is a fallback in case the theme provider doesn't update
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme)
    }
  }

  return {
    currentYear,
    isDark,
    toggleTheme,
  }
} 
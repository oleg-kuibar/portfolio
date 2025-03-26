"use client"

import { useTheme } from "@/lib/providers/theme-provider"
import { cn } from "@/utils/cn"
import { ThemeToggle } from "@/features/theme/components/theme-toggle"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <footer className={cn("py-8", isDark ? "bg-muted/10" : "bg-muted")}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-2xl font-bold text-primary">
              OK<span className="text-primary/70">.</span>
            </div>
            <p className="text-sm text-foreground/70 mt-1">Staff Frontend Engineer</p>
          </div>

          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <ThemeToggle />
            <a
              href="https://github.com/oleg-kuibar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition-colors"
              aria-label="Visit Oleg Kuibar's GitHub profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-github"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                <path d="M9 18c-4.51 2-5-2-7-2"></path>
              </svg>
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/olegkuibar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition-colors"
              aria-label="Visit Oleg Kuibar's LinkedIn profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-linkedin"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-foreground/70">&copy; {currentYear} Oleg Kuibar. All rights reserved.</p>
            <p className="text-xs text-foreground/50 mt-1">Built with Next.js, TypeScript, and Tailwind CSS</p>
          </div>
        </div>

        <div
          className={cn(
            "mt-8 pt-8 text-center text-sm text-foreground/50",
            isDark ? "border-t border-muted/20" : "border-t border-muted/50",
          )}
        >
          <p>
            Prefer {isDark ? "light" : "dark"} mode?{" "}
            <button
              onClick={() => {
                const newTheme = theme === "dark" ? "light" : "dark"
                document.documentElement.classList.toggle("dark")
                // This is a fallback in case the theme provider doesn't update
                if (typeof window !== "undefined") {
                  localStorage.setItem("theme", newTheme)
                }
              }}
              className="text-primary hover:underline ml-1"
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              Switch theme
            </button>
          </p>
        </div>
      </div>
    </footer>
  )
}


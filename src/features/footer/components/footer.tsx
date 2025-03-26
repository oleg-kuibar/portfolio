"use client"

import { useTheme } from "next-themes"
import { cn } from "@/utils/cn"
import { ThemeToggle } from "@/features/theme/components/theme-toggle"
import { FaLinkedin } from "react-icons/fa"
import { SiGithub } from "react-icons/si"

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
              aria-label="Visit Oleg Kuibar&apos;s GitHub profile"
            >
              <SiGithub className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/olegkuibar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition-colors"
              aria-label="Visit Oleg Kuibar&apos;s LinkedIn profile"
            >
              <FaLinkedin className="h-6 w-6" />
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


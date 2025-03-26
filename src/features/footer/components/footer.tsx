"use client";

import { cn } from "@/utils/cn";
import { FaLinkedin } from "react-icons/fa";
import { SiGithub } from "react-icons/si";
import { useFooter } from "../hooks/use-footer";
import { FOOTER_CONTENT } from "../constants/footer-content";
import { MoonIcon, SunIcon } from "lucide-react";

export function Footer() {
  const { currentYear, isDark, toggleTheme } = useFooter();

  return (
    <footer className={cn("py-8", isDark ? "bg-muted/10" : "bg-muted")}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-2xl font-bold text-primary">
              {FOOTER_CONTENT.name.split(" ")[0][0]}
              {FOOTER_CONTENT.name.split(" ")[1][0]}
              <span className="text-primary/70">.</span>
            </div>
            <p className="text-sm text-foreground/70 mt-1">
              {FOOTER_CONTENT.role}
            </p>
          </div>

          <div className="flex items-center gap-4 mb-4 md:mb-0">
            {FOOTER_CONTENT.socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors"
                aria-label={link.label}
              >
                {link.icon === "github" ? (
                  <SiGithub className="h-6 w-6" />
                ) : (
                  <FaLinkedin className="h-6 w-6" />
                )}
                <span className="sr-only">{link.name}</span>
              </a>
            ))}
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-foreground/70">
              &copy; {currentYear} {FOOTER_CONTENT.name}. All rights reserved.
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Built with {FOOTER_CONTENT.techStack.join(", ")}
            </p>
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
              onClick={toggleTheme}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              {isDark ? (
                <>
                  <SunIcon className="mr-2 h-4 w-4" />
                  Switch to light mode
                </>
              ) : (
                <>
                  <MoonIcon className="mr-2 h-4 w-4" />
                  Switch to dark mode
                </>
              )}
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
}

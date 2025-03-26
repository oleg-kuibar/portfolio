"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowDownIcon, GithubIcon, LinkedinIcon } from "lucide-react"
import { cn } from "@/utils/cn"
import { useTheme } from "@/lib/providers/theme-provider"
import { scrollToElement } from "@/utils/scroll-utils"

// Define which sections to show
const SHOW_BLOG = false

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const isDark = theme === "dark" || resolvedTheme === "dark"

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 z-0",
          isDark
            ? "bg-gradient-to-b from-background via-background/95 to-background/90"
            : "bg-gradient-to-b from-background to-background/50",
        )}
      />

      {/* Grid pattern */}
      <div
        className={cn(
          "absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center z-0",
          isDark ? "opacity-10" : "opacity-5",
        )}
      />

      {/* Dark mode specific particles */}
      {isDark && (
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full bg-primary/5 blur-3xl"></div>
        </div>
      )}

      <div className="container mx-auto px-4 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="block">Hi, I'm</span>
              <span className="text-primary">Oleg Kuibar</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-foreground/80 mb-6">Staff Frontend Engineer</h2>
            <p className="text-lg text-foreground/70 max-w-xl mb-8">
              I bridge technical excellence, architectural innovation, and team leadership to craft scalable,
              maintainable, and user-focused systems.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Button size="lg" className="rounded-full" onClick={() => scrollToElement("projects")}>
                View Projects
              </Button>
              {SHOW_BLOG ? (
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "rounded-full",
                    isDark && "hover:bg-primary/10 hover:text-primary hover:border-primary",
                  )}
                  onClick={() => scrollToElement("blog")}
                >
                  Read My Blog
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "rounded-full",
                    isDark && "hover:bg-primary/10 hover:text-primary hover:border-primary",
                  )}
                  onClick={() => scrollToElement("contact")}
                >
                  Contact Me
                </Button>
              )}
              <div className="flex items-center gap-4 mt-4 md:mt-0 md:ml-4">
                <a
                  href="https://github.com/oleg-kuibar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-foreground/70 hover:text-primary transition-colors",
                    isDark && "hover:text-primary/90",
                  )}
                  aria-label="Visit Oleg Kuibar's GitHub profile"
                >
                  <GithubIcon className="h-6 w-6" />
                  <span className="sr-only">GitHub</span>
                </a>
                <a
                  href="https://linkedin.com/in/olegkuibar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-foreground/70 hover:text-primary transition-colors",
                    isDark && "hover:text-primary/90",
                  )}
                  aria-label="Visit Oleg Kuibar's LinkedIn profile"
                >
                  <LinkedinIcon className="h-6 w-6" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 flex justify-center md:justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div
              className={cn(
                "relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden",
                "border-4 border-primary/20",
                isDark
                  ? "dark-glow before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/30 before:to-transparent before:z-10"
                  : "before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/20 before:to-transparent before:z-10",
              )}
            >
              <Image
                src="https://sjc.microlink.io/vX-ib3F-TVbwKLCsbZ7ZkSQOQq9KPkP99Ukp0N1rA0MZOaOU65rgU9rB6EM25GGb4Pq0kXAIZGOY_86NITY1lg.jpeg"
                alt="Oleg Kuibar"
                fill
                className={cn("object-cover", isDark && "dark-image-filter")}
                priority
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <a
            href="#about"
            className={cn(
              "flex flex-col items-center transition-colors",
              isDark ? "text-foreground/40 hover:text-primary/90" : "text-foreground/50 hover:text-primary",
            )}
            onClick={(e) => {
              e.preventDefault()
              scrollToElement("about")
            }}
          >
            <span className="text-sm mb-2">Scroll Down</span>
            <ArrowDownIcon className="h-5 w-5 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}


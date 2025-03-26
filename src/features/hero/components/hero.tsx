"use client"

import type React from "react"
import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/providers/theme-provider"
import { cn } from "@/utils/cn"
import { FaLinkedin } from "react-icons/fa"
import { SiGithub } from "react-icons/si"
import { ArrowDownIcon } from "lucide-react"
import { containerVariants, itemVariants } from "../animations"

interface HeroProps {
  title: string
  subtitle: string
  name: string
  role: string
  description: string
  socialLinks: {
    linkedin: string
    github: string
  }
}

export function Hero({
  title,
  name,
  role,
  description,
  socialLinks,
}: HeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about")
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background gradient - always rendered */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-b from-background via-background/95 to-background/90"
        aria-hidden="true"
      />
      
      {/* Grid pattern - always rendered */}
      <div 
        className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center z-0 opacity-5"
        aria-hidden="true"
      />

      {/* Dark mode effects - always rendered but with conditional opacity */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className={cn(
          "absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/5 blur-3xl",
          isDark ? "opacity-100" : "opacity-0"
        )} />
        <div className={cn(
          "absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-primary/10 blur-3xl",
          isDark ? "opacity-100" : "opacity-0"
        )} />
        <div className={cn(
          "absolute top-1/2 right-1/3 w-24 h-24 rounded-full bg-primary/5 blur-3xl",
          isDark ? "opacity-100" : "opacity-0"
        )} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col md:flex-row items-center justify-between gap-12"
        >
          <motion.div variants={itemVariants} className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {title} <span className="text-primary">{name}</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-foreground/70 mb-4">
              {role}
            </h2>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl">
              {description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button 
                size="lg" 
                className="gap-2"
                asChild
              >
                <Link 
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit LinkedIn profile"
                >
                  <FaLinkedin className="h-5 w-5" aria-hidden="true" />
                  LinkedIn
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2"
                asChild
              >
                <Link 
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit GitHub profile"
                >
                  <SiGithub className="h-5 w-5" aria-hidden="true" />
                  GitHub
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <Image
                src="/avatar.png"
                alt={`${name}'s profile picture`}
                fill
                className="rounded-full object-cover"
                priority
                sizes="(max-width: 768px) 256px, 320px"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Down Button */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : -20 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <button
          onClick={scrollToAbout}
          className={cn(
            "flex flex-col items-center transition-colors cursor-pointer",
            isDark ? "text-foreground/40 hover:text-primary/90" : "text-foreground/50 hover:text-primary"
          )}
          aria-label="Scroll to About section"
        >
          <span className="text-sm mb-2">Scroll Down</span>
          <ArrowDownIcon className="h-5 w-5 animate-bounce" aria-hidden="true" />
        </button>
      </motion.div>
    </section>
  )
}


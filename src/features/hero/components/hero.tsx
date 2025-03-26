"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"
import { FaLinkedin } from "react-icons/fa"
import { SiGithub } from "react-icons/si"
import { ArrowDownIcon } from "lucide-react"
import { containerVariants, itemVariants } from "../animations"
import { HeroBackground } from "./hero-background"
import { useHero } from "../hooks/use-hero"
import type { HeroProps } from "../types/hero"

export function Hero({
  title,
  name,
  role,
  description,
  socialLinks,
}: HeroProps) {
  const { ref, isInView, isDark, scrollToAbout } = useHero()

  return (
    <section 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      <HeroBackground isDark={isDark} />

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


"use client"

import { cn } from "@/utils/cn"
import type { HeroBackgroundProps } from "../types/hero"

export function HeroBackground({ isDark }: HeroBackgroundProps) {
  return (
    <>
      {/* Background gradient */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-b from-background via-background/95 to-background/90"
        aria-hidden="true"
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center z-0 opacity-5"
        aria-hidden="true"
      />

      {/* Dark mode effects */}
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
    </>
  )
} 
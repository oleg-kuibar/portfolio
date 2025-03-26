"use client"

import type React from "react"
import { useEffect, useCallback, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { cn } from "@/utils/cn"
import { useTechRadar } from "../hooks/use-tech-radar"
import { drawRadar } from "../utils/radar-drawer"
import { LEVEL_COLORS, LEVEL_DESCRIPTIONS } from "../constants/radar-config"

export function TechRadar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const {
    canvasRef,
    techItemPositions,
    hoveredTech,
    hoveredLegendItem,
    setActiveCategory,
    filteredTechItems,
    handleCanvasMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleMouseLeave,
    handleLegendItemHover,
  } = useTechRadar()

  const drawRadarCallback = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the container size
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    // Use the actual container width, but maintain aspect ratio
    const containerWidth = rect.width
    const size = Math.min(containerWidth, 800)

    // Update canvas size properly
    canvas.width = size * dpr
    canvas.height = size * dpr

    // Scale all drawing operations
    ctx.scale(dpr, dpr)

    // Center point and radius
    const centerX = size / 2
    const centerY = size / 2
    const maxRadius = (size / 2) * 0.85

    drawRadar({
      canvas,
      ctx,
      size,
      centerX,
      centerY,
      maxRadius,
      filteredTechItems,
      hoveredLegendItem,
      hoveredTech,
      isDark,
      techItemPositions: techItemPositions.current,
    })
  }, [canvasRef, filteredTechItems, hoveredLegendItem, hoveredTech, isDark, techItemPositions])

  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      drawRadarCallback()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize with debounce
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        drawRadarCallback()
      }, 100)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [drawRadarCallback])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section id="tech-radar" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tech Radar</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            A visual representation of my technology experience and interests, from core expertise to technologies I&apos;m
            exploring.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto"
        >
          <Tabs defaultValue="all" onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="frontend">Frontend</TabsTrigger>
              <TabsTrigger value="backend">Backend</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="devops">DevOps</TabsTrigger>
            </TabsList>

            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-[3] flex justify-center items-center min-h-[800px]">
                    <div className="relative w-full max-w-[800px] aspect-square">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-full touch-none"
                        onMouseMove={handleCanvasMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseLeave}
                        aria-label="Tech radar visualization"
                        role="img"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Legend</h3>

                      <div className="space-y-3">
                        {Object.entries(LEVEL_COLORS).map(([level, color]) => (
                          <div
                            key={level}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-md transition-colors",
                              hoveredLegendItem === level ? "bg-muted/50" : "hover:bg-muted/30",
                            )}
                            onMouseEnter={() => handleLegendItemHover(level)}
                            onMouseLeave={() => handleLegendItemHover(null)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Filter by ${level} technologies`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleLegendItemHover(level)
                              }
                            }}
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="capitalize font-medium">{level}</span>
                            <span className="text-foreground/60 text-sm">
                              {LEVEL_DESCRIPTIONS[level as keyof typeof LEVEL_DESCRIPTIONS]}
                            </span>
                          </div>
                        ))}
                      </div>

                      {hoveredTech && (
                        <motion.div
                          className={cn("mt-6 p-4 rounded-lg", isDark ? "bg-muted/30" : "bg-muted")}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h4 className="font-semibold">{hoveredTech.name}</h4>
                          <p className="text-sm text-foreground/70 mt-1">{hoveredTech.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                              {hoveredTech.category}
                            </span>
                            <span
                              className="text-xs px-2 py-1 rounded-full capitalize text-white"
                              style={{ backgroundColor: LEVEL_COLORS[hoveredTech.level as keyof typeof LEVEL_COLORS] }}
                            >
                              {hoveredTech.level}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}


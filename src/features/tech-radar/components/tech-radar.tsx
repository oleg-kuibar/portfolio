"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { cn } from "@/utils/cn"

interface TechItem {
  name: string
  category: string
  level: "core" | "frequent" | "occasional" | "exploring"
  description: string
}

export function TechRadar() {
  const ref = useRef(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [activeCategory, setActiveCategory] = useState("all")
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null)
  const [hoveredLegendItem, setHoveredLegendItem] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const techItems = useMemo<TechItem[]>(() => [
    // Frontend
    {
      name: "React",
      category: "frontend",
      level: "core",
      description: "Primary UI library for building component-based interfaces",
    },
    {
      name: "TypeScript",
      category: "frontend",
      level: "core",
      description: "Strongly typed programming language that builds on JavaScript",
    },
    {
      name: "Next.js",
      category: "frontend",
      level: "core",
      description: "React framework for production with hybrid rendering strategies",
    },
    {
      name: "Tailwind CSS",
      category: "frontend",
      level: "core",
      description: "Utility-first CSS framework for rapid UI development",
    },
    {
      name: "Redux",
      category: "frontend",
      level: "frequent",
      description: "Predictable state container for JavaScript apps",
    },
    {
      name: "React Query",
      category: "frontend",
      level: "frequent",
      description: "Data fetching and caching library for React applications",
    },
    {
      name: "Framer Motion",
      category: "frontend",
      level: "frequent",
      description: "Production-ready motion library for React",
    },
    {
      name: "Storybook",
      category: "frontend",
      level: "frequent",
      description: "Tool for developing UI components in isolation",
    },
    { name: "Gatsby", category: "frontend", level: "occasional", description: "Static site generator for React" },
    {
      name: "Vue.js",
      category: "frontend",
      level: "occasional",
      description: "Progressive JavaScript framework for building UIs",
    },
    {
      name: "Svelte",
      category: "frontend",
      level: "exploring",
      description: "Compiler-based framework that writes minimal JavaScript",
    },
    {
      name: "Solid.js",
      category: "frontend",
      level: "exploring",
      description: "Declarative, efficient, and flexible JavaScript library for building UIs",
    },

    // Backend
    {
      name: "Node.js",
      category: "backend",
      level: "core",
      description: "JavaScript runtime built on Chrome&apos;s V8 JavaScript engine",
    },
    {
      name: "Express",
      category: "backend",
      level: "frequent",
      description: "Fast, unopinionated, minimalist web framework for Node.js",
    },
    {
      name: "GraphQL",
      category: "backend",
      level: "frequent",
      description: "Query language for APIs and runtime for executing those queries",
    },
    { name: "MongoDB", category: "backend", level: "frequent", description: "Document-oriented NoSQL database" },
    {
      name: "PostgreSQL",
      category: "backend",
      level: "occasional",
      description: "Powerful, open source object-relational database system",
    },
    {
      name: "Firebase",
      category: "backend",
      level: "occasional",
      description: "Platform for building web and mobile applications",
    },
    {
      name: "AWS Lambda",
      category: "backend",
      level: "occasional",
      description: "Serverless compute service that runs code in response to events",
    },
    {
      name: "Deno",
      category: "backend",
      level: "exploring",
      description: "Secure runtime for JavaScript and TypeScript",
    },

    // Testing
    {
      name: "Jest",
      category: "testing",
      level: "core",
      description: "JavaScript testing framework with a focus on simplicity",
    },
    {
      name: "React Testing Library",
      category: "testing",
      level: "core",
      description: "Testing utilities for React focused on user behavior",
    },
    {
      name: "Cypress",
      category: "testing",
      level: "frequent",
      description: "End-to-end testing framework for web applications",
    },
    {
      name: "Playwright",
      category: "testing",
      level: "exploring",
      description: "Framework for reliable end-to-end testing for modern web apps",
    },

    // DevOps
    {
      name: "GitHub Actions",
      category: "devops",
      level: "frequent",
      description: "CI/CD platform integrated with GitHub",
    },
    {
      name: "Docker",
      category: "devops",
      level: "occasional",
      description: "Platform for developing, shipping, and running applications in containers",
    },
    {
      name: "Kubernetes",
      category: "devops",
      level: "exploring",
      description: "Container orchestration system for automating deployment and scaling",
    },
  ], [])

  const filteredTechItems =
    activeCategory === "all" ? techItems : techItems.filter((item) => item.category === activeCategory)

  const levelRadius = useMemo(() => ({
    core: 0.25,
    frequent: 0.5,
    occasional: 0.75,
    exploring: 0.95,
  }), [])

  const levelColors = useMemo(() => ({
    core: "#3b82f6",
    frequent: "#10b981",
    occasional: "#f59e0b",
    exploring: "#ef4444",
  }), [])

  // Store tech item positions for interaction
  const techItemPositions = useRef<{ [key: string]: { x: number; y: number; radius: number } }>({})

  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Set display size (css pixels)
    const size = Math.min(rect.width, 600)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = size * dpr
    canvas.height = size * dpr

    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const maxRadius = size / 2 - 20

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw radar circles
    const levels = ["core", "frequent", "occasional", "exploring"]
    levels.forEach((level) => {
      const radius = maxRadius * levelRadius[level as keyof typeof levelRadius]
      const isHighlighted = hoveredLegendItem === level

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = isHighlighted
        ? levelColors[level as keyof typeof levelColors]
        : isDark
          ? "rgba(156, 163, 175, 0.3)"
          : "rgba(156, 163, 175, 0.3)"
      ctx.lineWidth = isHighlighted ? 2 : 1
      ctx.stroke()

      if (isHighlighted) {
        ctx.fillStyle = levelColors[level as keyof typeof levelColors] + "15" // 15 is hex for 10% opacity
        ctx.fill()
      }

      // Add labels for each circle
      ctx.fillStyle = isHighlighted
        ? levelColors[level as keyof typeof levelColors]
        : isDark
          ? "rgba(156, 163, 175, 0.7)"
          : "rgba(156, 163, 175, 0.7)"
      ctx.font = isHighlighted ? "bold 12px sans-serif" : "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(level.charAt(0).toUpperCase() + level.slice(1), centerX - radius - 5, centerY)
    })

    // Draw axis lines
    const numAxes = 4
    for (let i = 0; i < numAxes; i++) {
      const angle = (i * Math.PI * 2) / numAxes

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius)
      ctx.strokeStyle = isDark ? "rgba(156, 163, 175, 0.3)" : "rgba(156, 163, 175, 0.3)"
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Reset tech item positions
    techItemPositions.current = {}

    // Plot tech items
    filteredTechItems.forEach((item, index) => {
      const angle = (index * Math.PI * 2) / filteredTechItems.length
      const radius = maxRadius * levelRadius[item.level]

      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Store position for interaction
      techItemPositions.current[item.name] = { x, y, radius: 8 }

      const isHighlighted = hoveredTech?.name === item.name || hoveredLegendItem === item.level

      // Draw point
      ctx.beginPath()
      ctx.arc(x, y, isHighlighted ? 10 : 8, 0, Math.PI * 2)
      ctx.fillStyle = levelColors[item.level as keyof typeof levelColors]

      if (isHighlighted) {
        ctx.shadowColor = levelColors[item.level as keyof typeof levelColors]
        ctx.shadowBlur = 10
      }

      ctx.fill()

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0

      // Draw label
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)"
      ctx.font = isHighlighted ? "bold 12px sans-serif" : "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Position label based on quadrant to avoid overlap
      const labelX = x + Math.cos(angle) * 20
      const labelY = y + Math.sin(angle) * 20

      // Add a subtle background to make text more readable
      const textWidth = ctx.measureText(item.name).width
      ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"
      ctx.fillRect(labelX - textWidth / 2 - 3, labelY - 8, textWidth + 6, 16)

      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)"
      ctx.fillText(item.name, labelX, labelY)
    })
  }, [filteredTechItems, hoveredLegendItem, hoveredTech?.name, isDark, levelColors, levelRadius])

  // Handle canvas mouse interactions
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if mouse is over any tech item
      let hoveredItem = null
      for (const [name, position] of Object.entries(techItemPositions.current)) {
        const distance = Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2))
        if (distance < position.radius + 2) {
          // +2 for better hit detection
          hoveredItem = techItems.find((item) => item.name === name) || null
          break
        }
      }

      setHoveredTech(hoveredItem)
    },
    [techItems],
  )

  const handleMouseLeave = () => {
    setHoveredTech(null)
    setHoveredLegendItem(null)
  }

  // Handle legend item hover
  const handleLegendItemHover = useCallback((level: string | null) => {
    setHoveredLegendItem(level)
  }, [])

  useEffect(() => {
    drawRadar()

    // Handle window resize
    const handleResize = () => {
      drawRadar()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [activeCategory, filteredTechItems, hoveredTech, hoveredLegendItem, drawRadar, isDark])

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
          className="max-w-4xl mx-auto"
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
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 flex justify-center">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full touch-none"
                      onMouseMove={handleCanvasMouseMove}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Tech radar visualization"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Legend</h3>

                      <div className="space-y-3">
                        {Object.entries(levelRadius).map(([level]) => (
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
                              style={{ backgroundColor: levelColors[level as keyof typeof levelColors] }}
                            />
                            <span className="capitalize font-medium">{level}</span>
                            <span className="text-foreground/60 text-sm">
                              {level === "core" && "- Daily use, expert level"}
                              {level === "frequent" && "- Regular use, proficient"}
                              {level === "occasional" && "- Periodic use, competent"}
                              {level === "exploring" && "- Learning, experimenting"}
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
                              style={{ backgroundColor: levelColors[hoveredTech.level as keyof typeof levelColors] }}
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


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
      name: "Angular",
      category: "frontend",
      level: "core",
      description: "Popular JavaScript framework for building dynamic web applications",
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
      name: "Zustand",
      category: "frontend",
      level: "core",
      description: "State management library for React",
    },
    {
      name: "Zod",
      category: "frontend",
      level: "core",
      description: "Schema declaration and validation library for TypeScript",
    },
    {
      name: "CodeGen",
      category: "frontend",
      level: "frequent",
      description: "Code generation library for TypeScript with integration to GraphQL and Zod",
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
      name: "React Native",
      category: "frontend",
      level: "exploring",
      description: "Mobile app development framework for React",
    },
    {
      name: "Astro",
      category: "frontend",
      level: "exploring",
      description: "Static site generator for React",
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
    core: 0.2,        // Innermost circle - expert level
    frequent: 0.4,    // Second circle - proficient
    occasional: 0.6,  // Third circle - competent
    exploring: 0.8,   // Outer circle - learning
  }), [])

  const levelColors = useMemo(() => ({
    core: "#3b82f6",
    frequent: "#10b981",
    occasional: "#f59e0b",
    exploring: "#ef4444",
  }), [])

  // Store tech item positions for interaction
  const techItemPositions = useRef<{ [key: string]: { x: number; y: number; radius: number; labelX?: number; labelY?: number } }>({})

  const drawRadar = useCallback(() => {
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

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw radar circles with gradient
    const levels = ["core", "frequent", "occasional", "exploring"]
    levels.forEach((level) => {
      const radius = maxRadius * levelRadius[level as keyof typeof levelRadius]
      const isHighlighted = hoveredLegendItem === level

      // Create gradient for circle
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, isHighlighted 
        ? levelColors[level as keyof typeof levelColors] + "20" // 20% opacity
        : isDark ? "rgba(156, 163, 175, 0.1)" : "rgba(156, 163, 175, 0.05)")
      gradient.addColorStop(1, "transparent")

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw circle border
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = isHighlighted
        ? levelColors[level as keyof typeof levelColors]
        : isDark ? "rgba(156, 163, 175, 0.3)" : "rgba(156, 163, 175, 0.2)"
      ctx.lineWidth = isHighlighted ? 2 : 1
      ctx.stroke()

      // Add labels with improved readability
      ctx.fillStyle = isHighlighted
        ? levelColors[level as keyof typeof levelColors]
        : isDark ? "rgba(156, 163, 175, 0.7)" : "rgba(156, 163, 175, 0.7)"
      ctx.font = isHighlighted ? "bold 12px sans-serif" : "12px sans-serif"
      ctx.textAlign = "right"
      
      // Add background for label
      const labelText = level.charAt(0).toUpperCase() + level.slice(1)
      const textWidth = ctx.measureText(labelText).width
      const labelX = centerX - radius - 10
      const labelY = centerY
      
      ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"
      ctx.fillRect(labelX - textWidth - 5, labelY - 8, textWidth + 10, 16)
      
      ctx.fillStyle = isHighlighted
        ? levelColors[level as keyof typeof levelColors]
        : isDark ? "rgba(156, 163, 175, 0.7)" : "rgba(156, 163, 175, 0.7)"
      ctx.fillText(labelText, labelX, labelY)
    })

    // Draw axis lines with improved visibility
    const numAxes = 4
    for (let i = 0; i < numAxes; i++) {
      const angle = (i * Math.PI * 2) / numAxes

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius)
      ctx.strokeStyle = isDark ? "rgba(156, 163, 175, 0.2)" : "rgba(156, 163, 175, 0.1)"
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Reset tech item positions
    techItemPositions.current = {}

    // First pass: Calculate initial positions
    filteredTechItems.forEach((item, index) => {
      const angle = (index * Math.PI * 2) / filteredTechItems.length
      const radius = maxRadius * levelRadius[item.level]

      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Store position for interaction
      techItemPositions.current[item.name] = { 
        x, 
        y, 
        radius: 8,
        labelX: x + Math.cos(angle) * 50, // Increased base distance
        labelY: y + Math.sin(angle) * 50
      }
    })

    // Second pass: Adjust label positions to avoid overlap
    filteredTechItems.forEach((item) => {
      const pos = techItemPositions.current[item.name]
      const labelWidth = ctx.measureText(item.name).width + 12 // Add padding
      const labelHeight = 20

      // Check for collisions with other labels
      let adjustment = 0
      let maxTries = 10
      let hasCollision = true

      while (hasCollision && maxTries > 0) {
        hasCollision = false
        for (const [otherName, otherPos] of Object.entries(techItemPositions.current)) {
          if (otherName === item.name || !otherPos.labelX || !otherPos.labelY) continue

          const xDist = Math.abs(pos.labelX! - otherPos.labelX)
          const yDist = Math.abs(pos.labelY! - otherPos.labelY)
          
          if (xDist < labelWidth && yDist < labelHeight) {
            hasCollision = true
            adjustment += 10
            const angle = Math.atan2(pos.y - centerY, pos.x - centerX)
            pos.labelX = pos.x + Math.cos(angle) * (50 + adjustment)
            pos.labelY = pos.y + Math.sin(angle) * (50 + adjustment)
            break
          }
        }
        maxTries--
      }
    })

    // Third pass: Draw everything
    filteredTechItems.forEach((item) => {
      const pos = techItemPositions.current[item.name]
      const isHighlighted = hoveredTech?.name === item.name || hoveredLegendItem === item.level

      // Draw point with glow effect
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, isHighlighted ? 9 : 4, 0, Math.PI * 2)
      
      if (isHighlighted) {
        ctx.shadowColor = levelColors[item.level as keyof typeof levelColors]
        ctx.shadowBlur = 15
      }
      
      ctx.fillStyle = levelColors[item.level as keyof typeof levelColors]
      ctx.fill()

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0

      // Draw label with improved readability
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)"
      ctx.font = isHighlighted ? "bold 14px sans-serif" : "14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Add background for label
      const textWidth = ctx.measureText(item.name).width
      ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"
      ctx.fillRect(pos.labelX! - textWidth / 2 - 6, pos.labelY! - 10, textWidth + 12, 20)

      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)"
      ctx.fillText(item.name, pos.labelX!, pos.labelY!)

      // Draw connecting line
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.labelX!, pos.labelY!)
      ctx.strokeStyle = isDark ? "rgba(156, 163, 175, 0.2)" : "rgba(156, 163, 175, 0.1)"
      ctx.lineWidth = 1
      ctx.stroke()
    })
  }, [filteredTechItems, hoveredLegendItem, hoveredTech?.name, isDark, levelColors, levelRadius])

  // Handle canvas mouse interactions with improved touch support
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

      // Check if mouse is over any tech item with improved hit detection
      let hoveredItem = null
      for (const [name, position] of Object.entries(techItemPositions.current)) {
        const distance = Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2))
        if (distance < position.radius + 5) { // Increased hit area
          hoveredItem = techItems.find((item) => item.name === name) || null
          break
        }
      }

      setHoveredTech(hoveredItem)
    },
    [techItems],
  )

  // Add touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Prevent scrolling while interacting with canvas
    handleCanvasMouseMove(e)
  }, [handleCanvasMouseMove])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Prevent scrolling while interacting with canvas
    handleCanvasMouseMove(e)
  }, [handleCanvasMouseMove])

  const handleMouseLeave = () => {
    setHoveredTech(null)
    setHoveredLegendItem(null)
  }

  // Handle legend item hover
  const handleLegendItemHover = useCallback((level: string | null) => {
    setHoveredLegendItem(level)
  }, [])

  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      drawRadar()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize with debounce
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        drawRadar()
      }, 100)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [drawRadar])

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


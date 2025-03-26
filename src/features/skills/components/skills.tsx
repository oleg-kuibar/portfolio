"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { SKILLS_DATA } from "../constants/skills-data"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ExperienceLevel, SkillDetails } from "../types/skill"

const EXPERIENCE_COLORS: Record<ExperienceLevel, { badge: string; tooltip: string }> = {
  Expert: {
    badge: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
    tooltip: "bg-green-500/5 border-green-500/10"
  },
  Advanced: {
    badge: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
    tooltip: "bg-blue-500/5 border-blue-500/10"
  },
  Intermediate: {
    badge: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
    tooltip: "bg-yellow-500/5 border-yellow-500/10"
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
} as const

const SkillBadge = memo(function SkillBadge({ 
  skill 
}: { 
  skill: SkillDetails
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "cursor-help transition-all duration-200 px-3 py-1 text-sm",
              EXPERIENCE_COLORS[skill.experienceLevel].badge
            )}
          >
            {skill.name}
          </Badge>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className={cn(
            "max-w-xs backdrop-blur-sm",
            EXPERIENCE_COLORS[skill.experienceLevel].tooltip
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  EXPERIENCE_COLORS[skill.experienceLevel].badge
                )}
              >
                {skill.experienceLevel}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {skill.yearsOfExperience}y · {skill.projects} projects
              </span>
            </div>
            {skill.certifications.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Certifications:</span>{" "}
                {skill.certifications.join(", ")}
              </div>
            )}
            {skill.notableAchievements.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Notable:</span>{" "}
                {skill.notableAchievements.join(", ")}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

const SkillCategory = memo(function SkillCategory({ 
  category 
}: { 
  category: { name: string; description: string; skills: SkillDetails[] } 
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold tracking-tight">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {category.skills.map((skill) => (
              <SkillBadge key={skill.name} skill={skill} />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  )
})

export function Skills() {
  return (
    <section id="skills" className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
      <div className="container relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Technical Skills</h2>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Technologies and tools I&apos;ve worked with. Hover over each skill to see more details.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8"
          >
            {SKILLS_DATA.map((category) => (
              <SkillCategory key={category.name} category={category} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}


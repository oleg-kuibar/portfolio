import { TechLevel } from "../types/tech-item"

export const LEVEL_RADIUS: Record<TechLevel, number> = {
  core: 0.2,        // Innermost circle - expert level
  frequent: 0.4,    // Second circle - proficient
  occasional: 0.6,  // Third circle - competent
  exploring: 0.8,   // Outer circle - learning
}

export const LEVEL_COLORS: Record<TechLevel, string> = {
  core: "#3b82f6",
  frequent: "#10b981",
  occasional: "#f59e0b",
  exploring: "#ef4444",
}

export const LEVEL_DESCRIPTIONS: Record<TechLevel, string> = {
  core: "Daily use, expert level",
  frequent: "Regular use, proficient",
  occasional: "Periodic use, competent",
  exploring: "Learning, experimenting",
} 
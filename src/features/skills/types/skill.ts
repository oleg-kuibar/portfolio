export interface Skill {
  name: string
  level: number
}

export type SkillCategory = "frontend" | "backend" | "other"

export interface SkillCategoryData {
  name: string
  skills: Skill[]
} 
import { SkillCategoryData } from "../types/skill"

export const SKILLS_DATA: Record<string, SkillCategoryData> = {
  frontend: {
    name: "Frontend",
    skills: [
      { name: "React", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Next.js", level: 92 },
      { name: "CSS/Tailwind", level: 88 },
      { name: "Redux/Context API", level: 85 },
      { name: "React Query", level: 80 },
      { name: "Framer Motion", level: 75 },
      { name: "Testing (Jest, RTL)", level: 85 },
    ],
  },
  backend: {
    name: "Backend",
    skills: [
      { name: "Node.js", level: 80 },
      { name: "Express", level: 75 },
      { name: "GraphQL", level: 70 },
      { name: "REST API Design", level: 85 },
      { name: "MongoDB", level: 65 },
      { name: "PostgreSQL", level: 60 },
      { name: "AWS Services", level: 65 },
      { name: "Firebase", level: 70 },
    ],
  },
  other: {
    name: "Leadership & Other",
    skills: [
      { name: "System Architecture", level: 85 },
      { name: "CI/CD", level: 80 },
      { name: "Performance Optimization", level: 90 },
      { name: "Agile/Scrum", level: 85 },
      { name: "Technical Leadership", level: 90 },
      { name: "Code Reviews", level: 95 },
      { name: "Mentoring", level: 85 },
      { name: "Documentation", level: 80 },
    ],
  },
} 
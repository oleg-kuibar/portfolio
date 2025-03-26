import type { SkillCategory } from "../types/skill"

export const SKILLS_DATA: SkillCategory[] = [
  {
    name: "Frontend Development",
    description: "Core technologies and frameworks for building modern web applications",
    skills: [
      {
        name: "React",
        icon: "react",
        experienceLevel: "Expert",
        yearsOfExperience: 8,
        projects: 8,
        certifications: ["React Certified Developer"],
        notableAchievements: ["Led migration of legacy app to React", "Developed reusable component library"]
      },
      {
        name: "TypeScript",
        icon: "typescript",
        experienceLevel: "Advanced",
        yearsOfExperience: 6,
        projects: 7,
        certifications: ["TypeScript Advanced Certification"],
        notableAchievements: []
      },
      {
        name: "Next.js",
        icon: "nextjs",
        experienceLevel: "Advanced",
        yearsOfExperience: 5,
        projects: 6,
        certifications: [],
        notableAchievements: ["Built high-performance SSR applications"]
      },
      {
        name: "Angular",
        icon: "angular",
        experienceLevel: "Advanced",
        yearsOfExperience: 5,
        projects: 6,
        certifications: ["Angular Certified Developer"],
        notableAchievements: ["Built enterprise-level applications"]
      },
      {
        name: "Tailwind CSS",
        icon: "tailwind",
        experienceLevel: "Advanced",
        yearsOfExperience: 4,
        projects: 5,
        certifications: [],
        notableAchievements: ["Created responsive design system"]
      },
      {
        name: "Zustand",
        icon: "zustand",
        experienceLevel: "Advanced",
        yearsOfExperience: 3,
        projects: 4,
        certifications: [],
        notableAchievements: ["Implemented global state management"]
      },
      {
        name: "Testing (Vitest, RTL, Playwright)",
        icon: "testing",
        experienceLevel: "Advanced",
        yearsOfExperience: 4,
        projects: 6,
        certifications: [],
        notableAchievements: ["Set up comprehensive testing suite"]
      }
    ]
  },
  {
    name: "Backend & DevOps",
    description: "Server-side technologies, infrastructure, and development operations",
    skills: [
      {
        name: "Node.js",
        icon: "nodejs",
        experienceLevel: "Advanced",
        yearsOfExperience: 6,
        projects: 7,
        certifications: ["Node.js Certified Developer"],
        notableAchievements: []
      },
      {
        name: "PostgreSQL",
        icon: "postgresql",
        experienceLevel: "Intermediate",
        yearsOfExperience: 4,
        projects: 5,
        certifications: [],
        notableAchievements: []
      },
      {
        name: "MongoDB",
        icon: "mongodb",
        experienceLevel: "Intermediate",
        yearsOfExperience: 4,
        projects: 5,
        certifications: [],
        notableAchievements: []
      },
      {
        name: "Docker",
        icon: "docker",
        experienceLevel: "Intermediate",
        yearsOfExperience: 3,
        projects: 4,
        certifications: [],
        notableAchievements: ["Containerized microservices architecture"]
      },
      {
        name: "AWS",
        icon: "aws",
        experienceLevel: "Intermediate",
        yearsOfExperience: 4,
        projects: 5,
        certifications: ["AWS Certified Developer"],
        notableAchievements: []
      },
      {
        name: "GraphQL",
        icon: "graphql",
        experienceLevel: "Intermediate",
        yearsOfExperience: 3,
        projects: 4,
        certifications: [],
        notableAchievements: ["Implemented efficient data fetching"]
      }
    ]
  },
  {
    name: "Architecture & Leadership",
    description: "System design, technical leadership, and team management",
    skills: [
      {
        name: "System Architecture",
        icon: "architecture",
        experienceLevel: "Advanced",
        yearsOfExperience: 6,
        projects: 7,
        certifications: [],
        notableAchievements: ["Designed scalable microservices architecture"]
      },
      {
        name: "Technical Leadership",
        icon: "leadership",
        experienceLevel: "Advanced",
        yearsOfExperience: 5,
        projects: 6,
        certifications: [],
        notableAchievements: ["Led frontend development team"]
      },
      {
        name: "Performance Optimization",
        icon: "performance",
        experienceLevel: "Advanced",
        yearsOfExperience: 6,
        projects: 6,
        certifications: [],
        notableAchievements: ["Improved application load times by 40%"]
      },
      {
        name: "Code Reviews",
        icon: "code-review",
        experienceLevel: "Advanced",
        yearsOfExperience: 6,
        projects: 8,
        certifications: [],
        notableAchievements: ["Established code review guidelines"]
      },
      {
        name: "Mentoring",
        icon: "mentoring",
        experienceLevel: "Advanced",
        yearsOfExperience: 4,
        projects: 5,
        certifications: [],
        notableAchievements: ["Mentored junior developers"]
      },
      {
        name: "Documentation",
        icon: "documentation",
        experienceLevel: "Advanced",
        yearsOfExperience: 6,
        projects: 7,
        certifications: [],
        notableAchievements: ["Created comprehensive technical documentation"]
      }
    ]
  }
] 
import { TechItem } from "../types/tech-item";

export const TECH_ITEMS: TechItem[] = [
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
    description:
      "Popular JavaScript framework for building dynamic web applications",
  },
  {
    name: "TypeScript",
    category: "frontend",
    level: "core",
    description:
      "Strongly typed programming language that builds on JavaScript",
  },
  {
    name: "Next.js",
    category: "frontend",
    level: "core",
    description:
      "React framework for production with hybrid rendering strategies",
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
    description:
      "Code generation library for TypeScript with integration to GraphQL and Zod",
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
  {
    name: "Gatsby",
    category: "frontend",
    level: "occasional",
    description: "Static site generator for React",
  },
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
    description:
      "Declarative, efficient, and flexible JavaScript library for building UIs",
  },

  // Backend
  {
    name: "Node.js",
    category: "backend",
    level: "core",
    description: "JavaScript runtime built on Chrome's V8 JavaScript engine",
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
    description:
      "Query language for APIs and runtime for executing those queries",
  },
  {
    name: "MongoDB",
    category: "backend",
    level: "frequent",
    description: "Document-oriented NoSQL database",
  },
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
    description:
      "Serverless compute service that runs code in response to events",
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
    description:
      "Framework for reliable end-to-end testing for modern web apps",
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
    description:
      "Platform for developing, shipping, and running applications in containers",
  },
  {
    name: "Kubernetes",
    category: "devops",
    level: "exploring",
    description:
      "Container orchestration system for automating deployment and scaling",
  },
];

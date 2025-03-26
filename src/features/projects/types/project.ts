export enum ProjectCategory {
  All = "All",
  Frontend = "Frontend",
  Backend = "Backend",
  FullStack = "Full Stack",
  DeveloperTools = "Developer Tools",
  Architecture = "Architecture",
}

export interface ProjectDetails {
  challenge: string;
  solution: string;
  technologies: string[];
  architecture?: string;
  results?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: ProjectCategory;
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
  poc?: boolean;
  details?: ProjectDetails;
}

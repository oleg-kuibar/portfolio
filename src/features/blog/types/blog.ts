export enum BlogCategory {
  All = "All",
  Frontend = "Frontend",
  Backend = "Backend",
  DevOps = "DevOps",
  Architecture = "Architecture",
  Career = "Career",
  Tutorial = "Tutorial",
  Thoughts = "Thoughts",
}

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  category: BlogCategory;
  featured?: boolean;
  draft?: boolean;
  readingTime?: number;
  coverImage?: string;
  canonicalUrl?: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
  excerpt: string;
  readingTime: number;
  url: string;
}

export interface BlogMetadata {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  tags: string[];
  category: BlogCategory;
  featured?: boolean;
  coverImage?: string;
  canonicalUrl?: string;
}

export interface BlogFilters {
  category: BlogCategory;
  tag?: string;
  search?: string;
}

export interface BlogStats {
  totalPosts: number;
  totalCategories: number;
  totalTags: number;
  featuredPosts: number;
  readingTime: number;
}

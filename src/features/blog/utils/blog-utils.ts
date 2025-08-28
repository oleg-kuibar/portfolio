import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serializeMDX } from '@/lib/mdx';
import { BlogPost, BlogFrontmatter, BlogCategory } from '../types/blog';

const BLOG_CONTENT_PATH = path.join(process.cwd(), 'content/blog');

/**
 * Calculate reading time based on average words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const plainText = content
    .replace(/[#*`]/g, '') // Remove markdown formatting
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Generate slug from filename or title
 */
export function generateSlug(filename: string): string {
  return filename
    .replace(/\.mdx?$/, '') // Remove file extension
    .replace(/[^a-zA-Z0-9-]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get all blog post filenames
 */
export async function getBlogPostFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(BLOG_CONTENT_PATH);
    return files.filter(file => file.endsWith('.mdx') || file.endsWith('.md'));
  } catch (error) {
    console.error('Error reading blog content directory:', error);
    return [];
  }
}

/**
 * Get all blog posts with metadata
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const files = await getBlogPostFiles();
  const posts: BlogPost[] = [];

  for (const filename of files) {
    try {
      const filePath = path.join(BLOG_CONTENT_PATH, filename);
      const fileContents = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContents);

      // Skip draft posts in production
      if (frontmatter.draft && process.env.NODE_ENV === 'production') {
        continue;
      }

      const slug = frontmatter.slug || generateSlug(filename);
      const readingTime = frontmatter.readingTime || calculateReadingTime(content);
      const excerpt = frontmatter.excerpt || generateExcerpt(content);

      posts.push({
        slug,
        frontmatter: frontmatter as BlogFrontmatter,
        content,
        excerpt,
        readingTime,
        url: `/blog/${slug}`,
      });
    } catch (error) {
      console.error(`Error processing blog post ${filename}:`, error);
    }
  }

  // Sort by date (newest first)
  return posts.sort((a, b) =>
    new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

/**
 * Get featured blog posts
 */
export async function getFeaturedBlogPosts(limit: number = 3): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.filter(post => post.frontmatter.featured).slice(0, limit);
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: BlogCategory): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  if (category === BlogCategory.All) {
    return posts;
  }
  return posts.filter(post => post.frontmatter.category === category);
}

/**
 * Get blog posts by tag
 */
export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.filter(post => post.frontmatter.tags.includes(tag));
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts();
  return posts.find(post => post.slug === slug) || null;
}

/**
 * Search blog posts
 */
export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  const searchTerm = query.toLowerCase();

  return posts.filter(post =>
    post.frontmatter.title.toLowerCase().includes(searchTerm) ||
    post.frontmatter.description.toLowerCase().includes(searchTerm) ||
    post.frontmatter.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    post.excerpt.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get all unique tags from blog posts
 */
export async function getAllBlogTags(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  const tags = new Set<string>();

  posts.forEach(post => {
    post.frontmatter.tags.forEach(tag => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * Get all categories from blog posts
 */
export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  const posts = await getAllBlogPosts();
  const categories = new Set<BlogCategory>();

  posts.forEach(post => {
    categories.add(post.frontmatter.category);
  });

  return [BlogCategory.All, ...Array.from(categories).sort()];
}



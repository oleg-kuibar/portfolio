import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

export type BlogPost = CollectionEntry<'blog'>;

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => {
    // Filter out drafts in production
    return import.meta.env.PROD ? !data.draft : true;
  });

  // Sort by date, newest first
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getFeaturedPosts(limit?: number): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  const featured = posts.filter((post) => post.data.featured);
  return limit ? featured.slice(0, limit) : featured;
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.filter(
    (post) => post.data.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((post) =>
    post.data.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    post.data.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  const categorySet = new Set<string>();
  posts.forEach((post) => {
    categorySet.add(post.data.category);
  });
  return Array.from(categorySet).sort();
}

export async function getCategoryCounts(): Promise<Map<string, number>> {
  const posts = await getAllBlogPosts();
  const counts = new Map<string, number>();
  posts.forEach((post) => {
    const category = post.data.category;
    counts.set(category, (counts.get(category) || 0) + 1);
  });
  return counts;
}

export async function getTagCounts(): Promise<Map<string, number>> {
  const posts = await getAllBlogPosts();
  const counts = new Map<string, number>();
  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return counts;
}

export function getReadingTime(content: string): string {
  const stats = readingTime(content);
  return stats.text;
}

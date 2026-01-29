import { getCollection } from 'astro:content';
import readingTime from 'reading-time';
import type { BlogPost } from './blog';

export interface SeriesPost {
  slug: string;
  title: string;
  description: string;
  date: Date;
  partNumber: number;
  readingTime: string;
  readingMinutes: number;
  category: string;
  tags: string[];
  featured: boolean;
}

export interface SeriesInfo {
  slug: string;
  name: string;
  description?: string;
  currentPart: number;
  totalParts: number;
  posts: SeriesPost[];
  totalReadingTime: string;
  totalReadingMinutes: number;
}

export interface SeriesMetadata {
  slug: string;
  name: string;
  description?: string;
  postCount: number;
  totalReadingTime: string;
  latestDate: Date;
  posts: SeriesPost[];
}

/** Series info for displaying on blog cards */
export interface SeriesCardInfo {
  partNumber: number;
  totalParts: number;
  seriesSlug: string;
}

const PART_PATTERN = /Part\s+(\d+)/i;

/**
 * Extracts part number from a title like "Building X Part 2: Something"
 */
function extractPartFromTitle(title: string): number | null {
  const match = title.match(PART_PATTERN);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Generates a human-readable series name from a slug
 * "building-kurast-trade" → "Building Kurast Trade"
 */
function generateSeriesName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generates a series slug from a title by removing the "Part X" portion
 * "Building kurast.trade Part 1: Real-Time..." → "building-kurast-trade"
 */
function generateSeriesSlug(title: string): string {
  // Remove "Part X:" or "Part X -" portion and anything after
  const baseTitle = title
    .replace(/Part\s+\d+[:\-]?\s*/i, '')
    .trim()
    .split(':')[0] // Take only the part before any remaining colon
    .trim();

  return baseTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Detects series info from a post's frontmatter or title pattern
 */
export function detectSeries(
  post: BlogPost
): { slug: string; part: number } | null {
  // Priority 1: Explicit frontmatter
  if (post.data.series && post.data.seriesPart) {
    return {
      slug: post.data.series,
      part: post.data.seriesPart,
    };
  }

  // Priority 2: Title pattern detection
  const partFromTitle = extractPartFromTitle(post.data.title);
  if (partFromTitle) {
    return {
      slug: generateSeriesSlug(post.data.title),
      part: partFromTitle,
    };
  }

  return null;
}

/**
 * Converts a BlogPost to a SeriesPost with reading time
 */
function toSeriesPost(post: BlogPost, partNumber: number): SeriesPost {
  const stats = readingTime(post.body || '');
  return {
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    date: post.data.date,
    partNumber,
    readingTime: stats.text,
    readingMinutes: Math.ceil(stats.minutes),
    category: post.data.category,
    tags: post.data.tags,
    featured: post.data.featured,
  };
}

/**
 * Gets all posts belonging to a specific series, sorted by part number
 */
export async function getSeriesPosts(seriesSlug: string): Promise<SeriesPost[]> {
  const allPosts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });

  const seriesPosts: SeriesPost[] = [];

  for (const post of allPosts) {
    const series = detectSeries(post);
    if (series && series.slug === seriesSlug) {
      seriesPosts.push(toSeriesPost(post, series.part));
    }
  }

  // Sort by part number
  return seriesPosts.sort((a, b) => a.partNumber - b.partNumber);
}

/**
 * Gets complete series information for a given post
 * Returns null if the post is not part of a series
 */
export async function getSeriesInfo(post: BlogPost): Promise<SeriesInfo | null> {
  const series = detectSeries(post);
  if (!series) return null;

  const posts = await getSeriesPosts(series.slug);
  if (posts.length <= 1) return null; // Single post is not a series

  const totalMinutes = posts.reduce((sum, p) => sum + p.readingMinutes, 0);

  // Get series description from any post that has it (usually first)
  const allPosts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });
  const postWithDescription = allPosts.find(
    (p) => detectSeries(p)?.slug === series.slug && p.data.seriesDescription
  );

  return {
    slug: series.slug,
    name: generateSeriesName(series.slug),
    description: postWithDescription?.data.seriesDescription,
    currentPart: series.part,
    totalParts: posts.length,
    posts,
    totalReadingTime: formatReadingTime(totalMinutes),
    totalReadingMinutes: totalMinutes,
  };
}

/**
 * Gets all unique series in the blog
 */
export async function getAllSeries(): Promise<SeriesMetadata[]> {
  const allPosts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });

  // Group posts by series slug
  const seriesMap = new Map<string, SeriesPost[]>();
  const descriptions = new Map<string, string>();

  for (const post of allPosts) {
    const series = detectSeries(post);
    if (!series) continue;

    if (!seriesMap.has(series.slug)) {
      seriesMap.set(series.slug, []);
    }
    seriesMap.get(series.slug)!.push(toSeriesPost(post, series.part));

    // Capture description if present
    if (post.data.seriesDescription) {
      descriptions.set(series.slug, post.data.seriesDescription);
    }
  }

  // Build metadata for each series (only include multi-part series)
  const seriesMetadata: SeriesMetadata[] = [];

  for (const [slug, posts] of seriesMap.entries()) {
    if (posts.length <= 1) continue; // Skip single-post "series"

    posts.sort((a, b) => a.partNumber - b.partNumber);

    const totalMinutes = posts.reduce((sum, p) => sum + p.readingMinutes, 0);
    const latestDate = posts.reduce(
      (latest, p) => (p.date > latest ? p.date : latest),
      posts[0].date
    );

    seriesMetadata.push({
      slug,
      name: generateSeriesName(slug),
      description: descriptions.get(slug),
      postCount: posts.length,
      totalReadingTime: formatReadingTime(totalMinutes),
      latestDate,
      posts,
    });
  }

  // Sort by latest date (newest first)
  return seriesMetadata.sort(
    (a, b) => b.latestDate.valueOf() - a.latestDate.valueOf()
  );
}

/**
 * Formats minutes into a human-readable string
 */
function formatReadingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min read`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m read` : `${hours}h read`;
}

/**
 * Gets lightweight series info for displaying on blog cards.
 * This is more efficient than getSeriesInfo when you just need the badge data.
 */
export async function getSeriesCardInfo(
  post: BlogPost,
  allSeriesCache?: SeriesMetadata[]
): Promise<SeriesCardInfo | null> {
  const series = detectSeries(post);
  if (!series) return null;

  // Use cache if provided, otherwise fetch
  const allSeries = allSeriesCache ?? await getAllSeries();
  const seriesData = allSeries.find((s) => s.slug === series.slug);

  if (!seriesData || seriesData.postCount <= 1) return null;

  return {
    partNumber: series.part,
    totalParts: seriesData.postCount,
    seriesSlug: series.slug,
  };
}

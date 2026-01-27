import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllBlogPosts } from '@/lib/blog';

export async function GET(context: APIContext) {
  const posts = await getAllBlogPosts();

  return rss({
    title: 'Oleg Kuibar Blog',
    description:
      'Thoughts on frontend development, system architecture, and engineering leadership.',
    site: context.site ?? 'https://olegkuibar.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
    })),
    customData: `<language>en-us</language>`,
  });
}

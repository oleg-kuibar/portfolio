import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPost } from '@/features/blog/components/blog-post';
import { getBlogPostBySlug, getAllBlogPosts } from '@/features/blog/utils/blog-utils';
import { serializeMDX } from '@/lib/mdx';
import { BlogPost as BlogPostType } from '@/features/blog/types/blog';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const { frontmatter } = post;

  return {
    title: `${frontmatter.title} | Oleg Kuibar`,
    description: frontmatter.description,
    keywords: frontmatter.tags,
    authors: [{ name: frontmatter.author }],
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: 'article',
      publishedTime: frontmatter.date,
      authors: [frontmatter.author],
      tags: frontmatter.tags,
      images: frontmatter.coverImage ? [
        {
          url: frontmatter.coverImage,
          alt: frontmatter.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: frontmatter.coverImage ? [frontmatter.coverImage] : [],
    },
  };
}

// Page component
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Serialize MDX content for client-side rendering
  const mdxSource = await serializeMDX(post.content);

  return <BlogPost post={post} mdxSource={mdxSource} />;
}

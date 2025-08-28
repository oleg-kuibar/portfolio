import type { Metadata } from 'next';
import { BlogListing } from '@/features/blog/components/blog-listing';

export const metadata: Metadata = {
  title: 'Blog | Oleg Kuibar',
  description: 'Thoughts, tutorials, and insights on frontend development, React, TypeScript, and software architecture.',
  keywords: ['blog', 'frontend', 'react', 'typescript', 'web development', 'programming'],
  openGraph: {
    title: 'Blog | Oleg Kuibar',
    description: 'Thoughts, tutorials, and insights on frontend development, React, TypeScript, and software architecture.',
    type: 'website',
  },
};

export default function BlogPage() {
  return <BlogListing />;
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, TagIcon, ShareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { BlogPost as BlogPostType } from '../types/blog';
import { MainLayout } from '@/components/layouts/main-layout';
import { MDXRemote } from 'next-mdx-remote';
import { MDXComponents } from '@/lib/mdx';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

interface BlogPostProps {
  post: BlogPostType;
  mdxSource: MDXRemoteSerializeResult;
}

export function BlogPost({ post, mdxSource }: BlogPostProps) {

  return (
    <MainLayout>
      <article className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-background to-muted/20 py-16"
        >
          <div className="container mx-auto px-4">
            <Link href="/blog">
              <Button variant="ghost" className="mb-8">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>

            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-sm">
                  {post.frontmatter.category}
                </Badge>
                {post.frontmatter.featured && (
                  <Badge variant="default" className="text-sm">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {post.frontmatter.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {post.frontmatter.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>{new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  <span>{post.readingTime} min read</span>
                </div>

                <div className="flex items-center gap-2">
                  <span>By {post.frontmatter.author}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="py-16"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="px-0 py-8">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <MDXRemote {...mdxSource} components={MDXComponents} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="py-16 bg-muted/20"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <hr className="border-border mb-8" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.frontmatter.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Link href="/blog">
                    <Button size="sm">
                      More Articles
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </article>
    </MainLayout>
  );
}

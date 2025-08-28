'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, TagIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBlog } from '../hooks/use-blog';
import { BlogCategory } from '../types/blog';
import { MainLayout } from '@/components/layouts/main-layout';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function BlogListing() {
  const {
    posts,
    featuredPosts,
    categories,
    tags,
    loading,
    error,
    filters,
    hasActiveFilters,
    postCount,
    setCategoryFilter,
    setTagFilter,
    setSearchFilter,
    clearFilters,
  } = useBlog();

  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      setSearchFilter(value.trim());
    } else {
      setSearchFilter('');
    }
  };

  const displayedPosts = activeTab === 'featured' ? featuredPosts : posts;

  if (loading) {
    return (
      <MainLayout>
        <main className="min-h-screen bg-background py-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <main className="min-h-screen bg-background py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Blog</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </main>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Thoughts, tutorials, and insights on frontend development, React, TypeScript, and software architecture.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <Tabs value={filters.category} onValueChange={(value) => setCategoryFilter(value as BlogCategory)}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'featured')}>
              <TabsList>
                <TabsTrigger value="all">All Posts ({postCount.total})</TabsTrigger>
                <TabsTrigger value="featured">Featured ({postCount.featured})</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Results Summary */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <p className="text-muted-foreground">
                Showing {postCount.filtered} of {postCount.total} posts
                {filters.search && ` for "${filters.search}"`}
                {filters.tag && ` tagged with "${filters.tag}"`}
              </p>
            </motion.div>
          )}

          {/* Blog Posts Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {displayedPosts.map((post, index) => (
              <motion.div key={post.slug} variants={itemVariants}>
                <BlogCard post={post} index={index} />
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {displayedPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-xl text-muted-foreground mb-4">No posts found</p>
              <p className="text-muted-foreground">
                {hasActiveFilters ? 'Try adjusting your filters or search terms.' : 'Check back later for new content!'}
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </MainLayout>
  );
}

interface BlogCardProps {
  post: any;
  index: number;
}

function BlogCard({ post, index }: BlogCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <CalendarIcon className="h-4 w-4" />
          <span>{new Date(post.frontmatter.date).toLocaleDateString()}</span>
          <ClockIcon className="h-4 w-4 ml-2" />
          <span>{post.readingTime} min read</span>
        </div>
        <h2 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={post.url}>
            {post.frontmatter.title}
          </Link>
        </h2>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {post.frontmatter.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {post.frontmatter.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{post.frontmatter.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={post.url} className="w-full">
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            Read More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

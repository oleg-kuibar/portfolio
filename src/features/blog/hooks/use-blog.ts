import { useState, useEffect, useMemo } from 'react';
import { BlogPost, BlogCategory, BlogFilters } from '../types/blog';

export const useBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BlogFilters>({
    category: BlogCategory.All,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

  // Load initial data
  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          postsResponse,
          tagsResponse,
          categoriesResponse,
          featuredResponse,
        ] = await Promise.all([
          fetch('/api/blog/posts'),
          fetch('/api/blog/tags'),
          fetch('/api/blog/categories'),
          fetch('/api/blog/posts?action=featured&limit=3'),
        ]);

        if (!postsResponse.ok || !tagsResponse.ok || !categoriesResponse.ok || !featuredResponse.ok) {
          throw new Error('Failed to fetch blog data');
        }

        const [
          { posts: allPosts },
          { tags: availableTags },
          { categories: availableCategories },
          { posts: featured },
        ] = await Promise.all([
          postsResponse.json(),
          tagsResponse.json(),
          categoriesResponse.json(),
          featuredResponse.json(),
        ]);

        setPosts(allPosts);
        setFilteredPosts(allPosts);
        setTags(availableTags);
        setCategories(availableCategories);
        setFeaturedPosts(featured);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog posts');
        console.error('Error loading blog data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, []);

  // Filter posts based on current filters
  useEffect(() => {
    const applyFilters = async () => {
      if (posts.length === 0) return;

      try {
        let response: Response;

        if (filters.search) {
          response = await fetch(`/api/blog/posts?action=search&query=${encodeURIComponent(filters.search)}`);
        } else if (filters.tag) {
          response = await fetch(`/api/blog/posts?action=tag&tag=${encodeURIComponent(filters.tag)}`);
        } else if (filters.category !== BlogCategory.All) {
          response = await fetch(`/api/blog/posts?action=category&category=${encodeURIComponent(filters.category)}`);
        } else {
          // If no filters, show all posts
          setFilteredPosts(posts);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to filter posts');
        }

        const { posts: filtered } = await response.json();
        setFilteredPosts(filtered);
      } catch (err) {
        console.error('Error filtering posts:', err);
      }
    };

    applyFilters();
  }, [posts, filters]);

  // Filter actions
  const setCategoryFilter = (category: BlogCategory) => {
    setFilters(prev => ({
      ...prev,
      category,
      tag: undefined, // Clear tag filter when category changes
      search: undefined, // Clear search when category changes
    }));
  };

  const setTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tag,
      category: BlogCategory.All, // Reset category when tag is selected
      search: undefined, // Clear search when tag changes
    }));
  };

  const setSearchFilter = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      category: BlogCategory.All, // Reset category when searching
      tag: undefined, // Clear tag filter when searching
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: BlogCategory.All,
    });
  };

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return filters.category !== BlogCategory.All ||
           filters.tag !== undefined ||
           filters.search !== undefined;
  }, [filters]);

  const postCount = useMemo(() => ({
    total: posts.length,
    filtered: filteredPosts.length,
    featured: featuredPosts.length,
  }), [posts.length, filteredPosts.length, featuredPosts.length]);

  const recentPosts = useMemo(() => {
    return posts.slice(0, 5);
  }, [posts]);

  return {
    // Data
    posts: filteredPosts,
    allPosts: posts,
    featuredPosts,
    recentPosts,
    tags,
    categories,

    // State
    loading,
    error,

    // Filters
    filters,
    hasActiveFilters,
    postCount,

    // Actions
    setCategoryFilter,
    setTagFilter,
    setSearchFilter,
    clearFilters,
  };
};

export const useBlogPost = (slug: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/blog/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog post not found');
            return;
          }
          throw new Error('Failed to fetch blog post');
        }

        const { post: blogPost } = await response.json();
        setPost(blogPost);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog post');
        console.error('Error loading blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  return {
    post,
    loading,
    error,
  };
};

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Post {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
}

interface SearchDialogProps {
  posts: Post[];
}

export function SearchDialog({ posts }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);

    return posts.filter((post) => {
      const searchableText = [
        post.title,
        post.description,
        post.category,
        ...post.tags,
      ]
        .join(' ')
        .toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    });
  }, [posts, query]);

  const handleSelect = (slug: string) => {
    setOpen(false);
    setQuery('');
    window.location.href = `/blog/${slug}`;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="retro-button bg-background flex items-center gap-2"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search posts...</span>
        <span className="sm:hidden">Search</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => {
              setOpen(false);
              setQuery('');
            }}
          />

          {/* Dialog */}
          <div className="fixed left-1/2 top-1/4 z-50 w-full max-w-lg -translate-x-1/2 rounded-lg border-2 border-border bg-background p-0 shadow-retro-lg">
            {/* Search input */}
            <div className="flex items-center border-b-2 border-border px-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {query.trim() === '' ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </p>
              ) : filteredPosts.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No posts found for "{query}"
                </p>
              ) : (
                <ul className="space-y-1">
                  {filteredPosts.map((post) => (
                    <li key={post.slug}>
                      <button
                        onClick={() => handleSelect(post.slug)}
                        className={cn(
                          'w-full rounded-md px-4 py-3 text-left transition-colors',
                          'hover:bg-muted focus:bg-muted focus:outline-none'
                        )}
                      >
                        <div className="font-medium text-foreground">
                          {post.title}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {post.description}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-primary">
                            {post.category}
                          </span>
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Keyboard hints */}
            <div className="border-t-2 border-border px-4 py-2">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">
                    Esc
                  </kbd>{' '}
                  to close
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

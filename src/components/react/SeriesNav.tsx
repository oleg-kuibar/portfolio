import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Link } from '@heroui/react';
import { ChevronUp, ChevronDown, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeriesPost {
  slug: string;
  title: string;
  partNumber: number;
  readingTime: string;
}

interface SeriesNavProps {
  seriesSlug: string;
  seriesName: string;
  currentPart: number;
  totalParts: number;
  posts: SeriesPost[];
  totalReadingTime: string;
}

export function SeriesNav({
  seriesSlug,
  seriesName,
  currentPart,
  totalParts,
  posts,
  totalReadingTime,
}: SeriesNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const storageKey = `series-nav-dismissed-${seriesSlug}`;

  // Check if dismissed on mount
  useEffect(() => {
    const dismissed = sessionStorage.getItem(storageKey);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [storageKey]);

  // Show after scrolling 300px
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(storageKey, 'true');
  };

  const sortedPosts = [...posts].sort((a, b) => a.partNumber - b.partNumber);
  const progressPercent = (currentPart / totalParts) * 100;

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-40 hidden lg:block"
        >
          <Card className="max-w-xs bg-background/95 backdrop-blur-sm border-2 border-border shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.1)]">
            <CardContent className="p-4">
              {/* Header with dismiss */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-2 px-0 h-auto min-w-0"
                  onPress={() => setIsExpanded(!isExpanded)}
                >
                  <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0 text-left">
                    <span className="text-xs font-medium text-primary uppercase tracking-wide block">
                      Series
                    </span>
                    <span className="text-sm font-medium text-foreground line-clamp-1 block">
                      {seriesName}
                    </span>
                  </div>
                </Button>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={handleDismiss}
                  aria-label="Dismiss series navigation"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="font-medium">
                    Part {currentPart} of {totalParts}
                  </span>
                  <span>{totalReadingTime}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Toggle button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onPress={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Hide parts' : 'Show all parts'}
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronUp className="h-3 w-3 ml-1" />
                )}
              </Button>

              {/* Expandable list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-border mt-3">
                      <nav aria-label="Series parts" className="space-y-1">
                        {sortedPosts.map((post) => {
                          const isCurrent = post.partNumber === currentPart;
                          return (
                            <a
                              key={post.slug}
                              href={`/blog/${post.slug}`}
                              className={cn(
                                'flex items-start gap-2 rounded-md px-3 py-2 transition-colors hover:bg-muted',
                                isCurrent && 'bg-primary/10 text-primary'
                              )}
                            >
                              <span
                                className={cn(
                                  'text-xs w-4 text-center flex-shrink-0',
                                  isCurrent
                                    ? 'text-primary font-bold'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {post.partNumber}
                              </span>
                              <span className="text-xs line-clamp-2">
                                {cleanTitle(post.title)}
                              </span>
                            </a>
                          );
                        })}
                      </nav>
                    </div>

                    {/* View series page link */}
                    <div className="mt-3 pt-3 border-t border-border text-center">
                      <Link
                        href={`/blog/series/${seriesSlug}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View series overview →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Removes "Part X:" prefix from title for cleaner display
 */
function cleanTitle(title: string): string {
  return title.replace(/Part\s+\d+[:\-]?\s*/i, '').trim();
}

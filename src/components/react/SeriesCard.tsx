import { Card, CardContent, CardFooter, Chip } from '@heroui/react';
import { BookOpen, Clock, Calendar } from 'lucide-react';

interface SeriesPost {
  partNumber: number;
  title: string;
  slug: string;
}

interface SeriesCardProps {
  slug: string;
  name: string;
  description?: string;
  postCount: number;
  totalReadingTime: string;
  latestDate: string;
  posts: SeriesPost[];
}

export function SeriesCard({
  slug,
  name,
  description,
  postCount,
  totalReadingTime,
  latestDate,
  posts,
}: SeriesCardProps) {
  return (
    <Card className="h-full border-2 border-border shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
      <a href={`/blog/series/${slug}`} className="block">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Chip size="sm" variant="soft" color="accent">
              <BookOpen className="h-3 w-3 mr-1 inline" />
              {postCount} Parts
            </Chip>
          </div>

          <h2 className="font-heading text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
            {name}
          </h2>

          {description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{latestDate}</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{totalReadingTime}</span>
            </div>
          </div>
        </CardContent>
      </a>

      <CardFooter className="p-4 border-t border-border">
        <ol className="relative w-full">
          {posts.slice(0, 3).map((post, index) => {
            const isLast = index === Math.min(posts.length, 3) - 1 && posts.length <= 3;
            return (
              <li key={post.partNumber} className="relative pl-6 pb-3 last:pb-0">
                {/* Connecting line */}
                {!isLast && (
                  <span className="absolute left-[7px] top-5 h-full w-px bg-border" />
                )}
                {/* Number circle */}
                <span className="absolute left-0 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background text-xs text-muted-foreground">
                  {post.partNumber}
                </span>
                <a
                  href={`/blog/${post.slug}`}
                  className="block text-sm hover:text-primary transition-colors line-clamp-1"
                >
                  {post.title}
                </a>
              </li>
            );
          })}
          {posts.length > 3 && (
            <li className="relative pl-6">
              <span className="absolute left-0 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background text-xs text-muted-foreground">
                +
              </span>
              <a
                href={`/blog/series/${slug}`}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {posts.length - 3} more parts
              </a>
            </li>
          )}
        </ol>
      </CardFooter>
    </Card>
  );
}

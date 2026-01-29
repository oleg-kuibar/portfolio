import { Card, CardContent, Chip } from '@heroui/react';
import { BookOpen, Clock, Calendar, ChevronRight } from 'lucide-react';

interface SeriesHeaderProps {
  name: string;
  description?: string;
  postCount: number;
  totalReadingTime: string;
  latestDate: string;
  firstPostSlug: string;
}

export function SeriesHeader({
  name,
  description,
  postCount,
  totalReadingTime,
  latestDate,
  firstPostSlug,
}: SeriesHeaderProps) {
  return (
    <Card className="mb-12 border-2 border-border shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.1)]">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Chip variant="soft" color="accent">
            <BookOpen className="h-3 w-3 mr-1 inline" />
            {postCount} Part Series
          </Chip>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
          {name}
        </h1>

        {description && (
          <p className="text-xl text-muted-foreground mb-6">{description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{totalReadingTime} total</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Updated {latestDate}</span>
          </div>
        </div>

        <a
          href={`/blog/${firstPostSlug}`}
          className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Start Reading Part 1
          <ChevronRight className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
}

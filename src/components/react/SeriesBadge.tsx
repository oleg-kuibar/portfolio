import { Chip } from '@heroui/react';
import { BookOpen } from 'lucide-react';

interface SeriesBadgeProps {
  partNumber: number;
  totalParts: number;
  seriesSlug: string;
  compact?: boolean;
}

export function SeriesBadge({
  partNumber,
  totalParts,
  seriesSlug,
  compact = false,
}: SeriesBadgeProps) {
  if (compact) {
    return (
      <Chip size="sm" variant="soft" color="accent">
        <BookOpen className="h-3 w-3 mr-1 inline" />
        Part {partNumber}/{totalParts}
      </Chip>
    );
  }

  return (
    <a href={`/blog/series/${seriesSlug}`}>
      <Chip
        size="sm"
        variant="soft"
        color="accent"
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        <BookOpen className="h-3 w-3 mr-1 inline" />
        Part {partNumber} of {totalParts}
      </Chip>
    </a>
  );
}

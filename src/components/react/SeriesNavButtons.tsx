import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SeriesNavButtonsProps {
  prevPost?: {
    slug: string;
    partNumber: number;
  } | null;
  nextPost?: {
    slug: string;
    partNumber: number;
  } | null;
}

export function SeriesNavButtons({ prevPost, nextPost }: SeriesNavButtonsProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {prevPost && (
        <a
          href={`/blog/${prevPost.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border-2 border-border bg-background hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous: Part {prevPost.partNumber}
        </a>
      )}
      {nextPost && (
        <a
          href={`/blog/${nextPost.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Next: Part {nextPost.partNumber}
          <ChevronRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

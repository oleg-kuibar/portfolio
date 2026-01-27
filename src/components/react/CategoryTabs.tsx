import { cn } from '@/lib/utils';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

interface CategoryTabsProps {
  categories: string[];
  currentCategory: string | null;
}

export function CategoryTabs({ categories, currentCategory }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      <a
        href="/blog"
        role="tab"
        aria-selected={!currentCategory}
        className={cn(
          'retro-button text-sm',
          !currentCategory
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-foreground'
        )}
      >
        All
      </a>
      {categories.map((category) => (
        <a
          key={category}
          href={`/blog/category/${slugify(category)}`}
          role="tab"
          aria-selected={currentCategory === category}
          className={cn(
            'retro-button text-sm',
            currentCategory === category
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground'
          )}
        >
          {category}
        </a>
      ))}
    </div>
  );
}

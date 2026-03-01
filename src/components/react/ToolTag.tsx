import { cn } from '@/lib/utils';

export type ToolTagVariant = 'flagship' | 'side-project' | 'open-source' | 'work';

interface ToolTagProps {
  label: string;
  variant: ToolTagVariant;
}

const variantStyles: Record<ToolTagVariant, { bg: string; text: string; border: string }> = {
  flagship: {
    bg: 'bg-primary/15',
    text: 'text-primary',
    border: 'border-primary/30',
  },
  'side-project': {
    bg: 'bg-secondary/15',
    text: 'text-secondary',
    border: 'border-secondary/30',
  },
  'open-source': {
    bg: 'bg-accent/15',
    text: 'text-accent',
    border: 'border-accent/30',
  },
  work: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
  },
};

export function ToolTag({ label, variant }: ToolTagProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1',
        'font-mono text-[10px] font-bold uppercase tracking-wider',
        'border-2 rounded-sm',
        'shadow-retro-sm',
        styles.bg,
        styles.text,
        styles.border
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'flagship' && 'bg-primary',
          variant === 'side-project' && 'bg-secondary',
          variant === 'open-source' && 'bg-accent',
          variant === 'work' && 'bg-muted-foreground'
        )}
      />
      {label}
    </span>
  );
}

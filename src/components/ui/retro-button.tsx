import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const RetroButton = forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-background text-foreground hover:bg-muted',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'bg-transparent border-foreground text-foreground hover:bg-muted',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn('retro-button font-medium', variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

RetroButton.displayName = 'RetroButton';

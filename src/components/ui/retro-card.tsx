import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RetroCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const RetroCard = forwardRef<HTMLDivElement, RetroCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('retro-card', className)} {...props}>
        {children}
      </div>
    );
  }
);

RetroCard.displayName = 'RetroCard';

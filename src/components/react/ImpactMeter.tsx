import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImpactMeterProps {
  label: string;
  before: string;
  after: string;
  improvement: string;
}

export function ImpactMeter({ label, before, after, improvement }: ImpactMeterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-mono text-xs font-bold text-accent">{improvement}</span>
      </div>
      <div className="relative h-6 bg-muted rounded overflow-hidden border border-border">
        {/* Before bar (gray, full width) */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-muted-foreground/20"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* After bar (accent color, proportional) */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent/80"
          initial={{ width: 0 }}
          whileInView={{ width: '15%' }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
        />
        {/* Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-mono">
          <span className="text-accent-foreground font-bold drop-shadow-sm">{after}</span>
          <span className="text-muted-foreground/70">{before}</span>
        </div>
      </div>
    </div>
  );
}

interface EfficiencyMeterProps {
  label: string;
  percentage: number;
  description?: string;
}

export function EfficiencyMeter({ label, percentage, description }: EfficiencyMeterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-mono text-xs font-bold text-accent">{percentage}%</span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden border border-border">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            percentage >= 80 ? 'bg-primary' : percentage >= 50 ? 'bg-accent' : 'bg-secondary'
          )}
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

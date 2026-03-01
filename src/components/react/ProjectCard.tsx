import { motion } from 'framer-motion';
import { ExternalLink, Github, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToolTag, type ToolTagVariant } from './ToolTag';
import { ImpactMeter, EfficiencyMeter } from './ImpactMeter';

type LinkIcon = 'github' | 'npm' | 'external';

interface ProjectLink {
  label: string;
  url: string;
  icon: LinkIcon;
}

interface ProjectMetric {
  label: string;
  before?: string;
  after?: string;
  value?: string;
  percentage?: number;
}

interface ProjectCardProps {
  title: string;
  tagline: string;
  description: string;
  category: ToolTagVariant;
  techStack: string[];
  metrics?: ProjectMetric[];
  links: ProjectLink[];
  featured?: boolean;
  codeComparison?: {
    before: string;
    after: string;
  };
}

const iconMap: Record<LinkIcon, typeof ExternalLink> = {
  github: Github,
  npm: Package,
  external: ExternalLink,
};

const categoryLabels: Record<ToolTagVariant, string> = {
  flagship: 'FLAGSHIP',
  'side-project': 'SIDE PROJECT',
  'open-source': 'OPEN SOURCE',
  work: 'WORK',
};

export function ProjectCard({
  title,
  tagline,
  description,
  category,
  techStack,
  metrics,
  links,
  featured = false,
  codeComparison,
}: ProjectCardProps) {
  return (
    <motion.article
      className={cn(
        'retro-card group transition-colors',
        featured && 'border-accent/50'
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <ToolTag label={categoryLabels[category]} variant={category} />
      </div>

      {/* Title */}
      <h3 className="font-heading text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Tagline */}
      <p className="font-mono text-sm text-primary mb-4">"{tagline}"</p>

      {/* Description */}
      <p className="text-muted-foreground mb-6">{description}</p>

      {/* Code comparison for flagship */}
      {codeComparison && (
        <div className="mb-6 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Before</span>
            <pre className="text-xs bg-muted p-3 rounded border border-border overflow-x-auto font-mono text-secondary">
              {codeComparison.before}
            </pre>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-primary uppercase tracking-wider">After</span>
            <pre className="text-xs bg-muted p-3 rounded border border-primary/30 overflow-x-auto font-mono text-primary">
              {codeComparison.after}
            </pre>
          </div>
        </div>
      )}

      {/* Metrics */}
      {metrics && metrics.length > 0 && (
        <div className="mb-6 space-y-4">
          {metrics.map((metric, index) => (
            <div key={index}>
              {metric.before && metric.after ? (
                <ImpactMeter
                  label={metric.label}
                  before={metric.before}
                  after={metric.after}
                  improvement={metric.value || ''}
                />
              ) : metric.percentage !== undefined ? (
                <EfficiencyMeter
                  label={metric.label}
                  percentage={metric.percentage}
                  description={metric.value}
                />
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="font-mono font-bold text-accent">{metric.value}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tech stack polaroids */}
      <div className="flex flex-wrap gap-2 mb-6">
        {techStack.map((tech) => (
          <span
            key={tech}
            className={cn(
              'px-2 py-1 text-xs font-mono',
              'bg-background border border-border rounded',
              'shadow-retro-xs'
            )}
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        {links.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5',
                'text-sm font-medium',
                'bg-muted hover:bg-accent/15 text-foreground',
                'border border-border rounded',
                'transition-colors',
                'shadow-retro-sm'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {link.label}
            </a>
          );
        })}
      </div>
    </motion.article>
  );
}

interface CompactProjectCardProps {
  title: string;
  tagline: string;
  category: ToolTagVariant;
  techStack: string[];
  metrics?: ProjectMetric[];
  links: ProjectLink[];
  comingSoon?: boolean;
}

export function CompactProjectCard({
  title,
  tagline,
  category,
  techStack,
  metrics,
  links,
  comingSoon = false,
}: CompactProjectCardProps) {
  return (
    <motion.article
      className={cn(
        'retro-card group transition-colors'
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-3">
        <ToolTag label={categoryLabels[category]} variant={category} />
      </div>

      {/* Title */}
      <h3 className="font-heading text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Tagline */}
      <p className="font-mono text-xs text-muted-foreground mb-4">"{tagline}"</p>

      {/* Metrics */}
      {metrics && metrics.length > 0 && (
        <div className="mb-4 space-y-3">
          {metrics.map((metric, index) => (
            <div key={index}>
              {metric.percentage !== undefined ? (
                <EfficiencyMeter
                  label={metric.label}
                  percentage={metric.percentage}
                />
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">{metric.label}</span>
                  <span className="font-mono text-xs font-bold text-primary">{metric.value}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tech stack */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
        {links.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1',
                'text-xs font-medium',
                'text-muted-foreground hover:text-primary',
                'transition-colors'
              )}
            >
              <Icon className="w-3 h-3" />
              {link.label}
            </a>
          );
        })}
        {comingSoon && links.length === 0 && (
          <span className="text-xs font-mono text-muted-foreground italic">
            Overwolf store — coming soon
          </span>
        )}
      </div>
    </motion.article>
  );
}

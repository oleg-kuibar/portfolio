import type { ThemeColors } from '../useThemeColors';

// ─── Small tree table types (CascadeViz / Playground) ────────────

export type SimpleTableType = 'users' | 'posts' | 'comments' | 'reactions';

export function getSimpleTableColor(table: SimpleTableType, colors: ThemeColors): string {
  switch (table) {
    case 'users': return colors.primary;
    case 'posts': return colors.secondary;
    case 'comments': return colors.accent;
    case 'reactions': return colors.mutedFg;
  }
}

// ─── Scale tree table types (ScaleViz) ───────────────────────────

export type ScaleTableType =
  | 'orgs' | 'teams' | 'projects' | 'epics' | 'tasks'
  | 'subtasks' | 'task_comments' | 'attachments' | 'mentions'
  | 'activity_logs' | 'notifications';

export const SCALE_TABLE_LABELS: Record<ScaleTableType, string> = {
  orgs: 'org',
  teams: 'team',
  projects: 'proj',
  epics: 'epic',
  tasks: 'task',
  subtasks: 'sub',
  task_comments: 'cmt',
  attachments: 'att',
  mentions: 'mnt',
  activity_logs: 'log',
  notifications: 'ntf',
};

export const SCALE_TABLE_ORDER: ScaleTableType[] = [
  'orgs', 'teams', 'projects', 'epics', 'tasks',
  'subtasks', 'task_comments', 'attachments', 'mentions',
  'activity_logs', 'notifications',
];

export function getScaleTableColor(table: ScaleTableType, colors: ThemeColors): string {
  switch (table) {
    case 'orgs': return colors.primary;
    case 'teams': return colors.secondary;
    case 'projects': return colors.accent;
    case 'epics': return '#8b5cf6';
    case 'tasks': return '#06b6d4';
    case 'subtasks': return '#10b981';
    case 'task_comments': return '#f59e0b';
    case 'attachments': return '#ef4444';
    case 'mentions': return '#ec4899';
    case 'activity_logs': return '#6366f1';
    case 'notifications': return colors.mutedFg;
  }
}

// ─── Playground table color (accepts any string) ─────────────────

export function getPlaygroundTableColor(table: string, colors: ThemeColors): string {
  switch (table) {
    case 'users': return colors.primary;
    case 'posts': return colors.secondary;
    case 'comments': return colors.accent;
    case 'reactions': return colors.mutedFg;
    default: return colors.foreground;
  }
}

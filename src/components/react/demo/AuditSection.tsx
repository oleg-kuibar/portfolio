import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors } from '../useThemeColors';
import { SectionHeader } from './SectionHeader';
import { CodeBlock } from './CodeBlock';

// ─── Mock audit log entries ─────────────────────────────────────

interface AuditEntry {
  id: string;
  operationId: string;
  timestamp: string;
  action: 'cascade_delete' | 'soft_delete' | 'restore' | 'dry_run';
  rootTable: string;
  rootId: string;
  totalAffected: number;
  tables: Record<string, number>;
  status: 'completed' | 'failed' | 'dry_run';
  duration: string;
}

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: '1', operationId: 'op_a7f2e', timestamp: '2024-12-15T14:32:11Z',
    action: 'cascade_delete', rootTable: 'users', rootId: 'j57a...x8k2',
    totalAffected: 23, tables: { users: 1, posts: 4, comments: 12, reactions: 6 },
    status: 'completed', duration: '47ms',
  },
  {
    id: '2', operationId: 'op_b3c1d', timestamp: '2024-12-15T14:30:45Z',
    action: 'dry_run', rootTable: 'posts', rootId: 'k82b...p4m1',
    totalAffected: 8, tables: { posts: 1, comments: 5, reactions: 2 },
    status: 'dry_run', duration: '12ms',
  },
  {
    id: '3', operationId: 'op_c9e4f', timestamp: '2024-12-15T14:28:03Z',
    action: 'cascade_delete', rootTable: 'orgs', rootId: 'n41c...r7s3',
    totalAffected: 156, tables: { orgs: 1, teams: 4, projects: 12, epics: 18, tasks: 31, subtasks: 28, task_comments: 35, attachments: 27 },
    status: 'completed', duration: '234ms',
  },
  {
    id: '4', operationId: 'op_d2a7b', timestamp: '2024-12-15T14:25:19Z',
    action: 'soft_delete', rootTable: 'users', rootId: 'p93d...v2t5',
    totalAffected: 11, tables: { users: 1, posts: 3, comments: 5, reactions: 2 },
    status: 'completed', duration: '31ms',
  },
  {
    id: '5', operationId: 'op_e5f8c', timestamp: '2024-12-15T14:22:57Z',
    action: 'restore', rootTable: 'users', rootId: 'p93d...v2t5',
    totalAffected: 11, tables: { users: 1, posts: 3, comments: 5, reactions: 2 },
    status: 'completed', duration: '28ms',
  },
  {
    id: '6', operationId: 'op_f1g3h', timestamp: '2024-12-15T14:18:42Z',
    action: 'cascade_delete', rootTable: 'posts', rootId: 'q27e...w9u1',
    totalAffected: 4, tables: { posts: 1, comments: 2, reactions: 1 },
    status: 'failed', duration: '89ms',
  },
];

const AUDIT_CODE = `// Every cascade operation is logged automatically
const result = await cascade.deleteWithCascade(ctx, "users", userId);
// result.operationId → trace back in audit log

// Query audit history
const ops = await cascade.listOperations(ctx, {
  table: "users",
  limit: 50,
});`;

// ─── Component ──────────────────────────────────────────────────

export function AuditSection() {
  const colors = useThemeColors();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, background: bg, muted, primary, secondary, accent } = colors;

  const { danger, success, warning } = colors;

  function getActionColor(action: AuditEntry['action']): string {
    switch (action) {
      case 'cascade_delete': return danger;
      case 'soft_delete': return warning;
      case 'restore': return success;
      case 'dry_run': return accent;
    }
  }

  function getActionLabel(action: AuditEntry['action']): string {
    switch (action) {
      case 'cascade_delete': return 'CASCADE';
      case 'soft_delete': return 'SOFT DEL';
      case 'restore': return 'RESTORE';
      case 'dry_run': return 'DRY RUN';
    }
  }

  function getStatusColor(status: AuditEntry['status']): string {
    switch (status) {
      case 'completed': return success;
      case 'failed': return danger;
      case 'dry_run': return accent;
    }
  }

  return (
    <section style={{ marginBottom: '4rem' }}>
      <SectionHeader
        title="Audit Everything"
        subtitle="Every cascade operation is tracked. Query your audit log to trace exactly what happened and when."
        id="audit"
      />

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: code snippet */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <CodeBlock code={AUDIT_CODE} language="typescript" title="mutation.ts" />
        </div>

        {/* Right: audit log dashboard */}
        <div style={{ flex: '1 1 380px', minWidth: 0 }}>
          <div className="mermaid-container" style={{ padding: '0.75rem' }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              marginBottom: '0.5rem', paddingBottom: '0.4rem',
              borderBottom: `1px solid ${border}`,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: success, boxShadow: `0 0 8px ${success}80` }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: fg }}>
                OPERATIONS LOG
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: mutedFg, marginLeft: 'auto' }}>
                {MOCK_AUDIT.length} entries
              </span>
            </div>

            {/* Entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {MOCK_AUDIT.map((entry) => {
                const expanded = expandedId === entry.id;
                const actionColor = getActionColor(entry.action);
                const statusColor = getStatusColor(entry.status);

                return (
                  <div key={entry.id}>
                    <div
                      onClick={() => setExpandedId(expanded ? null : entry.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.35rem 0.5rem', borderRadius: '0.3rem',
                        border: `2px solid ${expanded ? actionColor + '80' : border}`,
                        background: expanded ? `${actionColor}15` : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {/* Action badge */}
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700,
                        padding: '0.1rem 0.3rem', borderRadius: '0.15rem',
                        background: `${actionColor}20`, color: actionColor,
                        border: `1.5px solid ${actionColor}50`,
                        minWidth: '3.5rem', textAlign: 'center',
                      }}>
                        {getActionLabel(entry.action)}
                      </span>

                      {/* Target */}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: fg, fontWeight: 500 }}>
                        {entry.rootTable}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: mutedFg }}>
                        {entry.rootId}
                      </span>

                      {/* Count */}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: fg, fontWeight: 500, marginLeft: 'auto' }}>
                        {entry.totalAffected} <span style={{ color: mutedFg, fontWeight: 400 }}>docs</span>
                      </span>

                      {/* Duration */}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: mutedFg }}>
                        {entry.duration}
                      </span>

                      {/* Status dot */}
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0, boxShadow: `0 0 6px ${statusColor}60` }} />
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            padding: '0.5rem 0.5rem 0.5rem 1rem',
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                          }}>
                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.4rem' }}>
                              <div>
                                <span style={{ color: mutedFg }}>operation: </span>
                                <span style={{ color: fg }}>{entry.operationId}</span>
                              </div>
                              <div>
                                <span style={{ color: mutedFg }}>status: </span>
                                <span style={{ color: statusColor }}>{entry.status}</span>
                              </div>
                            </div>
                            <div style={{ color: mutedFg, marginBottom: '0.3rem' }}>
                              tables affected:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {Object.entries(entry.tables).map(([table, count]) => (
                                <span key={table} style={{
                                  padding: '0.1rem 0.35rem', borderRadius: '0.15rem',
                                  border: `1px solid ${border}`, color: fg, fontSize: '0.55rem',
                                }}>
                                  {table}: {count}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

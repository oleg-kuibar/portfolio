import { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../../convex/_generated/api';
import { useThemeColors } from '../useThemeColors';
import { useSessionId } from '../useSessionId';
import { SectionHeader } from './SectionHeader';
import { CodeBlock } from './CodeBlock';
import { DataTreePanel } from './DataTreePanel';
import { formatConvexError } from './format-error';
import type { NodeTraceStatus } from './DataTreePanel';
import { getPlaygroundTableColor } from './cascade-colors';

// ─── Types ──────────────────────────────────────────────────────

interface PlanEntry {
  table: string;
  documentId: string;
  depth: number;
  relationshipName?: string;
}

interface CascadeResult {
  operationId: string;
  totalDeleted: number;
  deletedByTable: Record<string, number>;
  dryRun: boolean;
  plan?: PlanEntry[];
}

const DRY_RUN_CODE = `// Preview what WOULD be deleted — no data touched
const preview = await cascade.deleteWithCascade(
  ctx, "users", userId, { dryRun: true }
);

// preview.plan → every document that would be removed
// preview.totalDeleted → count of affected documents
// preview.deletedByTable → breakdown by table`;

// ─── Component ──────────────────────────────────────────────────

export function DryRunSection() {
  const colors = useThemeColors();
  const sessionId = useSessionId();
  const data = useQuery(api.functions.listAll);
  const seedMutation = useMutation(api.functions.seed);
  const clearMutation = useMutation(api.functions.clearAll);
  const previewMutation = useMutation(api.functions.previewCascade);

  const [selected, setSelected] = useState<{ table: string; id: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<CascadeResult | null>(null);
  const [previewIds, setPreviewIds] = useState<Set<string>>(new Set());

  const handleDryRun = async () => {
    if (!selected) return;
    setLoading('preview'); setError(null);
    try {
      const res = await previewMutation({ table: selected.table, id: selected.id, sessionId });
      const cascadeResult = res as unknown as CascadeResult;
      setPreview(cascadeResult);
      if (cascadeResult.plan) {
        setPreviewIds(new Set(cascadeResult.plan.map(e => e.documentId)));
      }
    } catch (e: any) { setError(formatConvexError(e, 'Preview failed')); }
    finally { setLoading(null); }
  };

  const handleResetDB = async () => {
    setLoading('reset'); setError(null); setSelected(null); setPreview(null); setPreviewIds(new Set());
    try {
      await clearMutation({ sessionId });
      await seedMutation({ sessionId });
    } catch (e: any) { setError(formatConvexError(e, 'Reset failed')); }
    finally { setLoading(null); }
  };

  const handleClear = () => {
    setSelected(null); setPreview(null); setPreviewIds(new Set());
  };

  const getNodeStatus = useCallback((id: string): NodeTraceStatus => {
    if (selected && id === selected.id) return 'root';
    if (previewIds.has(id)) return 'discovered';
    return null;
  }, [selected, previewIds]);

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, background: bg, muted, accent, danger, success, warning } = colors;

  const btnStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.3rem 0.75rem',
    borderRadius: '0.25rem',
    border: `2px solid ${border}`,
    background: 'transparent',
    color: fg,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    opacity: loading ? 0.6 : 1,
  };

  return (
    <section style={{ marginBottom: '4rem' }}>
      <SectionHeader
        title="Preview Before You Delete"
        subtitle="Run a dry-run to see exactly what would be deleted — without touching any data. Verify the blast radius before committing."
        badge="Live"
        id="dry-run"
      />

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: code + preview result */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <CodeBlock code={DRY_RUN_CODE} language="typescript" title="mutation.ts" />

          {/* Preview result panel */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: `1.5px solid ${accent}`,
                  background: `${accent}08`,
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: accent, marginBottom: '0.2rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Dry Run Result
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: fg, marginBottom: '0.4rem' }}>
                  Would delete {preview.totalDeleted} document{preview.totalDeleted !== 1 ? 's' : ''}
                </div>

                {/* Table breakdown */}
                {preview.deletedByTable && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.4rem' }}>
                    {Object.entries(preview.deletedByTable).map(([table, count]) => (
                      <span key={table} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                        padding: '0.1rem 0.35rem', borderRadius: '0.15rem',
                        border: `1px solid ${getPlaygroundTableColor(table, colors)}40`,
                        color: getPlaygroundTableColor(table, colors),
                        background: `${getPlaygroundTableColor(table, colors)}12`,
                      }}>
                        {table}: {count}
                      </span>
                    ))}
                  </div>
                )}

                {/* Plan entries */}
                {preview.plan && (
                  <div style={{
                    maxHeight: '8rem', overflowY: 'auto',
                    borderTop: `1px solid ${border}`, paddingTop: '0.35rem',
                  }}>
                    {preview.plan.map((entry, i) => (
                      <div key={`${entry.documentId}-${i}`} style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.1rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                      }}>
                        <span style={{ color: getPlaygroundTableColor(entry.table, colors), minWidth: '3.5rem' }}>
                          {entry.table}
                        </span>
                        <span style={{ color: mutedFg }}>
                          {entry.documentId.slice(-8)}
                        </span>
                        <span style={{ color: mutedFg, opacity: 0.5, marginLeft: 'auto' }}>
                          depth {entry.depth}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: interactive tree */}
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <div className="mermaid-container" style={{ padding: '1rem' }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center',
              border: `1.5px solid ${border}`, borderRadius: '0.375rem', padding: '0.4rem 0.5rem', background: muted,
            }}>
              <button onClick={handleResetDB} disabled={!!loading} style={btnStyle}>
                {loading === 'reset' ? 'Resetting...' : 'Reset DB'}
              </button>
              <div style={{ width: 1, height: '1.25rem', background: border, flexShrink: 0 }} />
              <button onClick={handleDryRun} disabled={!!loading || !selected} style={{
                ...btnStyle,
                borderColor: selected ? accent : border,
                color: selected ? accent : fg,
              }}>
                {loading === 'preview' ? 'Previewing...' : 'Dry Run'}
              </button>
              {preview && (
                <button onClick={handleClear} style={{ ...btnStyle, fontSize: '0.65rem', color: mutedFg, borderColor: border }}>
                  Clear
                </button>
              )}

              {/* Connected indicator */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: data ? success : warning,
                  boxShadow: data ? `0 0 8px ${success}80` : 'none',
                }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg }}>
                  {data ? 'Live' : 'Connecting...'}
                </span>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginBottom: '0.5rem', padding: '0.4rem 0.6rem', borderRadius: '0.25rem',
                    border: `2px solid ${danger}`, background: `${danger}18`, color: danger,
                    fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                  <span>{error}</span>
                  <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: danger, cursor: 'pointer', fontWeight: 700 }}>x</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tree */}
            <DataTreePanel
              data={data as any}
              colors={colors}
              selected={selected}
              onSelect={(sel) => { setSelected(sel); setPreview(null); setPreviewIds(new Set()); }}
              nodeStatus={preview ? getNodeStatus : undefined}
              emptyMessage="No data yet. Click Reset DB to populate."
            />

            <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg, opacity: 0.7 }}>
              {!selected && !preview && 'Click any node, then Dry Run to preview the blast radius.'}
              {selected && !preview && `Selected: ${selected.table}. Click Dry Run to see what would be deleted.`}
              {preview && `${preview.totalDeleted} documents highlighted — this is the blast radius. No data was modified.`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

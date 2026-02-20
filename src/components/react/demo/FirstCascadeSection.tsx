import { useState, useEffect, useRef, useCallback } from 'react';
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

interface TraceStep {
  docId: string;
  table: string;
  depth: number;
  action: 'root' | 'discover' | 'delete';
  relationship?: string;
}

function buildTraceSteps(plan: PlanEntry[], rootId: string, rootTable: string): TraceStep[] {
  const steps: TraceStep[] = [];
  steps.push({ docId: rootId, table: rootTable, depth: 0, action: 'root' });
  const nonRoot = plan.filter(e => e.documentId !== rootId);
  for (let i = nonRoot.length - 1; i >= 0; i--) {
    const e = nonRoot[i];
    steps.push({ docId: e.documentId, table: e.table, depth: e.depth, action: 'discover', relationship: e.relationshipName });
  }
  for (const e of plan) {
    steps.push({ docId: e.documentId, table: e.table, depth: e.depth, action: 'delete' });
  }
  return steps;
}

const CASCADE_CODE = `// One line to delete a user and ALL related data:
await cascade.deleteWithCascade(ctx, "users", userId);
// Posts, comments, reactions — all cleaned up.
// Zero orphans. Zero dangling references.`;

// ─── Component ──────────────────────────────────────────────────

export function FirstCascadeSection() {
  const colors = useThemeColors();
  const sessionId = useSessionId();
  const data = useQuery(api.functions.listAll);
  const seedMutation = useMutation(api.functions.seed);
  const clearMutation = useMutation(api.functions.clearAll);
  const deleteMutation = useMutation(api.functions.deleteWithCascade);
  const previewMutation = useMutation(api.functions.previewCascade);

  const [selected, setSelected] = useState<{ table: string; id: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CascadeResult | null>(null);

  // Trace animation state
  const [snapshot, setSnapshot] = useState<typeof data>(null);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [currentTraceIdx, setCurrentTraceIdx] = useState(-1);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, 'root' | 'discovered' | 'deleting' | 'deleted'>>({});
  const [phase, setPhase] = useState<'idle' | 'tracing' | 'done'>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Trace tick
  useEffect(() => {
    if (phase !== 'tracing' || traceSteps.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentTraceIdx(prev => {
        const next = prev + 1;
        if (next >= traceSteps.length) { setPhase('done'); return prev; }
        const step = traceSteps[next];
        setNodeStatuses(ns => {
          const updated = { ...ns };
          if (step.action === 'root') updated[step.docId] = 'root';
          else if (step.action === 'discover') updated[step.docId] = 'discovered';
          else if (step.action === 'delete') {
            updated[step.docId] = 'deleting';
            setTimeout(() => setNodeStatuses(ns2 => ({ ...ns2, [step.docId]: 'deleted' })), 250);
          }
          return updated;
        });
        return next;
      });
    }, 400);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, traceSteps]);

  useEffect(() => { if (phase === 'done' && intervalRef.current) clearInterval(intervalRef.current); }, [phase]);

  const resetTrace = useCallback(() => {
    setPhase('idle'); setTraceSteps([]); setCurrentTraceIdx(-1);
    setNodeStatuses({}); setSnapshot(null); setResult(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleResetDB = async () => {
    setLoading('reset'); setError(null); setSelected(null); resetTrace();
    try {
      await clearMutation({ sessionId });
      await seedMutation({ sessionId });
    } catch (e: any) { setError(formatConvexError(e, 'Reset failed')); }
    finally { setLoading(null); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setLoading('delete'); setError(null); resetTrace();
    try {
      const preview = await previewMutation({ table: selected.table, id: selected.id, sessionId }) as unknown as CascadeResult;
      if (data) setSnapshot(JSON.parse(JSON.stringify(data)));
      if (preview.plan && preview.plan.length > 0) {
        const steps = buildTraceSteps(preview.plan, selected.id, selected.table);
        setTraceSteps(steps); setCurrentTraceIdx(-1); setNodeStatuses({});
        setPhase('tracing');
      }
      const res = await deleteMutation({ table: selected.table, id: selected.id, sessionId });
      setResult(res as unknown as CascadeResult); setSelected(null);
    } catch (e: any) { setError(formatConvexError(e, 'Delete failed')); }
    finally { setLoading(null); }
  };

  const isTracing = phase === 'tracing' || phase === 'done';
  const getNodeStatus = useCallback((id: string): NodeTraceStatus => nodeStatuses[id] || null, [nodeStatuses]);
  const displayData = snapshot || data;

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
        title="Your First Cascade Delete"
        subtitle="Connected to a real Convex database. Select any node and watch the BFS cascade trace through every descendant."
        badge="Live"
        id="first-cascade"
      />

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: code + explanation */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <CodeBlock code={CASCADE_CODE} language="typescript" title="mutation.ts" />

          {/* Result summary */}
          <AnimatePresence>
            {phase === 'done' && result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: `2px solid ${success}`,
                  background: `${success}18`,
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: success, marginBottom: '0.3rem' }}>
                  Deleted {result.totalDeleted} documents
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {result.deletedByTable && Object.entries(result.deletedByTable).map(([table, count]) => (
                    <span key={table} style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                      padding: '0.1rem 0.35rem', borderRadius: '0.15rem',
                      border: `1px solid ${success}60`, color: success,
                    }}>
                      {table}: {count}
                    </span>
                  ))}
                </div>
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
              <button onClick={handleDelete} disabled={!!loading || !selected || isTracing} style={{
                ...btnStyle,
                borderColor: selected ? danger : border,
                color: selected ? danger : fg,
                fontWeight: selected ? 600 : 400,
              }}>
                {loading === 'delete' ? 'Deleting...' : 'Cascade Delete'}
              </button>
              {isTracing && (
                <button onClick={resetTrace} style={{ ...btnStyle, fontSize: '0.65rem', color: mutedFg, borderColor: border }}>
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
              data={displayData as any}
              colors={colors}
              selected={selected}
              onSelect={(sel) => !isTracing && setSelected(sel)}
              nodeStatus={getNodeStatus}
              disabled={isTracing}
              emptyMessage="No data yet. Click Reset DB to populate."
            />

            <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg, opacity: 0.7 }}>
              {phase === 'idle' && !selected && 'Click any node to select it, then hit Cascade Delete.'}
              {phase === 'idle' && selected && `Selected: ${selected.table}. Hit Cascade Delete to remove it and all descendants.`}
              {phase === 'tracing' && 'BFS traversal in progress — discovering and deleting descendants...'}
              {phase === 'done' && 'Done! All descendants removed. Click Reset DB to try again.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

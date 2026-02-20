import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../../convex/_generated/api';
import { useThemeColors, type ThemeColors } from '../useThemeColors';
import { useSessionId } from '../useSessionId';
import { SectionHeader } from './SectionHeader';
import { SegmentedControl } from './SegmentedControl';
import { getPlaygroundTableColor } from './cascade-colors';
import { formatConvexError } from './format-error';

// ─── Types ──────────────────────────────────────────────────────

interface CascadeResult {
  operationId: string;
  totalDeleted: number;
  deletedByTable: Record<string, number>;
  dryRun: boolean;
  plan?: PlanEntry[];
}

interface PlanEntry {
  table: string;
  documentId: string;
  depth: number;
  relationshipName?: string;
}

type Phase = 'idle' | 'tracing' | 'done';

interface TraceStep {
  docId: string;
  table: string;
  depth: number;
  action: 'root' | 'discover' | 'delete';
  relationship?: string;
}

type PlaygroundMode = 'instant' | 'scheduled';

type JobStatus = 'pending' | 'discovering' | 'deleting' | 'completed' | 'failed' | 'cancelled';

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

function getStatusColor(status: JobStatus, colors: ThemeColors): string {
  switch (status) {
    case 'pending': return colors.mutedFg;
    case 'discovering': return colors.info;
    case 'deleting': return colors.warning;
    case 'completed': return colors.success;
    case 'failed': return colors.danger;
    case 'cancelled': return colors.mutedFg;
  }
}

function getStatusLabel(status: JobStatus): string {
  return status.toUpperCase();
}

// ─── Component ──────────────────────────────────────────────────

export function PlaygroundSection() {
  const colors = useThemeColors();
  const sessionId = useSessionId();
  const data = useQuery(api.functions.listAll);
  const seedMutation = useMutation(api.functions.seed);
  const clearMutation = useMutation(api.functions.clearAll);
  const deleteMutation = useMutation(api.functions.deleteWithCascade);
  const previewMutation = useMutation(api.functions.previewCascade);

  // Scheduled mutations/queries
  const jobs = useQuery(api.functions.listScheduledJobs);
  const startDelete = useMutation(api.functions.startScheduledDelete);
  const cancelDelete = useMutation(api.functions.cancelScheduledDelete);
  const clearJobsMutation = useMutation(api.functions.clearScheduledJobs);

  const [mode, setMode] = useState<PlaygroundMode>('instant');
  const [selected, setSelected] = useState<{ table: string; id: string } | null>(null);
  const [result, setResult] = useState<CascadeResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Snapshot: frozen copy of data during delete trace
  const [snapshot, setSnapshot] = useState<typeof data>(null);

  // Trace state (instant mode)
  const [phase, setPhase] = useState<Phase>('idle');
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [currentTraceIdx, setCurrentTraceIdx] = useState(-1);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, 'root' | 'discovered' | 'deleting' | 'deleted'>>({});
  const [showTrace, setShowTrace] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Scheduled state
  const [chunkSize, setChunkSize] = useState(3);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const activeJob = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;
    if (selectedJobId) {
      const found = jobs.find((j: any) => j._id === selectedJobId);
      if (found) return found;
    }
    return jobs.find((j: any) => j.status === 'deleting') || jobs[0];
  }, [jobs, selectedJobId]);

  const chunks = useMemo(() => {
    if (!activeJob) return [];
    const { plan, chunkSize: cs, deletedSoFar } = activeJob;
    const result: Array<{
      entries: Array<{ table: string; id: string }>;
      state: 'done' | 'processing' | 'pending';
      index: number;
    }> = [];
    for (let i = 0; i < plan.length; i += cs) {
      const entries = plan.slice(i, i + cs);
      const chunkEnd = i + entries.length;
      let state: 'done' | 'processing' | 'pending';
      if (chunkEnd <= deletedSoFar) state = 'done';
      else if (i < deletedSoFar + cs && i >= deletedSoFar - cs && activeJob.status === 'deleting')
        state = i < deletedSoFar ? 'done' : 'processing';
      else if (i < deletedSoFar) state = 'done';
      else state = activeJob.status === 'completed' ? 'done' : 'pending';
      result.push({ entries, state, index: result.length });
    }
    return result;
  }, [activeJob]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [currentTraceIdx]);

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
    setNodeStatuses({}); setSnapshot(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  if (!colors) return null;
  const { foreground: fg, mutedFg, border, accent, background: bg, muted, primary, secondary, danger, dangerMuted, success, warning, info } = colors;

  const displayData = snapshot || data;
  const isEmpty = displayData && displayData.users.length === 0 && displayData.posts.length === 0;

  const handleResetDB = async () => {
    setLoading('reset');
    setResult(null); setError(null); setSelected(null); resetTrace();
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
        setPhase('tracing'); setShowTrace(true);
      }
      const res = await deleteMutation({ table: selected.table, id: selected.id, sessionId });
      setResult(res as unknown as CascadeResult); setSelected(null);
    } catch (e: any) { setError(formatConvexError(e, 'Delete failed')); }
    finally { setLoading(null); }
  };

  const handleDryRun = async () => {
    if (!selected) return;
    setLoading('preview'); setError(null); resetTrace();
    try {
      const res = await previewMutation({ table: selected.table, id: selected.id, sessionId });
      const cascadeResult = res as unknown as CascadeResult;
      setResult(cascadeResult);
      if (cascadeResult.plan && cascadeResult.plan.length > 0) {
        const steps = buildTraceSteps(cascadeResult.plan, selected.id, selected.table);
        setTraceSteps(steps); setCurrentTraceIdx(-1); setNodeStatuses({});
        setTimeout(() => { setPhase('tracing'); setShowTrace(true); }, 150);
      }
    } catch (e: any) { setError(formatConvexError(e, 'Preview failed')); }
    finally { setLoading(null); }
  };

  // Scheduled handlers
  const handleScheduleDelete = async () => {
    if (!selected) return;
    setLoading('schedule'); setError(null);
    try {
      const jobId = await startDelete({ table: selected.table, id: selected.id, chunkSize, sessionId });
      setSelectedJobId(jobId); setSelected(null);
    } catch (e: any) { setError(formatConvexError(e, 'Schedule failed')); }
    finally { setLoading(null); }
  };

  const handleCancel = async (jobId: any) => {
    setLoading('cancel'); setError(null);
    try { await cancelDelete({ jobId, sessionId }); }
    catch (e: any) { setError(formatConvexError(e, 'Cancel failed')); }
    finally { setLoading(null); }
  };

  const handleClearJobs = async () => {
    setLoading('clear'); setError(null);
    try { await clearJobsMutation({ sessionId }); setSelectedJobId(null); }
    catch (e: any) { setError(formatConvexError(e, 'Clear failed')); }
    finally { setLoading(null); }
  };

  const isTracing = phase === 'tracing' || phase === 'done';
  const getNodeStatus = (id: string) => nodeStatuses[id] || null;
  const isSelected = (table: string, id: string) => selected?.table === table && selected?.id === id;
  const completedSteps = currentTraceIdx >= 0 ? traceSteps.slice(0, currentTraceIdx + 1) : [];

  const allDocs = displayData ? [
    ...displayData.users.map(d => ({ ...d, _table: 'users' as const })),
    ...displayData.posts.map(d => ({ ...d, _table: 'posts' as const })),
    ...displayData.comments.map(d => ({ ...d, _table: 'comments' as const })),
    ...displayData.reactions.map(d => ({ ...d, _table: 'reactions' as const })),
  ] : [];
  const docMap = Object.fromEntries(allDocs.map(d => [d._id, d]));

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

  const chipStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.2rem 0.5rem',
    borderRadius: '0.2rem', border: `1.5px solid ${active ? fg : border}`,
    background: active ? fg : 'transparent', color: active ? bg : mutedFg,
    cursor: 'pointer', transition: 'all 0.15s ease', fontWeight: active ? 600 : 400,
  });

  return (
    <section style={{ marginBottom: '4rem' }}>
      <SectionHeader
        title="Live Playground"
        subtitle="Connected to a real Convex backend. Select a node, then dry-run or cascade delete it."
        badge="Live"
        id="playground"
      />

      <div className="mermaid-container">
        {/* Toolbar */}
        <div style={{
          display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center',
          border: `1.5px solid ${border}`, borderRadius: '0.375rem', padding: '0.4rem 0.5rem', background: muted,
        }}>
          <button onClick={handleResetDB} disabled={!!loading} style={btnStyle}>
            {loading === 'reset' ? 'Resetting...' : 'Reset DB'}
          </button>
          <div style={{ width: 1, height: '1.25rem', background: border, flexShrink: 0 }} />

          <SegmentedControl
            value={mode}
            options={[
              { value: 'instant', label: 'Instant' },
              { value: 'scheduled', label: 'Scheduled' },
            ]}
            onChange={(v) => { setMode(v); setError(null); }}
          />
          <div style={{ width: 1, height: '1.25rem', background: border, flexShrink: 0 }} />

          {mode === 'instant' ? (
            <>
              <button onClick={handleDryRun} disabled={!!loading || !selected || isTracing} style={btnStyle}>
                {loading === 'preview' ? 'Previewing...' : 'Dry Run'}
              </button>
              <button onClick={handleDelete} disabled={!!loading || !selected} style={{
                ...btnStyle,
                borderColor: selected ? danger : border,
                color: selected ? danger : fg,
              }}>
                {loading === 'delete' ? 'Deleting...' : 'Cascade Delete'}
              </button>
              {isTracing && (
                <>
                  <div style={{ width: 1, height: '1.25rem', background: border, flexShrink: 0 }} />
                  <button onClick={resetTrace} style={{ ...btnStyle, borderColor: mutedFg, color: mutedFg, fontSize: '0.65rem' }}>
                    Clear Trace
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: mutedFg }}>Chunk:</span>
              {[1, 3, 5].map(size => (
                <button key={size} onClick={() => setChunkSize(size)} style={chipStyle(chunkSize === size)}>
                  {size}
                </button>
              ))}
              <div style={{ width: 1, height: '1.25rem', background: border, flexShrink: 0 }} />
              <button onClick={handleScheduleDelete} disabled={!!loading || !selected}
                style={{ ...btnStyle, borderColor: selected ? warning : border, color: selected ? warning : fg }}>
                {loading === 'schedule' ? 'Scheduling...' : 'Schedule Delete'}
              </button>
              <button onClick={handleClearJobs} disabled={!!loading} style={btnStyle}>
                {loading === 'clear' ? 'Clearing...' : 'Clear Jobs'}
              </button>
            </>
          )}

          {/* Connected indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: data ? success : warning,
              boxShadow: data ? `0 0 8px ${success}80` : 'none',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg }}>
              {data ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{
                marginBottom: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '0.25rem',
                border: `2px solid ${danger}`, background: `${danger}18`, color: danger,
                fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
              <span>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: danger, cursor: 'pointer', fontWeight: 700 }}>x</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tree + side panel */}
        <div style={{ display: 'flex', gap: '0.75rem', minHeight: '8rem' }}>
          {/* Data tree */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!displayData ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: mutedFg, padding: '2rem 0', textAlign: 'center' }}>
                Connecting to Convex...
              </div>
            ) : isEmpty && !isTracing ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: mutedFg, padding: '2rem 0', textAlign: 'center' }}>
                No data yet. Click <strong>Reset DB</strong> to populate.
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                {displayData.users.map(user => (
                  <div key={user._id}>
                    <NodeRow label={`\u{1F464} ${user.name}`} sublabel={user.email} tableColor={primary}
                      selected={isSelected('users', user._id)} traceStatus={getNodeStatus(user._id)}
                      onClick={() => !isTracing && setSelected(isSelected('users', user._id) ? null : { table: 'users', id: user._id })}
                      depth={0} colors={colors} />
                    {displayData.posts.filter(p => p.userId === user._id).map(post => (
                      <div key={post._id}>
                        <NodeRow label={`\u{1F4DD} ${post.title}`} tableColor={secondary}
                          selected={isSelected('posts', post._id)} traceStatus={getNodeStatus(post._id)}
                          onClick={() => !isTracing && setSelected(isSelected('posts', post._id) ? null : { table: 'posts', id: post._id })}
                          depth={1} colors={colors} />
                        {displayData.comments.filter(c => c.postId === post._id).map(comment => (
                          <div key={comment._id}>
                            <NodeRow label={`\u{1F4AC} ${comment.body}`} tableColor={accent}
                              selected={isSelected('comments', comment._id)} traceStatus={getNodeStatus(comment._id)}
                              onClick={() => !isTracing && setSelected(isSelected('comments', comment._id) ? null : { table: 'comments', id: comment._id })}
                              depth={2} colors={colors} />
                            {displayData.reactions.filter(r => r.commentId === comment._id).map(reaction => (
                              <NodeRow key={reaction._id} label={reaction.emoji} tableColor={mutedFg}
                                selected={isSelected('reactions', reaction._id)} traceStatus={getNodeStatus(reaction._id)}
                                onClick={() => !isTracing && setSelected(isSelected('reactions', reaction._id) ? null : { table: 'reactions', id: reaction._id })}
                                depth={3} colors={colors} />
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trace console (instant mode only) */}
          <AnimatePresence>
            {mode === 'instant' && showTrace && isTracing && (
              <motion.div
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 220 }} exit={{ opacity: 0, width: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ flexShrink: 0, overflow: 'hidden' }}
              >
                <div style={{
                  width: 220, borderRadius: '0.375rem', border: `1.5px solid ${border}`, background: bg,
                  padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                  display: 'flex', flexDirection: 'column', height: '100%',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem', paddingBottom: '0.35rem', borderBottom: `1px solid ${border}` }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: phase === 'tracing' ? success : mutedFg, boxShadow: phase === 'tracing' ? `0 0 8px ${success}80` : 'none' }} />
                    <span style={{ color: fg, fontWeight: 600, fontSize: '0.65rem' }}>BFS TRACE</span>
                    <span style={{ color: mutedFg, marginLeft: 'auto' }}>{completedSteps.length}/{traceSteps.length}</span>
                  </div>
                  <div ref={logRef} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <AnimatePresence initial={false}>
                      {completedSteps.map((step, i) => {
                        const doc = docMap[step.docId];
                        const label = doc ? (step.table === 'reactions' ? doc.emoji : doc.name || doc.title || doc.body || '...') : step.docId.slice(-8);
                        return (
                          <motion.div key={`${step.action}-${step.docId}-${i}`}
                            initial={{ opacity: 0, x: 8, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.3rem',
                              padding: '0.15rem 0.2rem', paddingLeft: `${0.2 + step.depth * 0.5}rem`,
                              borderRadius: '0.15rem',
                              background: i === currentTraceIdx ? `${getPlaygroundTableColor(step.table, colors)}12` : 'transparent',
                            }}
                          >
                            <span style={{
                              display: 'inline-block', padding: '0.05rem 0.25rem', borderRadius: '0.15rem',
                              background: step.action === 'root' ? primary : step.action === 'discover' ? accent : danger,
                              color: step.action === 'discover' ? bg : '#fff',
                              fontSize: '0.5rem', fontWeight: 700, minWidth: '2rem', textAlign: 'center',
                            }}>
                              {step.action === 'root' ? 'ROOT' : step.action === 'discover' ? 'FIND' : 'DEL'}
                            </span>
                            <span style={{
                              color: step.action === 'delete' ? danger : fg,
                              textDecoration: step.action === 'delete' ? 'line-through' : 'none',
                              opacity: step.action === 'delete' ? 0.6 : 1,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '7rem',
                            }}>
                              {label}
                            </span>
                            <span style={{ color: getPlaygroundTableColor(step.table, colors), opacity: 0.5, marginLeft: 'auto', flexShrink: 0 }}>
                              {step.table.slice(0, 4)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                  {phase === 'done' && result && (
                    <div style={{ marginTop: '0.4rem', paddingTop: '0.35rem', borderTop: `1px solid ${border}`, color: result.dryRun ? accent : danger, fontWeight: 600, fontSize: '0.6rem' }}>
                      {result.dryRun ? 'Would delete' : 'Deleted'} {result.totalDeleted} doc{result.totalDeleted !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scheduled mode: Job Queue + Pipeline */}
        <AnimatePresence>
          {mode === 'scheduled' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', minHeight: '10rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {/* Job Queue */}
                <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: mutedFg, letterSpacing: '0.04em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Job Queue
                  </div>
                  {!jobs ? (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: mutedFg, padding: '1rem 0' }}>Loading...</div>
                  ) : jobs.length === 0 ? (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: mutedFg, padding: '2rem 0', textAlign: 'center', border: `1.5px dashed ${border}`, borderRadius: '0.375rem' }}>
                      No jobs yet. Select a node and click Schedule Delete.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <AnimatePresence initial={false}>
                        {jobs.map((job: any) => (
                          <JobCard key={job._id} job={job} colors={colors} isSelected={activeJob?._id === job._id}
                            onSelect={() => setSelectedJobId(job._id)} onCancel={() => handleCancel(job._id)} loading={!!loading} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Pipeline */}
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: mutedFg, letterSpacing: '0.04em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Pipeline {activeJob ? `\u2014 ${activeJob.rootTable}:${activeJob.rootId.slice(-6)}` : ''}
                  </div>
                  {!activeJob ? (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: mutedFg, padding: '2rem 0', textAlign: 'center', border: `1.5px dashed ${border}`, borderRadius: '0.375rem' }}>
                      Select a job to view its pipeline.
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '22rem', overflowY: 'auto', padding: '0.25rem' }}>
                        <AnimatePresence initial={false}>
                          {chunks.map(chunk => (
                            <ChunkBlock key={chunk.index} chunk={chunk} colors={colors} chunkIndex={chunk.index} />
                          ))}
                        </AnimatePresence>
                      </div>
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: `1px solid ${border}`, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: mutedFg, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Deleted {activeJob.deletedSoFar} of {activeJob.totalToDelete} docs</span>
                        <span>{chunks.length} chunk{chunks.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Retry footnote */}
              <div style={{
                marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg, opacity: 0.7,
              }}>
                Each chunk runs as a separate scheduled function. If a chunk fails, the job resumes from the last successful batch.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note */}
        <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg, opacity: 0.7 }}>
          Live shared database — other visitors may be making changes. Each session has its own rate limit.
        </div>
      </div>
    </section>
  );
}

// ─── Tree Node Row ──────────────────────────────────────────────

function NodeRow({ label, sublabel, tableColor, selected, traceStatus, onClick, depth, colors }: {
  label: string; sublabel?: string; tableColor: string;
  selected: boolean; traceStatus: 'root' | 'discovered' | 'deleting' | 'deleted' | null;
  onClick: () => void; depth: number; colors: NonNullable<ReturnType<typeof useThemeColors>>;
}) {
  const { foreground: fg, background: bg, border, accent } = colors;
  let rowBg = 'transparent'; let rowBorder = 'transparent';
  let textColor = fg; let textDecoration = 'none'; let indicatorColor = tableColor;

  if (selected && !traceStatus) { rowBg = `${accent}15`; rowBorder = accent; }
  if (traceStatus === 'root') { rowBg = `${colors.primary}18`; rowBorder = colors.primary; indicatorColor = colors.primary; }
  else if (traceStatus === 'discovered') { rowBg = `${colors.accent}12`; rowBorder = colors.accent; indicatorColor = colors.accent; }
  else if (traceStatus === 'deleting') { rowBg = `${colors.danger}30`; rowBorder = colors.danger; textColor = colors.danger; indicatorColor = colors.danger; }
  else if (traceStatus === 'deleted') { rowBg = `${colors.danger}18`; rowBorder = colors.dangerMuted; textDecoration = 'line-through'; textColor = colors.dangerMuted; indicatorColor = colors.dangerMuted; }

  return (
    <motion.div
      onClick={onClick}
      animate={{ backgroundColor: rowBg, borderColor: rowBorder }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.25rem 0.5rem', paddingLeft: `${0.5 + depth * 1.25}rem`,
        borderRadius: '0.25rem', cursor: traceStatus ? 'default' : 'pointer',
        border: `2px solid ${rowBorder}`, background: rowBg, position: 'relative',
      }}
    >
      {depth > 0 && (
        <div style={{
          position: 'absolute', left: `${0.15 + (depth - 1) * 1.25}rem`,
          top: 0, bottom: '50%', width: '0.75rem',
          borderLeft: `1.5px solid ${border}`, borderBottom: `1.5px solid ${border}`,
          borderBottomLeftRadius: '0.2rem', opacity: 0.4, pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
        <motion.div
          animate={{ background: indicatorColor, scale: traceStatus === 'deleting' ? [1, 1.8, 0] : 1 }}
          transition={traceStatus === 'deleting' ? { duration: 0.4 } : { duration: 0.2 }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: indicatorColor, position: 'absolute', top: 1, left: 1 }}
        />
        {(traceStatus === 'root' || traceStatus === 'discovered') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.6, 0], scale: [1, 2.5] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ position: 'absolute', top: -1, left: -1, width: 12, height: 12, borderRadius: '50%', border: `2px solid ${indicatorColor}`, pointerEvents: 'none' }}
          />
        )}
      </div>
      <span style={{ color: textColor, textDecoration, transition: 'color 0.2s' }}>{label}</span>
      {sublabel && <span style={{ color: tableColor, fontSize: '0.65rem', opacity: 0.7 }}>{sublabel}</span>}
      {traceStatus && traceStatus !== 'deleted' && (
        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            marginLeft: 'auto', padding: '0.05rem 0.3rem', borderRadius: '0.15rem',
            background: traceStatus === 'root' ? colors.primary : traceStatus === 'discovered' ? colors.accent : colors.danger,
            color: traceStatus === 'discovered' ? bg : '#fff',
            fontSize: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
          }}>
          {traceStatus === 'root' ? 'ROOT' : traceStatus === 'discovered' ? 'FOUND' : 'DEL'}
        </motion.span>
      )}
      {traceStatus === 'deleted' && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
          style={{
            marginLeft: 'auto', padding: '0.05rem 0.3rem', borderRadius: '0.15rem',
            background: colors.dangerMuted, color: colors.danger, fontSize: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
          }}>
          DELETED
        </motion.span>
      )}
    </motion.div>
  );
}

// ─── Job Card ───────────────────────────────────────────────────

function JobCard({ job, colors, isSelected, onSelect, onCancel, loading }: {
  job: any; colors: NonNullable<ReturnType<typeof useThemeColors>>;
  isSelected: boolean; onSelect: () => void; onCancel: () => void; loading: boolean;
}) {
  const { foreground: fg, mutedFg, border } = colors;
  const statusColor = getStatusColor(job.status, colors);
  const progress = job.totalToDelete > 0 ? job.deletedSoFar / job.totalToDelete : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      onClick={onSelect}
      style={{
        padding: '0.5rem 0.6rem', borderRadius: '0.375rem',
        border: `1.5px solid ${isSelected ? statusColor : border}`,
        background: isSelected ? `${statusColor}08` : 'transparent',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: fg }}>
          {job.rootTable}:{job.rootId.slice(-6)}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '0.15rem', background: statusColor, color: '#fff' }}>
          {getStatusLabel(job.status)}
        </span>
        {job.status === 'deleting' && (
          <button onClick={(e) => { e.stopPropagation(); onCancel(); }} disabled={loading}
            style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', padding: '0.1rem 0.35rem', borderRadius: '0.15rem', border: `1.5px solid ${colors.danger}`, background: 'transparent', color: colors.danger, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
      <div style={{ height: 4, borderRadius: 2, background: `${border}80`, overflow: 'hidden', marginBottom: '0.2rem' }}>
        <motion.div animate={{ width: `${progress * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{ height: '100%', borderRadius: 2, background: statusColor }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: mutedFg }}>
        <span>{job.deletedSoFar}/{job.totalToDelete} deleted</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
    </motion.div>
  );
}

// ─── Chunk Block ────────────────────────────────────────────────

function ChunkBlock({ chunk, colors, chunkIndex }: {
  chunk: { entries: Array<{ table: string; id: string }>; state: 'done' | 'processing' | 'pending'; index: number };
  colors: NonNullable<ReturnType<typeof useThemeColors>>; chunkIndex: number;
}) {
  const { mutedFg, border } = colors;
  const { entries, state } = chunk;

  let blockBg = 'transparent'; let blockBorder = border; let labelColor = mutedFg;
  if (state === 'processing') { blockBg = `${colors.warning}20`; blockBorder = colors.warning; labelColor = colors.warning; }
  else if (state === 'done') { blockBg = `${colors.success}12`; blockBorder = `${colors.success}60`; labelColor = colors.success; }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0, borderColor: blockBorder, backgroundColor: blockBg }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: chunkIndex * 0.03 }}
      style={{ padding: '0.35rem 0.5rem', borderRadius: '0.3rem', borderWidth: '1.5px', borderStyle: 'solid', position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: entries.length > 0 ? '0.25rem' : 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 600, color: labelColor }}>
          Chunk {chunkIndex + 1}
        </span>
        {state === 'done' && <span style={{ fontSize: '0.6rem', color: colors.success }}>&#10003;</span>}
        {state === 'processing' && (
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700, color: colors.warning }}>
            PROCESSING
          </motion.span>
        )}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: mutedFg, marginLeft: 'auto' }}>
          {entries.length} doc{entries.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
        {entries.map((entry, i) => (
          <span key={`${entry.id}-${i}`} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.5rem', padding: '0.1rem 0.3rem', borderRadius: '0.15rem',
            background: `${getPlaygroundTableColor(entry.table, colors)}18`, color: getPlaygroundTableColor(entry.table, colors),
            border: `1px solid ${getPlaygroundTableColor(entry.table, colors)}30`,
            textDecoration: state === 'done' ? 'line-through' : 'none', opacity: state === 'done' ? 0.6 : 1,
          }}>
            {entry.table}:{entry.id.slice(-4)}
          </span>
        ))}
      </div>
      {state === 'processing' && (
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ position: 'absolute', inset: -1, borderRadius: '0.3rem', border: `1.5px solid ${colors.warning}`, pointerEvents: 'none', boxShadow: `0 0 8px ${colors.warning}40` }} />
      )}
    </motion.div>
  );
}

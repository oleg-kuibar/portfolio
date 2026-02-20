import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors } from '../useThemeColors';
import { usePanZoom } from '../usePanZoom';
import { ZoomControls } from '../ZoomControls';
import { TransportBar } from './TransportBar';
import { buildTreeFromPlaygroundData, computeTreeBounds, type PlaygroundData } from './tree-builders';
import {
  buildCascadeSteps, computeRecoveryState, computeFailureParams,
  buildRecoverySteps,
  type TreeNode, type CascadeStep, type RecoveryStep, type StepState,
} from './cascade-logic';
import { getSimpleTableColor, type SimpleTableType } from './cascade-colors';
import { buildRecoveryLogEntries } from './log-entries';
import { LogConsole } from './LogConsole';

const NODE_W = 94;
const NODE_H = 34;

interface RecoveryVizProps {
  data: PlaygroundData;
}

export function RecoveryViz({ data }: RecoveryVizProps) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const colors = useThemeColors();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { containerRef, transform, transformStyle, isPanning, handlers: panZoomHandlers, resetView, zoomIn, zoomOut } = usePanZoom();

  const memo = useMemo(() => {
    const treeNodes = buildTreeFromPlaygroundData(data);
    if (treeNodes.length === 0) return {
      nodes: [] as TreeNode[], nodeMap: {} as Record<string, TreeNode>,
      cascadeSteps: [] as CascadeStep[], recoverySteps: [] as RecoveryStep[],
      failureCascadeStep: 0, partialDeletedIds: new Set<string>(),
      recoveryTotal: 2, logEntries: [], viewBox: '0 0 700 360',
    };
    const nm: Record<string, TreeNode> = {};
    for (const n of treeNodes) nm[n.id] = n;
    const cs = buildCascadeSteps(nm, treeNodes[0].id);
    const fp = computeFailureParams(cs);
    const rs = buildRecoverySteps(cs, fp.failureCascadeStep, fp.partialDeletedIds);
    const recoveryTotal = fp.failureCascadeStep + 2 + rs.length;
    const le = buildRecoveryLogEntries(cs, rs, fp.failureCascadeStep, fp.partialDeletedIds, treeNodes, nm);
    const bounds = computeTreeBounds(treeNodes);
    const vb = `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`;
    return {
      nodes: treeNodes, nodeMap: nm, cascadeSteps: cs, recoverySteps: rs,
      failureCascadeStep: fp.failureCascadeStep, partialDeletedIds: fp.partialDeletedIds,
      recoveryTotal, logEntries: le, viewBox: vb,
    };
  }, [data]);

  const { nodes, nodeMap, cascadeSteps, recoverySteps, failureCascadeStep, partialDeletedIds, recoveryTotal, logEntries, viewBox } = memo;

  const isFinished = step >= recoveryTotal;
  const inRecoveryPhase = step > failureCascadeStep + 2;
  const isCrashed = step >= failureCascadeStep + 1 && !inRecoveryPhase;
  const isRecoveryDone = isFinished && recoverySteps.length > 0 && recoverySteps[recoverySteps.length - 1].action === 'recovery_done';

  // Determine current recovery action for badge logic
  const currentRecoveryStep = inRecoveryPhase
    ? recoverySteps[step - (failureCascadeStep + 3)]
    : null;

  const state = nodes.length > 0
    ? computeRecoveryState(step, cascadeSteps, recoverySteps, failureCascadeStep, partialDeletedIds, nodes, nodeMap)
    : { statuses: {}, visited: [], stack: [], explanation: '', activeEdge: null } as StepState;

  useEffect(() => {
    if (playing && !isFinished && nodes.length > 0) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s + 1 > recoveryTotal) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 700);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, isFinished, recoveryTotal, nodes.length]);

  useEffect(() => { if (isFinished) setPlaying(false); }, [isFinished]);
  useEffect(() => { setStep(0); setPlaying(false); }, [data]);
  useEffect(() => { resetView(); }, [data, resetView]);
  useEffect(() => { if (step > 0 && !showLogs) setShowLogs(true); }, [step > 0]);

  const handleReset = useCallback(() => { setHasInteracted(true); setPlaying(false); setStep(0); }, []);
  const handleStep = useCallback(() => { setHasInteracted(true); setPlaying(false); setStep(s => Math.min(s + 1, recoveryTotal)); }, [recoveryTotal]);
  const handleTogglePlay = useCallback(() => {
    setHasInteracted(true);
    if (isFinished) { setStep(0); setPlaying(true); } else { setPlaying(p => !p); }
  }, [isFinished]);

  if (!colors || nodes.length === 0) return null;

  const { foreground: fg, mutedFg, border, accent, background: bg, muted, danger, dangerMuted, success, warning } = colors;
  const deletedCount = Object.values(state.statuses).filter(s => s === 'deleted').length;
  const orphanedCount = Object.values(state.statuses).filter(s => s === 'orphaned').length;

  // Status bar border color
  let statusBorderColor = accent;
  if (isCrashed) statusBorderColor = danger;
  else if (isRecoveryDone) statusBorderColor = success;
  else if (inRecoveryPhase) statusBorderColor = warning;

  // Build return value for LogConsole
  const returnValue = isRecoveryDone ? {
    type: 'batched',
    operationId: '1708167234567_a7b9c2',
    totalDeleted: nodes.length,
    deletedByTable: (() => {
      const counts: Record<string, number> = {};
      for (const n of nodes) counts[n.table] = (counts[n.table] || 0) + 1;
      return counts;
    })(),
    batches: recoverySteps.filter(s => s.action === 'batch_start').length,
    retriedEntries: 1,
    failedEntries: 0,
    softDelete: false,
  } : undefined;

  return (
    <div className="mermaid-container">
      <div style={{ display: 'flex', gap: '0.5rem', minHeight: 0 }}>
        <div
          ref={containerRef}
          {...panZoomHandlers}
          style={{
            flex: 1, overflow: 'hidden', position: 'relative', minHeight: '280px',
            touchAction: 'none', cursor: isPanning ? 'grabbing' : 'grab',
          }}
        >
          <div style={{ transform: transformStyle, transformOrigin: '0 0' }}>
            <svg viewBox={viewBox} style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* Edges */}
              {nodes.map(node =>
                node.children.map(childId => {
                  const child = nodeMap[childId];
                  if (!child) return null;
                  const parentDeleted = state.statuses[node.id] === 'deleted';
                  const childDeleted = state.statuses[childId] === 'deleted';
                  const isOrphaned = state.statuses[childId] === 'orphaned';
                  const isActive = state.activeEdge?.from === node.id && state.activeEdge?.to === childId;
                  const x1 = node.x; const y1 = node.y + NODE_H / 2;
                  const x2 = child.x; const y2 = child.y - NODE_H / 2;
                  const yMid = y1 + (y2 - y1) * 0.5;

                  const edgeColor = isActive ? accent : isOrphaned ? danger : border;
                  return (
                    <motion.path
                      key={`e-${node.id}-${childId}`}
                      d={`M ${x1} ${y1} L ${x1} ${yMid} L ${x2} ${yMid} L ${x2} ${y2}`}
                      fill="none" stroke={edgeColor} strokeWidth={isActive ? 2.5 : 1.5}
                      strokeDasharray={isOrphaned ? '4 3' : 'none'}
                      animate={{ opacity: parentDeleted && childDeleted ? 0.15 : isOrphaned ? 0.6 : 1 }}
                      transition={{ duration: 0.25 }}
                    />
                  );
                })
              )}

              {/* Nodes */}
              {nodes.map(node => {
                const status = state.statuses[node.id];
                const tableColor = getSimpleTableColor(node.table as SimpleTableType, colors);
                const isReaction = node.table === 'reactions';

                let fill = muted; let stroke = tableColor; let strokeWidth = 2;
                let textFill = fg; let nodeOpacity = 1;

                if (status === 'visiting') { fill = tableColor; stroke = fg; strokeWidth = 2.5; textFill = bg; }
                else if (status === 'deleted') { fill = `${dangerMuted}20`; stroke = dangerMuted; strokeWidth = 1.5; textFill = dangerMuted; nodeOpacity = 0.7; }
                else if (status === 'orphaned') { stroke = danger; }

                // Check if this node is the retry node during batch_retry
                const isRetryNode = currentRecoveryStep?.action === 'batch_retry' && currentRecoveryStep.retryNodeId === node.id;

                return (
                  <g key={node.id}>
                    <motion.rect x={node.x - NODE_W / 2} y={node.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={6}
                      animate={{ fill, stroke, strokeWidth, opacity: nodeOpacity }} transition={{ duration: 0.25 }} />
                    <motion.text x={node.x} y={node.y + (isReaction ? 5 : 1)} textAnchor="middle" fontSize={isReaction ? 14 : 10}
                      fontFamily="var(--font-mono)" fontWeight={status === 'visiting' ? 600 : 500}
                      animate={{ fill: textFill, opacity: nodeOpacity }} transition={{ duration: 0.25 }}
                      style={{ textDecoration: status === 'deleted' ? 'line-through' : 'none' }}>
                      {node.label}
                    </motion.text>
                    {!isReaction && (
                      <motion.text x={node.x} y={node.y + 12} textAnchor="middle" fontSize={7} fontFamily="var(--font-mono)"
                        animate={{ fill: status === 'visiting' ? bg : status === 'deleted' ? dangerMuted : mutedFg }}
                        transition={{ duration: 0.25 }}>
                        {node.table}
                      </motion.text>
                    )}
                    <AnimatePresence>
                      {status === 'orphaned' && (
                        <motion.g key="orphan-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <rect x={node.x + NODE_W / 2 - 6} y={node.y - NODE_H / 2 - 6} width={14} height={13} rx={3} fill={danger} />
                          <text x={node.x + NODE_W / 2 + 1} y={node.y - NODE_H / 2 + 4.5} textAnchor="middle" fontSize={8} fontWeight={700} fontFamily="var(--font-mono)" fill="#fff">!</text>
                        </motion.g>
                      )}
                      {status === 'deleted' && (
                        <motion.g key="del-badge" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.85, scale: 1 }} exit={{ opacity: 0 }}>
                          <rect x={node.x + NODE_W / 2 - 6} y={node.y - NODE_H / 2 - 6} width={24} height={13} rx={3} fill={dangerMuted} />
                          <text x={node.x + NODE_W / 2 + 6} y={node.y - NODE_H / 2 + 4} textAnchor="middle" fontSize={7} fontWeight={700} fontFamily="var(--font-mono)" fill={danger}>DEL</text>
                        </motion.g>
                      )}
                      {status === 'visiting' && inRecoveryPhase && !isRetryNode && (
                        <motion.g key="batch-badge" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                          <rect x={node.x + NODE_W / 2 - 6} y={node.y - NODE_H / 2 - 6} width={32} height={13} rx={3} fill={tableColor} />
                          <text x={node.x + NODE_W / 2 + 10} y={node.y - NODE_H / 2 + 4} textAnchor="middle" fontSize={6} fontWeight={700} fontFamily="var(--font-mono)" fill="#fff">BATCH</text>
                        </motion.g>
                      )}
                      {isRetryNode && (
                        <motion.g key="retry-badge" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                          <rect x={node.x + NODE_W / 2 - 6} y={node.y - NODE_H / 2 - 6} width={32} height={13} rx={3} fill={warning} />
                          <text x={node.x + NODE_W / 2 + 10} y={node.y - NODE_H / 2 + 4} textAnchor="middle" fontSize={6} fontWeight={700} fontFamily="var(--font-mono)" fill="#fff">RETRY</text>
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </g>
                );
              })}
            </svg>
          </div>
          <ZoomControls scale={transform.scale} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} colors={colors} />
        </div>

        {/* Side panel */}
        <AnimatePresence mode="wait">
          {isCrashed && (
            <motion.div
              key="crashed-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                width: 130, flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                display: 'flex', flexDirection: 'column', gap: '0.35rem',
              }}
            >
              <div style={{
                borderRadius: '0.375rem', border: `2px solid ${danger}`, background: `${danger}18`, padding: '0.5rem',
              }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: danger, marginBottom: '0.3rem', letterSpacing: '0.03em' }}>
                  CRASHED
                </div>
                <div style={{ color: mutedFg, lineHeight: 1.3, fontSize: '0.55rem' }}>
                  Cascade delete failed mid-operation
                </div>
              </div>
              <div style={{
                borderRadius: '0.375rem', border: `2px solid ${danger}`, background: `${danger}10`, padding: '0.5rem',
              }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, color: mutedFg, marginBottom: '0.25rem', letterSpacing: '0.03em' }}>
                  CORRUPTION
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: dangerMuted }}>deleted</span>
                    <span style={{ color: dangerMuted, fontWeight: 600 }}>{deletedCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: danger }}>orphaned</span>
                    <span style={{ color: danger, fontWeight: 600 }}>{orphanedCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: mutedFg }}>total</span>
                    <span style={{ color: fg, fontWeight: 600 }}>{nodes.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {inRecoveryPhase && !isRecoveryDone && (
            <motion.div
              key="recovering-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                width: 130, flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                display: 'flex', flexDirection: 'column', gap: '0.35rem',
              }}
            >
              <div style={{
                borderRadius: '0.375rem', border: `2px solid ${warning}`, background: `${warning}18`, padding: '0.5rem',
              }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: warning, marginBottom: '0.3rem', letterSpacing: '0.03em' }}>
                  RECOVERING
                </div>
                <div style={{ color: mutedFg, lineHeight: 1.3, fontSize: '0.55rem' }}>
                  Batched recovery in progress
                </div>
              </div>
              <div style={{
                borderRadius: '0.375rem', border: `2px solid ${warning}`, background: `${warning}10`, padding: '0.5rem',
              }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, color: mutedFg, marginBottom: '0.25rem', letterSpacing: '0.03em' }}>
                  PROGRESS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: dangerMuted }}>deleted</span>
                    <span style={{ color: dangerMuted, fontWeight: 600 }}>{deletedCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: warning }}>remaining</span>
                    <span style={{ color: warning, fontWeight: 600 }}>{orphanedCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: mutedFg }}>total</span>
                    <span style={{ color: fg, fontWeight: 600 }}>{nodes.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {isRecoveryDone && (
            <motion.div
              key="recovered-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                width: 130, flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                display: 'flex', flexDirection: 'column', gap: '0.35rem',
              }}
            >
              <div style={{
                borderRadius: '0.375rem', border: `2px solid ${success}`, background: `${success}18`, padding: '0.5rem',
              }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: success, marginBottom: '0.3rem', letterSpacing: '0.03em' }}>
                  RECOVERED
                </div>
                <div style={{ color: mutedFg, lineHeight: 1.3, fontSize: '0.55rem' }}>
                  All documents successfully deleted
                </div>
              </div>
              <div style={{
                borderRadius: '0.375rem', border: `2px solid ${success}`, background: `${success}10`, padding: '0.5rem',
              }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, color: mutedFg, marginBottom: '0.25rem', letterSpacing: '0.03em' }}>
                  RESULT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: success }}>deleted</span>
                    <span style={{ color: success, fontWeight: 600 }}>{nodes.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: mutedFg }}>orphaned</span>
                    <span style={{ color: mutedFg, fontWeight: 600 }}>0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: mutedFg }}>batches</span>
                    <span style={{ color: fg, fontWeight: 600 }}>{recoverySteps.filter(s => s.action === 'batch_start').length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle button */}
      {step > 0 && (
        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowLogs(l => !l)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg,
              background: 'none', border: `1px solid ${border}`, borderRadius: '0.2rem',
              padding: '0.15rem 0.4rem', cursor: 'pointer',
            }}
          >
            {showLogs ? 'Hide' : 'Show'} Logs
          </button>
        </div>
      )}

      {/* Log Console panel */}
      <AnimatePresence>
        {showLogs && step > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '0.5rem', overflow: 'hidden' }}
          >
            <LogConsole
              entries={logEntries}
              currentStep={step}
              isFinished={isFinished}
              returnValue={returnValue}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: fg,
        marginTop: '0.5rem', minHeight: '1.2em', padding: '0.3rem 0.5rem',
        borderRadius: '0.25rem',
        background: step > 0 ? muted : 'transparent',
        borderLeft: step > 0 ? `3px solid ${statusBorderColor}` : 'none',
      }}>
        {state.explanation}
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <TransportBar
          playing={playing} isFinished={isFinished} hasInteracted={hasInteracted}
          step={step} totalSteps={recoveryTotal}
          onTogglePlay={handleTogglePlay} onStep={handleStep} onReset={handleReset}
        />
      </div>
    </div>
  );
}

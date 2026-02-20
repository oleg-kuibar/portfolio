import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors, type ThemeColors } from '../useThemeColors';
import { usePanZoom } from '../usePanZoom';
import { ZoomControls } from '../ZoomControls';
import { TransportBar } from './TransportBar';
import { buildTreeFromPlaygroundData, computeTreeBounds, type PlaygroundData } from './tree-builders';
import { buildCascadeSteps, computeCascadeState, type TreeNode, type CascadeStep, type StepState } from './cascade-logic';
import { getSimpleTableColor, type SimpleTableType } from './cascade-colors';
import { buildCascadeLogEntries } from './log-entries';
import { LogConsole } from './LogConsole';

const NODE_W = 94;
const NODE_H = 34;

interface CascadeVizProps {
  data: PlaygroundData;
}

export function CascadeViz({ data }: CascadeVizProps) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const colors = useThemeColors();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { containerRef, transform, transformStyle, isPanning, handlers: panZoomHandlers, resetView, zoomIn, zoomOut } = usePanZoom();

  // Build tree
  const { nodes, nodeMap, cascadeSteps, cascadeTotal, logEntries, viewBox } = useMemo(() => {
    const treeNodes = buildTreeFromPlaygroundData(data);
    if (treeNodes.length === 0) return { nodes: [] as TreeNode[], nodeMap: {} as Record<string, TreeNode>, cascadeSteps: [] as CascadeStep[], cascadeTotal: 0, logEntries: [], viewBox: '0 0 700 360' };
    const nm: Record<string, TreeNode> = {};
    for (const n of treeNodes) nm[n.id] = n;
    const cs = buildCascadeSteps(nm, treeNodes[0].id);
    const le = buildCascadeLogEntries(cs, treeNodes, nm);
    const bounds = computeTreeBounds(treeNodes);
    const vb = `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`;
    return { nodes: treeNodes, nodeMap: nm, cascadeSteps: cs, cascadeTotal: cs.length, logEntries: le, viewBox: vb };
  }, [data]);

  const isFinished = step >= cascadeTotal;
  const state = nodes.length > 0
    ? computeCascadeState(step, cascadeSteps, nodes, nodeMap)
    : { statuses: {}, visited: [], stack: [], explanation: '', activeEdge: null } as StepState;

  // Play interval
  useEffect(() => {
    if (playing && !isFinished && nodes.length > 0) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s + 1 > cascadeTotal) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 700);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, isFinished, cascadeTotal, nodes.length]);

  useEffect(() => { if (isFinished) setPlaying(false); }, [isFinished]);
  useEffect(() => { setStep(0); setPlaying(false); }, [data]);
  useEffect(() => { resetView(); }, [data, resetView]);

  // Auto-open logs when animation first starts
  useEffect(() => { if (step > 0 && !showLogs) setShowLogs(true); }, [step > 0]);

  const handleReset = useCallback(() => { setHasInteracted(true); setPlaying(false); setStep(0); }, []);
  const handleStep = useCallback(() => { setHasInteracted(true); setPlaying(false); setStep(s => Math.min(s + 1, cascadeTotal)); }, [cascadeTotal]);
  const handleTogglePlay = useCallback(() => {
    setHasInteracted(true);
    if (isFinished) { setStep(0); setPlaying(true); } else { setPlaying(p => !p); }
  }, [isFinished]);
  const handleScrub = useCallback((s: number) => { setHasInteracted(true); setPlaying(false); setStep(s); }, []);

  if (!colors || nodes.length === 0) return null;

  const { foreground: fg, mutedFg, border, accent, background: bg, muted, primary, secondary, danger, dangerMuted } = colors;
  const deletedCount = Object.values(state.statuses).filter(s => s === 'deleted').length;

  return (
    <div className="mermaid-container">
      {/* SVG visualization */}
      <div
        ref={containerRef}
        {...panZoomHandlers}
        style={{
          overflow: 'hidden',
          position: 'relative',
          minHeight: '280px',
          touchAction: 'none',
          cursor: isPanning ? 'grabbing' : 'grab',
        }}
      >
        <div style={{ transform: transformStyle, transformOrigin: '0 0' }}>
          <svg viewBox={viewBox} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Cascade delete visualization">
            <defs>
              <filter id="glow-cascade" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {nodes.map(node =>
              node.children.map(childId => {
                const child = nodeMap[childId];
                if (!child) return null;
                const parentDeleted = state.statuses[node.id] === 'deleted';
                const childDeleted = state.statuses[childId] === 'deleted';
                const isActive = state.activeEdge?.from === node.id && state.activeEdge?.to === childId;
                const isTraversed = state.visited.includes(node.id) && state.visited.includes(childId);

                const x1 = node.x; const y1 = node.y + NODE_H / 2;
                const x2 = child.x; const y2 = child.y - NODE_H / 2;
                const yMid = y1 + (y2 - y1) * 0.5;

                const edgeColor = isActive ? accent
                  : isTraversed && !parentDeleted ? getSimpleTableColor(node.table as SimpleTableType, colors)
                  : border;

                return (
                  <g key={`edge-${node.id}-${childId}`}>
                    <motion.path
                      d={`M ${x1} ${y1} L ${x1} ${yMid} L ${x2} ${yMid} L ${x2} ${y2}`}
                      fill="none"
                      stroke={edgeColor}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      animate={{
                        opacity: parentDeleted && childDeleted ? 0.15 : 1,
                        stroke: edgeColor,
                        strokeWidth: isActive ? 2.5 : 1.5,
                      }}
                      transition={{ duration: 0.25 }}
                    />
                    {isActive && (
                      <motion.circle
                        r={3} fill={accent}
                        animate={{ cx: [x1, x1, x2, x2], cy: [y1, yMid, yMid, y2] }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Nodes */}
            {nodes.map(node => {
              const status = state.statuses[node.id];
              const tableColor = getSimpleTableColor(node.table as SimpleTableType, colors);
              const isReaction = node.table === 'reactions';

              let fill = muted; let stroke = tableColor; let strokeWidth = 2; let textFill = fg;
              let nodeOpacity = 1; let labelDecoration = 'none';

              if (status === 'visiting') {
                fill = tableColor; stroke = fg; strokeWidth = 2.5; textFill = bg;
              } else if (status === 'deleted') {
                fill = `${dangerMuted}20`; stroke = dangerMuted; strokeWidth = 1.5;
                textFill = dangerMuted; labelDecoration = 'line-through'; nodeOpacity = 0.7;
              }

              return (
                <g key={node.id}>
                  {status === 'visiting' && (
                    <motion.rect
                      x={node.x - NODE_W / 2 - 4} y={node.y - NODE_H / 2 - 4}
                      width={NODE_W + 8} height={NODE_H + 8} rx={10}
                      fill="none" stroke={tableColor}
                      initial={{ opacity: 0.6, strokeWidth: 2 }}
                      animate={{ opacity: [0.6, 0], strokeWidth: [2, 0.5], scale: [1, 1.08] }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  )}
                  <motion.rect
                    x={node.x - NODE_W / 2} y={node.y - NODE_H / 2}
                    width={NODE_W} height={NODE_H} rx={6}
                    animate={{ fill, stroke, strokeWidth, opacity: nodeOpacity }}
                    transition={{ duration: 0.25 }}
                  />
                  <motion.text
                    x={node.x} y={node.y + (isReaction ? 5 : 1)}
                    textAnchor="middle" fontSize={isReaction ? 14 : 10}
                    fontFamily="var(--font-mono)" fontWeight={status === 'visiting' ? 600 : 500}
                    animate={{ fill: textFill, opacity: nodeOpacity }}
                    transition={{ duration: 0.25 }}
                    style={{ textDecoration: labelDecoration }}
                  >
                    {node.label}
                  </motion.text>
                  {!isReaction && (
                    <motion.text
                      x={node.x} y={node.y + 12}
                      textAnchor="middle" fontSize={7} fontFamily="var(--font-mono)"
                      animate={{
                        fill: status === 'visiting' ? bg : status === 'deleted' ? dangerMuted : mutedFg,
                        opacity: status === 'deleted' ? 0.5 : 0.7,
                      }}
                      transition={{ duration: 0.25 }}
                    >
                      {node.table}
                    </motion.text>
                  )}
                  <AnimatePresence>
                    {status === 'visiting' && (
                      <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                        <rect x={node.x + NODE_W / 2 - 6} y={node.y - NODE_H / 2 - 6} width={28} height={13} rx={3} fill={tableColor} />
                        <text x={node.x + NODE_W / 2 + 8} y={node.y - NODE_H / 2 + 4} textAnchor="middle" fontSize={7} fontWeight={700} fontFamily="var(--font-mono)" fill={bg}>BFS</text>
                      </motion.g>
                    )}
                    {status === 'discovered' && (
                      <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                        <rect x={node.x + NODE_W / 2 - 6} y={node.y - NODE_H / 2 - 6} width={34} height={13} rx={3} fill={accent} />
                        <text x={node.x + NODE_W / 2 + 11} y={node.y - NODE_H / 2 + 4} textAnchor="middle" fontSize={7} fontWeight={700} fontFamily="var(--font-mono)" fill={bg}>FOUND</text>
                      </motion.g>
                    )}
                    {status === 'deleted' && (
                      <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.85, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <rect x={node.x + NODE_W / 2 - 6} y={node.y - NODE_H / 2 - 6} width={24} height={13} rx={3} fill={dangerMuted} />
                        <text x={node.x + NODE_W / 2 + 6} y={node.y - NODE_H / 2 + 4} textAnchor="middle" fontSize={7} fontWeight={700} fontFamily="var(--font-mono)" fill={danger}>DEL</text>
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

      {/* Toggle buttons */}
      {step > 0 && (
        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          <button
            onClick={() => setShowQueue(q => !q)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg,
              background: 'none', border: `1px solid ${border}`, borderRadius: '0.2rem',
              padding: '0.15rem 0.4rem', cursor: 'pointer',
            }}
          >
            {showQueue ? 'Hide' : 'Show'} BFS Queue
          </button>
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

      {/* BFS Queue panel (collapsed by default) */}
      <AnimatePresence>
        {showQueue && step > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: '0.5rem',
              display: 'flex',
              gap: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              overflow: 'hidden',
            }}
          >
            <div style={{
              flex: 1, borderRadius: '0.375rem', border: `1.5px solid ${border}`,
              background: bg, padding: '0.4rem 0.5rem',
            }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, color: mutedFg, marginBottom: '0.3rem', letterSpacing: '0.03em' }}>
                BFS QUEUE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {state.stack.length === 0 ? (
                  <span style={{ color: mutedFg, opacity: 0.5, fontStyle: 'italic' }}>
                    {isFinished ? 'empty' : 'waiting...'}
                  </span>
                ) : (
                  [...state.stack].reverse().map((id, i) => {
                    const node = nodeMap[id];
                    if (!node) return null;
                    return (
                      <div key={`q-${id}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.1rem 0.2rem' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: getSimpleTableColor(node.table as SimpleTableType, colors) }} />
                        <span style={{ color: i === 0 ? fg : mutedFg, fontWeight: i === 0 ? 600 : 400 }}>{node.label}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div style={{
              flex: 1, borderRadius: '0.375rem', border: `1.5px solid ${border}`,
              background: bg, padding: '0.4rem 0.5rem',
            }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, color: mutedFg, marginBottom: '0.3rem', letterSpacing: '0.03em' }}>
                PROGRESS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: mutedFg }}>visited</span>
                  <span style={{ color: fg, fontWeight: 600 }}>{state.visited.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: dangerMuted }}>deleted</span>
                  <span style={{ color: dangerMuted, fontWeight: 600 }}>{deletedCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: mutedFg }}>remaining</span>
                  <span style={{ color: fg, fontWeight: 600 }}>{nodes.length - deletedCount}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              returnValue={isFinished ? {
                type: 'sync',
                operationId: '1708167234567_a7b9c2',
                totalDeleted: nodes.length,
                deletedByTable: Object.fromEntries(
                  [...new Set(nodes.map(n => n.table))].map(t => [t, nodes.filter(n => n.table === t).length]),
                ),
                dryRun: false,
                softDelete: false,
              } : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status explanation */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: fg,
        marginTop: '0.5rem', minHeight: '1.2em', padding: '0.3rem 0.5rem',
        borderRadius: '0.25rem',
        background: step > 0 ? muted : 'transparent',
        borderLeft: step > 0 ? `3px solid ${accent}` : 'none',
        transition: 'all 0.2s ease',
      }}>
        {state.explanation}
      </div>

      {/* Transport bar */}
      <div style={{ marginTop: '0.5rem' }}>
        <TransportBar
          playing={playing}
          isFinished={isFinished}
          hasInteracted={hasInteracted}
          step={step}
          totalSteps={cascadeTotal}
          onTogglePlay={handleTogglePlay}
          onStep={handleStep}
          onReset={handleReset}
          onScrub={handleScrub}
        />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
        <LegendDot color={primary} label="users" />
        <LegendDot color={secondary} label="posts" />
        <LegendDot color={accent} label="comments" />
        <LegendDot color={mutedFg} label="reactions" />
        <LegendDot color={dangerMuted} label="deleted" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
      <svg width={10} height={10}><circle cx={5} cy={5} r={4} fill={color} /></svg>
      <span style={{ color }}>{label}</span>
    </div>
  );
}

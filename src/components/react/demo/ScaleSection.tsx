import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../../convex/_generated/api';
import { useThemeColors } from '../useThemeColors';
import { useSessionId } from '../useSessionId';
import { usePanZoom } from '../usePanZoom';
import { ZoomControls } from '../ZoomControls';
import { SectionHeader } from './SectionHeader';
import { TransportBar } from './TransportBar';
import { SegmentedControl } from './SegmentedControl';
import { buildTreeFromScaleData } from './tree-builders';
import { layoutTree, SCALE_NODE_W, SCALE_NODE_H } from './tree-layout';
import {
  buildCascadeSteps, computeCascadeState,
  type TreeNode, type CascadeStep, type StepState, type NodeStatus,
} from './cascade-logic';
import {
  getScaleTableColor, SCALE_TABLE_LABELS, SCALE_TABLE_ORDER,
  type ScaleTableType,
} from './cascade-colors';
import { formatConvexError } from './format-error';
import { useAutoPlay } from '../../../hooks/useAutoPlay';

type SpeedMode = 'watch' | 'instant';
type ScaleMode = 'animation' | 'tryit';

export function ScaleSection() {
  const sessionId = useSessionId();
  const colors = useThemeColors();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('watch');
  const [autoSeeded, setAutoSeeded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { containerRef, transform, transformStyle, isPanning, handlers: panZoomHandlers, resetView, zoomIn, zoomOut } = usePanZoom();

  // Mode toggle
  const [scaleMode, setScaleMode] = useState<ScaleMode>('animation');

  // Try-it state
  const [selectedNode, setSelectedNode] = useState<{ table: string; id: string } | null>(null);
  const [tryItLoading, setTryItLoading] = useState<string | null>(null);
  const [tryItError, setTryItError] = useState<string | null>(null);
  const [previewPlan, setPreviewPlan] = useState<Array<{ table: string; documentId: string }> | null>(null);

  // Click-vs-pan guard
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const data = useQuery(api.functions.listAllScale);
  const seedMutation = useMutation(api.functions.seedScale);
  const previewMutation = useMutation(api.functions.previewCascade);
  const deleteMutation = useMutation(api.functions.deleteWithCascade);
  const clearScaleMutation = useMutation(api.functions.clearScale);

  const isEmpty = data && data.orgs.length === 0;
  const hasData = data && data.orgs.length > 0;

  // Auto-seed on first visit
  useEffect(() => {
    if (isEmpty && !autoSeeded) {
      setAutoSeeded(true);
      seedMutation({ sessionId }).catch(() => {});
    }
  }, [isEmpty, autoSeeded, seedMutation, sessionId]);

  // Build tree
  const { nodes, nodeMap, cascadeSteps, totalCascadeSteps, viewBox } = useMemo(() => {
    const empty = { nodes: [] as TreeNode[], nodeMap: {} as Record<string, TreeNode>, cascadeSteps: [] as CascadeStep[], totalCascadeSteps: 0, viewBox: { x: 0, y: 0, w: 700, h: 400 } };
    if (!hasData) return empty;
    const treeNodes = buildTreeFromScaleData(data);
    if (treeNodes.length === 0) return empty;
    const { nodeMap: nm, viewBox: vb } = layoutTree(treeNodes);
    const cs = buildCascadeSteps(nm, treeNodes[0].id);
    return { nodes: treeNodes, nodeMap: nm, cascadeSteps: cs, totalCascadeSteps: cs.length, viewBox: vb };
  }, [data, hasData]);

  const isFinished = step >= totalCascadeSteps;

  // Animation state
  const animState = nodes.length > 0
    ? computeCascadeState(step, cascadeSteps, nodes, nodeMap, SCALE_TABLE_LABELS as Record<string, string>)
    : { statuses: {}, visited: [], stack: [], explanation: '', activeEdge: null } as StepState;

  // Try-it status computation
  const tryItStatuses = useMemo<Record<string, NodeStatus>>(() => {
    if (scaleMode !== 'tryit') return {};
    const statuses: Record<string, NodeStatus> = {};
    for (const n of nodes) statuses[n.id] = 'idle';
    if (selectedNode) statuses[selectedNode.id] = 'visiting';
    if (previewPlan) {
      for (const entry of previewPlan) {
        if (statuses[entry.documentId] !== undefined && entry.documentId !== selectedNode?.id) {
          statuses[entry.documentId] = 'discovered';
        }
      }
    }
    return statuses;
  }, [scaleMode, nodes, selectedNode, previewPlan]);

  // Merge state depending on mode
  const state: StepState = scaleMode === 'animation'
    ? animState
    : {
        statuses: tryItStatuses,
        visited: [],
        stack: [],
        explanation: !selectedNode
          ? 'Click any node to select it, then Dry Run or Cascade Delete'
          : previewPlan
            ? `Would delete ${previewPlan.length} documents across ${new Set(previewPlan.map(e => e.table)).size} tables`
            : `Selected: ${nodeMap[selectedNode.id]?.label || '...'} (${SCALE_TABLE_LABELS[selectedNode.table as ScaleTableType] || selectedNode.table})`,
        activeEdge: null,
      };

  // Auto-play on scroll (animation mode only)
  const sectionRef = useAutoPlay(
    useCallback(() => {
      if (nodes.length > 0 && !hasInteracted && scaleMode === 'animation') {
        setPlaying(true);
      }
    }, [nodes.length, hasInteracted, scaleMode]),
    { enabled: nodes.length > 0 && !hasInteracted && scaleMode === 'animation' },
  );

  // Play interval
  useEffect(() => {
    if (playing && !isFinished && nodes.length > 0 && scaleMode === 'animation') {
      const ms = speedMode === 'instant' ? 30 : 350;
      const perTick = speedMode === 'instant' ? 3 : 1;
      intervalRef.current = setInterval(() => {
        setStep(s => {
          const next = Math.min(s + perTick, totalCascadeSteps);
          if (next >= totalCascadeSteps) setPlaying(false);
          return next;
        });
      }, ms);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, isFinished, totalCascadeSteps, speedMode, nodes.length, scaleMode]);

  useEffect(() => { if (isFinished) setPlaying(false); }, [isFinished]);
  useEffect(() => { setStep(0); setPlaying(false); }, [data]);
  useEffect(() => { resetView(); }, [data, resetView]);

  // Clear try-it state when data changes
  useEffect(() => {
    setSelectedNode(null);
    setPreviewPlan(null);
    setTryItError(null);
  }, [data]);

  // Animation handlers
  const handleReset = useCallback(() => { setHasInteracted(true); setPlaying(false); setStep(0); }, []);
  const handleStep = useCallback(() => { setHasInteracted(true); setPlaying(false); setStep(s => Math.min(s + 1, totalCascadeSteps)); }, [totalCascadeSteps]);
  const handleTogglePlay = useCallback(() => {
    setHasInteracted(true);
    if (isFinished) { setStep(0); setPlaying(true); } else { setPlaying(p => !p); }
  }, [isFinished]);
  const handleScrub = useCallback((s: number) => { setHasInteracted(true); setPlaying(false); setStep(s); }, []);

  // Mode switch handler
  const handleModeChange = useCallback((mode: ScaleMode) => {
    setScaleMode(mode);
    setHasInteracted(true);
    if (mode === 'tryit') {
      setPlaying(false);
      setStep(0);
    } else {
      setSelectedNode(null);
      setPreviewPlan(null);
      setTryItError(null);
      setStep(0);
    }
  }, []);

  // Try-it node click — hit-test at container level to avoid setPointerCapture conflict
  const svgRef = useRef<SVGSVGElement>(null);
  const handleContainerPointerUp = useCallback((e: React.PointerEvent) => {
    if (scaleMode !== 'tryit' || nodes.length === 0) return;
    const start = pointerStartRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.sqrt(dx * dx + dy * dy) >= 5) return; // was a pan, not a click

    // Convert screen coords to SVG coords
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgPt = pt.matrixTransform(ctm.inverse());

    // Hit-test against node bounding boxes
    const halfW = SCALE_NODE_W / 2;
    const halfH = SCALE_NODE_H / 2;
    for (const node of nodes) {
      if (
        svgPt.x >= node.x - halfW && svgPt.x <= node.x + halfW &&
        svgPt.y >= node.y - halfH && svgPt.y <= node.y + halfH
      ) {
        setPreviewPlan(null);
        setTryItError(null);
        setSelectedNode(prev =>
          prev?.id === node.id ? null : { table: node.table, id: node.id }
        );
        return;
      }
    }
    // Clicked empty space — deselect
    setSelectedNode(null);
    setPreviewPlan(null);
  }, [scaleMode, nodes]);

  // Try-it handlers
  const handleDryRun = useCallback(async () => {
    if (!selectedNode) return;
    setTryItLoading('preview');
    setTryItError(null);
    try {
      const res = await previewMutation({ table: selectedNode.table, id: selectedNode.id, sessionId }) as any;
      setPreviewPlan(res.plan || []);
    } catch (e: any) {
      setTryItError(formatConvexError(e, 'Preview failed'));
    } finally {
      setTryItLoading(null);
    }
  }, [selectedNode, previewMutation, sessionId]);

  const handleCascadeDelete = useCallback(async () => {
    if (!selectedNode) return;
    setTryItLoading('delete');
    setTryItError(null);
    try {
      await deleteMutation({ table: selectedNode.table, id: selectedNode.id, sessionId });
      setSelectedNode(null);
      setPreviewPlan(null);
    } catch (e: any) {
      setTryItError(formatConvexError(e, 'Delete failed'));
    } finally {
      setTryItLoading(null);
    }
  }, [selectedNode, deleteMutation, sessionId]);

  const handleResetScale = useCallback(async () => {
    setTryItLoading('reset');
    setTryItError(null);
    setSelectedNode(null);
    setPreviewPlan(null);
    try {
      await clearScaleMutation({ sessionId });
      await seedMutation({ sessionId });
    } catch (e: any) {
      setTryItError(formatConvexError(e, 'Reset failed'));
    } finally {
      setTryItLoading(null);
    }
  }, [clearScaleMutation, seedMutation, sessionId]);

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, accent, background: bg, muted, danger, dangerMuted, success, warning } = colors;

  // Metrics
  const bfsRounds = cascadeSteps.filter(s => s.action === 'visit').length;
  const tableCount = new Set(nodes.map(n => n.table)).size;

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
    opacity: tryItLoading ? 0.6 : 1,
  };

  return (
    <section ref={sectionRef} style={{ marginBottom: '4rem' }}>
      <SectionHeader
        title="At Scale"
        subtitle="A real-world SaaS schema with 11 tables across 10 levels of nesting. BFS discovers dependents level-by-level with parallel queries, then deletes in reverse order."
        id="scale"
      />

      <div className="mermaid-container">
        {/* Top controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <SegmentedControl
            value={scaleMode}
            options={[
              { value: 'animation', label: 'Animation' },
              { value: 'tryit', label: 'Try it' },
            ]}
            onChange={handleModeChange}
          />
          {scaleMode === 'animation' && (
            <SegmentedControl
              value={speedMode}
              options={[
                { value: 'watch', label: 'Watch' },
                { value: 'instant', label: 'Instant' },
              ]}
              onChange={(v) => { setHasInteracted(true); setSpeedMode(v); }}
            />
          )}
          {hasData && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg }}>
              {nodes.length} documents
            </span>
          )}
        </div>

        {/* Error (try-it mode) */}
        <AnimatePresence>
          {tryItError && scaleMode === 'tryit' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{
                marginBottom: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.25rem',
                border: `2px solid ${danger}`, background: `${danger}18`, color: danger,
                fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
              <span>{tryItError}</span>
              <button onClick={() => setTryItError(null)} style={{ background: 'none', border: 'none', color: danger, cursor: 'pointer' }}>x</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SVG container */}
        <div
          ref={containerRef}
          {...panZoomHandlers}
          onPointerDown={(e) => {
            pointerStartRef.current = { x: e.clientX, y: e.clientY };
            panZoomHandlers.onPointerDown?.(e);
          }}
          onPointerUp={(e) => {
            panZoomHandlers.onPointerUp?.(e);
            handleContainerPointerUp(e);
          }}
          style={{
            overflow: 'hidden', borderRadius: '0.375rem', border: `1.5px solid ${border}`,
            background: bg, maxHeight: '500px', position: 'relative', touchAction: 'none',
            cursor: isPanning ? 'grabbing' : scaleMode === 'tryit' ? 'crosshair' : 'grab',
          }}
        >
          {!data ? (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: mutedFg, padding: '3rem 0', textAlign: 'center', cursor: 'default' }}>
              Connecting to Convex...
            </div>
          ) : isEmpty ? (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: mutedFg, padding: '3rem 0', textAlign: 'center', cursor: 'default' }}>
              Seeding documents across 11 tables...
            </div>
          ) : (
            <div style={{ transform: transformStyle, transformOrigin: '0 0' }}>
              <svg
                ref={svgRef}
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                style={{ width: '100%', minWidth: `${Math.max(700, viewBox.w * 0.8)}px`, height: 'auto', display: 'block' }}
              >
                {/* Edges */}
                {nodes.map(node =>
                  node.children.map(childId => {
                    const child = nodeMap[childId];
                    const parentDeleted = state.statuses[node.id] === 'deleted';
                    const childDeleted = state.statuses[childId] === 'deleted';
                    const isActive = state.activeEdge?.from === node.id && state.activeEdge?.to === childId;
                    // In try-it mode, highlight edges to discovered nodes
                    const isPreviewEdge = scaleMode === 'tryit' && previewPlan &&
                      (state.statuses[childId] === 'discovered' || state.statuses[childId] === 'visiting');
                    return (
                      <line key={`e-${node.id}-${childId}`}
                        x1={node.x} y1={node.y + SCALE_NODE_H / 2} x2={child.x} y2={child.y - SCALE_NODE_H / 2}
                        stroke={isActive ? accent : isPreviewEdge ? `${danger}80` : border}
                        strokeWidth={isActive ? 2 : isPreviewEdge ? 1.2 : 0.8}
                        opacity={parentDeleted && childDeleted ? 0.15 : 0.6}
                        style={{ transition: 'all 0.15s ease' }}
                      />
                    );
                  })
                )}

                {/* Nodes */}
                {nodes.map(node => {
                  const status = state.statuses[node.id];
                  const tableColor = getScaleTableColor(node.table as ScaleTableType, colors);

                  let fill = muted; let stroke = tableColor; let strokeWidth = 1.5;
                  let textFill = fg; let nodeOpacity = 1;

                  if (status === 'visiting') { fill = tableColor; stroke = fg; strokeWidth = 2; textFill = bg; }
                  else if (status === 'discovered' && scaleMode === 'tryit') { fill = `${tableColor}`; stroke = danger; strokeWidth = 1.5; textFill = bg; nodeOpacity = 0.8; }
                  else if (status === 'deleted') { fill = `${dangerMuted}20`; stroke = dangerMuted; strokeWidth = 1; textFill = dangerMuted; nodeOpacity = 0.5; }

                  return (
                    <g key={node.id}
                      style={{ cursor: scaleMode === 'tryit' ? 'pointer' : undefined }}
                    >
                      {status === 'visiting' && (
                        <motion.rect
                          x={node.x - SCALE_NODE_W / 2 - 3} y={node.y - SCALE_NODE_H / 2 - 3}
                          width={SCALE_NODE_W + 6} height={SCALE_NODE_H + 6} rx={7}
                          fill="none" stroke={tableColor}
                          initial={{ opacity: 0.6, strokeWidth: 1.5 }}
                          animate={{ opacity: [0.6, 0], strokeWidth: [1.5, 0.3], scale: [1, 1.06] }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      )}
                      <rect x={node.x - SCALE_NODE_W / 2} y={node.y - SCALE_NODE_H / 2}
                        width={SCALE_NODE_W} height={SCALE_NODE_H} rx={4}
                        fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={nodeOpacity}
                        style={{ transition: 'all 0.15s ease' }}
                      />
                      <text x={node.x} y={node.y - 1} textAnchor="middle" fontSize={7}
                        fontFamily="var(--font-mono)" fontWeight={status === 'visiting' ? 600 : 400}
                        fill={textFill} opacity={nodeOpacity}
                        style={{ transition: 'fill 0.15s ease', textDecoration: status === 'deleted' ? 'line-through' : 'none', pointerEvents: 'none' }}>
                        {node.label}
                      </text>
                      <text x={node.x} y={node.y + 7} textAnchor="middle" fontSize={5}
                        fontFamily="var(--font-mono)"
                        fill={status === 'visiting' ? bg : status === 'discovered' && scaleMode === 'tryit' ? bg : status === 'deleted' ? dangerMuted : mutedFg}
                        opacity={status === 'deleted' ? 0.4 : 0.6}
                        style={{ transition: 'fill 0.15s ease', pointerEvents: 'none' }}>
                        {SCALE_TABLE_LABELS[node.table as ScaleTableType] || node.table}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
          {hasData && (
            <ZoomControls scale={transform.scale} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} colors={colors} />
          )}
        </div>

        {/* Metrics overlay after completion (animation mode only) */}
        {scaleMode === 'animation' && isFinished && hasData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              marginTop: '0.75rem',
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              padding: '0.6rem 0.75rem',
              borderRadius: '0.375rem',
              border: `2px solid ${success}60`,
              background: `${success}12`,
            }}
          >
            {[
              { label: 'docs', value: nodes.length },
              { label: 'tables', value: tableCount },
              { label: 'BFS rounds', value: bfsRounds },
              { label: 'orphans', value: 0 },
            ].map(m => (
              <div key={m.label} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                <span style={{ color: success, fontWeight: 700, fontSize: '0.9rem' }}>{m.value}</span>
                <span style={{ color: mutedFg, marginLeft: '0.3rem' }}>{m.label}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Status */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: fg,
          marginTop: '0.5rem', minHeight: '1.6em', padding: '0.3rem 0.5rem',
          borderRadius: '0.25rem', background: muted,
          borderLeft: `3px solid ${scaleMode === 'animation' && step > 0 ? accent : scaleMode === 'tryit' && selectedNode ? accent : 'transparent'}`,
        }}>
          {state.explanation}
        </div>

        {/* Bottom bar: mode-specific */}
        <div style={{ marginTop: '0.5rem' }}>
          {scaleMode === 'animation' ? (
            <TransportBar
              playing={playing} isFinished={isFinished} hasInteracted={hasInteracted}
              step={step} totalSteps={totalCascadeSteps}
              onTogglePlay={handleTogglePlay} onStep={handleStep} onReset={handleReset} onScrub={handleScrub}
            />
          ) : (
            <div style={{
              display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center',
              border: `1.5px solid ${border}`, borderRadius: '0.375rem', padding: '0.4rem 0.5rem', background: muted,
            }}>
              <button
                onClick={handleDryRun}
                disabled={!!tryItLoading || !selectedNode}
                style={{ ...btnStyle, opacity: !selectedNode || tryItLoading ? 0.4 : 1 }}
              >
                {tryItLoading === 'preview' ? 'Previewing...' : 'Dry Run'}
              </button>
              <button
                onClick={handleCascadeDelete}
                disabled={!!tryItLoading || !selectedNode}
                style={{
                  ...btnStyle,
                  borderColor: selectedNode ? danger : border,
                  color: selectedNode ? danger : fg,
                  opacity: !selectedNode || tryItLoading ? 0.4 : 1,
                }}
              >
                {tryItLoading === 'delete' ? 'Deleting...' : 'Cascade Delete'}
              </button>
              <div style={{ width: 1, height: '1.25rem', background: border, flexShrink: 0 }} />
              <button
                onClick={handleResetScale}
                disabled={!!tryItLoading}
                style={btnStyle}
              >
                {tryItLoading === 'reset' ? 'Resetting...' : 'Reset DB'}
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
          {SCALE_TABLE_ORDER.map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>
              <svg width={8} height={8}><circle cx={4} cy={4} r={3} fill={getScaleTableColor(t, colors)} /></svg>
              <span style={{ color: getScaleTableColor(t, colors) }}>{SCALE_TABLE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

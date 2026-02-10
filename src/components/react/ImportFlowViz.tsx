import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors, type ThemeColors } from './useThemeColors';
import { PlayButton } from './PlayButton';

type Scenario = 'unchanged' | 'changed';
type ItemStatus = 'pending' | 'hashing' | 'comparing' | 'queued' | 'finding' | 'deciding' | 'created' | 'updated' | 'unchanged' | 'skipped';

interface ItemState {
  id: number;
  status: ItemStatus;
  label: string;
}

const ITEM_LABELS_CHANGED = [
  { finalStatus: 'created' as const, label: 'New item' },
  { finalStatus: 'updated' as const, label: 'Price changed' },
  { finalStatus: 'unchanged' as const, label: 'Same data' },
  { finalStatus: 'unchanged' as const, label: 'Same data' },
  { finalStatus: 'updated' as const, label: 'Stats changed' },
  { finalStatus: 'unchanged' as const, label: 'Same data' },
  { finalStatus: 'unchanged' as const, label: 'Same data' },
  { finalStatus: 'unchanged' as const, label: 'Same data' },
];

const UNCHANGED_TOTAL_STEPS = 3;
const CHANGED_TOTAL_STEPS = 2 + 8 * 3 + 1;

// Box dimensions
const BOX_W = 60;
const BOX_H = 50;
const SMALL_W = 54;
const SMALL_H = 22;

// Pipeline stage positions (SVG viewBox coords)
const STAGES = {
  incoming:   { x: 70,  y: 72 },
  hash:       { x: 200, y: 72 },
  compare:    { x: 340, y: 72 },
  upsert:     { x: 490, y: 72 },
  result:     { x: 640, y: 72 },
  allSkipped: { x: 340, y: 190 },
  // Detail panel nodes (2 rows: row1 y=158, row2 y=210)
  find:       { x: 415, y: 158 },
  exists:     { x: 530, y: 158 },
  insert:     { x: 650, y: 158 },
  shallowEq:  { x: 530, y: 210 },
  patch:      { x: 650, y: 210 },
};

// Dedicated slot positions where dots land in the detail panel.
// These are visible as dashed placeholder circles so the transition target is clear.
const SLOTS = {
  find:   { x: STAGES.find.x + SMALL_W / 2 + 12, y: STAGES.find.y },       // right of Find node
  insert: { x: STAGES.insert.x + SMALL_W / 2 + 12, y: STAGES.insert.y },   // right of Insert node
  patch:  { x: STAGES.patch.x + SMALL_W / 2 + 12, y: STAGES.patch.y },     // right of Patch node
  skip:   { x: STAGES.shallowEq.x, y: STAGES.shallowEq.y + 34 },          // below Equal? node
};

type Colors = ThemeColors;

function getStatusColor(status: ItemStatus, colors: Colors): string {
  switch (status) {
    case 'created': return colors.primary;
    case 'updated': return colors.secondary;
    case 'unchanged': return colors.mutedFg;
    case 'skipped': return colors.mutedFg;
    case 'deciding': return colors.foreground;
    default: return colors.accent;
  }
}

function getStatusOpacity(status: ItemStatus): number {
  return status === 'skipped' ? 0.4 : 1;
}

/** Returns grid position for a dot inside a box centered at (cx, cy). */
function dotGridPos(cx: number, cy: number, index: number): { x: number; y: number } {
  const col = index % 4;
  const row = Math.floor(index / 4);
  const sp = 13;
  return {
    x: cx - 1.5 * sp + col * sp,
    y: cy - 0.5 * sp + row * sp,
  };
}

function getDotPosition(item: ItemState, scenario: Scenario): { x: number; y: number } {
  const i = item.id;
  switch (item.status) {
    case 'pending':    return dotGridPos(STAGES.incoming.x, STAGES.incoming.y, i);
    case 'hashing':    return dotGridPos(STAGES.hash.x, STAGES.hash.y, i);
    case 'comparing':  return dotGridPos(STAGES.compare.x, STAGES.compare.y, i);
    case 'queued':     return dotGridPos(STAGES.upsert.x, STAGES.upsert.y, i);
    case 'skipped':
      return scenario === 'unchanged'
        ? dotGridPos(STAGES.allSkipped.x, STAGES.allSkipped.y, i)
        : dotGridPos(STAGES.result.x, STAGES.result.y, i);
    case 'finding':
      return SLOTS.find;
    case 'deciding': {
      const cfg = ITEM_LABELS_CHANGED[i];
      if (cfg.finalStatus === 'created')   return SLOTS.insert;
      if (cfg.finalStatus === 'updated')   return SLOTS.patch;
      return SLOTS.skip;
    }
    // Resolved states → Result box
    case 'created':
    case 'updated':
    case 'unchanged':
      return dotGridPos(STAGES.result.x, STAGES.result.y, i);
    default:
      return dotGridPos(STAGES.incoming.x, STAGES.incoming.y, i);
  }
}

function computeItems(scenario: Scenario, step: number): ItemState[] {
  if (scenario === 'unchanged') {
    return Array.from({ length: 8 }, (_, i) => {
      let status: ItemStatus = 'pending';
      if (step >= 1) status = 'hashing';
      if (step >= 2) status = 'comparing';
      if (step >= 3) status = 'skipped';
      return { id: i, status, label: 'Item ' + (i + 1) };
    });
  }

  return Array.from({ length: 8 }, (_, i) => {
    const cfg = ITEM_LABELS_CHANGED[i];
    if (step === 0) return { id: i, status: 'pending' as ItemStatus, label: cfg.label };
    if (step === 1) return { id: i, status: 'hashing' as ItemStatus, label: cfg.label };
    if (step === 2) return { id: i, status: 'comparing' as ItemStatus, label: cfg.label };

    // step >= 3 — upsert loop (3 sub-steps per item: find → decide → resolve)
    const itemStart = 3 + i * 3;
    let status: ItemStatus = 'queued';
    if (step >= itemStart)     status = 'finding';
    if (step >= itemStart + 1) status = 'deciding';
    if (step >= itemStart + 2) status = cfg.finalStatus;
    return { id: i, status, label: cfg.label };
  });
}

function getStageExplanation(scenario: Scenario, step: number): string {
  if (scenario === 'unchanged') {
    if (step === 0) return 'Ready \u2014 8 items waiting to be imported';
    if (step === 1) return 'Hashing all 8 items with SHA-256\u2026';
    if (step === 2) return 'Hash matches stored version \u2014 nothing changed!';
    if (step >= 3) return 'All 8 items skipped. Zero writes.';
    return '';
  }

  if (step === 0) return 'Ready \u2014 8 items waiting to be imported';
  if (step === 1) return 'Hashing all 8 items with SHA-256\u2026';
  if (step === 2) return 'Hash differs from stored version \u2014 entering upsert loop';

  const itemStep = step - 3;
  const itemIndex = Math.floor(itemStep / 3);
  const subStep = itemStep % 3;

  if (itemIndex < 8) {
    const cfg = ITEM_LABELS_CHANGED[itemIndex];
    if (subStep === 0) return `Item ${itemIndex + 1}: Finding by index\u2026`;
    if (subStep === 1) {
      if (cfg.finalStatus === 'created')   return `Item ${itemIndex + 1}: Not found \u2192 inserting`;
      if (cfg.finalStatus === 'updated')   return `Item ${itemIndex + 1}: Exists, data differs \u2192 patching`;
      return `Item ${itemIndex + 1}: Exists, shallowEqual match \u2192 skipping`;
    }
    return `Item ${itemIndex + 1}: ${cfg.label} \u2192 ${cfg.finalStatus}`;
  }

  return 'Done! Only 3 writes out of 8 items.';
}

function computeCounters(items: ItemState[]) {
  return {
    created: items.filter(i => i.status === 'created').length,
    updated: items.filter(i => i.status === 'updated').length,
    unchanged: items.filter(i => i.status === 'unchanged').length,
    skipped: items.filter(i => i.status === 'skipped').length,
  };
}

// ─── Main Component ───────────────────────────────────────────────

export function ImportFlowViz() {
  const [scenario, setScenario] = useState<Scenario>('unchanged');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const colors = useThemeColors();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = scenario === 'unchanged' ? UNCHANGED_TOTAL_STEPS : CHANGED_TOTAL_STEPS;
  const items = computeItems(scenario, step);
  const counters = computeCounters(items);
  const explanation = getStageExplanation(scenario, step);
  const isFinished = step >= totalSteps;

  useEffect(() => {
    if (playing && !isFinished) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          const max = scenario === 'unchanged' ? UNCHANGED_TOTAL_STEPS : CHANGED_TOTAL_STEPS;
          if (s + 1 > max) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, isFinished, scenario]);

  useEffect(() => { if (isFinished) setPlaying(false); }, [isFinished]);

  const handleReset = useCallback(() => { setHasInteracted(true); setPlaying(false); setStep(0); }, []);
  const handleStep = useCallback(() => { setHasInteracted(true); setPlaying(false); setStep(s => Math.min(s + 1, totalSteps)); }, [totalSteps]);
  const handlePlay = useCallback(() => {
    setHasInteracted(true);
    if (isFinished) { setStep(0); setPlaying(true); } else { setPlaying(p => !p); }
  }, [isFinished]);
  const handleScenarioChange = useCallback((s: Scenario) => { setHasInteracted(true); setScenario(s); setStep(0); setPlaying(false); }, []);

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, accent, background: bg, muted, primary, secondary } = colors;
  const showDetail = scenario === 'changed' && step >= 3;

  // Determine which detail node to highlight
  const activeDetailItem = items.find(i => i.status === 'finding' || i.status === 'deciding');
  const activeDetailPhase = activeDetailItem?.status ?? null; // 'finding' | 'deciding' | null
  const activeOutcome = activeDetailItem ? ITEM_LABELS_CHANGED[activeDetailItem.id].finalStatus : null;

  return (
    <div className="mermaid-container my-6">
      {/* Controls bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['unchanged', 'changed'] as const).map(s => (
            <button key={s} onClick={() => handleScenarioChange(s)} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '0.25rem 0.625rem',
              borderRadius: '0.25rem', border: `2px solid ${scenario === s ? fg : border}`,
              background: scenario === s ? fg : 'transparent', color: scenario === s ? bg : fg,
              cursor: 'pointer', fontWeight: scenario === s ? 600 : 400, transition: 'all 0.15s ease',
            }}>
              {s === 'unchanged' ? 'Nothing changed' : 'Some items changed'}
            </button>
          ))}
        </div>
        <PlayButton
          playing={playing}
          finished={isFinished}
          onPlay={handlePlay}
          onStep={handleStep}
          onReset={handleReset}
          stepDisabled={isFinished}
          hasInteracted={hasInteracted}
          fg={fg} bg={bg} border={border} mutedFg={mutedFg} accent={accent}
        />
      </div>

      {/* SVG visualization */}
      <svg viewBox="0 0 700 260" style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Import flow visualization">

        {/* ── Connection arrows (main pipeline) ── */}
        <ArrowLine from={boxRight(STAGES.incoming)} to={boxLeft(STAGES.hash)} color={border} />
        <ArrowLine from={boxRight(STAGES.hash)} to={boxLeft(STAGES.compare)} color={border} />

        {scenario === 'unchanged' ? (
          <>
            <ArrowLine from={boxBottom(STAGES.compare)} to={boxTop(STAGES.allSkipped)} color={border} />
            {/* Label on the arrow */}
            <text x={STAGES.compare.x + 8} y={STAGES.compare.y + BOX_H / 2 + 18} fontSize={8} fontFamily="var(--font-mono)" fill={mutedFg}>match →</text>
            <text x={STAGES.compare.x + 8} y={STAGES.compare.y + BOX_H / 2 + 28} fontSize={8} fontFamily="var(--font-mono)" fill={mutedFg}>skip all</text>
          </>
        ) : (
          <>
            <ArrowLine from={boxRight(STAGES.compare)} to={boxLeft(STAGES.upsert)} color={border} />
            <ArrowLine from={boxRight(STAGES.upsert)} to={boxLeft(STAGES.result)} color={border} />
            {/* Label on compare→upsert arrow */}
            <text x={STAGES.compare.x + BOX_W / 2 + 10} y={STAGES.compare.y - BOX_H / 2 + 4} fontSize={8} fontFamily="var(--font-mono)" fill={mutedFg}>differs → check each</text>
          </>
        )}

        {/* ── Stage boxes with labels above ── */}
        <StageBox x={STAGES.incoming.x} y={STAGES.incoming.y} label="Incoming" active={step === 0} colors={{ fg, border, accent, bg: muted }} />
        <StageBox x={STAGES.hash.x} y={STAGES.hash.y} label="SHA-256" active={step === 1} colors={{ fg, border, accent, bg: muted }} />
        <StageBox x={STAGES.compare.x} y={STAGES.compare.y} label="Compare" active={step === 2} colors={{ fg, border, accent, bg: muted }} />

        {scenario === 'unchanged' ? (
          <StageBox x={STAGES.allSkipped.x} y={STAGES.allSkipped.y} label="All Skipped" active={step >= 3} colors={{ fg, border, accent, bg: muted }} />
        ) : (
          <>
            <StageBox x={STAGES.upsert.x} y={STAGES.upsert.y} label="Upsert Loop" active={step >= 3 && !isFinished} colors={{ fg, border, accent, bg: muted }} />
            <StageBox x={STAGES.result.x} y={STAGES.result.y} label="Result" active={isFinished} colors={{ fg, border, accent, bg: muted }} />
          </>
        )}

        {/* ── Detail panel (per-item decision tree) ── */}
        <AnimatePresence>
          {showDetail && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {/* Bounding box */}
              <rect x={385} y={128} width={310} height={128} rx={6} fill="none" stroke={border} strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
              <text x={392} y={142} fontSize={8} fontFamily="var(--font-mono)" fill={mutedFg}>per-item detail</text>

              {/* Row 1: Find → Exists → Insert */}
              <SmallNode
                x={STAGES.find.x} y={STAGES.find.y} label="Find by idx"
                fg={activeDetailPhase === 'finding' ? bg : fg}
                bg={activeDetailPhase === 'finding' ? accent : muted}
                stroke={activeDetailPhase === 'finding' ? accent : border}
                strokeW={activeDetailPhase === 'finding' ? 2.5 : 1.5}
              />
              <SmallNode x={STAGES.exists.x} y={STAGES.exists.y} label="Exists?" fg={fg} bg={muted} stroke={border} />
              <SmallNode
                x={STAGES.insert.x} y={STAGES.insert.y} label="Insert"
                fg={bg} bg={primary}
                stroke={activeDetailPhase === 'deciding' && activeOutcome === 'created' ? fg : primary}
                strokeW={activeDetailPhase === 'deciding' && activeOutcome === 'created' ? 2.5 : 1.5}
              />

              {/* Row 2: Equal? → Patch */}
              <SmallNode x={STAGES.shallowEq.x} y={STAGES.shallowEq.y} label="Equal?" fg={fg} bg={muted} stroke={border} />
              <SmallNode
                x={STAGES.patch.x} y={STAGES.patch.y} label="Patch"
                fg={bg} bg={secondary}
                stroke={activeDetailPhase === 'deciding' && activeOutcome === 'updated' ? fg : secondary}
                strokeW={activeDetailPhase === 'deciding' && activeOutcome === 'updated' ? 2.5 : 1.5}
              />

              {/* ── Connections ── */}
              {/* Find → Exists (horizontal) */}
              <ArrowLine from={{ x: STAGES.find.x + SMALL_W / 2, y: STAGES.find.y }} to={{ x: STAGES.exists.x - SMALL_W / 2, y: STAGES.exists.y }} color={border} size={4} />
              {/* Exists → Insert (horizontal, No branch) */}
              <ArrowLine from={{ x: STAGES.exists.x + SMALL_W / 2, y: STAGES.exists.y }} to={{ x: STAGES.insert.x - SMALL_W / 2, y: STAGES.insert.y }} color={border} size={4} />
              <text x={(STAGES.exists.x + STAGES.insert.x) / 2} y={STAGES.exists.y - SMALL_H / 2 - 3} textAnchor="middle" fontSize={7} fontFamily="var(--font-mono)" fill={mutedFg}>No</text>
              {/* Exists → Equal? (vertical, Yes branch) */}
              <ArrowLine from={{ x: STAGES.exists.x, y: STAGES.exists.y + SMALL_H / 2 }} to={{ x: STAGES.shallowEq.x, y: STAGES.shallowEq.y - SMALL_H / 2 }} color={border} size={4} />
              <text x={STAGES.exists.x + 8} y={(STAGES.exists.y + STAGES.shallowEq.y) / 2 + 3} fontSize={7} fontFamily="var(--font-mono)" fill={mutedFg}>Yes</text>
              {/* Equal? → Patch (horizontal, No branch) */}
              <ArrowLine from={{ x: STAGES.shallowEq.x + SMALL_W / 2, y: STAGES.shallowEq.y }} to={{ x: STAGES.patch.x - SMALL_W / 2, y: STAGES.patch.y }} color={border} size={4} />
              <text x={(STAGES.shallowEq.x + STAGES.patch.x) / 2} y={STAGES.shallowEq.y - SMALL_H / 2 - 3} textAnchor="middle" fontSize={7} fontFamily="var(--font-mono)" fill={mutedFg}>No</text>
              {/* Equal? → skip (vertical down, Yes branch) */}
              <line x1={STAGES.shallowEq.x} y1={STAGES.shallowEq.y + SMALL_H / 2} x2={STAGES.shallowEq.x} y2={STAGES.shallowEq.y + 24} stroke={border} strokeWidth={1.5} />
              <text x={STAGES.shallowEq.x + 8} y={STAGES.shallowEq.y + SMALL_H / 2 + 12} fontSize={7} fontFamily="var(--font-mono)" fill={mutedFg}>Yes</text>
              <text
                x={STAGES.shallowEq.x - 14} y={SLOTS.skip.y + 4}
                textAnchor="end" fontSize={9} fontFamily="var(--font-mono)"
                fill={activeDetailPhase === 'deciding' && activeOutcome === 'unchanged' ? fg : mutedFg}
                fontWeight={activeDetailPhase === 'deciding' && activeOutcome === 'unchanged' ? 600 : 400}
              >
                skip
              </text>

              {/* ── Placeholder slot circles (dashed outlines showing where dots land) ── */}
              {Object.values(SLOTS).map((slot, idx) => (
                <circle key={`slot-${idx}`} cx={slot.x} cy={slot.y} r={7} fill="none" stroke={border} strokeWidth={1} strokeDasharray="3 2" opacity={0.4} />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── Animated dots ── */}
        {items.map((item) => {
          const pos = getDotPosition(item, scenario);
          const color = getStatusColor(item.status, colors);
          const opacity = getStatusOpacity(item.status);
          return (
            <motion.circle
              key={`dot-${item.id}`}
              r={5}
              fill={color}
              opacity={opacity}
              animate={{ cx: pos.x, cy: pos.y }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            />
          );
        })}
      </svg>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: fg, minHeight: '1.2em' }}>
          {explanation}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          <span style={{ color: primary }}>created: <strong>{counters.created}</strong></span>
          <span style={{ color: secondary }}>updated: <strong>{counters.updated}</strong></span>
          <span style={{ color: mutedFg }}>unchanged: <strong>{counters.unchanged}</strong></span>
          <span style={{ color: mutedFg, opacity: 0.5 }}>skipped: <strong>{counters.skipped}</strong></span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <LegendDot color={primary} label="Created" />
        <LegendDot color={secondary} label="Updated" />
        <LegendDot color={mutedFg} label="Unchanged" />
        <LegendDot color={mutedFg} label="Skipped" opacity={0.4} />
        <LegendDot color={accent} label="In progress" />
      </div>
    </div>
  );
}

// ─── SVG helpers ──────────────────────────────────────────────────

/** Edge positions of a main pipeline box */
function boxRight(stage: { x: number; y: number }) { return { x: stage.x + BOX_W / 2, y: stage.y }; }
function boxLeft(stage: { x: number; y: number })  { return { x: stage.x - BOX_W / 2, y: stage.y }; }
function boxBottom(stage: { x: number; y: number }) { return { x: stage.x, y: stage.y + BOX_H / 2 }; }
function boxTop(stage: { x: number; y: number })    { return { x: stage.x, y: stage.y - BOX_H / 2 }; }

/** Arrow line with triangle head */
function ArrowLine({ from, to, color, size = 5 }: {
  from: { x: number; y: number }; to: { x: number; y: number }; color: string; size?: number;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const ha = Math.PI / 6;
  return (
    <>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={1.5} />
      <polygon
        points={`${to.x},${to.y} ${to.x - size * Math.cos(angle - ha)},${to.y - size * Math.sin(angle - ha)} ${to.x - size * Math.cos(angle + ha)},${to.y - size * Math.sin(angle + ha)}`}
        fill={color}
      />
    </>
  );
}

/** Main pipeline stage: label above, box below (container for dots) */
function StageBox({ x, y, label, active, colors }: {
  x: number; y: number; label: string; active: boolean;
  colors: { fg: string; border: string; accent: string; bg: string };
}) {
  return (
    <g>
      {/* Label above box */}
      <text
        x={x} y={y - BOX_H / 2 - 7}
        textAnchor="middle" fontSize={10}
        fontFamily="var(--font-mono)" fontWeight={active ? 600 : 500}
        fill={active ? colors.accent : colors.fg}
        style={{ transition: 'fill 0.2s ease' }}
      >
        {label}
      </text>
      {/* Box */}
      <motion.rect
        x={x - BOX_W / 2} y={y - BOX_H / 2}
        width={BOX_W} height={BOX_H} rx={6}
        fill={colors.bg}
        stroke={active ? colors.accent : colors.border}
        strokeWidth={active ? 2.5 : 2}
        animate={{
          stroke: active ? colors.accent : colors.border,
          strokeWidth: active ? 2.5 : 2,
        }}
        transition={{ duration: 0.2 }}
      />
    </g>
  );
}

/** Small detail-panel node with label inside */
function SmallNode({ x, y, label, fg, bg, stroke, strokeW = 1.5 }: {
  x: number; y: number; label: string; fg: string; bg: string; stroke: string; strokeW?: number;
}) {
  return (
    <g>
      <rect x={x - SMALL_W / 2} y={y - SMALL_H / 2} width={SMALL_W} height={SMALL_H} rx={4} fill={bg} stroke={stroke} strokeWidth={strokeW} />
      <text x={x} y={y + 3} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill={fg} style={{ pointerEvents: 'none' }}>
        {label}
      </text>
    </g>
  );
}

function LegendDot({ color, label, opacity = 1 }: { color: string; label: string; opacity?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
      <svg width={10} height={10}><circle cx={5} cy={5} r={4} fill={color} opacity={opacity} /></svg>
      <span style={{ color, opacity }}>{label}</span>
    </div>
  );
}

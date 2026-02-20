import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors, type ThemeColors } from './useThemeColors';
import {
  type Phase, type TerminalLine, type PlunkConfig, type LineType,
  DEFAULT_CONFIG, getIntervalMs, computeArchState,
  generatePublishLines, generateInjectLines, generatePushLines,
  generateDevLines, generateRestoreLines, generateSimpleCommandLines,
  COMMANDS, COMPARISON_DATA, type ComparisonRow,
} from './plunkMachine';

// ── Terminal color mapping ──────────────────────────────────────────

function getLineColor(type: LineType, colors: ThemeColors): string {
  switch (type) {
    case 'cmd': return colors.accent;
    case 'success': return colors.accent;
    case 'info': return colors.foreground;
    case 'error': return '#e55353';
    case 'warn': return colors.secondary;
    case 'dim': return colors.mutedFg;
    case 'file': return colors.accent;
    case 'hash': return colors.secondary;
    case 'accent': return colors.accent;
    default: return colors.foreground;
  }
}

// ── Sub-components ──────────────────────────────────────────────────

function StatsRow({ stats, colors }: {
  stats: { published: number; injected: number; filesCopied: number; skipped: number };
  colors: ThemeColors;
}) {
  const { accent, mutedFg, border, muted } = colors;
  const items = [
    { label: 'Published', value: stats.published },
    { label: 'Injected', value: stats.injected },
    { label: 'Files Copied', value: stats.filesCopied },
    { label: 'Skipped (cached)', value: stats.skipped },
  ];

  return (
    <div style={{
      display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '1rem 1.25rem',
      background: muted, borderRadius: '0.375rem', border: `1.5px solid ${border}`,
      marginBottom: '1.5rem',
    }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={item.value}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              style={{
                fontSize: '1.5rem', fontWeight: 700, color: accent,
                lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {item.value}
            </motion.span>
          </AnimatePresence>
          <span style={{
            fontSize: '0.6rem', color: mutedFg, textTransform: 'uppercase',
            letterSpacing: '0.1em', fontFamily: 'var(--font-mono)',
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ label, colors }: { label: string; colors: ThemeColors }) {
  return (
    <div style={{
      fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em',
      color: colors.mutedFg, marginBottom: '1rem', display: 'flex',
      alignItems: 'center', gap: '0.8rem', fontFamily: 'var(--font-mono)',
    }}>
      {label}
      <span style={{ flex: 1, height: '1px', background: colors.border }} />
    </div>
  );
}

// ── Architecture Diagram ────────────────────────────────────────────

const ARCH_SVG_W = 720;
const ARCH_SVG_H = 190;
const NODE_W = 170;
const NODE_H = 140;
const ARROW_W = 65;

function ArchDiagram({ phase, progress, published, injected, config, colors }: {
  phase: Phase; progress: number; published: boolean; injected: boolean;
  config: PlunkConfig; colors: ThemeColors;
}) {
  const { mutedFg, border, muted, foreground: fg, accent } = colors;
  const arch = computeArchState(phase, progress, published, injected);
  const { packageName, version, pm } = config;

  const nodeX = [20, 255, 490]; // left edges of 3 nodes
  const arrowX = [20 + NODE_W, 255 + NODE_W]; // arrow start X positions
  const nodeY = 25;

  return (
    <svg
      viewBox={`0 0 ${ARCH_SVG_W} ${ARCH_SVG_H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label="plunk architecture: Library → Store → Consumer"
    >
      {/* Node: Library */}
      <ArchNode
        x={nodeX[0]} y={nodeY} w={NODE_W} h={NODE_H}
        icon="☷" title="Library Package" subtitle={`~/${packageName.split('/').pop()}/`}
        active={arch.libraryActive} colors={colors}
        files={['package.json', 'dist/index.mjs', 'dist/index.d.ts', 'dist/utils.mjs']}
      />

      {/* Arrow: Publish */}
      <ArchArrow
        x={arrowX[0]} y={nodeY + NODE_H / 2}
        w={ARROW_W} label="publish" active={arch.publishArrow} colors={colors}
      />

      {/* Node: Store */}
      <ArchNode
        x={nodeX[1]} y={nodeY} w={NODE_W} h={NODE_H}
        icon="◬" title="Plunk Store" subtitle="~/.plunk/store/"
        active={arch.storeActive} colors={colors}
        files={published ? [`${packageName}@${version}/`, `  package/ (${config.filesCount} files)`, '  .plunk-meta.json'] : ['— empty']}
      />

      {/* Arrow: Inject */}
      <ArchArrow
        x={arrowX[1]} y={nodeY + NODE_H / 2}
        w={ARROW_W} label="inject" active={arch.injectArrow} colors={colors}
      />

      {/* Node: Consumer */}
      <ArchNode
        x={nodeX[2]} y={nodeY} w={NODE_W} h={NODE_H}
        icon="⚙" title="Consumer App" subtitle="~/my-app/"
        active={arch.consumerActive} colors={colors}
        files={injected
          ? [`node_modules/${packageName}/`, '  package.json', '  dist/index.mjs', '  .plunk/state.json']
          : ['— waiting']
        }
      />
    </svg>
  );
}

function ArchNode({ x, y, w, h, icon, title, subtitle, active, colors, files }: {
  x: number; y: number; w: number; h: number;
  icon: string; title: string; subtitle: string;
  active: boolean; colors: ThemeColors; files: string[];
}) {
  const { foreground: fg, accent, mutedFg, border, muted } = colors;
  return (
    <g>
      <motion.rect
        x={x} y={y} width={w} height={h} rx={6}
        fill={muted} stroke={active ? accent : border}
        strokeWidth={active ? 2 : 1.5}
        animate={{ stroke: active ? accent : border, strokeWidth: active ? 2 : 1.5 }}
        transition={{ duration: 0.3 }}
      />
      <text x={x + 10} y={y + 20} fontSize={15} fill={fg}>{icon}</text>
      <text
        x={x + 10} y={y + 38} fontSize={11} fontWeight={600}
        fontFamily="var(--font-mono)"
        fill={active ? accent : fg}
        style={{ transition: 'fill 0.3s' }}
      >
        {title}
      </text>
      <text x={x + 10} y={y + 53} fontSize={9} fontFamily="var(--font-mono)" fill={mutedFg}>
        {subtitle}
      </text>
      {files.map((f, i) => (
        <text
          key={i} x={x + 10} y={y + 70 + i * 15}
          fontSize={9} fontFamily="var(--font-mono)"
          fill={f.startsWith('—') ? mutedFg : (active ? accent : fg)}
          opacity={f.startsWith('—') ? 0.5 : 0.8}
          style={{ transition: 'fill 0.3s, opacity 0.3s' }}
        >
          ▪ {f}
        </text>
      ))}
    </g>
  );
}

function ArchArrow({ x, y, w, label, active, colors }: {
  x: number; y: number; w: number; label: string;
  active: boolean; colors: ThemeColors;
}) {
  const { accent, border, mutedFg } = colors;
  const lineColor = active ? accent : border;
  return (
    <g>
      <motion.line
        x1={x} y1={y} x2={x + w - 8} y2={y}
        stroke={lineColor} strokeWidth={2}
        animate={{ stroke: lineColor }}
        transition={{ duration: 0.3 }}
      />
      <motion.polygon
        points={`${x + w},${y} ${x + w - 8},${y - 5} ${x + w - 8},${y + 5}`}
        fill={lineColor}
        animate={{ fill: lineColor }}
        transition={{ duration: 0.3 }}
      />
      {/* Animated particle */}
      {active && (
        <motion.circle
          r={4} cy={y} fill={accent}
          initial={{ cx: x, opacity: 0 }}
          animate={{ cx: [x, x + w], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${accent})` }}
        />
      )}
      <text
        x={x + w / 2} y={y + 20} textAnchor="middle"
        fontSize={9} fontFamily="var(--font-mono)"
        fill={active ? accent : mutedFg}
        fontWeight={active ? 600 : 400}
        style={{ transition: 'fill 0.3s' }}
      >
        {label}
      </text>
    </g>
  );
}

// ── Config Panel ────────────────────────────────────────────────────

function ConfigPanel({ config, onChange, colors }: {
  config: PlunkConfig;
  onChange: (partial: Partial<PlunkConfig>) => void;
  colors: ThemeColors;
}) {
  const { foreground: fg, mutedFg, border, muted } = colors;

  const cardStyle: React.CSSProperties = {
    background: muted, border: `1.5px solid ${border}`, borderRadius: '0.375rem',
    padding: '1rem', flex: '1 1 240px', minWidth: 0,
  };
  const titleStyle: React.CSSProperties = {
    fontSize: '0.7rem', fontWeight: 600, color: mutedFg, textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: '0.8rem', fontFamily: 'var(--font-mono)',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.65rem', color: mutedFg, marginBottom: '0.2rem',
    fontFamily: 'var(--font-mono)',
  };
  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', width: '100%',
    padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.15)', border: `1px solid ${border}`,
    borderRadius: '3px', color: fg, outline: 'none',
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
      <div style={cardStyle}>
        <div style={titleStyle}>Library</div>
        <div style={{ marginBottom: '0.6rem' }}>
          <label style={labelStyle}>Package name</label>
          <input style={inputStyle} value={config.packageName}
            onChange={e => onChange({ packageName: e.target.value })} />
        </div>
        <div style={{ marginBottom: '0.6rem' }}>
          <label style={labelStyle}>Version</label>
          <input style={inputStyle} value={config.version}
            onChange={e => onChange({ version: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Files in dist/</label>
          <input style={inputStyle} type="number" min={1} max={50} value={config.filesCount}
            onChange={e => onChange({ filesCount: Math.max(1, Math.min(50, parseInt(e.target.value) || 4)) })} />
        </div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>Consumer</div>
        <div style={{ marginBottom: '0.6rem' }}>
          <label style={labelStyle}>Package manager</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={config.pm}
            onChange={e => onChange({ pm: e.target.value as PlunkConfig['pm'] })}>
            <option value="pnpm">pnpm</option>
            <option value="npm">npm</option>
            <option value="yarn">yarn</option>
            <option value="bun">bun</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Simulate change on re-publish</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={config.changeOnRepublish ? 'yes' : 'no'}
            onChange={e => onChange({ changeOnRepublish: e.target.value === 'yes' })}>
            <option value="yes">Yes — files differ</option>
            <option value="no">No — same hash (skip)</option>
          </select>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>Workflow</div>
        <div>
          <label style={labelStyle}>Animation speed</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={config.speed}
            onChange={e => onChange({ speed: e.target.value as PlunkConfig['speed'] })}>
            <option value="fast">Fast (0.5x)</option>
            <option value="normal">Normal (1x)</option>
            <option value="slow">Slow (2x)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ── Action Buttons ──────────────────────────────────────────────────

interface ActionBtnDef {
  key: string;
  label: string;
  shortcut: string;
  primary?: boolean;
}

const ACTION_BTNS: ActionBtnDef[] = [
  { key: 'publish', label: 'plunk publish', shortcut: '1', primary: true },
  { key: 'inject', label: 'plunk add', shortcut: '2' },
  { key: 'push', label: 'plunk push', shortcut: '3' },
  { key: 'dev', label: 'plunk dev', shortcut: '4' },
  { key: 'restore', label: 'plunk restore', shortcut: '5' },
  { key: 'clear', label: 'clear', shortcut: 'c' },
];

function ActionButtons({ onAction, phase, published, injected, devRunning, colors }: {
  onAction: (action: string) => void;
  phase: Phase; published: boolean; injected: boolean; devRunning: boolean;
  colors: ThemeColors;
}) {
  const { foreground: fg, border, muted, accent, background: bg, mutedFg } = colors;
  const busy = phase !== 'idle';

  return (
    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
      {ACTION_BTNS.map(btn => {
        const disabled = (busy && btn.key !== 'clear' && btn.key !== 'dev')
          || (btn.key === 'inject' && !published)
          || (btn.key === 'restore' && !injected);
        const isPrimary = btn.primary;
        const isDevToggle = btn.key === 'dev' && devRunning;

        return (
          <button
            key={btn.key}
            onClick={() => onAction(btn.key)}
            disabled={disabled}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: isPrimary ? 600 : 500,
              padding: '0.6rem 1.2rem', border: `1.5px solid ${isPrimary ? accent : border}`,
              borderRadius: '4px', cursor: disabled ? 'not-allowed' : 'pointer',
              background: isPrimary ? accent : muted,
              color: isPrimary ? bg : fg,
              opacity: disabled ? 0.35 : 1,
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            {isDevToggle ? '■ stop dev' : btn.label}
            <span style={{
              fontSize: '0.6rem', padding: '0.1em 0.35em', border: `1px solid ${isPrimary ? bg : border}`,
              borderRadius: '2px', opacity: 0.5, color: isPrimary ? bg : mutedFg,
            }}>
              {btn.shortcut}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Terminal ─────────────────────────────────────────────────────────

function TerminalPanel({ lines, visibleCount, colors, terminalRef }: {
  lines: TerminalLine[];
  visibleCount: number;
  colors: ThemeColors;
  terminalRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { border, mutedFg } = colors;

  return (
    <div style={{
      borderRadius: '0.375rem', overflow: 'hidden',
      border: `1.5px solid ${border}`, marginBottom: '1.5rem',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.03)',
        borderBottom: `1px solid ${border}`, fontSize: '0.65rem', color: mutedFg,
        fontFamily: 'var(--font-mono)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: border, display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: border, display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: border, display: 'inline-block' }} />
        <span style={{ marginLeft: '0.4rem' }}>plunk — interactive demo</span>
      </div>

      {/* Body */}
      <div
        ref={terminalRef}
        style={{
          padding: '0.8rem 1rem', minHeight: '220px', maxHeight: '340px',
          overflowY: 'auto', fontSize: '0.75rem', lineHeight: 1.7,
          fontFamily: 'var(--font-mono)', background: 'oklch(0.10 0.01 45)',
          color: 'oklch(0.85 0.02 85)',
          scrollbarWidth: 'thin' as const,
        }}
      >
        {lines.length === 0 && (
          <div style={{ color: mutedFg }}>Ready. Press a command or use keyboard shortcuts 1-5.</div>
        )}
        {lines.slice(0, visibleCount).map((ln) => (
          <div
            key={ln.id}
            style={{
              color: getLineColor(ln.type, colors),
              fontWeight: ln.type === 'cmd' ? 600 : 400,
              animation: 'plunkLineAppear 0.2s ease forwards',
            }}
          >
            {ln.type === 'cmd' ? (
              <><span style={{ color: colors.accent }}>$</span> <span>{ln.html.slice(2)}</span></>
            ) : ln.html}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Commands Grid ───────────────────────────────────────────────────

function CommandsGrid({ onCommand, colors }: {
  onCommand: (cmd: string) => void;
  colors: ThemeColors;
}) {
  const { foreground: fg, accent, mutedFg, border, muted } = colors;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
      gap: '0.5rem', marginBottom: '1.5rem',
    }}>
      {COMMANDS.map(cmd => (
        <button
          key={cmd.cmd}
          onClick={() => onCommand(cmd.cmd)}
          style={{
            display: 'flex', alignItems: 'baseline', gap: '0.5rem',
            padding: '0.6rem 0.8rem', background: muted,
            border: `1.5px solid ${border}`, borderRadius: '4px',
            cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s',
            fontFamily: 'var(--font-mono)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: accent, whiteSpace: 'nowrap' }}>
            {cmd.cmd}
          </span>
          <span style={{ fontSize: '0.65rem', color: mutedFg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cmd.description}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Comparison Table ────────────────────────────────────────────────

function ComparisonTable({ colors }: { colors: ThemeColors }) {
  const { foreground: fg, accent, mutedFg, border, muted, secondary } = colors;

  function statusColor(status: 'yes' | 'no' | 'partial'): string {
    if (status === 'yes') return accent;
    if (status === 'partial') return secondary;
    return mutedFg;
  }

  const cellStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem', borderBottom: `1px solid ${border}`,
    fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
  };

  return (
    <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, borderBottom: `2px solid ${border}`, color: mutedFg, fontWeight: 600, textAlign: 'left' }} />
            <th style={{ ...cellStyle, borderBottom: `2px solid ${border}`, color: accent, fontWeight: 600, textAlign: 'left' }}>plunk</th>
            <th style={{ ...cellStyle, borderBottom: `2px solid ${border}`, color: mutedFg, fontWeight: 600, textAlign: 'left' }}>npm link</th>
            <th style={{ ...cellStyle, borderBottom: `2px solid ${border}`, color: mutedFg, fontWeight: 600, textAlign: 'left' }}>yalc</th>
            <th style={{ ...cellStyle, borderBottom: `2px solid ${border}`, color: mutedFg, fontWeight: 600, textAlign: 'left' }}>pnpm link</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_DATA.map((row, i) => (
            <tr key={i} style={{ transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = `${muted}`)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ ...cellStyle, color: fg, fontWeight: 500 }}>{row.feature}</td>
              <td style={{ ...cellStyle, color: accent, fontWeight: 600 }}>{row.plunk.text}</td>
              <td style={{ ...cellStyle, color: statusColor(row.npmLink.status) }}>{row.npmLink.text}</td>
              <td style={{ ...cellStyle, color: statusColor(row.yalc.status) }}>{row.yalc.text}</td>
              <td style={{ ...cellStyle, color: statusColor(row.pnpmLink.status) }}>{row.pnpmLink.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Inject keyframe animation via style tag ─────────────────────────

function StyleInjector() {
  return (
    <style>{`
      @keyframes plunkLineAppear {
        from { opacity: 0; transform: translateY(3px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function PlunkPlayground() {
  const colors = useThemeColors();

  const [config, setConfig] = useState<PlunkConfig>(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<Phase>('idle');
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [published, setPublished] = useState(false);
  const [injected, setInjected] = useState(false);
  const [devRunning, setDevRunning] = useState(false);
  const [contentHash, setContentHash] = useState<string | null>(null);

  const [stats, setStats] = useState({ published: 0, injected: 0, filesCopied: 0, skipped: 0 });

  const terminalRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const devIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleCount]);

  // Playback interval — reveal lines one by one (matches HashExplorer pattern)
  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setVisibleCount(v => {
        // Use functional updater to read fresh lines.length via closure
        // lines.length is stable between action dispatches
        if (v >= lines.length) {
          setPlaying(false);
          return v;
        }
        return v + 1;
      });
    }, getIntervalMs(config.speed));
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, lines.length, config.speed]);

  // When playback finishes, update state
  useEffect(() => {
    if (!playing && visibleCount >= lines.length && lines.length > 0) {
      setPhase('idle');
    }
  }, [playing, visibleCount, lines.length]);

  // Track lines count via ref for reliable access in callbacks
  const linesCountRef = useRef(0);
  useEffect(() => { linesCountRef.current = lines.length; }, [lines.length]);

  const handleAction = useCallback((action: string) => {
    if (action === 'clear') {
      setLines([]);
      setVisibleCount(0);
      setPhase('idle');
      setPlaying(false);
      return;
    }

    if (action === 'dev') {
      if (devRunning) {
        setDevRunning(false);
        if (devIntervalRef.current) clearInterval(devIntervalRef.current);
        const stopLines = [{ id: Date.now(), html: '■ Stopped watching.', type: 'warn' as LineType }];
        setLines(prev => [...prev, ...stopLines]);
        setVisibleCount(prev => prev + 1);
        return;
      }
      const devLines = generateDevLines(config);
      setLines(prev => [...prev, ...devLines]);
      setVisibleCount(prev => prev + devLines.length);
      setDevRunning(true);
      return;
    }

    // Don't allow actions while busy
    if (phase !== 'idle') return;

    switch (action) {
      case 'publish': {
        const { lines: newLines, hash, skipped } = generatePublishLines(config, published, contentHash);
        setLines(prev => [...prev, ...newLines]);
        setVisibleCount(linesCountRef.current);
        setPhase('publishing');
        setPlaying(true);
        setContentHash(hash);
        if (!skipped) {
          setPublished(true);
          setStats(s => ({ ...s, published: s.published + 1, filesCopied: s.filesCopied + config.filesCount }));
        } else {
          setStats(s => ({ ...s, skipped: s.skipped + 1 }));
        }
        break;
      }
      case 'inject': {
        if (!published) return;
        const newLines = generateInjectLines(config);
        setLines(prev => [...prev, ...newLines]);
        setVisibleCount(linesCountRef.current);
        setPhase('injecting');
        setPlaying(true);
        setInjected(true);
        setStats(s => ({ ...s, injected: s.injected + 1, filesCopied: s.filesCopied + config.filesCount }));
        break;
      }
      case 'push': {
        const { lines: newLines, hash, skipped } = generatePushLines(config, published, contentHash);
        setLines(prev => [...prev, ...newLines]);
        setVisibleCount(linesCountRef.current);
        setPhase('pushing');
        setPlaying(true);
        setContentHash(hash);
        if (!skipped) {
          setPublished(true);
          setInjected(true);
          setStats(s => ({
            ...s,
            published: s.published + 1,
            injected: s.injected + 1,
            filesCopied: s.filesCopied + config.filesCount * 2,
          }));
        } else {
          setStats(s => ({ ...s, skipped: s.skipped + 1 }));
        }
        break;
      }
      case 'restore': {
        if (!injected) return;
        const newLines = generateRestoreLines(config);
        setLines(prev => [...prev, ...newLines]);
        setVisibleCount(linesCountRef.current);
        setPhase('restoring');
        setPlaying(true);
        setInjected(false);
        break;
      }
      default: {
        // Simple commands from the grid
        const newLines = generateSimpleCommandLines(action, config, { published, injected, hash: contentHash });
        setLines(prev => [...prev, ...newLines]);
        setVisibleCount(prev => prev + newLines.length); // show immediately
      }
    }
  }, [config, phase, published, injected, contentHash, devRunning]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case '1': handleAction('publish'); break;
        case '2': handleAction('inject'); break;
        case '3': handleAction('push'); break;
        case '4': handleAction('dev'); break;
        case '5': handleAction('restore'); break;
        case 'c': case 'C': handleAction('clear'); break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleAction]);

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, accent } = colors;
  const progress = lines.length > 0 ? visibleCount / lines.length : 0;

  return (
    <div className="mermaid-container my-6" style={{ padding: '1.5rem' }}>
      <StyleInjector />

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.4rem' }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 400,
            fontStyle: 'italic', letterSpacing: '-0.02em', color: accent, lineHeight: 1,
          }}>
            plunk
          </span>
          <span style={{
            fontSize: '0.7rem', color: mutedFg, background: 'rgba(0,0,0,0.1)',
            padding: '0.15em 0.5em', borderRadius: '3px', border: `1px solid ${border}`,
            fontFamily: 'var(--font-mono)',
          }}>
            v0.1.0
          </span>
        </div>
        <p style={{
          fontSize: '0.8rem', color: mutedFg, fontWeight: 300, letterSpacing: '0.02em',
          fontFamily: 'var(--font-mono)',
        }}>
          Modern local package development. Smart file copying into node_modules — no symlinks, no git contamination.
        </p>
      </div>

      {/* Stats */}
      <StatsRow stats={stats} colors={colors} />

      {/* Architecture */}
      <SectionLabel label="Architecture" colors={colors} />
      <div style={{ marginBottom: '1.5rem' }}>
        <ArchDiagram
          phase={phase} progress={progress}
          published={published} injected={injected}
          config={config} colors={colors}
        />
      </div>

      {/* Config */}
      <SectionLabel label="Configuration" colors={colors} />
      <ConfigPanel config={config} onChange={partial => setConfig(c => ({ ...c, ...partial }))} colors={colors} />

      {/* Actions */}
      <SectionLabel label="Actions" colors={colors} />
      <ActionButtons
        onAction={handleAction} phase={phase}
        published={published} injected={injected} devRunning={devRunning}
        colors={colors}
      />

      {/* Terminal */}
      <SectionLabel label="Output" colors={colors} />
      <TerminalPanel lines={lines} visibleCount={visibleCount} colors={colors} terminalRef={terminalRef} />

      {/* Commands */}
      <SectionLabel label="All Commands" colors={colors} />
      <CommandsGrid onCommand={cmd => handleAction(cmd)} colors={colors} />

      {/* Comparison */}
      <SectionLabel label="vs. Alternatives" colors={colors} />
      <ComparisonTable colors={colors} />

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.65rem', color: mutedFg, paddingTop: '1rem',
        borderTop: `1px solid ${border}`, fontFamily: 'var(--font-mono)',
      }}>
        <span>plunk — interactive playground</span>
        <a
          href="https://github.com/oleg-kuibar/plunk"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: fg, textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = accent)}
          onMouseLeave={e => (e.currentTarget.style.color = fg)}
        >
          github.com/oleg-kuibar/plunk
        </a>
      </div>
    </div>
  );
}

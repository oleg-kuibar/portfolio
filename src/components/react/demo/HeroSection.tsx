import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors } from '../useThemeColors';
import { CodeBlock } from './CodeBlock';
import { SectionHeader } from './SectionHeader';

// ─── Mini tree for the hero animation ────────────────────────────

interface MiniNode {
  id: string;
  label: string;
  table: string;
  children: string[];
  x: number;
  y: number;
}

const NODE_W = 80;
const NODE_H = 28;

function buildMiniTree(): MiniNode[] {
  return [
    { id: 'u1', label: 'Alice', table: 'users', children: ['p1', 'p2'], x: 250, y: 40 },
    { id: 'p1', label: 'Post #1', table: 'posts', children: ['c1', 'c2'], x: 150, y: 110 },
    { id: 'p2', label: 'Post #2', table: 'posts', children: ['c3'], x: 350, y: 110 },
    { id: 'c1', label: 'Nice!', table: 'comments', children: ['r1'], x: 80, y: 180 },
    { id: 'c2', label: 'Thanks', table: 'comments', children: ['r2'], x: 210, y: 180 },
    { id: 'c3', label: 'Great', table: 'comments', children: ['r3'], x: 350, y: 180 },
    { id: 'r1', label: '\u{1F44D}', table: 'reactions', children: [], x: 40, y: 245 },
    { id: 'r2', label: '\u{2764}\u{FE0F}', table: 'reactions', children: [], x: 170, y: 245 },
    { id: 'r3', label: '\u{1F525}', table: 'reactions', children: [], x: 310, y: 245 },
  ];
}

type Phase = 'idle' | 'deleting' | 'orphaned';

const HERO_CODE = `// Without cascading deletes:
await ctx.db.delete(userId);
// Post #1, Post #2, comments, reactions...
// all still in the database. Orphaned.`;

const SOLUTION_CODE = `// With @oleg-kuibar/cascading-deletes:
await cascade.deleteWithCascade(ctx, "users", userId);
// All 9 related documents deleted automatically.
// Zero orphans. Zero dangling references.`;

// ─── Component ──────────────────────────────────────────────────

export function HeroSection() {
  const colors = useThemeColors();
  const nodes = useMemo(buildMiniTree, []);
  const nodeMap = useMemo(() => {
    const m: Record<string, MiniNode> = {};
    for (const n of nodes) m[n.id] = n;
    return m;
  }, [nodes]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [hasPlayed, setHasPlayed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playAnimation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
    setHasPlayed(false);
    timerRef.current = setTimeout(() => {
      setPhase('deleting');
      timerRef.current = setTimeout(() => {
        setPhase('orphaned');
        setHasPlayed(true);
      }, 800);
    }, 400);
  }, []);

  // Auto-play on mount
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setPhase('deleting');
      timerRef.current = setTimeout(() => {
        setPhase('orphaned');
        setHasPlayed(true);
      }, 800);
    }, 1200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, accent, background: bg, muted, primary, secondary, danger, dangerMuted, success } = colors;

  const orphanCount = nodes.length - 1; // all except root

  function getTableColor(table: string): string {
    switch (table) {
      case 'users': return primary;
      case 'posts': return secondary;
      case 'comments': return accent;
      case 'reactions': return mutedFg;
      default: return fg;
    }
  }

  return (
    <section style={{ marginBottom: '4rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          color: fg,
          marginBottom: '0.5rem',
          lineHeight: 1.2,
        }}>
          Cascading Deletes
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1.05rem',
          color: mutedFg,
          maxWidth: '36rem',
          lineHeight: 1.6,
        }}>
          A Convex component that prevents orphaned data. Delete a parent document and all its descendants are cleaned up automatically.
        </p>
        <div style={{
          display: 'inline-flex', gap: '0.35rem', marginTop: '0.75rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: mutedFg,
          padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
          border: `1px solid ${border}`, background: `${muted}`,
        }}>
          <span style={{ color: accent, fontWeight: 500 }}>convex component</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>open source</span>
        </div>
      </div>

      {/* Hero card: code + animation side by side */}
      <div className="mermaid-container" style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}>
          {/* Left: code snippet */}
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: mutedFg,
              marginBottom: '0.5rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              The Problem
            </div>
            <CodeBlock
              code={HERO_CODE}
              language="typescript"
              title="mutation.ts"
              showCopy={false}
            />

            {/* Orphan counter */}
            <AnimatePresence>
              {phase === 'orphaned' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: `2px solid ${danger}`,
                    background: `${danger}18`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: danger,
                    lineHeight: 1,
                  }}>
                    {orphanCount}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: danger,
                  }}>
                    orphaned documents
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Solution teaser */}
            {hasPlayed && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
                style={{ marginTop: '1rem' }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: success,
                  marginBottom: '0.5rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  The Solution
                </div>
                <CodeBlock
                  code={SOLUTION_CODE}
                  language="typescript"
                  title="mutation.ts"
                  showCopy={false}
                />
              </motion.div>
            )}
          </div>

          {/* Right: mini tree animation */}
          <div style={{
            flex: '1 1 300px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 420, height: 'auto' }}>
              {/* Edges */}
              {nodes.map(node =>
                node.children.map(childId => {
                  const child = nodeMap[childId];
                  if (!child) return null;
                  const isOrphaned = phase === 'orphaned' && node.id !== 'u1';

                  return (
                    <motion.line
                      key={`e-${node.id}-${childId}`}
                      x1={node.x} y1={node.y + NODE_H / 2}
                      x2={child.x} y2={child.y - NODE_H / 2}
                      stroke={isOrphaned || (phase === 'orphaned' && node.id === 'u1') ? danger : border}
                      strokeWidth={1.5}
                      strokeDasharray={phase === 'orphaned' ? '4 3' : 'none'}
                      animate={{
                        opacity: phase === 'orphaned' && node.id === 'u1' ? 0.3 : phase === 'orphaned' ? 0.5 : 0.8,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  );
                })
              )}

              {/* Nodes */}
              {nodes.map(node => {
                const isRoot = node.id === 'u1';
                const tableColor = getTableColor(node.table);
                const isReaction = node.table === 'reactions';

                let fill = muted;
                let stroke = tableColor;
                let textFill = fg;
                let opacity = 1;

                if (phase === 'deleting' && isRoot) {
                  fill = danger;
                  stroke = dangerMuted;
                  textFill = '#fff';
                } else if (phase === 'orphaned' && isRoot) {
                  fill = `${dangerMuted}20`;
                  stroke = dangerMuted;
                  textFill = dangerMuted;
                  opacity = 0.5;
                } else if (phase === 'orphaned' && !isRoot) {
                  stroke = danger;
                }

                return (
                  <g key={node.id}>
                    <motion.rect
                      x={node.x - NODE_W / 2}
                      y={node.y - NODE_H / 2}
                      width={NODE_W}
                      height={NODE_H}
                      rx={5}
                      animate={{ fill, stroke, opacity }}
                      transition={{ duration: 0.4 }}
                      strokeWidth={2}
                    />
                    <motion.text
                      x={node.x}
                      y={node.y + (isReaction ? 5 : 1)}
                      textAnchor="middle"
                      fontSize={isReaction ? 14 : 10}
                      fontFamily="var(--font-mono)"
                      fontWeight={500}
                      animate={{ fill: textFill, opacity }}
                      transition={{ duration: 0.4 }}
                      style={{
                        textDecoration: phase === 'orphaned' && isRoot ? 'line-through' : 'none',
                      }}
                    >
                      {node.label}
                    </motion.text>
                    {!isReaction && (
                      <motion.text
                        x={node.x}
                        y={node.y + 10}
                        textAnchor="middle"
                        fontSize={7}
                        fontFamily="var(--font-mono)"
                        animate={{
                          fill: phase === 'orphaned' && isRoot ? dangerMuted : mutedFg,
                          opacity: phase === 'orphaned' && isRoot ? 0.5 : 0.7,
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        {node.table}
                      </motion.text>
                    )}

                    {/* Orphan badge */}
                    <AnimatePresence>
                      {phase === 'orphaned' && !isRoot && (
                        <motion.g
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          <rect
                            x={node.x + NODE_W / 2 - 6}
                            y={node.y - NODE_H / 2 - 6}
                            width={14} height={13} rx={3}
                            fill={danger}
                          />
                          <text
                            x={node.x + NODE_W / 2 + 1}
                            y={node.y - NODE_H / 2 + 4.5}
                            textAnchor="middle"
                            fontSize={8} fontWeight={700}
                            fontFamily="var(--font-mono)"
                            fill="#fff"
                          >
                            !
                          </text>
                        </motion.g>
                      )}
                      {phase === 'orphaned' && isRoot && (
                        <motion.g
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 0.85, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <rect
                            x={node.x + NODE_W / 2 - 6}
                            y={node.y - NODE_H / 2 - 6}
                            width={24} height={13} rx={3}
                            fill={dangerMuted}
                          />
                          <text
                            x={node.x + NODE_W / 2 + 6}
                            y={node.y - NODE_H / 2 + 4}
                            textAnchor="middle"
                            fontSize={7} fontWeight={700}
                            fontFamily="var(--font-mono)"
                            fill={danger}
                          >
                            DEL
                          </text>
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </g>
                );
              })}
            </svg>
            <AnimatePresence>
              {hasPlayed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={playAnimation}
                  style={{
                    marginTop: '0.5rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '0.25rem',
                    border: `1.5px solid ${border}`,
                    background: 'transparent',
                    color: mutedFg,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                >
                  Replay
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

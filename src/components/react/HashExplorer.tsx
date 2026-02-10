import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors, type ThemeColors } from './useThemeColors';
import { PlayButton } from './PlayButton';

type Mode = 'without' | 'with';

interface KVLine {
  key: string;
  value: string;
  id: string;
}

const OBJ_A_UNSORTED: KVLine[] = [
  { key: 'name', value: '"Windforce"', id: 'a-name' },
  { key: 'type', value: '"weapon"', id: 'a-type' },
  { key: 'stats', value: '{ damage: 120 }', id: 'a-stats' },
];

const OBJ_B_UNSORTED: KVLine[] = [
  { key: 'type', value: '"weapon"', id: 'b-type' },
  { key: 'stats', value: '{ damage: 120 }', id: 'b-stats' },
  { key: 'name', value: '"Windforce"', id: 'b-name' },
];

const SORTED_ORDER = ['name', 'stats', 'type'];

function sortLines(lines: KVLine[]): KVLine[] {
  return [...lines].sort((a, b) => SORTED_ORDER.indexOf(a.key) - SORTED_ORDER.indexOf(b.key));
}

const HASH_A_UNSORTED = 'a3f2...c891';
const HASH_B_UNSORTED = '7b1e...d4f0';
const HASH_SORTED = 'e5a9...2b3c';

const STR_A_UNSORTED = '{"name":"Windforce","type":"weapon","stats":{"damage":120}}';
const STR_B_UNSORTED = '{"type":"weapon","stats":{"damage":120},"name":"Windforce"}';
const STR_SORTED = '{"name":"Windforce","stats":{"damage":120},"type":"weapon"}';

function getMaxSteps(mode: Mode): number {
  return mode === 'without' ? 2 : 3;
}

function JsonCard({
  title, lines, sorted, movedKeys, colors,
}: {
  title: string;
  lines: KVLine[];
  sorted: boolean;
  movedKeys: Set<string>;
  colors: ThemeColors;
}) {
  const { foreground: fg, mutedFg, border, muted, primary } = colors;
  return (
    <div style={{
      flex: '1 1 240px', borderRadius: '0.375rem', border: `1.5px solid ${border}`,
      background: muted, padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
      minWidth: 0,
    }}>
      <div style={{ fontSize: '0.7rem', color: mutedFg, marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ color: fg }}>{'{'}</div>
      <div style={{ paddingLeft: '1rem', overflow: 'visible', position: 'relative' }}>
        {lines.map((line, i) => (
          <motion.div
            key={line.id}
            layout
            layoutId={line.id}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              color: sorted && movedKeys.has(line.key) ? primary : fg,
              transition: 'color 0.3s ease',
            }}
          >
            {line.key}: {line.value}{i < lines.length - 1 ? ',' : ''}
          </motion.div>
        ))}
      </div>
      <div style={{ color: fg }}>{'}'}</div>
    </div>
  );
}

export function HashExplorer() {
  const [mode, setMode] = useState<Mode>('without');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colors = useThemeColors();

  const maxSteps = getMaxSteps(mode);
  const isFinished = step >= maxSteps;

  const handleInteraction = useCallback(() => { setHasInteracted(true); }, []);

  useEffect(() => { setStep(0); setPlaying(false); }, [mode]);

  useEffect(() => {
    if (playing && !isFinished) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s + 1 > maxSteps) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 1200);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, isFinished, maxSteps]);

  useEffect(() => { if (isFinished) setPlaying(false); }, [isFinished]);

  const handlePlay = useCallback(() => {
    handleInteraction();
    if (isFinished) { setStep(0); setPlaying(true); }
    else { setPlaying(p => !p); }
  }, [isFinished, handleInteraction]);

  const handleStep = useCallback(() => {
    handleInteraction();
    setPlaying(false);
    setStep(s => Math.min(s + 1, maxSteps));
  }, [maxSteps, handleInteraction]);

  const handleReset = useCallback(() => {
    handleInteraction();
    setPlaying(false);
    setStep(0);
  }, [handleInteraction]);

  const handleModeChange = useCallback((m: Mode) => {
    handleInteraction();
    setMode(m);
  }, [handleInteraction]);

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, background: bg, primary, secondary, muted, accent } = colors;

  const isSorted = mode === 'with' && step >= 1;
  const linesA = isSorted ? sortLines(OBJ_A_UNSORTED) : OBJ_A_UNSORTED;
  const linesB = isSorted ? sortLines(OBJ_B_UNSORTED) : OBJ_B_UNSORTED;

  // Determine which keys moved in each card
  const movedKeysA = new Set<string>();
  const movedKeysB = new Set<string>();
  if (isSorted) {
    OBJ_A_UNSORTED.forEach((line, i) => {
      if (linesA[i]?.key !== line.key) movedKeysA.add(line.key);
    });
    OBJ_B_UNSORTED.forEach((line, i) => {
      if (linesB[i]?.key !== line.key) movedKeysB.add(line.key);
    });
  }

  // Pipeline label
  const showSortLabel = mode === 'with' && step >= 1;
  const showStringify = mode === 'without' ? step >= 1 : step >= 2;
  const showHash = mode === 'without' ? step >= 2 : step >= 3;

  const strA = mode === 'without' ? STR_A_UNSORTED : STR_SORTED;
  const strB = mode === 'without' ? STR_B_UNSORTED : STR_SORTED;
  const hashA = mode === 'without' ? HASH_A_UNSORTED : HASH_SORTED;
  const hashB = mode === 'without' ? HASH_B_UNSORTED : HASH_SORTED;
  const stringsMatch = strA === strB;
  const hashesMatch = hashA === hashB;

  return (
    <div className="mermaid-container my-6">
      {/* Mode toggle + controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['without', 'with'] as const).map(m => (
            <button key={m} onClick={() => handleModeChange(m)} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '0.25rem 0.625rem',
              borderRadius: '0.25rem', border: `2px solid ${mode === m ? fg : border}`,
              background: mode === m ? fg : 'transparent', color: mode === m ? bg : fg,
              cursor: 'pointer', fontWeight: mode === m ? 600 : 400, transition: 'all 0.15s ease',
            }}>
              {m === 'without' ? 'Without sortKeysDeep' : 'With sortKeysDeep'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: mutedFg, marginLeft: '0.25rem' }}>
            {step}/{maxSteps}
          </span>
        </div>
      </div>

      {/* JSON cards */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <JsonCard title="API call #1" lines={linesA} sorted={isSorted} movedKeys={movedKeysA} colors={colors} />
        <JsonCard title="API call #2" lines={linesB} sorted={isSorted} movedKeys={movedKeysB} colors={colors} />
      </div>

      {/* Pipeline labels */}
      <AnimatePresence mode="wait">
        {showSortLabel && !showStringify && (
          <motion.div
            key="sort-label"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{
              textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              color: primary, marginBottom: '0.75rem', fontWeight: 600,
            }}
          >
            sortKeysDeep() → keys reordered alphabetically
          </motion.div>
        )}
      </AnimatePresence>

      {/* Serialized strings */}
      <AnimatePresence>
        {showStringify && (
          <motion.div
            key="strings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ marginBottom: '0.75rem' }}
          >
            <div style={{
              textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              color: mutedFg, marginBottom: '0.5rem',
            }}>
              JSON.stringify() →
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[strA, strB].map((s, i) => (
                <div key={i} style={{
                  flex: '1 1 240px', borderRadius: '0.375rem', padding: '0.5rem 0.75rem',
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: fg,
                  border: `2px solid ${stringsMatch ? secondary : '#e55' }`,
                  background: muted, overflowX: 'auto', wordBreak: 'break-all',
                }}>
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hash result */}
      <AnimatePresence>
        {showHash && (
          <motion.div
            key="hashes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{
              textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              color: mutedFg, marginBottom: '0.5rem',
            }}>
              SHA-256 →
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {[hashA, hashB].map((h, i) => (
                <div key={i} style={{
                  flex: '1 1 240px', textAlign: 'center', fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem', fontWeight: 600,
                  color: hashesMatch ? secondary : '#e55',
                }}>
                  {h}
                </div>
              ))}
            </div>
            <div style={{
              textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600,
              color: hashesMatch ? secondary : '#e55', padding: '0.5rem',
              borderRadius: '0.25rem', background: hashesMatch ? `${secondary}18` : '#e5533018',
            }}>
              {hashesMatch
                ? 'Identical hash — sync skipped correctly ✓'
                : 'Different hashes — unnecessary re-import!'
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

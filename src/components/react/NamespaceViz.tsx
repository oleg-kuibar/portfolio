import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useThemeColors, type ThemeColors } from './useThemeColors';
import { PlayButton } from './PlayButton';

type Scenario = 'without' | 'with';

interface Tile {
  id: string;
  label: string;
  locale: 'EN' | 'FR' | 'ES';
  inBatch: boolean;
}

const TILES: Tile[] = [
  { id: 'a', label: 'Post A', locale: 'EN', inBatch: true },
  { id: 'b', label: 'Post B', locale: 'EN', inBatch: true },
  { id: 'c', label: 'Post C', locale: 'EN', inBatch: true },
  { id: 'd', label: 'Post D', locale: 'EN', inBatch: false },
  { id: 'e', label: 'Post E', locale: 'FR', inBatch: false },
  { id: 'f', label: 'Post F', locale: 'FR', inBatch: false },
  { id: 'g', label: 'Post G', locale: 'FR', inBatch: false },
  { id: 'h', label: 'Post H', locale: 'FR', inBatch: false },
  { id: 'i', label: 'Post I', locale: 'ES', inBatch: false },
  { id: 'j', label: 'Post J', locale: 'ES', inBatch: false },
  { id: 'k', label: 'Post K', locale: 'ES', inBatch: false },
  { id: 'l', label: 'Post L', locale: 'ES', inBatch: false },
];

function isDeleted(tile: Tile, scenario: Scenario): boolean {
  if (tile.inBatch) return false;
  if (scenario === 'without') return true;
  return tile.locale === 'EN';
}

function getLocaleColor(locale: 'EN' | 'FR' | 'ES', colors: ThemeColors): string {
  switch (locale) {
    case 'EN': return colors.primary;
    case 'FR': return colors.secondary;
    case 'ES': return colors.accent;
  }
}

// Play sequence: step 0 = show "without" (reset), step 1 = animate deletions,
// step 2 = switch to "with" (reset), step 3 = animate deletions
const PLAY_TOTAL_STEPS = 3;

export function NamespaceViz() {
  const [scenario, setScenario] = useState<Scenario>('without');
  const [animated, setAnimated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playStep, setPlayStep] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colors = useThemeColors();

  const isFinished = playStep >= PLAY_TOTAL_STEPS;

  const handleInteraction = useCallback(() => { setHasInteracted(true); }, []);

  const handleScenarioChange = useCallback((s: Scenario) => {
    handleInteraction();
    setScenario(s);
    setAnimated(false);
    setPlaying(false);
  }, [handleInteraction]);

  // Auto-animate deletion after scenario change
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(timer);
  }, [scenario]);

  // Play sequence logic
  const advancePlayStep = useCallback((step: number) => {
    if (step === 0) {
      setScenario('without');
      setAnimated(false);
    } else if (step === 1) {
      // Deletions animate via the animated flag (auto from useEffect)
    } else if (step === 2) {
      setScenario('with');
      setAnimated(false);
    } else if (step === 3) {
      // Deletions animate
    }
  }, []);

  useEffect(() => {
    if (playing && !isFinished) {
      intervalRef.current = setInterval(() => {
        setPlayStep(s => {
          const next = s + 1;
          if (next > PLAY_TOTAL_STEPS) { setPlaying(false); return s; }
          return next;
        });
      }, 1400);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, isFinished]);

  useEffect(() => { advancePlayStep(playStep); }, [playStep, advancePlayStep]);
  useEffect(() => { if (isFinished) setPlaying(false); }, [isFinished]);

  const handlePlay = useCallback(() => {
    handleInteraction();
    if (isFinished) {
      setPlayStep(0);
      setPlaying(true);
    } else {
      setPlaying(p => !p);
    }
  }, [isFinished, handleInteraction]);

  const handleStep = useCallback(() => {
    handleInteraction();
    setPlaying(false);
    setPlayStep(s => Math.min(s + 1, PLAY_TOTAL_STEPS));
  }, [handleInteraction]);

  const handleReset = useCallback(() => {
    handleInteraction();
    setPlaying(false);
    setPlayStep(0);
    setScenario('without');
    setAnimated(false);
  }, [handleInteraction]);

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, background: bg, muted, primary, secondary, accent } = colors;

  const deletedCount = TILES.filter(t => isDeleted(t, scenario)).length;
  const survivedCount = TILES.length - deletedCount;

  return (
    <div className="mermaid-container my-6">
      {/* Toggle + play */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['without', 'with'] as const).map(s => (
            <button key={s} onClick={() => handleScenarioChange(s)} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '0.25rem 0.625rem',
              borderRadius: '0.25rem', border: `2px solid ${scenario === s ? fg : border}`,
              background: scenario === s ? fg : 'transparent', color: scenario === s ? bg : fg,
              cursor: 'pointer', fontWeight: scenario === s ? 600 : 400, transition: 'all 0.15s ease',
            }}>
              {s === 'without' ? 'Without namespace' : 'With namespace: en-US'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: mutedFg }}>
            Sync batch: Post A, B, C (EN)
          </span>
        </div>
      </div>

      {/* Grid with row labels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {(['EN', 'FR', 'ES'] as const).map(locale => {
          const rowTiles = TILES.filter(t => t.locale === locale);
          const isScoped = scenario === 'with' && locale === 'EN';
          const rowLocaleColor = getLocaleColor(locale, colors);

          return (
            <div key={locale} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.25rem',
              borderRadius: '0.375rem',
              background: isScoped ? `${primary}10` : 'transparent',
              border: isScoped ? `1.5px dashed ${primary}50` : '1.5px solid transparent',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                color: isScoped ? primary : mutedFg,
                width: '1.5rem', textAlign: 'center', flexShrink: 0,
              }}>
                {locale}
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', flex: 1,
              }}>
                {rowTiles.map((tile) => {
                  const tileIndex = TILES.indexOf(tile);
                  const deleted = animated && isDeleted(tile, scenario);

                  return (
                    <motion.div
                      key={tile.id}
                      animate={{
                        opacity: deleted ? 0.35 : 1,
                        scale: deleted ? 0.96 : 1,
                      }}
                      transition={{ duration: 0.3, delay: deleted ? tileIndex * 0.06 : 0 }}
                      style={{
                        borderRadius: '0.375rem', padding: '0.5rem 0.4rem',
                        background: deleted ? '#e5535515' : muted, textAlign: 'center',
                        borderLeft: `3px solid ${deleted ? '#e55' : rowLocaleColor}`,
                        borderTop: `1.5px solid ${deleted ? '#e5535540' : border}`,
                        borderRight: `1.5px solid ${deleted ? '#e5535540' : border}`,
                        borderBottom: `1.5px solid ${deleted ? '#e5535540' : border}`,
                        transition: 'background 0.3s ease, border-color 0.3s ease',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: deleted ? mutedFg : fg,
                        fontWeight: 500, textDecoration: deleted ? 'line-through' : 'none',
                        textDecorationColor: '#e55',
                      }}>
                        {tile.label}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                        marginTop: '0.15rem',
                      }}>
                        {tile.inBatch && (
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: bg,
                            background: rowLocaleColor, borderRadius: '2px', padding: '0 3px',
                            lineHeight: '1.3', fontWeight: 600,
                          }}>
                            synced
                          </span>
                        )}
                        {deleted && (
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#e55',
                            fontWeight: 600, lineHeight: '1.3',
                          }}>
                            deleted
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scope line */}
      <div style={{
        textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        color: mutedFg, marginTop: '0.75rem',
      }}>
        deleteStale scans:{' '}
        <strong style={{ color: scenario === 'without' ? '#e55' : primary }}>
          {scenario === 'without' ? 'ALL docs' : 'EN only'}
        </strong>
      </div>

      {/* Counters */}
      <div style={{
        display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem',
        fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
      }}>
        <span style={{ color: '#e55', fontWeight: 600 }}>
          <motion.span key={`del-${deletedCount}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            {deletedCount}
          </motion.span>
          {' '}deleted
        </span>
        <span style={{ color: secondary, fontWeight: 600 }}>
          <motion.span key={`sur-${survivedCount}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            {survivedCount}
          </motion.span>
          {' '}survived
        </span>
      </div>
    </div>
  );
}

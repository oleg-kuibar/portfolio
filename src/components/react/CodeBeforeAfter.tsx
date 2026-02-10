import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors } from './useThemeColors';
import { PlayButton } from './PlayButton';

const BEFORE = `export const syncItems = mutation({
  handler: async (ctx, { items, realm, gameMode }) => {
    // Hash the incoming data
    const hash = await generateDataHash(items);

    // Check if anything changed
    const changed = await hasDataChanged(
      ctx, "d4data", "items", hash, realm, gameMode
    );
    if (!changed) return { skipped: true };

    // Upsert each item
    let created = 0, updated = 0;
    for (const item of items) {
      const existing = await ctx.db
        .query("items")
        .withIndex("by_name_realm", (q) =>
          q.eq("name", item.name).eq("realm", realm)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...item, lastSyncedAt: Date.now()
        });
        updated++;
      } else {
        await ctx.db.insert("items", {
          ...item, realm, lastSyncedAt: Date.now()
        });
        created++;
      }
    }

    // Record the sync version
    await recordSyncVersion(
      ctx, "d4data", "items", hash, realm, gameMode
    );
    return { created, updated };
  },
});`;

const AFTER = `export const syncItems = mutation({
  handler: async (ctx, { items, realm, gameMode }) => {
    return await importer.import(ctx, {
      source: "d4data",
      dataType: "items",
      data: items,
      upsert: {
        table: "items",
        index: "by_name_realm",
        getIndexKeys: (item) => [item.name, realm],
        toDoc: (item) => ({
          ...item, realm, lastSyncedAt: Date.now(),
        }),
      },
      options: { namespace: { realm, gameMode } },
    });
  },
});`;

const BEFORE_LINES = BEFORE.split('\n').length;
const AFTER_LINES = AFTER.split('\n').length;
const REDUCTION = Math.round((1 - AFTER_LINES / BEFORE_LINES) * 100);

const KEYWORDS = /\b(const|let|var|await|return|if|for|else|async|export|function|import|from|new)\b/g;
const STRINGS = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
const COMMENTS = /(\/\/.*$)/gm;

function colorize(line: string, colors: { primary: string; secondary: string; mutedFg: string; foreground: string }) {
  const tokens: { start: number; end: number; color: string }[] = [];

  let m: RegExpExecArray | null;

  COMMENTS.lastIndex = 0;
  while ((m = COMMENTS.exec(line)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, color: colors.mutedFg });
  }

  STRINGS.lastIndex = 0;
  while ((m = STRINGS.exec(line)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, color: colors.secondary });
  }

  KEYWORDS.lastIndex = 0;
  while ((m = KEYWORDS.exec(line)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, color: colors.primary });
  }

  tokens.sort((a, b) => a.start - b.start);

  const result: JSX.Element[] = [];
  let pos = 0;
  for (const token of tokens) {
    if (token.start < pos) continue;
    if (token.start > pos) {
      result.push(<span key={pos}>{line.slice(pos, token.start)}</span>);
    }
    result.push(<span key={token.start} style={{ color: token.color }}>{line.slice(token.start, token.end)}</span>);
    pos = token.end;
  }
  if (pos < line.length) {
    result.push(<span key={pos}>{line.slice(pos)}</span>);
  }
  return result;
}

export function CodeBeforeAfter() {
  const [tab, setTab] = useState<'before' | 'after'>('before');
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colors = useThemeColors();

  const handleInteraction = useCallback(() => { setHasInteracted(true); }, []);

  const handlePlay = useCallback(() => {
    handleInteraction();
    if (playing) {
      setPlaying(false);
    } else {
      setTab('before');
      setPlaying(true);
    }
  }, [playing, handleInteraction]);

  const handleTabClick = useCallback((t: 'before' | 'after') => {
    handleInteraction();
    setTab(t);
    setPlaying(false);
  }, [handleInteraction]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setTab(t => t === 'before' ? 'after' : 'before');
      }, 2000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, background: bg, primary, secondary, muted, accent } = colors;
  const code = tab === 'before' ? BEFORE : AFTER;
  const lines = code.split('\n');

  return (
    <div className="mermaid-container my-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['before', 'after'] as const).map(t => (
            <button key={t} onClick={() => handleTabClick(t)} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '0.25rem 0.625rem',
              borderRadius: '0.25rem', border: `2px solid ${tab === t ? fg : border}`,
              background: tab === t ? fg : 'transparent', color: tab === t ? bg : fg,
              cursor: 'pointer', fontWeight: tab === t ? 600 : 400, transition: 'all 0.15s ease',
            }}>
              {t === 'before' ? `Before · ${BEFORE_LINES} lines` : `After · ${AFTER_LINES} lines`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <PlayButton
            playing={playing}
            finished={false}
            onPlay={handlePlay}
            hasInteracted={hasInteracted}
            fg={fg} bg={bg} border={border} mutedFg={mutedFg} accent={accent}
          />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '0.2rem 0.5rem',
            borderRadius: '0.25rem', background: primary, color: bg, fontWeight: 600,
          }}>
            −{REDUCTION}% lines
          </span>
        </div>
      </div>

      <div style={{ overflow: 'hidden', borderRadius: '0.375rem', border: `1px solid ${border}`, background: muted }}>
        <AnimatePresence mode="wait">
          <motion.pre
            key={tab}
            initial={{ opacity: 0, y: tab === 'after' ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: tab === 'after' ? -8 : 8 }}
            transition={{ duration: 0.25 }}
            style={{
              margin: 0, padding: '1rem', overflowX: 'auto',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', lineHeight: 1.6, color: fg,
            }}
          >
            {lines.map((line, i) => (
              <div key={i} style={{ display: 'flex', minHeight: '1.4em' }}>
                <span style={{ width: '2.5ch', textAlign: 'right', marginRight: '1ch', color: mutedFg, opacity: 0.5, userSelect: 'none', flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span>{colorize(line, { primary, secondary, mutedFg, foreground: fg })}</span>
              </div>
            ))}
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}

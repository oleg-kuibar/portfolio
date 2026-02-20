import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors } from '../useThemeColors';
import { SectionHeader } from './SectionHeader';
import { CodeBlock } from './CodeBlock';
import { DataTreePanel } from './DataTreePanel';
import type { NodeTraceStatus } from './DataTreePanel';

// ─── Mock data for soft-delete demo ─────────────────────────────

const MOCK_DATA = {
  users: [
    { _id: 'sd_u1', name: 'Alice', email: 'alice@example.com' },
    { _id: 'sd_u2', name: 'Bob', email: 'bob@example.com' },
  ],
  posts: [
    { _id: 'sd_p1', userId: 'sd_u1', title: 'Hello World', body: 'First post' },
    { _id: 'sd_p2', userId: 'sd_u1', title: 'Cascade Deletes', body: 'Deep dive' },
    { _id: 'sd_p3', userId: 'sd_u2', title: "Bob's Post", body: 'Hello from Bob' },
  ],
  comments: [
    { _id: 'sd_c1', postId: 'sd_p1', userId: 'sd_u2', body: 'Great post!' },
    { _id: 'sd_c2', postId: 'sd_p1', userId: 'sd_u1', body: 'Thanks!' },
    { _id: 'sd_c3', postId: 'sd_p2', userId: 'sd_u2', body: 'Informative' },
    { _id: 'sd_c4', postId: 'sd_p3', userId: 'sd_u1', body: 'Nice one!' },
  ],
  reactions: [
    { _id: 'sd_r1', commentId: 'sd_c1', userId: 'sd_u1', emoji: '\u{1F44D}' },
    { _id: 'sd_r2', commentId: 'sd_c2', userId: 'sd_u2', emoji: '\u{2764}\u{FE0F}' },
    { _id: 'sd_r3', commentId: 'sd_c3', userId: 'sd_u1', emoji: '\u{1F389}' },
    { _id: 'sd_r4', commentId: 'sd_c4', userId: 'sd_u2', emoji: '\u{1F44D}' },
  ],
};

// ─── Cascade resolution (which IDs are affected) ────────────────

function getCascadeIds(rootTable: string, rootId: string): string[] {
  const ids: string[] = [rootId];

  if (rootTable === 'users') {
    const userPosts = MOCK_DATA.posts.filter(p => p.userId === rootId);
    for (const post of userPosts) {
      ids.push(post._id);
      const postComments = MOCK_DATA.comments.filter(c => c.postId === post._id);
      for (const comment of postComments) {
        ids.push(comment._id);
        ids.push(...MOCK_DATA.reactions.filter(r => r.commentId === comment._id).map(r => r._id));
      }
    }
  } else if (rootTable === 'posts') {
    const postComments = MOCK_DATA.comments.filter(c => c.postId === rootId);
    for (const comment of postComments) {
      ids.push(comment._id);
      ids.push(...MOCK_DATA.reactions.filter(r => r.commentId === comment._id).map(r => r._id));
    }
  } else if (rootTable === 'comments') {
    ids.push(...MOCK_DATA.reactions.filter(r => r.commentId === rootId).map(r => r._id));
  }

  return ids;
}

const SOFT_DELETE_CODE = `// Soft-delete: mark as deleted without removing
await cascade.deleteWithCascade(ctx, "users", userId, {
  softDelete: true, // marks all descendants
});

// Later: restore if needed
await cascade.restore(ctx, "users", userId);`;

// ─── Component ──────────────────────────────────────────────────

export function SoftDeleteSection() {
  const colors = useThemeColors();
  const [selected, setSelected] = useState<{ table: string; id: string } | null>(null);
  const [trashedIds, setTrashedIds] = useState<Set<string>>(new Set());
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  const handleSoftDelete = useCallback(() => {
    if (!selected) return;
    const ids = getCascadeIds(selected.table, selected.id);
    // Animate the soft-delete
    setAnimatingIds(new Set(ids));
    setTimeout(() => {
      setTrashedIds(prev => {
        const next = new Set(prev);
        for (const id of ids) next.add(id);
        return next;
      });
      setAnimatingIds(new Set());
      setSelected(null);
    }, 600);
  }, [selected]);

  const handleRestore = useCallback(() => {
    setTrashedIds(new Set());
    setSelected(null);
    setAnimatingIds(new Set());
  }, []);

  const handleReset = useCallback(() => {
    setTrashedIds(new Set());
    setSelected(null);
    setAnimatingIds(new Set());
  }, []);

  const nodeStatus = useCallback((id: string): NodeTraceStatus => {
    if (animatingIds.has(id)) return 'deleting';
    if (trashedIds.has(id)) return 'soft-deleted';
    return null;
  }, [trashedIds, animatingIds]);

  const trashedCount = trashedIds.size;
  const isDisabled = animatingIds.size > 0;

  if (!colors) return null;

  const { foreground: fg, mutedFg, border, background: bg, muted, warning, success } = colors;

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
    opacity: isDisabled ? 0.6 : 1,
  };

  return (
    <section style={{ marginBottom: '4rem' }}>
      <SectionHeader
        title="Soft-Delete & Restore"
        subtitle="Mark documents as deleted without removing them. Restore the entire cascade with one call."
        id="soft-delete"
      />

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: code snippet */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <CodeBlock code={SOFT_DELETE_CODE} language="typescript" title="mutation.ts" />

          <div style={{
            marginTop: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: mutedFg,
            lineHeight: 1.6,
          }}>
            Soft-deleted documents stay in the database but are excluded from queries.
            You can restore the entire cascade tree at any time.
          </div>
        </div>

        {/* Right: interactive demo */}
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <div className="mermaid-container" style={{ padding: '1rem' }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center',
              border: `1.5px solid ${border}`, borderRadius: '0.375rem', padding: '0.4rem 0.5rem', background: muted,
            }}>
              <button onClick={handleSoftDelete} disabled={isDisabled || !selected} style={{
                ...btnStyle,
                borderColor: selected ? warning : border,
                color: selected ? warning : fg,
                fontWeight: selected ? 600 : 400,
              }}>
                Soft Delete
              </button>
              <button onClick={handleRestore} disabled={isDisabled || trashedCount === 0} style={{
                ...btnStyle,
                borderColor: trashedCount > 0 ? success : border,
                color: trashedCount > 0 ? success : fg,
                fontWeight: trashedCount > 0 ? 600 : 400,
              }}>
                Restore All
              </button>
              <button onClick={handleReset} disabled={isDisabled} style={{ ...btnStyle, fontSize: '0.65rem', color: mutedFg, borderColor: border }}>
                Reset
              </button>

              {trashedCount > 0 && (
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: warning, fontWeight: 600 }}>
                  {trashedCount} trashed
                </span>
              )}
            </div>

            {/* Tree */}
            <DataTreePanel
              data={MOCK_DATA}
              colors={colors}
              selected={selected}
              onSelect={setSelected}
              nodeStatus={nodeStatus}
              disabled={isDisabled}
            />

            <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: mutedFg, opacity: 0.7 }}>
              {!selected && trashedCount === 0 && 'Click a node, then Soft Delete to mark it and its descendants.'}
              {!selected && trashedCount > 0 && 'Documents are marked but not removed. Click Restore All to bring them back.'}
              {selected && `Selected: ${selected.table}. Soft Delete will mark all descendants.`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

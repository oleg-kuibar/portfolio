import { motion } from 'framer-motion';
import type { ThemeColors } from '../useThemeColors';

// ─── Types ──────────────────────────────────────────────────────

export type NodeTraceStatus = 'root' | 'discovered' | 'deleting' | 'deleted' | 'soft-deleted' | null;

interface DataTreePanelProps {
  data: {
    users: Array<{ _id: string; name: string; email: string }>;
    posts: Array<{ _id: string; userId: string; title: string; body: string }>;
    comments: Array<{ _id: string; postId: string; userId: string; body: string }>;
    reactions: Array<{ _id: string; commentId: string; userId: string; emoji: string }>;
  } | null;
  colors: ThemeColors;
  selected: { table: string; id: string } | null;
  onSelect: (sel: { table: string; id: string } | null) => void;
  nodeStatus?: (id: string) => NodeTraceStatus;
  disabled?: boolean;
  emptyMessage?: string;
}

// ─── Component ──────────────────────────────────────────────────

export function DataTreePanel({
  data, colors, selected, onSelect, nodeStatus, disabled, emptyMessage,
}: DataTreePanelProps) {
  const { foreground: fg, mutedFg, primary, secondary, accent } = colors;
  const getStatus = nodeStatus || (() => null);
  const isSelected = (table: string, id: string) => selected?.table === table && selected?.id === id;
  const isEmpty = data && data.users.length === 0 && data.posts.length === 0;

  if (!data) {
    return (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: mutedFg, padding: '2rem 0', textAlign: 'center' }}>
        Connecting to Convex...
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: mutedFg, padding: '2rem 0', textAlign: 'center' }}>
        {emptyMessage || 'No data yet. Click Reset DB to populate.'}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
      {data.users.map(user => (
        <div key={user._id}>
          <NodeRow
            label={`\u{1F464} ${user.name}`} sublabel={user.email} tableColor={primary}
            selected={isSelected('users', user._id)} traceStatus={getStatus(user._id)}
            onClick={() => !disabled && onSelect(isSelected('users', user._id) ? null : { table: 'users', id: user._id })}
            depth={0} colors={colors}
          />
          {data.posts.filter(p => p.userId === user._id).map(post => (
            <div key={post._id}>
              <NodeRow
                label={`\u{1F4DD} ${post.title}`} tableColor={secondary}
                selected={isSelected('posts', post._id)} traceStatus={getStatus(post._id)}
                onClick={() => !disabled && onSelect(isSelected('posts', post._id) ? null : { table: 'posts', id: post._id })}
                depth={1} colors={colors}
              />
              {data.comments.filter(c => c.postId === post._id).map(comment => (
                <div key={comment._id}>
                  <NodeRow
                    label={`\u{1F4AC} ${comment.body}`} tableColor={accent}
                    selected={isSelected('comments', comment._id)} traceStatus={getStatus(comment._id)}
                    onClick={() => !disabled && onSelect(isSelected('comments', comment._id) ? null : { table: 'comments', id: comment._id })}
                    depth={2} colors={colors}
                  />
                  {data.reactions.filter(r => r.commentId === comment._id).map(reaction => (
                    <NodeRow
                      key={reaction._id} label={reaction.emoji} tableColor={mutedFg}
                      selected={isSelected('reactions', reaction._id)} traceStatus={getStatus(reaction._id)}
                      onClick={() => !disabled && onSelect(isSelected('reactions', reaction._id) ? null : { table: 'reactions', id: reaction._id })}
                      depth={3} colors={colors}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Tree Node Row ──────────────────────────────────────────────

function NodeRow({ label, sublabel, tableColor, selected, traceStatus, onClick, depth, colors }: {
  label: string; sublabel?: string; tableColor: string;
  selected: boolean; traceStatus: NodeTraceStatus;
  onClick: () => void; depth: number; colors: ThemeColors;
}) {
  const { foreground: fg, background: bg, border, accent, primary, danger, dangerMuted, warning, success } = colors;
  let rowBg = 'transparent'; let rowBorder = 'transparent';
  let textColor = fg; let textDecoration = 'none'; let indicatorColor = tableColor;
  let opacity = 1;

  if (selected && !traceStatus) { rowBg = `${accent}28`; rowBorder = accent; }
  if (traceStatus === 'root') { rowBg = `${primary}25`; rowBorder = primary; indicatorColor = primary; }
  else if (traceStatus === 'discovered') { rowBg = `${accent}20`; rowBorder = accent; indicatorColor = accent; }
  else if (traceStatus === 'deleting') { rowBg = `${danger}30`; rowBorder = danger; textColor = danger; indicatorColor = danger; }
  else if (traceStatus === 'deleted') { rowBg = `${danger}18`; rowBorder = dangerMuted; textDecoration = 'line-through'; textColor = dangerMuted; indicatorColor = dangerMuted; }
  else if (traceStatus === 'soft-deleted') { rowBg = `${warning}18`; rowBorder = warning; textDecoration = 'line-through'; textColor = warning; indicatorColor = warning; opacity = 0.65; }

  return (
    <motion.div
      onClick={onClick}
      animate={{ backgroundColor: rowBg, borderColor: rowBorder }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.3rem 0.5rem', paddingLeft: `${0.5 + depth * 1.25}rem`,
        borderRadius: '0.25rem', cursor: traceStatus ? 'default' : 'pointer',
        border: `2px solid ${rowBorder}`, background: rowBg, position: 'relative',
        opacity,
      }}
    >
      {depth > 0 && (
        <div style={{
          position: 'absolute', left: `${0.15 + (depth - 1) * 1.25}rem`,
          top: 0, bottom: '50%', width: '0.75rem',
          borderLeft: `1.5px solid ${border}`, borderBottom: `1.5px solid ${border}`,
          borderBottomLeftRadius: '0.2rem', opacity: 0.5, pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', width: 12, height: 12, flexShrink: 0 }}>
        <motion.div
          animate={{ background: indicatorColor, scale: traceStatus === 'deleting' ? [1, 1.8, 0] : 1 }}
          transition={traceStatus === 'deleting' ? { duration: 0.4 } : { duration: 0.2 }}
          style={{ width: 10, height: 10, borderRadius: '50%', background: indicatorColor, position: 'absolute', top: 1, left: 1 }}
        />
        {(traceStatus === 'root' || traceStatus === 'discovered') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.7, 0], scale: [1, 2.5] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ position: 'absolute', top: -1, left: -1, width: 14, height: 14, borderRadius: '50%', border: `2px solid ${indicatorColor}`, pointerEvents: 'none' }}
          />
        )}
      </div>
      <span style={{ color: textColor, textDecoration, transition: 'color 0.2s', fontWeight: 500 }}>{label}</span>
      {sublabel && <span style={{ color: tableColor, fontSize: '0.65rem', opacity: 0.8 }}>{sublabel}</span>}
      {traceStatus && traceStatus !== 'deleted' && traceStatus !== 'soft-deleted' && (
        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            marginLeft: 'auto', padding: '0.1rem 0.4rem', borderRadius: '0.2rem',
            background: traceStatus === 'root' ? primary : traceStatus === 'discovered' ? accent : danger,
            color: traceStatus === 'discovered' ? bg : '#fff',
            fontSize: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
            letterSpacing: '0.03em',
          }}>
          {traceStatus === 'root' ? 'ROOT' : traceStatus === 'discovered' ? 'FOUND' : 'DEL'}
        </motion.span>
      )}
      {traceStatus === 'deleted' && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            marginLeft: 'auto', padding: '0.1rem 0.4rem', borderRadius: '0.2rem',
            background: dangerMuted, color: danger, fontSize: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
            letterSpacing: '0.03em',
          }}>
          DELETED
        </motion.span>
      )}
      {traceStatus === 'soft-deleted' && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            marginLeft: 'auto', padding: '0.1rem 0.4rem', borderRadius: '0.2rem',
            background: `${warning}30`, color: warning, fontSize: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
            border: `1px solid ${warning}50`,
            letterSpacing: '0.03em',
          }}>
          TRASHED
        </motion.span>
      )}
    </motion.div>
  );
}

import { useState } from 'react';
import { useThemeColors } from '../useThemeColors';
import { SectionHeader } from './SectionHeader';
import { CascadeViz } from './CascadeViz';
import { NormalDeleteViz } from './NormalDeleteViz';
import { FailureViz } from './FailureViz';
import { RecoveryViz } from './RecoveryViz';
import type { PlaygroundData } from './tree-builders';

const TABS = [
  { key: 'cascade', label: 'Cascade Delete' },
  { key: 'normal', label: 'Normal Delete' },
  { key: 'failure', label: 'Failed Delete' },
  { key: 'recovery', label: 'Error Recovery' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// Static mock data matching the seed function output so the algorithm
// visualizations work without needing a live database connection.
const MOCK_DATA: PlaygroundData = {
  users: [
    { _id: 'u_alice', name: 'Alice', email: 'alice@example.com' },
    { _id: 'u_bob', name: 'Bob', email: 'bob@example.com' },
  ],
  posts: [
    { _id: 'p_1', userId: 'u_alice', title: 'Hello World', body: 'My first post!' },
    { _id: 'p_2', userId: 'u_alice', title: 'Cascade Deletes', body: 'A deep dive into cascading deletes.' },
    { _id: 'p_3', userId: 'u_bob', title: "Bob's Post", body: 'Hello from Bob!' },
  ],
  comments: [
    { _id: 'c_1', postId: 'p_1', userId: 'u_bob', body: 'Great post!' },
    { _id: 'c_2', postId: 'p_1', userId: 'u_alice', body: 'Thanks Bob!' },
    { _id: 'c_3', postId: 'p_2', userId: 'u_bob', body: 'Informative' },
    { _id: 'c_4', postId: 'p_3', userId: 'u_alice', body: 'Nice one!' },
  ],
  reactions: [
    { _id: 'r_1', commentId: 'c_1', userId: 'u_alice', emoji: '\u{1F44D}' },
    { _id: 'r_2', commentId: 'c_2', userId: 'u_bob', emoji: '\u{2764}\u{FE0F}' },
    { _id: 'r_3', commentId: 'c_3', userId: 'u_alice', emoji: '\u{1F389}' },
    { _id: 'r_4', commentId: 'c_4', userId: 'u_bob', emoji: '\u{1F44D}' },
  ],
};

export function AlgorithmSection() {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabKey>('cascade');

  if (!colors) return null;

  const { foreground: fg, mutedFg, border } = colors;

  return (
    <section style={{ marginBottom: '4rem' }}>
      <SectionHeader
        title="How It Works"
        subtitle="BFS traversal discovers all dependents level-by-level via parallel index queries, then deletes in reverse level order. I/O rounds scale with graph depth, not node count."
        id="algorithm"
      />

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        borderBottom: `1px solid ${border}`,
        marginBottom: '1rem',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '0.5rem 0.25rem',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.key ? fg : 'transparent'}`,
              color: activeTab === tab.key ? fg : mutedFg,
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'cascade' ? (
        <CascadeViz data={MOCK_DATA} />
      ) : activeTab === 'normal' ? (
        <NormalDeleteViz data={MOCK_DATA} />
      ) : activeTab === 'failure' ? (
        <FailureViz data={MOCK_DATA} />
      ) : (
        <RecoveryViz data={MOCK_DATA} />
      )}
    </section>
  );
}

import type { CascadeStep, RecoveryStep, TreeNode } from './cascade-logic';

// ─── Types ──────────────────────────────────────────────────────

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  source: string;
  message: string;
  stepIndex: number;
}

// ─── Helpers ────────────────────────────────────────────────────

/** Generate a fake timestamp starting from a base, incrementing by ~100–400ms per step */
function makeTimestamps(count: number): string[] {
  const base = new Date(2025, 0, 15, 14, 23, 1, 234);
  const timestamps: string[] = [];
  let ms = base.getTime();
  for (let i = 0; i < count; i++) {
    const d = new Date(ms);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const mss = String(d.getMilliseconds()).padStart(3, '0');
    timestamps.push(`${hh}:${mm}:${ss}.${mss}`);
    ms += 80 + Math.floor(i * 30);
  }
  return timestamps;
}

function tableCounts(ids: string[], nodeMap: Record<string, TreeNode>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of ids) {
    const table = nodeMap[id]?.table ?? 'unknown';
    counts[table] = (counts[table] || 0) + 1;
  }
  return counts;
}

function indexNameForTable(table: string): string {
  const map: Record<string, string> = {
    posts: 'by_userId',
    comments: 'by_postId',
    reactions: 'by_commentId',
  };
  return map[table] || `by_parentId`;
}

// ─── Cascade log entries ────────────────────────────────────────

export function buildCascadeLogEntries(
  cascadeSteps: CascadeStep[],
  nodes: TreeNode[],
  nodeMap: Record<string, TreeNode>,
): LogEntry[] {
  const entries: LogEntry[] = [];
  const ts = makeTimestamps(cascadeSteps.length + 4);
  let tsIdx = 0;

  const rootLabel = nodes[0]?.label ?? 'root';
  const rootTable = nodes[0]?.table ?? 'unknown';

  // Step 0 → initial
  entries.push({
    timestamp: ts[tsIdx++],
    level: 'INFO',
    source: 'cascade.deleteWithCascade',
    message: `Starting BFS from ${rootTable}:${rootLabel}`,
    stepIndex: 0,
  });

  // Find the transition point between discovery and deletion
  const firstDeleteIdx = cascadeSteps.findIndex(s => s.action === 'delete');

  for (let i = 0; i < cascadeSteps.length; i++) {
    const cs = cascadeSteps[i];
    const stepIndex = i + 1; // animation step = cascadeSteps index + 1

    if (cs.action === 'visit') {
      const tables = [...new Set(cs.nodeIds.map(id => nodeMap[id]?.table))];
      entries.push({
        timestamp: ts[tsIdx++],
        level: 'INFO',
        source: 'cascade.deleteWithCascade',
        message: `Level ${cs.level}: Querying ${cs.nodeIds.length} ${tables.join(', ')} node${cs.nodeIds.length !== 1 ? 's' : ''}`,
        stepIndex,
      });
    } else if (cs.action === 'discover') {
      const counts = tableCounts(cs.nodeIds, nodeMap);
      const parts = Object.entries(counts).map(
        ([table, count]) => `${count} ${table} via ${indexNameForTable(table)}`,
      );
      entries.push({
        timestamp: ts[tsIdx++],
        level: 'INFO',
        source: 'cascade.deleteWithCascade',
        message: `Level ${cs.level}: Found ${parts.join(', ')}`,
        stepIndex,
      });
    } else if (cs.action === 'delete') {
      // Insert "Discovery complete" message right before the first delete
      if (i === firstDeleteIdx) {
        const tableSet = new Set(nodes.map(n => n.table));
        entries.push({
          timestamp: ts[tsIdx++],
          level: 'INFO',
          source: 'cascade.deleteWithCascade',
          message: `Discovery complete: ${nodes.length} docs across ${tableSet.size} tables`,
          stepIndex,
        });
      }
      const counts = tableCounts(cs.nodeIds, nodeMap);
      const parts = Object.entries(counts).map(([table, count]) => `${count} ${table}`);
      entries.push({
        timestamp: ts[tsIdx++],
        level: 'INFO',
        source: 'cascade.deleteWithCascade',
        message: `Deleting level ${cs.level}: ${parts.join(', ')}`,
        stepIndex,
      });
    }
  }

  // Final success entry at the last step
  entries.push({
    timestamp: ts[Math.min(tsIdx, ts.length - 1)],
    level: 'SUCCESS',
    source: 'cascade.deleteWithCascade',
    message: `Cascade complete: ${nodes.length} documents deleted in 267ms`,
    stepIndex: cascadeSteps.length,
  });

  return entries;
}

// ─── Normal delete log entries ──────────────────────────────────

export function buildNormalLogEntries(nodes: TreeNode[]): LogEntry[] {
  const rootLabel = nodes[0]?.label ?? 'root';
  const rootTable = nodes[0]?.table ?? 'unknown';
  const orphanCount = nodes.length - 1;
  const ts = makeTimestamps(4);

  return [
    {
      timestamp: ts[0],
      level: 'INFO',
      source: 'ctx.db.delete',
      message: `Deleting ${rootTable}:${rootLabel}`,
      stepIndex: 1,
    },
    {
      timestamp: ts[1],
      level: 'WARN',
      source: 'ctx.db.delete',
      message: `${orphanCount} documents now have dangling foreign key references`,
      stepIndex: 2,
    },
    {
      timestamp: ts[2],
      level: 'INFO',
      source: 'ctx.db.delete',
      message: `Deleted 1 document — no cascade configured`,
      stepIndex: 2,
    },
  ];
}

// ─── Failure log entries ────────────────────────────────────────

export function buildFailureLogEntries(
  cascadeSteps: CascadeStep[],
  failureCascadeStep: number,
  partialDeletedIds: Set<string>,
  nodes: TreeNode[],
  nodeMap: Record<string, TreeNode>,
): LogEntry[] {
  // Reuse cascade entries up to the failure point
  const allCascadeEntries = buildCascadeLogEntries(cascadeSteps, nodes, nodeMap);

  // Keep entries whose stepIndex <= failureCascadeStep
  const entries = allCascadeEntries.filter(e => e.stepIndex <= failureCascadeStep);

  const ts = makeTimestamps(entries.length + 4);
  const nextTs = ts[Math.min(entries.length, ts.length - 1)];
  const nextTs2 = ts[Math.min(entries.length + 1, ts.length - 1)];

  const deletedCount = partialDeletedIds.size;
  const orphanedCount = nodes.length - deletedCount;

  entries.push({
    timestamp: nextTs,
    level: 'ERROR',
    source: 'cascade.deleteWithCascade',
    message: `TransactionTooLarge: mutation exceeded 8MB limit`,
    stepIndex: failureCascadeStep + 1,
  });

  entries.push({
    timestamp: nextTs2,
    level: 'ERROR',
    source: 'cascade.deleteWithCascade',
    message: `Partial state: ${deletedCount} deleted, ${orphanedCount} orphaned`,
    stepIndex: failureCascadeStep + 2,
  });

  return entries;
}

// ─── Recovery log entries ────────────────────────────────────────

export function buildRecoveryLogEntries(
  cascadeSteps: CascadeStep[],
  recoverySteps: RecoveryStep[],
  failureCascadeStep: number,
  partialDeletedIds: Set<string>,
  nodes: TreeNode[],
  nodeMap: Record<string, TreeNode>,
): LogEntry[] {
  // Start with failure log entries
  const entries = buildFailureLogEntries(cascadeSteps, failureCascadeStep, partialDeletedIds, nodes, nodeMap);

  const ts = makeTimestamps(entries.length + recoverySteps.length + 4);
  let tsIdx = entries.length;

  const batchCount = recoverySteps.filter(s => s.action === 'batch_start').length;

  for (let i = 0; i < recoverySteps.length; i++) {
    const rs = recoverySteps[i];
    const stepIndex = failureCascadeStep + 3 + i;
    const timestamp = ts[Math.min(tsIdx++, ts.length - 1)];

    switch (rs.action) {
      case 'detect_stale':
        entries.push({
          timestamp, level: 'WARN', source: 'cascade',
          message: 'Stale operation detected: op_1708167234567, status=processing, age=45s',
          stepIndex,
        });
        break;
      case 'resume': {
        const totalRemaining = recoverySteps
          .filter(s => s.action === 'batch_start')
          .reduce((sum, s) => sum + s.nodeIds.length, 0);
        entries.push({
          timestamp, level: 'INFO', source: 'cascade',
          message: `Resuming with batched mode: ${totalRemaining} docs in ${batchCount} batches`,
          stepIndex,
        });
        break;
      }
      case 'batch_start': {
        const tables = [...new Set(rs.nodeIds.map(id => nodeMap[id]?.table))];
        entries.push({
          timestamp, level: 'INFO', source: 'cascade:worker',
          message: `Batch ${rs.batchIndex + 1}/${batchCount}: processing ${rs.nodeIds.length} ${tables.join(', ')}`,
          stepIndex,
        });
        break;
      }
      case 'batch_retry':
        entries.push({
          timestamp, level: 'WARN', source: 'cascade:worker',
          message: `Entry ${rs.retryNodeId} failed: "Document locked by concurrent mutation", retry 1/3`,
          stepIndex,
        });
        break;
      case 'batch_complete':
        entries.push({
          timestamp, level: 'INFO', source: 'cascade:worker',
          message: `Batch ${rs.batchIndex + 1}/${batchCount}: deleted ${rs.nodeIds.length} documents`,
          stepIndex,
        });
        break;
      case 'recovery_done':
        entries.push({
          timestamp, level: 'SUCCESS', source: 'cascade',
          message: `Recovery complete: ${nodes.length} documents deleted in 1,847ms`,
          stepIndex,
        });
        break;
    }
  }

  return entries;
}

// ─── Types ──────────────────────────────────────────────────────

export type NodeStatus = 'idle' | 'visiting' | 'discovered' | 'deleting' | 'deleted' | 'orphaned';

export interface TreeNode {
  id: string;
  label: string;
  table: string;
  children: string[];
  parent: string | null;
  x: number;
  y: number;
}

export interface StepState {
  statuses: Record<string, NodeStatus>;
  visited: string[];
  stack: string[];
  explanation: string;
  activeEdge: { from: string; to: string } | null;
}

export interface CascadeStep {
  nodeIds: string[];
  action: 'visit' | 'discover' | 'delete';
  level: number;
}

// ─── BFS step computation ───────────────────────────────────────

export function buildCascadeSteps(nodeMap: Record<string, TreeNode>, rootId: string): CascadeStep[] {
  const steps: CascadeStep[] = [];
  const levels: string[][] = [];

  let currentLevel = [rootId];
  let levelNum = 0;

  while (currentLevel.length > 0) {
    levels.push(currentLevel);
    steps.push({ nodeIds: currentLevel, action: 'visit', level: levelNum });

    const nextLevel: string[] = [];
    for (const nodeId of currentLevel) {
      nextLevel.push(...nodeMap[nodeId].children);
    }
    if (nextLevel.length > 0) {
      steps.push({ nodeIds: nextLevel, action: 'discover', level: levelNum + 1 });
    }

    currentLevel = nextLevel;
    levelNum++;
  }

  for (let i = levels.length - 1; i >= 0; i--) {
    steps.push({ nodeIds: levels[i], action: 'delete', level: i });
  }

  return steps;
}

// ─── State computation: Cascade mode ────────────────────────────

export function computeCascadeState(
  step: number,
  cascadeSteps: CascadeStep[],
  nodes: TreeNode[],
  nodeMap: Record<string, TreeNode>,
  tableLabels?: Record<string, string>,
): StepState {
  const statuses: Record<string, NodeStatus> = {};
  const visited: string[] = [];
  for (const n of nodes) statuses[n.id] = 'idle';

  if (step === 0) {
    const rootLabel = nodes[0]?.label || 'root';
    return { statuses, visited, stack: [], explanation: `Click Play to start BFS cascade delete from ${rootLabel}`, activeEdge: null };
  }

  const applied = cascadeSteps.slice(0, step);
  let queue: string[] = [];

  for (const s of applied) {
    if (s.action === 'visit') {
      for (const id of s.nodeIds) {
        statuses[id] = 'visiting';
        if (!visited.includes(id)) visited.push(id);
      }
      queue = [...s.nodeIds];
    } else if (s.action === 'discover') {
      for (const id of s.nodeIds) {
        if (statuses[id] === 'idle') statuses[id] = 'discovered';
      }
      queue = [...s.nodeIds];
    } else if (s.action === 'delete') {
      for (const id of s.nodeIds) statuses[id] = 'deleted';
      queue = [];
    }
  }

  const last = applied[applied.length - 1];

  if (last.action === 'visit') {
    for (const n of nodes) {
      if (statuses[n.id] === 'visiting' && !last.nodeIds.includes(n.id)) {
        statuses[n.id] = 'discovered';
      }
    }
  } else if (last.action === 'discover') {
    for (const n of nodes) {
      if (statuses[n.id] === 'visiting') statuses[n.id] = 'discovered';
    }
  }

  let activeEdge: StepState['activeEdge'] = null;
  if (last.action === 'discover' && last.nodeIds.length > 0) {
    const firstChild = last.nodeIds[0];
    const childNode = nodeMap[firstChild];
    if (childNode?.parent) activeEdge = { from: childNode.parent, to: firstChild };
  }

  const tableSet = tableLabels
    ? [...new Set(last.nodeIds.map(id => tableLabels[nodeMap[id].table] || nodeMap[id].table))]
    : [];
  const tableHint = tableSet.length > 0 ? ` (${tableSet.join(', ')})` : '';

  let explanation = '';
  if (last.action === 'visit') {
    explanation = `Visit level ${last.level}: ${last.nodeIds.length} node${last.nodeIds.length !== 1 ? 's' : ''}${tableHint} — querying dependents via Promise.all`;
  } else if (last.action === 'discover') {
    explanation = `Discovered ${last.nodeIds.length} dependent${last.nodeIds.length !== 1 ? 's' : ''} at level ${last.level} via parallel index queries`;
  } else if (last.action === 'delete') {
    explanation = `Delete level ${last.level}: ${last.nodeIds.length} node${last.nodeIds.length !== 1 ? 's' : ''}${tableHint}`;
  }

  const allDeleted = Object.values(statuses).every(s => s === 'deleted');
  if (allDeleted) {
    explanation = `Done! All ${nodes.length} documents deleted via BFS cascade.`;
  }

  return { statuses, visited, stack: queue, explanation, activeEdge };
}

// ─── State computation: Normal delete ───────────────────────────

export function computeNormalState(nodes: TreeNode[]): (step: number) => StepState {
  return (step: number): StepState => {
    const statuses: Record<string, NodeStatus> = {};
    for (const n of nodes) statuses[n.id] = 'idle';

    if (step === 0) {
      const rootLabel = nodes[0]?.label || 'root';
      return { statuses, visited: [], stack: [], explanation: `Click Play to see a normal delete of ${rootLabel}`, activeEdge: null };
    }
    if (step === 1) {
      statuses[nodes[0].id] = 'deleting';
      return { statuses, visited: [nodes[0].id], stack: [nodes[0].id], explanation: `ctx.db.delete(${nodes[0].label.toLowerCase()}) removes only the root document`, activeEdge: null };
    }
    statuses[nodes[0].id] = 'deleted';
    for (let i = 1; i < nodes.length; i++) {
      statuses[nodes[i].id] = 'orphaned';
    }
    return {
      statuses,
      visited: [nodes[0].id],
      stack: [],
      explanation: `${nodes[0].label} deleted, but ${nodes.length - 1} orphaned documents remain with dangling references.`,
      activeEdge: null,
    };
  };
}

export const NORMAL_TOTAL = 2;

// ─── State computation: Failed delete ───────────────────────────

export function computeFailureState(
  step: number,
  cascadeSteps: CascadeStep[],
  failureCascadeStep: number,
  partialDeletedIds: Set<string>,
  nodes: TreeNode[],
  nodeMap: Record<string, TreeNode>,
  tableLabels?: Record<string, string>,
): StepState {
  if (step <= failureCascadeStep) {
    return computeCascadeState(step, cascadeSteps, nodes, nodeMap, tableLabels);
  }

  if (step === failureCascadeStep + 1) {
    const state = computeCascadeState(failureCascadeStep, cascadeSteps, nodes, nodeMap, tableLabels);
    for (const id of partialDeletedIds) {
      state.statuses[id] = 'deleted';
    }
    const totalDeleted = Object.values(state.statuses).filter(s => s === 'deleted').length;
    state.explanation = `Deleting level... ${totalDeleted} nodes deleted so far`;
    state.stack = [...partialDeletedIds];
    state.activeEdge = null;
    return state;
  }

  const state = computeCascadeState(failureCascadeStep, cascadeSteps, nodes, nodeMap, tableLabels);
  for (const id of partialDeletedIds) {
    state.statuses[id] = 'deleted';
  }
  for (const n of nodes) {
    if (state.statuses[n.id] !== 'deleted') {
      state.statuses[n.id] = 'orphaned';
    }
  }
  const deletedCount = Object.values(state.statuses).filter(s => s === 'deleted').length;
  const orphanedCount = Object.values(state.statuses).filter(s => s === 'orphaned').length;
  state.explanation = `Process crashed! ${deletedCount} deleted, ${orphanedCount} orphaned with dangling references.`;
  state.stack = [];
  state.activeEdge = null;
  return state;
}

// ─── Recovery types ─────────────────────────────────────────────

export interface RecoveryStep {
  action: 'detect_stale' | 'resume' | 'batch_start' | 'batch_retry' | 'batch_complete' | 'recovery_done';
  nodeIds: string[];
  batchIndex: number;
  retryNodeId?: string;
}

// ─── Build recovery steps ───────────────────────────────────────

export function buildRecoverySteps(
  cascadeSteps: CascadeStep[],
  failureCascadeStep: number,
  partialDeletedIds: Set<string>,
): RecoveryStep[] {
  // The failure occurs at cascadeSteps[failureCascadeStep - 1] (since step index is 1-based)
  // Find which delete levels remain after the crash
  const deleteSteps = cascadeSteps.filter(s => s.action === 'delete');
  const firstDeleteIdx = cascadeSteps.findIndex(s => s.action === 'delete');

  // Determine how many delete steps completed before the crash
  // failureCascadeStep is the step index where the crash happens
  const crashCascadeIdx = failureCascadeStep - 1; // 0-based index into cascadeSteps
  const crashDeleteStep = cascadeSteps[crashCascadeIdx];

  // Collect remaining nodes: crash-level nodes not in partialDeletedIds + all subsequent delete levels
  const remainingBatches: { nodeIds: string[]; table: string }[] = [];

  let foundCrashStep = false;
  for (const ds of deleteSteps) {
    if (ds === crashDeleteStep) {
      foundCrashStep = true;
      const remaining = ds.nodeIds.filter(id => !partialDeletedIds.has(id));
      if (remaining.length > 0) {
        remainingBatches.push({ nodeIds: remaining, table: '' });
      }
      continue;
    }
    if (foundCrashStep) {
      remainingBatches.push({ nodeIds: [...ds.nodeIds], table: '' });
    }
  }

  if (remainingBatches.length === 0) return [];

  const totalRemaining = remainingBatches.reduce((sum, b) => sum + b.nodeIds.length, 0);
  const retryNodeId = remainingBatches[0].nodeIds[0];

  const steps: RecoveryStep[] = [];

  // detect_stale
  steps.push({ action: 'detect_stale', nodeIds: [], batchIndex: 0 });
  // resume
  steps.push({ action: 'resume', nodeIds: [], batchIndex: 0 });

  // For each batch: batch_start → (optional batch_retry for batch 0) → batch_complete
  for (let i = 0; i < remainingBatches.length; i++) {
    const batch = remainingBatches[i];
    steps.push({ action: 'batch_start', nodeIds: batch.nodeIds, batchIndex: i });
    if (i === 0 && retryNodeId) {
      steps.push({ action: 'batch_retry', nodeIds: batch.nodeIds, batchIndex: i, retryNodeId });
    }
    steps.push({ action: 'batch_complete', nodeIds: batch.nodeIds, batchIndex: i });
  }

  // recovery_done
  steps.push({ action: 'recovery_done', nodeIds: [], batchIndex: remainingBatches.length - 1 });

  return steps;
}

// ─── State computation: Recovery mode ───────────────────────────

export function computeRecoveryState(
  step: number,
  cascadeSteps: CascadeStep[],
  recoverySteps: RecoveryStep[],
  failureCascadeStep: number,
  partialDeletedIds: Set<string>,
  nodes: TreeNode[],
  nodeMap: Record<string, TreeNode>,
  tableLabels?: Record<string, string>,
): StepState {
  // Phase 1: delegate to failure state for crash animation
  if (step <= failureCascadeStep + 2) {
    return computeFailureState(step, cascadeSteps, failureCascadeStep, partialDeletedIds, nodes, nodeMap, tableLabels);
  }

  // Phase 2: Recovery — start from failure end-state
  const baseState = computeFailureState(failureCascadeStep + 2, cascadeSteps, failureCascadeStep, partialDeletedIds, nodes, nodeMap, tableLabels);
  const statuses = { ...baseState.statuses };

  const recoveryIdx = step - (failureCascadeStep + 3);
  const appliedRecovery = recoverySteps.slice(0, recoveryIdx + 1);

  // Track which nodes have been batch-completed during recovery
  const recoveryDeleted = new Set<string>();
  const currentlyVisiting = new Set<string>();

  for (const rs of appliedRecovery) {
    if (rs.action === 'batch_start') {
      for (const id of rs.nodeIds) {
        statuses[id] = 'visiting';
        currentlyVisiting.add(id);
      }
    } else if (rs.action === 'batch_complete') {
      for (const id of rs.nodeIds) {
        statuses[id] = 'deleted';
        recoveryDeleted.add(id);
        currentlyVisiting.delete(id);
      }
    }
    // batch_retry, detect_stale, resume, recovery_done — no status changes
  }

  const last = appliedRecovery[appliedRecovery.length - 1];
  let explanation = '';

  switch (last.action) {
    case 'detect_stale':
      explanation = 'Stale operation detected: op_1708167234567, status=processing, age=45s';
      break;
    case 'resume': {
      const totalRemaining = recoverySteps
        .filter(s => s.action === 'batch_start')
        .reduce((sum, s) => sum + s.nodeIds.length, 0);
      const batchCount = recoverySteps.filter(s => s.action === 'batch_start').length;
      explanation = `Resuming with batched mode: ${totalRemaining} docs in ${batchCount} batches`;
      break;
    }
    case 'batch_start': {
      const batchCount = recoverySteps.filter(s => s.action === 'batch_start').length;
      const tables = [...new Set(last.nodeIds.map(id => nodeMap[id]?.table))];
      explanation = `Batch ${last.batchIndex + 1}/${batchCount}: processing ${last.nodeIds.length} ${tables.join(', ')} documents`;
      break;
    }
    case 'batch_retry':
      explanation = `Entry ${last.retryNodeId} failed (attempt 1/3), retrying in 100ms...`;
      break;
    case 'batch_complete': {
      const batchCount = recoverySteps.filter(s => s.action === 'batch_start').length;
      explanation = `Batch ${last.batchIndex + 1}/${batchCount}: deleted ${last.nodeIds.length} documents`;
      break;
    }
    case 'recovery_done': {
      explanation = `Recovery complete: all ${nodes.length} documents deleted via batched cascade`;
      break;
    }
  }

  return {
    statuses,
    visited: baseState.visited,
    stack: [...currentlyVisiting],
    explanation,
    activeEdge: null,
  };
}

// ─── Compute failure scenario parameters ────────────────────────

export function computeFailureParams(cascadeSteps: CascadeStep[]) {
  const firstDeleteIdx = cascadeSteps.findIndex(s => s.action === 'delete');
  const deleteSteps = cascadeSteps.filter(s => s.action === 'delete');
  const maxCompleted = Math.max(0, deleteSteps.length - 2);
  const completedDeletes = Math.floor(Math.random() * (maxCompleted + 1));
  const failureCascadeStep = firstDeleteIdx >= 0 ? firstDeleteIdx + completedDeletes : cascadeSteps.length;

  const crashLevelNodes = deleteSteps[completedDeletes]?.nodeIds ?? [];
  const shuffled = [...crashLevelNodes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const partialCount = Math.max(1, Math.floor(Math.random() * crashLevelNodes.length));
  const partialDeletedIds = new Set(shuffled.slice(0, partialCount));

  return {
    failureCascadeStep,
    partialDeletedIds,
    failureTotal: failureCascadeStep + 2,
  };
}

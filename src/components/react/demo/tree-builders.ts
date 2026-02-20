import type { TreeNode } from './cascade-logic';
import type { SimpleTableType } from './cascade-colors';
import type { ScaleTableType } from './cascade-colors';

// ─── Types ──────────────────────────────────────────────────────

export type PlaygroundData = {
  users: { _id: string; name: string; email: string }[];
  posts: { _id: string; userId: string; title: string; body: string }[];
  comments: { _id: string; postId: string; userId: string; body: string }[];
  reactions: { _id: string; commentId: string; userId: string; emoji: string }[];
};

export type ScaleData = {
  orgs: { _id: string; name: string }[];
  teams: { _id: string; orgId: string; name: string }[];
  projects: { _id: string; teamId: string; name: string }[];
  epics: { _id: string; projectId: string; name: string }[];
  tasks: { _id: string; epicId: string; name: string }[];
  subtasks: { _id: string; taskId: string; name: string }[];
  task_comments: { _id: string; subtaskId: string; body: string }[];
  attachments: { _id: string; commentId: string; name: string }[];
  mentions: { _id: string; attachmentId: string; name: string }[];
  activity_logs: { _id: string; mentionId: string; action: string }[];
  notifications: { _id: string; logId: string; message: string }[];
};

// ─── Build tree from playground data (4-table simple schema) ────

const NODE_W = 94;
const NODE_GAP = 16;       // horizontal gap between adjacent leaves
const LEVEL_H = 90;        // vertical distance between levels
const PADDING_X = 60;      // left/right padding
const PADDING_Y = 40;      // top padding

export function buildTreeFromPlaygroundData(data: PlaygroundData): TreeNode[] {
  const nodes: TreeNode[] = [];
  const idSet = new Set<string>();
  const nodeMap = new Map<string, TreeNode>();

  function add(id: string, label: string, table: SimpleTableType, parentId: string | null) {
    if (idSet.has(id)) return;
    idSet.add(id);
    const node: TreeNode = { id, label, table, children: [], parent: parentId, x: 0, y: 0 };
    nodes.push(node);
    nodeMap.set(id, node);
    if (parentId) {
      const parent = nodeMap.get(parentId);
      if (parent) parent.children.push(id);
    }
  }

  // Build tree structure (no positions yet)
  for (const user of data.users) {
    add(user._id, user.name, 'users', null);
    for (const post of data.posts.filter(p => p.userId === user._id)) {
      add(post._id, post.title, 'posts', user._id);
      for (const comment of data.comments.filter(c => c.postId === post._id)) {
        add(comment._id, comment.body, 'comments', post._id);
        for (const reaction of data.reactions.filter(r => r.commentId === comment._id)) {
          add(reaction._id, reaction.emoji, 'reactions', comment._id);
        }
      }
    }
  }

  if (nodes.length === 0) return nodes;

  // Bottom-up layout: assign x positions via post-order traversal
  let leafX = 0; // running leaf counter

  function layoutNode(node: TreeNode, depth: number) {
    node.y = PADDING_Y + depth * LEVEL_H;
    const childNodes = node.children.map(id => nodeMap.get(id)!).filter(Boolean);

    if (childNodes.length === 0) {
      // Leaf node: assign next sequential x position
      node.x = PADDING_X + leafX * (NODE_W + NODE_GAP) + NODE_W / 2;
      leafX++;
    } else {
      // Recurse children first (post-order)
      for (const child of childNodes) {
        layoutNode(child, depth + 1);
      }
      // Parent x = center of its children's x range
      const minChildX = Math.min(...childNodes.map(c => c.x));
      const maxChildX = Math.max(...childNodes.map(c => c.x));
      node.x = (minChildX + maxChildX) / 2;
    }
  }

  // Find root nodes and layout each tree
  const roots = nodes.filter(n => n.parent === null);
  for (const root of roots) {
    layoutNode(root, 0);
  }

  return nodes;
}

// ─── Compute bounding box for tree nodes ─────────────────────────

export function computeTreeBounds(nodes: TreeNode[], nodeW = 94, nodeH = 34) {
  if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 700, maxY: 360 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x - nodeW / 2);
    maxX = Math.max(maxX, n.x + nodeW / 2);
    minY = Math.min(minY, n.y - nodeH / 2);
    maxY = Math.max(maxY, n.y + nodeH / 2);
  }
  const pad = 20;
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

// ─── Build tree from scale data (11-table schema) ───────────────

export function buildTreeFromScaleData(data: ScaleData): TreeNode[] {
  const nodes: TreeNode[] = [];
  const idSet = new Set<string>();

  function add(id: string, label: string, table: ScaleTableType, parentId: string | null) {
    if (idSet.has(id)) return;
    idSet.add(id);
    const truncated = label.length > 8 ? label.slice(0, 7) + '\u2026' : label;
    nodes.push({ id, label: truncated, table, children: [], parent: parentId, x: 0, y: 0 });
    if (parentId) {
      const parent = nodes.find(n => n.id === parentId);
      if (parent) parent.children.push(id);
    }
  }

  for (const o of data.orgs) add(o._id, o.name, 'orgs', null);
  for (const t of data.teams) add(t._id, t.name, 'teams', t.orgId);
  for (const p of data.projects) add(p._id, p.name, 'projects', p.teamId);
  for (const e of data.epics) add(e._id, e.name, 'epics', e.projectId);
  for (const t of data.tasks) add(t._id, t.name, 'tasks', t.epicId);
  for (const s of data.subtasks) add(s._id, s.name, 'subtasks', s.taskId);
  for (const c of data.task_comments) add(c._id, c.body, 'task_comments', c.subtaskId);
  for (const a of data.attachments) add(a._id, a.name, 'attachments', a.commentId);
  for (const m of data.mentions) add(m._id, m.name, 'mentions', m.attachmentId);
  for (const l of data.activity_logs) add(l._id, l.action, 'activity_logs', l.mentionId);
  for (const n of data.notifications) add(n._id, n.message, 'notifications', n.logId);

  return nodes;
}

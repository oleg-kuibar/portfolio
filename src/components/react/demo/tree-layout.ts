import type { TreeNode } from './cascade-logic';

// ─── Layout constants ───────────────────────────────────────────

export const SCALE_NODE_W = 52;
export const SCALE_NODE_H = 22;
const LEVEL_HEIGHT = 54;
const MIN_GAP = 8;

export interface LayoutResult {
  nodeMap: Record<string, TreeNode>;
  viewBox: { x: number; y: number; w: number; h: number };
}

// ─── Reingold-Tilford simplified layout ─────────────────────────

export function layoutTree(nodes: TreeNode[]): LayoutResult {
  const nodeMap: Record<string, TreeNode> = {};
  for (const n of nodes) nodeMap[n.id] = n;

  const root = nodes[0];
  if (!root) return { nodeMap, viewBox: { x: 0, y: 0, w: 700, h: 400 } };

  const widthCache: Record<string, number> = {};

  function computeWidth(nodeId: string): number {
    if (widthCache[nodeId] !== undefined) return widthCache[nodeId];
    const node = nodeMap[nodeId];
    if (node.children.length === 0) {
      widthCache[nodeId] = SCALE_NODE_W + MIN_GAP;
      return widthCache[nodeId];
    }
    let totalWidth = 0;
    for (const childId of node.children) {
      totalWidth += computeWidth(childId);
    }
    widthCache[nodeId] = Math.max(SCALE_NODE_W + MIN_GAP, totalWidth);
    return widthCache[nodeId];
  }

  function assignPositions(nodeId: string, left: number, depth: number) {
    const node = nodeMap[nodeId];
    const width = widthCache[nodeId];

    node.y = depth * LEVEL_HEIGHT + 30;

    if (node.children.length === 0) {
      node.x = left + width / 2;
      return;
    }

    let childLeft = left;
    for (const childId of node.children) {
      assignPositions(childId, childLeft, depth + 1);
      childLeft += widthCache[childId];
    }

    const firstChild = nodeMap[node.children[0]];
    const lastChild = nodeMap[node.children[node.children.length - 1]];
    node.x = (firstChild.x + lastChild.x) / 2;
  }

  computeWidth(root.id);
  assignPositions(root.id, 0, 0);

  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs) - SCALE_NODE_W;
  const maxX = Math.max(...xs) + SCALE_NODE_W;
  const minY = Math.min(...ys) - SCALE_NODE_H;
  const maxY = Math.max(...ys) + SCALE_NODE_H + 10;

  return {
    nodeMap,
    viewBox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
  };
}

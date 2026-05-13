import type { FlowNodeData, IttoFlowNode, IttoNode } from "../types/graph";

export const PROCESS_COLUMN_X = {
  inputs: 0,
  focus: 320,
  outputs: 640,
  consumers: 960,
  techniques: 0
};

export const ARTIFACT_COLUMN_X = {
  producers: 0,
  focus: 320,
  consumers: 640
};

export function getFocusY(columnSizes: number[], startY = 80, gap = 78): number {
  const tallest = Math.max(...columnSizes, 1);
  return Math.max(160, startY + ((tallest - 1) * gap) / 2);
}

export function layoutVerticalColumn(
  items: IttoNode[],
  x: number,
  startY = 80,
  gap = 78,
  dataForNode?: (node: IttoNode) => Partial<FlowNodeData>
): IttoFlowNode[] {
  return items.map((item, index) => toFlowNode(item, x, startY + index * gap, dataForNode?.(item)));
}

export function layoutCenteredColumn(
  items: IttoNode[],
  x: number,
  centerY: number,
  gap = 78,
  dataForNode?: (node: IttoNode) => Partial<FlowNodeData>
): IttoFlowNode[] {
  const startY = centerY - ((items.length - 1) * gap) / 2;
  return layoutVerticalColumn(items, x, startY, gap, dataForNode);
}

export function layoutGrid(
  items: IttoNode[],
  startX: number,
  startY: number,
  columns = 4,
  xGap = 260,
  yGap = 96,
  dataForNode?: (node: IttoNode) => Partial<FlowNodeData>
): IttoFlowNode[] {
  return items.map((item, index) =>
    toFlowNode(
      item,
      startX + (index % columns) * xGap,
      startY + Math.floor(index / columns) * yGap,
      dataForNode?.(item)
    )
  );
}

export function layoutCenteredGrid(
  items: IttoNode[],
  startX: number,
  centerY: number,
  columns = 2,
  xGap = 260,
  yGap = 78,
  dataForNode?: (node: IttoNode) => Partial<FlowNodeData>
): IttoFlowNode[] {
  const rows = Math.ceil(items.length / columns);
  const startY = centerY - ((rows - 1) * yGap) / 2;
  return layoutGrid(items, startX, startY, columns, xGap, yGap, dataForNode);
}

export function getReadableGridColumns(itemCount: number): number {
  if (itemCount >= 16) {
    return 4;
  }

  if (itemCount >= 10) {
    return 3;
  }

  if (itemCount >= 7) {
    return 2;
  }

  return 1;
}

export function toFlowNode(
  node: IttoNode,
  x: number,
  y: number,
  data?: Partial<FlowNodeData>
): IttoFlowNode {
  const nodeType =
    node.type === "process" ? "processNode" : node.type === "technique" ? "techniqueNode" : "artifactNode";

  return {
    id: node.id,
    type: nodeType,
    position: { x, y },
    data: {
      label: node.label,
      nodeType: node.type,
      knowledgeArea: node.knowledgeArea,
      processGroup: node.processGroup,
      category: node.category,
      knowledgeAreaLabel: node.knowledgeAreaLabel,
      processGroupLabel: node.processGroupLabel,
      ...data
    }
  };
}

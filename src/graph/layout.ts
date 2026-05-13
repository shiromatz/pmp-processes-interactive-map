import type { FlowNodeData, IttoFlowNode, IttoNode } from "../types/graph";

export const PROCESS_COLUMN_X = {
  inputs: 0,
  focus: 360,
  outputs: 720,
  consumers: 1080
};

export const ARTIFACT_COLUMN_X = {
  producers: 0,
  focus: 360,
  consumers: 720
};

export function getFocusY(columnSizes: number[], startY = 80, gap = 100): number {
  const tallest = Math.max(...columnSizes, 1);
  return Math.max(160, startY + ((tallest - 1) * gap) / 2);
}

export function layoutVerticalColumn(
  items: IttoNode[],
  x: number,
  startY = 80,
  gap = 100,
  dataForNode?: (node: IttoNode) => Partial<FlowNodeData>
): IttoFlowNode[] {
  return items.map((item, index) => toFlowNode(item, x, startY + index * gap, dataForNode?.(item)));
}

export function layoutCenteredColumn(
  items: IttoNode[],
  x: number,
  centerY: number,
  gap = 100,
  dataForNode?: (node: IttoNode) => Partial<FlowNodeData>
): IttoFlowNode[] {
  const startY = centerY - ((items.length - 1) * gap) / 2;
  return layoutVerticalColumn(items, x, startY, gap, dataForNode);
}

export function toFlowNode(
  node: IttoNode,
  x: number,
  y: number,
  data?: Partial<FlowNodeData>
): IttoFlowNode {
  return {
    id: node.id,
    type: node.type === "process" ? "processNode" : "artifactNode",
    position: { x, y },
    data: {
      label: node.label,
      nodeType: node.type,
      knowledgeArea: node.knowledgeArea,
      processGroup: node.processGroup,
      ...data
    }
  };
}

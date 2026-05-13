import type { FlowNodeData, IttoFlowNode, IttoNode } from "../types/graph";
import { KNOWLEDGE_AREAS, PROCESS_GROUPS } from "../data/constants";

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

export function layoutProcessMatrixGrid(
  items: IttoNode[],
  startX: number,
  centerY: number,
  xGap = 260,
  yGap = 116,
  dataForNode?: (node: IttoNode) => Partial<FlowNodeData>
): IttoFlowNode[] {
  const processes = items.filter((item) => item.type === "process" && item.processGroup && item.knowledgeArea);

  if (processes.length !== items.length) {
    return layoutCenteredColumn(items, startX, centerY, yGap, dataForNode);
  }

  const groupKeys = PROCESS_GROUPS.filter((group) => processes.some((process) => process.processGroup === group));
  const areaKeys = KNOWLEDGE_AREAS.filter((area) => processes.some((process) => process.knowledgeArea === area));
  const cells = new Map<string, IttoNode[]>();

  for (const process of processes) {
    const key = `${process.knowledgeArea}|${process.processGroup}`;
    cells.set(key, [...(cells.get(key) ?? []), process]);
  }

  const rowHeights = areaKeys.map((area) => {
    const maxItemsInRow = Math.max(
      ...groupKeys.map((group) => cells.get(`${area}|${group}`)?.length ?? 0),
      1
    );
    return maxItemsInRow * yGap;
  });
  const totalHeight = rowHeights.reduce((sum, height) => sum + height, 0);
  const startY = centerY - (totalHeight - yGap) / 2;
  const rowStartByArea = new Map<string, number>();
  let currentY = startY;

  for (const [index, area] of areaKeys.entries()) {
    rowStartByArea.set(area, currentY);
    currentY += rowHeights[index];
  }

  return processes.map((process) => {
    const area = process.knowledgeArea;
    const group = process.processGroup;
    if (!area || !group) {
      return toFlowNode(process, startX, centerY, dataForNode?.(process));
    }

    const cellItems = cells.get(`${area}|${group}`) ?? [];
    const stackIndex = cellItems.findIndex((item) => item.id === process.id);
    return toFlowNode(
      process,
      startX + groupKeys.indexOf(group) * xGap,
      (rowStartByArea.get(area) ?? centerY) + stackIndex * yGap,
      dataForNode?.(process)
    );
  });
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
      knowledgeAreaShortLabel: node.knowledgeAreaShortLabel,
      processGroupShortLabel: node.processGroupShortLabel,
      ...data
    }
  };
}

import type { BuiltView, IttoFlowEdge, RelationType } from "../types/graph";

type FlowEdgeOptions = {
  sourceHandle?: string;
  targetHandle?: string;
};

export function toFlowEdge(
  source: string,
  target: string,
  relation: RelationType,
  options: FlowEdgeOptions = {}
): IttoFlowEdge {
  return {
    id: `${source}-${target}-${relation}`,
    source,
    target,
    sourceHandle: options.sourceHandle ?? "source-right",
    targetHandle: options.targetHandle ?? "target-left",
    type: "smoothstep",
    animated: true,
    data: { relation },
    className: getRelationClassName(relation)
  };
}

export function filterVisibleEdges(nodes: BuiltView["nodes"], edges: IttoFlowEdge[]): IttoFlowEdge[] {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const seenEdgeIds = new Set<string>();

  return edges.filter((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target) || seenEdgeIds.has(edge.id)) {
      return false;
    }

    seenEdgeIds.add(edge.id);
    return true;
  });
}

function getRelationClassName(relation: RelationType): string {
  if (relation === "supports") {
    return "flow-edge--supports";
  }

  if (relation === "applies_to") {
    return "flow-edge--applies";
  }

  if (relation === "maps_to") {
    return "flow-edge--maps";
  }

  if (relation === "contains") {
    return "flow-edge--contains";
  }

  if (relation === "references") {
    return "flow-edge--references";
  }

  if (relation === "outputs") {
    return "flow-edge--outputs";
  }

  if (relation === "updates") {
    return "flow-edge--updates";
  }

  if (relation === "uses") {
    return "flow-edge--uses";
  }

  return "flow-edge--input";
}

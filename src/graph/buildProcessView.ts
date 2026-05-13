import type { BuiltView, GraphFilters, IttoFlowEdge, IttoGraph } from "../types/graph";
import { getInputsForProcess, getNodeById, getOutputsForProcess, getUpdatesForProcess, nodeMatchesFilters, uniqueNodes } from "./selectors";
import { getFocusY, layoutCenteredColumn, PROCESS_COLUMN_X, toFlowNode } from "./layout";

export function buildProcessView(
  graph: IttoGraph,
  selectedProcessId: string,
  filters: GraphFilters
): BuiltView {
  const focus = getNodeById(graph, selectedProcessId);

  if (!focus || focus.type !== "process") {
    return { nodes: [], edges: [] };
  }

  const rawInputs = uniqueNodes(getInputsForProcess(graph, selectedProcessId));
  const rawOutputs = getOutputsForProcess(graph, selectedProcessId);
  const rawUpdates = getUpdatesForProcess(graph, selectedProcessId);
  const inputIds = new Set(rawInputs.map((node) => node.id));
  const inputs = rawInputs;
  const outputs = uniqueNodes([
    ...rawOutputs,
    ...rawUpdates.filter((node) => !inputIds.has(node.id))
  ]);

  const muted = (nodeId: string) => {
    const node = getNodeById(graph, nodeId);
    return node ? !nodeMatchesFilters(node, filters) : false;
  };

  const focusY = getFocusY([inputs.length, outputs.length]);
  const nodes = [
    ...layoutCenteredColumn(inputs, PROCESS_COLUMN_X.inputs, focusY, 116, (node) => ({
      muted: muted(node.id)
    })),
    toFlowNode(focus, PROCESS_COLUMN_X.focus, focusY, {
      isFocus: true,
      isRecent: true,
      muted: muted(focus.id)
    }),
    ...layoutCenteredColumn(outputs, PROCESS_COLUMN_X.outputs, focusY, 116, (node) => ({
      muted: muted(node.id)
    }))
  ];

  const inputEdges = rawInputs.map((input) => toFlowEdge(input.id, focus.id, "input_to"));
  const outputEdges = [
    ...rawOutputs.map((output) =>
      toFlowEdge(focus.id, output.id, "outputs")
    ),
    ...rawUpdates.map((output) =>
      toFlowEdge(focus.id, output.id, "updates", inputIds.has(output.id) ? "backward" : "forward")
    )
  ];
  return {
    nodes,
    edges: filterVisibleEdges(nodes, [...inputEdges, ...outputEdges])
  };
}

function toFlowEdge(
  source: string,
  target: string,
  relation: "input_to" | "outputs" | "updates" | "uses",
  direction: "forward" | "backward" = "forward"
): IttoFlowEdge {
  return {
    id: `${source}-${target}-${relation}`,
    source,
    target,
    sourceHandle: direction === "backward" ? "source-left" : "source-right",
    targetHandle: direction === "backward" ? "target-right" : "target-left",
    type: "smoothstep",
    animated: true,
    data: { relation },
    className:
      relation === "outputs"
        ? "flow-edge--outputs"
        : relation === "updates"
          ? "flow-edge--updates"
          : relation === "uses"
            ? "flow-edge--uses"
            : "flow-edge--input"
  };
}

function filterVisibleEdges(nodes: BuiltView["nodes"], edges: IttoFlowEdge[]): IttoFlowEdge[] {
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

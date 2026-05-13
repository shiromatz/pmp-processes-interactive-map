import type { BuiltView, GraphFilters, IttoFlowEdge, IttoGraph } from "../types/graph";
import { getConsumersForArtifact, getInputsForProcess, getNodeById, getOutputsForProcess, getUpdatesForProcess, nodeMatchesFilters, uniqueNodes } from "./selectors";
import { getFocusY, getReadableGridColumns, layoutCenteredColumn, layoutCenteredGrid, PROCESS_COLUMN_X, toFlowNode } from "./layout";

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
  const outputs = uniqueNodes([...rawOutputs, ...rawUpdates]);
  const outputIds = new Set(outputs.map((node) => node.id));
  const inputs = rawInputs.filter((node) => !outputIds.has(node.id));
  const consumers =
    filters.downstreamDepth === 2
      ? uniqueNodes(outputs.flatMap((output) => getConsumersForArtifact(graph, output.id))).filter(
          (consumer) => consumer.id !== focus.id
        )
      : [];
  const consumerIds = new Set(consumers.map((node) => node.id));

  const muted = (nodeId: string) => {
    const node = getNodeById(graph, nodeId);
    return node ? !nodeMatchesFilters(node, filters) : false;
  };

  const focusY = getFocusY([inputs.length, outputs.length, consumers.length]);
  const consumerColumns = getReadableGridColumns(consumers.length);
  const nodes = [
    ...layoutCenteredColumn(inputs, PROCESS_COLUMN_X.inputs, focusY, 78, (node) => ({
      muted: muted(node.id)
    })),
    toFlowNode(focus, PROCESS_COLUMN_X.focus, focusY, {
      isFocus: true,
      isRecent: true,
      muted: muted(focus.id)
    }),
    ...layoutCenteredColumn(outputs, PROCESS_COLUMN_X.outputs, focusY, 78, (node) => ({
      muted: muted(node.id)
    })),
    ...layoutCenteredGrid(consumers, PROCESS_COLUMN_X.consumers, focusY, consumerColumns, 250, 78, (node) => ({
      muted: muted(node.id)
    }))
  ];

  const inputEdges = rawInputs.map((input) =>
    toFlowEdge(input.id, focus.id, "input_to", outputIds.has(input.id) ? "backward" : "forward")
  );
  const outputEdges = [
    ...rawOutputs.map((output) =>
      toFlowEdge(focus.id, output.id, "outputs")
    ),
    ...rawUpdates.map((output) =>
      toFlowEdge(focus.id, output.id, "updates")
    )
  ];
  const downstreamEdges =
    filters.downstreamDepth === 2
      ? outputs.flatMap((output) =>
          getConsumersForArtifact(graph, output.id)
            .filter((consumer) => consumerIds.has(consumer.id))
            .map((consumer) => toFlowEdge(output.id, consumer.id, "input_to"))
        )
      : [];

  return {
    nodes,
    edges: filterVisibleEdges(nodes, [...inputEdges, ...outputEdges, ...downstreamEdges])
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
    animated: relation === "outputs" || relation === "updates" || relation === "uses",
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

import type { BuiltView, GraphFilters, IttoFlowEdge, IttoGraph } from "../types/graph";
import { getConsumersForArtifact, getInputsForProcess, getNodeById, getOutputsForProcess, nodeMatchesFilters, uniqueNodes } from "./selectors";
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

  const inputs = uniqueNodes(getInputsForProcess(graph, selectedProcessId));
  const outputs = uniqueNodes(getOutputsForProcess(graph, selectedProcessId));
  const consumers =
    filters.downstreamDepth === 2
      ? uniqueNodes(outputs.flatMap((output) => getConsumersForArtifact(graph, output.id)))
      : [];

  const muted = (nodeId: string) => {
    const node = getNodeById(graph, nodeId);
    return node ? !nodeMatchesFilters(node, filters) : false;
  };

  const focusY = getFocusY([inputs.length, outputs.length, consumers.length]);
  const nodes = [
    ...layoutCenteredColumn(inputs, PROCESS_COLUMN_X.inputs, focusY, 100, (node) => ({
      muted: muted(node.id)
    })),
    toFlowNode(focus, PROCESS_COLUMN_X.focus, focusY, {
      isFocus: true,
      muted: muted(focus.id)
    }),
    ...layoutCenteredColumn(outputs, PROCESS_COLUMN_X.outputs, focusY, 100, (node) => ({
      muted: muted(node.id)
    })),
    ...layoutCenteredColumn(consumers, PROCESS_COLUMN_X.consumers, focusY, 100, (node) => ({
      muted: muted(node.id)
    }))
  ];

  const inputEdges = inputs.map((input) => toFlowEdge(input.id, focus.id, "input_to"));
  const outputEdges = outputs.map((output) => toFlowEdge(focus.id, output.id, "outputs"));
  const downstreamEdges =
    filters.downstreamDepth === 2
      ? outputs.flatMap((output) =>
          getConsumersForArtifact(graph, output.id).map((consumer) =>
            toFlowEdge(output.id, consumer.id, "input_to")
          )
        )
      : [];

  return {
    nodes,
    edges: [...inputEdges, ...outputEdges, ...downstreamEdges]
  };
}

function toFlowEdge(
  source: string,
  target: string,
  relation: "input_to" | "outputs"
): IttoFlowEdge {
  return {
    id: `${source}-${target}-${relation}`,
    source,
    target,
    type: "smoothstep",
    animated: relation === "outputs",
    data: { relation },
    className: relation === "outputs" ? "flow-edge--outputs" : "flow-edge--input"
  };
}

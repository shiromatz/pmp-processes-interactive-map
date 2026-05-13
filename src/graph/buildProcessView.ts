import type { BuiltView, GraphFilters, IttoFlowEdge, IttoGraph } from "../types/graph";
import { getConsumersForArtifact, getInputsForProcess, getNodeById, getOutputsForProcess, getTechniquesForProcess, getUpdatesForProcess, nodeMatchesFilters, uniqueNodes } from "./selectors";
import { getFocusY, layoutCenteredColumn, layoutGrid, PROCESS_COLUMN_X, toFlowNode } from "./layout";

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
  const outputs = uniqueNodes([
    ...getOutputsForProcess(graph, selectedProcessId),
    ...getUpdatesForProcess(graph, selectedProcessId)
  ]);
  const consumers =
    filters.downstreamDepth === 2
      ? uniqueNodes(outputs.flatMap((output) => getConsumersForArtifact(graph, output.id)))
      : [];
  const techniques = filters.showTechniques || filters.nodeType === "technique"
    ? uniqueNodes(getTechniquesForProcess(graph, selectedProcessId))
    : [];

  const muted = (nodeId: string) => {
    const node = getNodeById(graph, nodeId);
    return node ? !nodeMatchesFilters(node, filters) : false;
  };

  const focusY = getFocusY([inputs.length, outputs.length, consumers.length]);
  const relationshipBottomY =
    focusY + ((Math.max(inputs.length, outputs.length, consumers.length, 1) - 1) * 100) / 2;
  const techniqueStartY = relationshipBottomY + 170;
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
    })),
    ...layoutGrid(techniques, PROCESS_COLUMN_X.techniques, techniqueStartY, 4, 260, 96, (node) => ({
      muted: muted(node.id)
    }))
  ];

  const inputEdges = inputs.map((input) => toFlowEdge(input.id, focus.id, "input_to"));
  const outputEdges = [
    ...getOutputsForProcess(graph, selectedProcessId).map((output) =>
      toFlowEdge(focus.id, output.id, "outputs")
    ),
    ...getUpdatesForProcess(graph, selectedProcessId).map((output) =>
      toFlowEdge(focus.id, output.id, "updates")
    )
  ];
  const downstreamEdges =
    filters.downstreamDepth === 2
      ? outputs.flatMap((output) =>
          getConsumersForArtifact(graph, output.id).map((consumer) =>
            toFlowEdge(output.id, consumer.id, "input_to")
          )
        )
      : [];
  const techniqueEdges = techniques.length > 0
    ? techniques.map((technique) => toFlowEdge(focus.id, technique.id, "uses"))
    : [];

  return {
    nodes,
    edges: [...inputEdges, ...outputEdges, ...downstreamEdges, ...techniqueEdges]
  };
}

function toFlowEdge(
  source: string,
  target: string,
  relation: "input_to" | "outputs" | "updates" | "uses"
): IttoFlowEdge {
  return {
    id: `${source}-${target}-${relation}`,
    source,
    target,
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

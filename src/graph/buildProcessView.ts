import { filterVisibleEdges, toFlowEdge } from "./flowEdges";
import type { GraphSource } from "./graphIndex";
import type { BuiltView, GraphFilters } from "../types/graph";
import { getInputsForProcess, getNodeById, getOutputsForProcess, getUpdatesForProcess, nodeMatchesFilters, uniqueNodes } from "./selectors";
import { getFocusY, layoutCenteredColumn, PROCESS_COLUMN_X, toFlowNode } from "./layout";

export function buildProcessView(
  graph: GraphSource,
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
    ...rawOutputs.filter((node) => !inputIds.has(node.id)),
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
      toFlowEdge(focus.id, output.id, "updates")
    )
  ];
  return {
    nodes,
    edges: filterVisibleEdges(nodes, [...inputEdges, ...outputEdges])
  };
}

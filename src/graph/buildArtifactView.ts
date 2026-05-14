import { filterVisibleEdges, toFlowEdge } from "./flowEdges";
import type { GraphSource } from "./graphIndex";
import type { BuiltView, GraphFilters } from "../types/graph";
import { getConsumersForArtifact, getNodeById, getProducersForArtifact, getUpdatersForArtifact, nodeMatchesFilters, uniqueNodes } from "./selectors";
import { ARTIFACT_COLUMN_X, getFocusY, layoutCenteredColumn, layoutProcessMatrixGrid, toFlowNode } from "./layout";

export function buildArtifactView(
  graph: GraphSource,
  selectedArtifactId: string,
  filters: GraphFilters
): BuiltView {
  const focus = getNodeById(graph, selectedArtifactId);

  if (!focus || focus.type !== "artifact") {
    return { nodes: [], edges: [] };
  }

  const producerNodes = getProducersForArtifact(graph, selectedArtifactId);
  const updaterNodes = getUpdatersForArtifact(graph, selectedArtifactId);
  const consumers = uniqueNodes(getConsumersForArtifact(graph, selectedArtifactId));
  const consumerIds = new Set(consumers.map((node) => node.id));
  const producers = uniqueNodes([
    ...producerNodes,
    ...updaterNodes
  ]).filter((node) => !consumerIds.has(node.id));
  const muted = (nodeId: string) => {
    const node = getNodeById(graph, nodeId);
    return node ? !nodeMatchesFilters(node, filters) : false;
  };
  const focusY = getFocusY([producers.length, consumers.length]);

  const nodes = [
    ...layoutCenteredColumn(producers, ARTIFACT_COLUMN_X.producers, focusY, 116, (node) => ({
      muted: muted(node.id)
    })),
    toFlowNode(focus, ARTIFACT_COLUMN_X.focus, focusY, {
      isFocus: true,
      isRecent: true,
      muted: muted(focus.id)
    }),
    ...layoutProcessMatrixGrid(consumers, ARTIFACT_COLUMN_X.consumers, focusY, 250, 116, (node) => ({
      muted: muted(node.id)
    }))
  ];
  const edges = [
    ...producerNodes.map((producer) => toFlowEdge(producer.id, focus.id, "outputs")),
    ...updaterNodes.map((producer) => toFlowEdge(producer.id, focus.id, "updates")),
    ...consumers.map((consumer) => toFlowEdge(focus.id, consumer.id, "input_to"))
  ];

  return { nodes, edges: filterVisibleEdges(nodes, edges) };
}

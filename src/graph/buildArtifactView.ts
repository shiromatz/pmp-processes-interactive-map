import type { BuiltView, GraphFilters, IttoFlowEdge, IttoGraph } from "../types/graph";
import { getConsumersForArtifact, getNodeById, getProducersForArtifact, getUpdatersForArtifact, nodeMatchesFilters, uniqueNodes } from "./selectors";
import { ARTIFACT_COLUMN_X, getFocusY, getReadableGridColumns, layoutCenteredColumn, layoutCenteredGrid, toFlowNode } from "./layout";

export function buildArtifactView(
  graph: IttoGraph,
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
  const consumerColumns = getReadableGridColumns(consumers.length);

  const nodes = [
    ...layoutCenteredColumn(producers, ARTIFACT_COLUMN_X.producers, focusY, 78, (node) => ({
      muted: muted(node.id)
    })),
    toFlowNode(focus, ARTIFACT_COLUMN_X.focus, focusY, {
      isFocus: true,
      isRecent: true,
      muted: muted(focus.id)
    }),
    ...layoutCenteredGrid(consumers, ARTIFACT_COLUMN_X.consumers, focusY, consumerColumns, 250, 78, (node) => ({
      muted: muted(node.id)
    }))
  ];
  const edges = [
    ...producerNodes.map((producer) =>
      toFlowEdge(producer.id, focus.id, "outputs", consumerIds.has(producer.id) ? "backward" : "forward")
    ),
    ...updaterNodes.map((producer) =>
      toFlowEdge(producer.id, focus.id, "updates", consumerIds.has(producer.id) ? "backward" : "forward")
    ),
    ...consumers.map((consumer) => toFlowEdge(focus.id, consumer.id, "input_to"))
  ];

  return { nodes, edges: filterVisibleEdges(nodes, edges) };
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
    animated: relation === "outputs" || relation === "updates",
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
  return edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
}

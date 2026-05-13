import type { BuiltView, GraphFilters, IttoFlowEdge, IttoGraph } from "../types/graph";
import { getConsumersForArtifact, getNodeById, getProducersForArtifact, nodeMatchesFilters, uniqueNodes } from "./selectors";
import { ARTIFACT_COLUMN_X, getFocusY, layoutCenteredColumn, toFlowNode } from "./layout";

export function buildArtifactView(
  graph: IttoGraph,
  selectedArtifactId: string,
  filters: GraphFilters
): BuiltView {
  const focus = getNodeById(graph, selectedArtifactId);

  if (!focus || focus.type !== "artifact") {
    return { nodes: [], edges: [] };
  }

  const producers = uniqueNodes(getProducersForArtifact(graph, selectedArtifactId));
  const consumers = uniqueNodes(getConsumersForArtifact(graph, selectedArtifactId));
  const muted = (nodeId: string) => {
    const node = getNodeById(graph, nodeId);
    return node ? !nodeMatchesFilters(node, filters) : false;
  };
  const focusY = getFocusY([producers.length, consumers.length]);

  return {
    nodes: [
      ...layoutCenteredColumn(producers, ARTIFACT_COLUMN_X.producers, focusY, 100, (node) => ({
        muted: muted(node.id)
      })),
      toFlowNode(focus, ARTIFACT_COLUMN_X.focus, focusY, {
        isFocus: true,
        muted: muted(focus.id)
      }),
      ...layoutCenteredColumn(consumers, ARTIFACT_COLUMN_X.consumers, focusY, 100, (node) => ({
        muted: muted(node.id)
      }))
    ],
    edges: [
      ...producers.map((producer) => toFlowEdge(producer.id, focus.id, "outputs")),
      ...consumers.map((consumer) => toFlowEdge(focus.id, consumer.id, "input_to"))
    ]
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

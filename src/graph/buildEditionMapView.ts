import { filterVisibleEdges, toFlowEdge } from "./flowEdges";
import type { GraphSource } from "./graphIndex";
import type { BuiltView, IttoEdge, IttoNode } from "../types/graph";
import {
  getIncomingEdgesForNode,
  getNodeById,
  getOutgoingEdgesForNode,
  uniqueNodes
} from "./selectors";
import { getFocusY, layoutCenteredColumn, toFlowNode } from "./layout";

const EDITION_COLUMN_X = {
  incoming: 0,
  focus: 340,
  outgoing: 680
};

export function buildEditionMapView(graph: GraphSource, selectedNodeId: string): BuiltView {
  const focus = getNodeById(graph, selectedNodeId);

  if (!focus) {
    return { nodes: [], edges: [] };
  }

  const incomingEdges = getIncomingEdgesForNode(graph, selectedNodeId);
  const outgoingEdges = getOutgoingEdgesForNode(graph, selectedNodeId);
  const incoming = uniqueNodes(getConnectedNodes(graph, incomingEdges, "source"));
  const outgoing = uniqueNodes(getConnectedNodes(graph, outgoingEdges, "target"));
  const focusY = getFocusY([incoming.length, outgoing.length], 80, 110);

  const nodes = [
    ...layoutCenteredColumn(incoming, EDITION_COLUMN_X.incoming, focusY, 116),
    toFlowNode(focus, EDITION_COLUMN_X.focus, focusY, {
      isFocus: true,
      isRecent: true
    }),
    ...layoutCenteredColumn(outgoing, EDITION_COLUMN_X.outgoing, focusY, 116)
  ];
  const edges = [
    ...incomingEdges.map((edge) => toFlowEdge(edge.source, edge.target, edge.relation)),
    ...outgoingEdges.map((edge) => toFlowEdge(edge.source, edge.target, edge.relation))
  ];

  return { nodes, edges: filterVisibleEdges(nodes, edges) };
}

function getConnectedNodes(
  graph: GraphSource,
  edges: IttoEdge[],
  endpoint: "source" | "target"
): IttoNode[] {
  return edges
    .map((edge) => getNodeById(graph, edge[endpoint]))
    .filter((node): node is IttoNode => Boolean(node));
}

import type {
  GraphFilters,
  IttoEdge,
  IttoNode,
  KnowledgeArea,
  NodeType,
  ProcessGroup
} from "../types/graph";
import { getGraphIndex, type GraphSource } from "./graphIndex";

export function getNodeById(graph: GraphSource, nodeId: string): IttoNode | undefined {
  return getGraphIndex(graph).nodesById.get(nodeId);
}

export function getProcessNodes(graph: GraphSource): IttoNode[] {
  return getGraphIndex(graph).nodesByType.process;
}

export function getArtifactNodes(graph: GraphSource): IttoNode[] {
  return getGraphIndex(graph).nodesByType.artifact;
}

export function getTechniqueNodes(graph: GraphSource): IttoNode[] {
  return getGraphIndex(graph).nodesByType.technique;
}

export function getNodesByType(graph: GraphSource, type: NodeType): IttoNode[] {
  return getGraphIndex(graph).nodesByType[type] ?? [];
}

export function getIncomingEdgesForNode(graph: GraphSource, nodeId: string): IttoEdge[] {
  return getGraphIndex(graph).incomingByNode.get(nodeId) ?? [];
}

export function getOutgoingEdgesForNode(graph: GraphSource, nodeId: string): IttoEdge[] {
  return getGraphIndex(graph).outgoingByNode.get(nodeId) ?? [];
}

export function getIncomingNodesForNode(graph: GraphSource, nodeId: string): IttoNode[] {
  const index = getGraphIndex(graph);
  return getIncomingEdgesForNode(index, nodeId)
    .map((edge) => index.nodesById.get(edge.source))
    .filter((node): node is IttoNode => Boolean(node));
}

export function getOutgoingNodesForNode(graph: GraphSource, nodeId: string): IttoNode[] {
  const index = getGraphIndex(graph);
  return getOutgoingEdgesForNode(index, nodeId)
    .map((edge) => index.nodesById.get(edge.target))
    .filter((node): node is IttoNode => Boolean(node));
}

export function getInputsForProcess(graph: GraphSource, processId: string): IttoNode[] {
  return getGraphIndex(graph).inputsByProcess.get(processId) ?? [];
}

export function getOutputsForProcess(graph: GraphSource, processId: string): IttoNode[] {
  return getGraphIndex(graph).outputsByProcess.get(processId) ?? [];
}

export function getUpdatesForProcess(graph: GraphSource, processId: string): IttoNode[] {
  return getGraphIndex(graph).updatesByProcess.get(processId) ?? [];
}

export function getProducersForArtifact(graph: GraphSource, artifactId: string): IttoNode[] {
  return getGraphIndex(graph).producersByArtifact.get(artifactId) ?? [];
}

export function getUpdatersForArtifact(graph: GraphSource, artifactId: string): IttoNode[] {
  return getGraphIndex(graph).updatersByArtifact.get(artifactId) ?? [];
}

export function getConsumersForArtifact(graph: GraphSource, artifactId: string): IttoNode[] {
  return getGraphIndex(graph).consumersByArtifact.get(artifactId) ?? [];
}

export function getTechniquesForProcess(graph: GraphSource, processId: string): IttoNode[] {
  return getGraphIndex(graph).techniquesByProcess.get(processId) ?? [];
}

export function getProcessesUsingTechnique(graph: GraphSource, techniqueId: string): IttoNode[] {
  return getGraphIndex(graph).processesByTechnique.get(techniqueId) ?? [];
}

export function getEdgeBetween(
  graph: GraphSource,
  source: string,
  target: string
): IttoEdge | undefined {
  return getGraphIndex(graph).edgeByEndpoints.get(`${source}->${target}`);
}

export function uniqueNodes(nodes: IttoNode[]): IttoNode[] {
  const seen = new Set<string>();
  return nodes.filter((node) => {
    if (seen.has(node.id)) {
      return false;
    }

    seen.add(node.id);
    return true;
  });
}

export function nodeMatchesFilters(node: IttoNode, filters: GraphFilters): boolean {
  if (filters.nodeType !== "all" && node.type !== filters.nodeType) {
    return false;
  }

  if (node.type === "process") {
    if (filters.processGroup !== "all" && node.processGroup !== filters.processGroup) {
      return false;
    }

    if (filters.knowledgeArea !== "all" && node.knowledgeArea !== filters.knowledgeArea) {
      return false;
    }
  }

  if (node.type === "artifact" || node.type === "technique") {
    return filters.processGroup === "all" && filters.knowledgeArea === "all";
  }

  return filters.processGroup === "all" && filters.knowledgeArea === "all";
}

export function filterProcesses(
  graph: GraphSource,
  knowledgeArea: KnowledgeArea,
  processGroup: ProcessGroup
): IttoNode[] {
  return getProcessNodes(graph).filter(
    (node) => node.knowledgeArea === knowledgeArea && node.processGroup === processGroup
  );
}

export function searchNodes(
  graph: GraphSource,
  query: string,
  nodeType: NodeType | "all" = "all"
): IttoNode[] {
  const index = getGraphIndex(graph);
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return index.nodes
    .filter((node) => nodeType === "all" || node.type === nodeType)
    .filter((node) => {
      const text = [
        node.label,
        node.englishLabel ?? "",
        node.type,
        node.category ?? "",
        node.englishCategory ?? "",
        node.knowledgeArea ?? "",
        node.knowledgeAreaLabel ?? "",
        node.processGroup ?? "",
        node.processGroupLabel ?? ""
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(normalizedQuery);
    })
    .slice(0, 12);
}

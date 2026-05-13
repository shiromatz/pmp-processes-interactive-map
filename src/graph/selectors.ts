import type {
  GraphFilters,
  IttoEdge,
  IttoGraph,
  IttoNode,
  KnowledgeArea,
  NodeType,
  ProcessGroup
} from "../types/graph";

export function getNodeById(graph: IttoGraph, nodeId: string): IttoNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function getProcessNodes(graph: IttoGraph): IttoNode[] {
  return graph.nodes.filter((node) => node.type === "process");
}

export function getArtifactNodes(graph: IttoGraph): IttoNode[] {
  return graph.nodes.filter((node) => node.type === "artifact");
}

export function getInputsForProcess(graph: IttoGraph, processId: string): IttoNode[] {
  return graph.edges
    .filter((edge) => edge.target === processId && edge.relation === "input_to")
    .map((edge) => getNodeById(graph, edge.source))
    .filter(isNode);
}

export function getOutputsForProcess(graph: IttoGraph, processId: string): IttoNode[] {
  return graph.edges
    .filter((edge) => edge.source === processId && edge.relation === "outputs")
    .map((edge) => getNodeById(graph, edge.target))
    .filter(isNode);
}

export function getProducersForArtifact(graph: IttoGraph, artifactId: string): IttoNode[] {
  return graph.edges
    .filter((edge) => edge.target === artifactId && edge.relation === "outputs")
    .map((edge) => getNodeById(graph, edge.source))
    .filter(isNode);
}

export function getConsumersForArtifact(graph: IttoGraph, artifactId: string): IttoNode[] {
  return graph.edges
    .filter((edge) => edge.source === artifactId && edge.relation === "input_to")
    .map((edge) => getNodeById(graph, edge.target))
    .filter(isNode);
}

export function getDownstreamUsage(
  graph: IttoGraph,
  processId: string
): Array<{ output: IttoNode; consumers: IttoNode[] }> {
  return getOutputsForProcess(graph, processId).map((output) => ({
    output,
    consumers: getConsumersForArtifact(graph, output.id)
  }));
}

export function getEdgeBetween(
  graph: IttoGraph,
  source: string,
  target: string
): IttoEdge | undefined {
  return graph.edges.find((edge) => edge.source === source && edge.target === target);
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

  if (node.type === "artifact") {
    return filters.processGroup === "all" && filters.knowledgeArea === "all";
  }

  return true;
}

export function filterProcesses(
  graph: IttoGraph,
  knowledgeArea: KnowledgeArea,
  processGroup: ProcessGroup
): IttoNode[] {
  return getProcessNodes(graph).filter(
    (node) => node.knowledgeArea === knowledgeArea && node.processGroup === processGroup
  );
}

export function searchNodes(
  graph: IttoGraph,
  query: string,
  nodeType: NodeType | "all" = "all"
): IttoNode[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return graph.nodes
    .filter((node) => nodeType === "all" || node.type === nodeType)
    .filter((node) => {
      const text = [
        node.label,
        node.type,
        node.knowledgeArea ?? "",
        node.processGroup ?? ""
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(normalizedQuery);
    })
    .slice(0, 12);
}

function isNode(node: IttoNode | undefined): node is IttoNode {
  return Boolean(node);
}

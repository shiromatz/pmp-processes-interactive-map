import type { IttoEdge, IttoGraph, IttoNode, NodeType } from "../types/graph";

export type GraphIndex = {
  graph: IttoGraph;
  nodes: IttoNode[];
  edges: IttoEdge[];
  nodesById: Map<string, IttoNode>;
  nodesByType: Record<NodeType, IttoNode[]>;
  incomingByNode: Map<string, IttoEdge[]>;
  outgoingByNode: Map<string, IttoEdge[]>;
  inputsByProcess: Map<string, IttoNode[]>;
  outputsByProcess: Map<string, IttoNode[]>;
  updatesByProcess: Map<string, IttoNode[]>;
  producersByArtifact: Map<string, IttoNode[]>;
  updatersByArtifact: Map<string, IttoNode[]>;
  consumersByArtifact: Map<string, IttoNode[]>;
  techniquesByProcess: Map<string, IttoNode[]>;
  processesByTechnique: Map<string, IttoNode[]>;
  edgeByEndpoints: Map<string, IttoEdge>;
};

export type GraphSource = IttoGraph | GraphIndex;

export function createGraphIndex(graph: IttoGraph): GraphIndex {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const nodesByType: Record<NodeType, IttoNode[]> = {
    process: [],
    artifact: [],
    technique: [],
    principle: [],
    performanceDomain: [],
    model: [],
    method: [],
    focusArea: [],
    processGuidance: []
  };
  const incomingByNode = new Map<string, IttoEdge[]>();
  const outgoingByNode = new Map<string, IttoEdge[]>();
  const inputsByProcess = new Map<string, IttoNode[]>();
  const outputsByProcess = new Map<string, IttoNode[]>();
  const updatesByProcess = new Map<string, IttoNode[]>();
  const producersByArtifact = new Map<string, IttoNode[]>();
  const updatersByArtifact = new Map<string, IttoNode[]>();
  const consumersByArtifact = new Map<string, IttoNode[]>();
  const techniquesByProcess = new Map<string, IttoNode[]>();
  const processesByTechnique = new Map<string, IttoNode[]>();
  const edgeByEndpoints = new Map<string, IttoEdge>();

  for (const node of graph.nodes) {
    nodesByType[node.type].push(node);
  }

  for (const edge of graph.edges) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);

    if (!source || !target) {
      continue;
    }

    addEdgeToMap(outgoingByNode, edge.source, edge);
    addEdgeToMap(incomingByNode, edge.target, edge);

    if (!edgeByEndpoints.has(getEndpointKey(edge.source, edge.target))) {
      edgeByEndpoints.set(getEndpointKey(edge.source, edge.target), edge);
    }

    if (edge.relation === "input_to") {
      addToMap(inputsByProcess, edge.target, source);
      addToMap(consumersByArtifact, edge.source, target);
    }

    if (edge.relation === "outputs") {
      addToMap(outputsByProcess, edge.source, target);
      addToMap(producersByArtifact, edge.target, source);
    }

    if (edge.relation === "updates") {
      addToMap(updatesByProcess, edge.source, target);
      addToMap(updatersByArtifact, edge.target, source);
    }

    if (edge.relation === "uses") {
      addToMap(techniquesByProcess, edge.source, target);
      addToMap(processesByTechnique, edge.target, source);
    }
  }

  return {
    graph,
    nodes: graph.nodes,
    edges: graph.edges,
    nodesById,
    nodesByType,
    incomingByNode,
    outgoingByNode,
    inputsByProcess,
    outputsByProcess,
    updatesByProcess,
    producersByArtifact,
    updatersByArtifact,
    consumersByArtifact,
    techniquesByProcess,
    processesByTechnique,
    edgeByEndpoints
  };
}

export function getGraphIndex(source: GraphSource): GraphIndex {
  return isGraphIndex(source) ? source : createGraphIndex(source);
}

function isGraphIndex(source: GraphSource): source is GraphIndex {
  return "nodesById" in source;
}

function addToMap(map: Map<string, IttoNode[]>, key: string, node: IttoNode) {
  map.set(key, [...(map.get(key) ?? []), node]);
}

function addEdgeToMap(map: Map<string, IttoEdge[]>, key: string, edge: IttoEdge) {
  map.set(key, [...(map.get(key) ?? []), edge]);
}

function getEndpointKey(source: string, target: string): string {
  return `${source}->${target}`;
}

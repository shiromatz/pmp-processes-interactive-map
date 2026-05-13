import type { Edge, Node } from "@xyflow/react";

export type NodeType = "process" | "artifact" | "technique";

export type RelationType = "input_to" | "outputs" | "updates" | "uses";

export type ProcessGroup =
  | "Initiating"
  | "Planning"
  | "Executing"
  | "Monitoring and Controlling"
  | "Closing";

export type KnowledgeArea =
  | "Project Integration Management"
  | "Project Scope Management"
  | "Project Schedule Management"
  | "Project Cost Management"
  | "Project Quality Management"
  | "Project Resource Management"
  | "Project Communications Management"
  | "Project Risk Management"
  | "Project Procurement Management"
  | "Project Stakeholder Management";

export type IttoNode = {
  id: string;
  label: string;
  type: NodeType;
  knowledgeArea?: KnowledgeArea;
  processGroup?: ProcessGroup;
  category?: string;
  englishLabel?: string;
  englishCategory?: string;
  knowledgeAreaLabel?: string;
  processGroupLabel?: string;
};

export type IttoEdge = {
  source: string;
  target: string;
  relation: RelationType;
};

export type IttoGraph = {
  nodes: IttoNode[];
  edges: IttoEdge[];
};

export type NodeTypeFilter = "all" | "process" | "artifact" | "technique";

export type GraphFilters = {
  processGroup: ProcessGroup | "all";
  knowledgeArea: KnowledgeArea | "all";
  nodeType: NodeTypeFilter;
  downstreamDepth: 1 | 2;
};

export type FlowNodeData = {
  label: string;
  nodeType: NodeType;
  knowledgeArea?: KnowledgeArea;
  processGroup?: ProcessGroup;
  category?: string;
  knowledgeAreaLabel?: string;
  processGroupLabel?: string;
  isFocus?: boolean;
  isRecent?: boolean;
  muted?: boolean;
};

export type FlowEdgeData = {
  relation: RelationType;
};

export type IttoFlowNode = Node<FlowNodeData, "processNode" | "artifactNode" | "techniqueNode">;
export type IttoFlowEdge = Edge<FlowEdgeData>;

export type BuiltView = {
  nodes: IttoFlowNode[];
  edges: IttoFlowEdge[];
};

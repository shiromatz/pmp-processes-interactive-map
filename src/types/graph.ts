import type { Edge, Node } from "@xyflow/react";

export type NodeType =
  | "process"
  | "artifact"
  | "technique"
  | "principle"
  | "performanceDomain"
  | "model"
  | "method"
  | "focusArea"
  | "processGuidance";

export type RelationType =
  | "input_to"
  | "outputs"
  | "updates"
  | "uses"
  | "supports"
  | "applies_to"
  | "maps_to"
  | "contains"
  | "references";

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
  knowledgeAreaShortLabel?: string;
  processGroupShortLabel?: string;
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

export type NodeTypeFilter = "all" | NodeType;

export type ProcessRelationHighlight = "produced" | "usedAsInput" | "updated" | "related";

export type GraphFilters = {
  processGroup: ProcessGroup | "all";
  knowledgeArea: KnowledgeArea | "all";
  nodeType: NodeTypeFilter;
};

export type FlowNodeData = {
  label: string;
  nodeType: NodeType;
  nodeTypeLabel?: string;
  knowledgeArea?: KnowledgeArea;
  processGroup?: ProcessGroup;
  category?: string;
  knowledgeAreaLabel?: string;
  processGroupLabel?: string;
  knowledgeAreaShortLabel?: string;
  processGroupShortLabel?: string;
  isFocus?: boolean;
  isRecent?: boolean;
  isDraggable?: boolean;
  muted?: boolean;
};

export type FlowEdgeData = {
  relation: RelationType;
};

export type IttoFlowNode = Node<FlowNodeData, "processNode" | "artifactNode" | "techniqueNode" | "genericNode">;
export type IttoFlowEdge = Edge<FlowEdgeData>;

export type BuiltView = {
  nodes: IttoFlowNode[];
  edges: IttoFlowEdge[];
};

import ittoData from "./itto.json";
import pmbokSeventhData from "./pmbok-seventh.json";
import pmbokEighthData from "./pmbok-eighth.json";
import type { IttoGraph, NodeType } from "../types/graph";

export type EditionId = "sixth" | "seventh" | "eighth";

export type EditionConfig = {
  id: EditionId;
  graph: IttoGraph;
  defaultNodeId: string;
  primaryNodeTypes: NodeType[];
  matrixNodeTypes: NodeType[];
};

export const DEFAULT_EDITION: EditionId = "sixth";

export const EDITION_OPTIONS: EditionId[] = ["sixth", "seventh", "eighth"];

export const EDITION_CONFIGS: Record<EditionId, EditionConfig> = {
  sixth: {
    id: "sixth",
    graph: ittoData as IttoGraph,
    defaultNodeId: "develop_project_management_plan",
    primaryNodeTypes: ["process", "artifact", "technique"],
    matrixNodeTypes: ["process"]
  },
  seventh: {
    id: "seventh",
    graph: pmbokSeventhData as IttoGraph,
    defaultNodeId: "seventh_domain_delivery",
    primaryNodeTypes: ["principle", "performanceDomain", "model", "method", "artifact"],
    matrixNodeTypes: ["principle", "performanceDomain", "model", "method", "artifact"]
  },
  eighth: {
    id: "eighth",
    graph: pmbokEighthData as IttoGraph,
    defaultNodeId: "eighth_domain_governance",
    primaryNodeTypes: ["principle", "performanceDomain", "focusArea", "processGuidance", "model", "method", "artifact"],
    matrixNodeTypes: ["principle", "performanceDomain", "focusArea", "processGuidance", "model", "method", "artifact"]
  }
};

export function isEdition(value: string | null | undefined): value is EditionId {
  return value === "sixth" || value === "seventh" || value === "eighth";
}

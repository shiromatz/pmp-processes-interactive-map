import type { BuiltView, GraphFilters, IttoFlowEdge, IttoGraph } from "../types/graph";
import { getNodeById, getProcessesUsingTechnique, nodeMatchesFilters, uniqueNodes } from "./selectors";
import { ARTIFACT_COLUMN_X, getFocusY, layoutCenteredColumn, toFlowNode } from "./layout";

export function buildTechniqueView(
  graph: IttoGraph,
  selectedTechniqueId: string,
  filters: GraphFilters
): BuiltView {
  const focus = getNodeById(graph, selectedTechniqueId);

  if (!focus || focus.type !== "technique") {
    return { nodes: [], edges: [] };
  }

  const processes = uniqueNodes(getProcessesUsingTechnique(graph, selectedTechniqueId));
  const muted = (nodeId: string) => {
    const node = getNodeById(graph, nodeId);
    return node ? !nodeMatchesFilters(node, filters) : false;
  };
  const focusY = getFocusY([processes.length]);

  return {
    nodes: [
      ...layoutCenteredColumn(processes, ARTIFACT_COLUMN_X.producers, focusY, 78, (node) => ({
        muted: muted(node.id)
      })),
      toFlowNode(focus, ARTIFACT_COLUMN_X.focus, focusY, {
        isFocus: true,
        isRecent: true,
        muted: muted(focus.id)
      })
    ],
    edges: processes.map((process) => toFlowEdge(process.id, focus.id))
  };
}

function toFlowEdge(source: string, target: string): IttoFlowEdge {
  return {
    id: `${source}-${target}-uses`,
    source,
    target,
    sourceHandle: "source-right",
    targetHandle: "target-left",
    type: "smoothstep",
    animated: true,
    data: { relation: "uses" },
    className: "flow-edge--uses"
  };
}

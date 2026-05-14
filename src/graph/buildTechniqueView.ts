import { toFlowEdge } from "./flowEdges";
import type { GraphSource } from "./graphIndex";
import type { BuiltView, GraphFilters } from "../types/graph";
import { getNodeById, getProcessesUsingTechnique, nodeMatchesFilters, uniqueNodes } from "./selectors";
import { layoutProcessMatrixGrid, toFlowNode } from "./layout";

export function buildTechniqueView(
  graph: GraphSource,
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
  const initialProcessNodes = layoutProcessMatrixGrid(processes, 0, 0, 250, 116, (node) => ({
    muted: muted(node.id)
  }));
  const initialBounds = getNodePositionBounds(initialProcessNodes);
  const processNodes = initialBounds
    ? initialProcessNodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x,
          y: node.position.y + 80 - initialBounds.minY
        }
      }))
    : initialProcessNodes;
  const processBounds = getNodePositionBounds(processNodes);
  const focusX = processBounds ? (processBounds.minX + processBounds.maxX) / 2 : 0;
  const focusY = processBounds ? processBounds.maxY + 150 : 240;

  return {
    nodes: [
      ...processNodes,
      toFlowNode(focus, focusX, focusY, {
        isFocus: true,
        isRecent: true,
        muted: muted(focus.id)
      })
    ],
    edges: processes.map((process) =>
      toFlowEdge(process.id, focus.id, "uses", {
        sourceHandle: "source-bottom",
        targetHandle: "target-top"
      })
    )
  };
}

function getNodePositionBounds(nodes: BuiltView["nodes"]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} | null {
  if (nodes.length === 0) {
    return null;
  }

  return nodes.reduce(
    (bounds, node) => ({
      minX: Math.min(bounds.minX, node.position.x),
      maxX: Math.max(bounds.maxX, node.position.x),
      minY: Math.min(bounds.minY, node.position.y),
      maxY: Math.max(bounds.maxY, node.position.y)
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    }
  );
}

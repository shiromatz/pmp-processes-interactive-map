import { useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type NodeProps
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { buildArtifactView } from "../graph/buildArtifactView";
import { buildProcessView } from "../graph/buildProcessView";
import { getNodeById } from "../graph/selectors";
import type { GraphFilters, IttoFlowNode, IttoGraph } from "../types/graph";

type GraphViewProps = {
  graph: IttoGraph;
  selectedNodeId: string;
  filters: GraphFilters;
  onSelectNode: (nodeId: string) => void;
};

const nodeTypes = {
  processNode: IttoNode,
  artifactNode: IttoNode
};

export function GraphView({ graph, selectedNodeId, filters, onSelectNode }: GraphViewProps) {
  const selectedNode = getNodeById(graph, selectedNodeId);
  const view = useMemo(() => {
    if (!selectedNode) {
      return { nodes: [], edges: [] };
    }

    return selectedNode.type === "process"
      ? buildProcessView(graph, selectedNode.id, filters)
      : buildArtifactView(graph, selectedNode.id, filters);
  }, [filters, graph, selectedNode]);

  return (
    <section className="graph-panel" aria-label="Relationship graph">
      <div className="graph-panel__header">
        <div>
          <p className="eyebrow">Graph View</p>
          <h2>{selectedNode?.label ?? "Select a node"}</h2>
        </div>
        <div className="graph-legend" aria-label="Graph legend">
          <span className="legend-item legend-item--process">Process</span>
          <span className="legend-item legend-item--artifact">Artifact</span>
        </div>
      </div>
      <div className="graph-canvas">
        <ReactFlow
          nodes={view.nodes}
          edges={view.edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => onSelectNode(node.id)}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.35}
          maxZoom={1.3}
          nodesDraggable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} size={1} />
          <MiniMap pannable zoomable nodeStrokeWidth={3} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  );
}

function IttoNode({ data }: NodeProps<IttoFlowNode>) {
  const className = [
    "itto-node",
    data.nodeType === "process" ? "itto-node--process" : "itto-node--artifact",
    data.isFocus ? "itto-node--focus" : "",
    data.muted ? "itto-node--muted" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <Handle type="target" position={Position.Left} />
      <div className="itto-node__kind">{data.nodeType === "process" ? "Process" : "Artifact"}</div>
      <div className="itto-node__label">{data.label}</div>
      {data.nodeType === "process" ? (
        <div className="itto-node__meta">
          {data.processGroup} / {data.knowledgeArea?.replace("Project ", "").replace(" Management", "")}
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  type NodeProps
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { buildArtifactView } from "../graph/buildArtifactView";
import { buildProcessView } from "../graph/buildProcessView";
import { buildTechniqueView } from "../graph/buildTechniqueView";
import { getNodeById } from "../graph/selectors";
import type { Messages } from "../i18n";
import type { GraphFilters, IttoFlowEdge, IttoFlowNode, IttoGraph } from "../types/graph";

type GraphViewProps = {
  graph: IttoGraph;
  selectedNodeId: string;
  filters: GraphFilters;
  messages: Messages;
  onSelectNode: (nodeId: string) => void;
};

export function GraphView({ graph, selectedNodeId, filters, messages, onSelectNode }: GraphViewProps) {
  const flowInstanceRef = useRef<ReactFlowInstance<IttoFlowNode, IttoFlowEdge> | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [readableMinZoom, setReadableMinZoom] = useState(0.62);
  const selectedNode = getNodeById(graph, selectedNodeId);
  const nodeTypes = useMemo(
    () => ({
      processNode: (props: NodeProps<IttoFlowNode>) => <IttoNode {...props} messages={messages} />,
      artifactNode: (props: NodeProps<IttoFlowNode>) => <IttoNode {...props} messages={messages} />,
      techniqueNode: (props: NodeProps<IttoFlowNode>) => <IttoNode {...props} messages={messages} />
    }),
    [messages]
  );
  const view = useMemo(() => {
    if (!selectedNode) {
      return { nodes: [], edges: [] };
    }

    if (selectedNode.type === "process") {
      return buildProcessView(graph, selectedNode.id, filters);
    }

    if (selectedNode.type === "artifact") {
      return buildArtifactView(graph, selectedNode.id, filters);
    }

    return buildTechniqueView(graph, selectedNode.id, filters);
  }, [filters, graph, selectedNode]);
  const viewNodeIds = useMemo(() => view.nodes.map((node) => node.id).join("|"), [view.nodes]);
  const viewEdgeIds = useMemo(() => view.edges.map((edge) => edge.id).join("|"), [view.edges]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const updateReadableMinZoom = () => {
      const width = canvasRef.current?.clientWidth ?? 0;
      setReadableMinZoom(width < 480 ? 0.46 : 0.62);
    };

    updateReadableMinZoom();
    const observer = new ResizeObserver(updateReadableMinZoom);
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!flowInstanceRef.current || view.nodes.length === 0) {
      return;
    }

    setIsTransitioning(false);

    const restartTimer = window.setTimeout(() => setIsTransitioning(true), 20);
    const fitTimer = window.setTimeout(() => {
      void flowInstanceRef.current?.fitView({
        padding: 0.18,
        duration: 720,
        minZoom: readableMinZoom,
        maxZoom: 1.05,
        interpolate: "smooth"
      });
    }, 70);
    const transitionTimer = window.setTimeout(() => setIsTransitioning(false), 980);

    return () => {
      window.clearTimeout(restartTimer);
      window.clearTimeout(fitTimer);
      window.clearTimeout(transitionTimer);
    };
  }, [
    selectedNodeId,
    view.nodes.length,
    viewNodeIds,
    viewEdgeIds,
    filters.knowledgeArea,
    filters.nodeType,
    filters.processGroup,
    readableMinZoom
  ]);

  return (
    <section className="graph-panel" aria-label={messages.relationshipGraph}>
      <div className="graph-panel__header">
        <div>
          <p className="eyebrow">{messages.graphView}</p>
          <h2>{selectedNode?.label ?? messages.selectNode}</h2>
        </div>
        <div className="graph-legend" aria-label={messages.graphLegend}>
          <span className="legend-item legend-item--process">{messages.nodeTypes.process}</span>
          <span className="legend-item legend-item--artifact">{messages.nodeTypes.artifact}</span>
          <span className="legend-line-item legend-line-item--input">
            <span className="legend-line" aria-hidden="true" />
            {messages.inputs}
          </span>
          <span className="legend-line-item legend-line-item--output">
            <span className="legend-line" aria-hidden="true" />
            {messages.outputs}
          </span>
          <span className="legend-line-item legend-line-item--update">
            <span className="legend-line" aria-hidden="true" />
            {messages.updates}
          </span>
        </div>
      </div>
      <div ref={canvasRef} className={`graph-canvas${isTransitioning ? " is-transitioning" : ""}`}>
        <ReactFlow
          nodes={view.nodes}
          edges={view.edges}
          nodeTypes={nodeTypes}
          onInit={(instance) => {
            flowInstanceRef.current = instance;
          }}
          onNodeClick={(_, node) => onSelectNode(node.id)}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={readableMinZoom}
          maxZoom={1.3}
          nodesDraggable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  );
}

function IttoNode({ data, messages }: NodeProps<IttoFlowNode> & { messages: Messages }) {
  const className = [
    "itto-node",
    data.nodeType === "process"
      ? "itto-node--process"
      : data.nodeType === "technique"
        ? "itto-node--technique"
        : "itto-node--artifact",
    data.isFocus ? "itto-node--focus" : "",
    data.isRecent ? "itto-node--recent" : "",
    data.muted ? "itto-node--muted" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <Handle id="target-left" type="target" position={Position.Left} />
      <div className="itto-node__kind">{messages.nodeTypes[data.nodeType]}</div>
      <div className="itto-node__label">{data.label}</div>
      {data.nodeType === "process" ? (
        <div className="itto-node__meta">
          {data.processGroupLabel ?? data.processGroup} / {data.knowledgeAreaLabel ?? data.knowledgeArea}
        </div>
      ) : data.nodeType === "technique" ? (
        <div className="itto-node__meta">{data.category}</div>
      ) : null}
      <Handle id="source-right" type="source" position={Position.Right} />
    </div>
  );
}

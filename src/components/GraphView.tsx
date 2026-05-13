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
import type { GraphFilters, IttoFlowEdge, IttoFlowNode, IttoGraph, NodeType, RelationType } from "../types/graph";

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
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const selectedNode = getNodeById(graph, selectedNodeId);
  const nodeTypes = useMemo(
    () => ({
      processNode: (props: NodeProps<IttoFlowNode>) => <IttoNode {...props} messages={messages} />,
      artifactNode: (props: NodeProps<IttoFlowNode>) => <IttoNode {...props} messages={messages} />,
      techniqueNode: (props: NodeProps<IttoFlowNode>) => <IttoNode {...props} messages={messages} />,
      axisLabelNode: (props: NodeProps<IttoFlowNode>) => <AxisLabelNode {...props} />
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
  const visibleEdges = useMemo<IttoFlowEdge[]>(
    () =>
      view.edges.map((edge): IttoFlowEdge => {
        const isDirectConnection = edge.source === selectedNodeId || edge.target === selectedNodeId;
        return {
          ...edge,
          label: getRelationLabel(edge.data?.relation, selectedNode?.type, messages),
          labelShowBg: true,
          labelBgPadding: [6, 3] as [number, number],
          labelBgBorderRadius: 4,
          labelStyle: {
            fill: "#172033",
            fontSize: 11,
            fontWeight: 800
          },
          className: [
            edge.className,
            isDirectConnection ? "is-active" : "is-dimmed",
            selectedEdgeId === edge.id ? "is-edge-selected" : ""
          ]
            .filter(Boolean)
            .join(" ")
        };
      }),
    [messages, selectedEdgeId, selectedNode?.type, selectedNodeId, view.edges]
  );
  const legendItems = useMemo(() => getLegendItems(selectedNode?.type, messages), [messages, selectedNode?.type]);

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

  useEffect(() => {
    setSelectedEdgeId(null);
  }, [selectedNodeId, viewEdgeIds]);

  return (
    <section className="graph-panel" aria-label={messages.relationshipGraph}>
      <div className="graph-panel__header">
        <div>
          <p className="eyebrow">{messages.graphView}</p>
          <h2>{selectedNode?.label ?? messages.selectNode}</h2>
        </div>
        <div className="graph-legend" aria-label={messages.graphLegend}>
          {legendItems.map((item) =>
            item.type === "node" ? (
              <span key={item.label} className={`legend-item legend-item--${item.nodeType}`}>
                {item.label}
              </span>
            ) : (
              <span key={item.label} className={`legend-line-item legend-line-item--${item.relation}`}>
                <span className="legend-line" aria-hidden="true" />
                {item.label}
              </span>
            )
          )}
        </div>
      </div>
      <div ref={canvasRef} className={`graph-canvas${isTransitioning ? " is-transitioning" : ""}`}>
        <ReactFlow
          nodes={view.nodes}
          edges={visibleEdges}
          nodeTypes={nodeTypes}
          onInit={(instance) => {
            flowInstanceRef.current = instance;
          }}
          onNodeClick={(_, node) => {
            if (node.type !== "axisLabelNode" && node.data.nodeType) {
              setSelectedEdgeId(null);
              onSelectNode(node.id);
            }
          }}
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onPaneClick={() => setSelectedEdgeId(null)}
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
  if (!data.nodeType) {
    return null;
  }

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

function AxisLabelNode({ data }: NodeProps<IttoFlowNode>) {
  return <div className={`axis-label axis-label--${data.axis ?? "column"}`}>{data.label}</div>;
}

type LegendEntry =
  | { type: "node"; nodeType: NodeType; label: string }
  | { type: "line"; relation: "input" | "output" | "update" | "uses"; label: string };

function getLegendItems(selectedType: NodeType | undefined, messages: Messages): LegendEntry[] {
  if (selectedType === "artifact") {
    return [
      { type: "node", nodeType: "process", label: messages.nodeTypes.process },
      { type: "node", nodeType: "artifact", label: messages.nodeTypes.artifact },
      { type: "line", relation: "output", label: messages.producedBy },
      { type: "line", relation: "input", label: messages.usedAsInputBy },
      { type: "line", relation: "update", label: messages.updatedBy }
    ];
  }

  if (selectedType === "technique") {
    return [
      { type: "node", nodeType: "process", label: messages.nodeTypes.process },
      { type: "node", nodeType: "technique", label: messages.nodeTypes.technique },
      { type: "line", relation: "uses", label: messages.usedBy }
    ];
  }

  return [
    { type: "node", nodeType: "process", label: messages.nodeTypes.process },
    { type: "node", nodeType: "artifact", label: messages.nodeTypes.artifact },
    { type: "line", relation: "input", label: messages.inputs },
    { type: "line", relation: "output", label: messages.outputs },
    { type: "line", relation: "update", label: messages.updates }
  ];
}

function getRelationLabel(
  relation: RelationType | undefined,
  selectedType: NodeType | undefined,
  messages: Messages
): string {
  if (selectedType === "artifact") {
    if (relation === "outputs") {
      return messages.producedBy;
    }

    if (relation === "input_to") {
      return messages.usedAsInputBy;
    }

    if (relation === "updates") {
      return messages.updatedBy;
    }
  }

  if (relation === "outputs") {
    return messages.outputs;
  }

  if (relation === "updates") {
    return messages.updates;
  }

  if (relation === "uses") {
    return messages.usedBy;
  }

  return messages.inputs;
}

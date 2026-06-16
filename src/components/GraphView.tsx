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
import { buildEditionMapView } from "../graph/buildEditionMapView";
import { buildProcessView } from "../graph/buildProcessView";
import { buildTechniqueView } from "../graph/buildTechniqueView";
import type { EditionId } from "../data/editions";
import type { GraphSource } from "../graph/graphIndex";
import { getNodeById } from "../graph/selectors";
import type { Messages } from "../i18n";
import type { GraphFilters, IttoFlowEdge, IttoFlowNode, NodeType, RelationType } from "../types/graph";

type GraphViewProps = {
  graph: GraphSource;
  selectedNodeId: string;
  filters: GraphFilters;
  edition: EditionId;
  messages: Messages;
  onSelectNode: (nodeId: string) => void;
};

export function GraphView({ graph, selectedNodeId, filters, edition, messages, onSelectNode }: GraphViewProps) {
  const flowInstanceRef = useRef<ReactFlowInstance<IttoFlowNode, IttoFlowEdge> | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [manualPositions, setManualPositions] = useState<Record<string, IttoFlowNode["position"]>>({});
  const [readableMinZoom, setReadableMinZoom] = useState(0.62);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const draggedNodeRef = useRef(false);
  const selectedNode = getNodeById(graph, selectedNodeId);
  const view = useMemo(() => {
    if (!selectedNode) {
      return { nodes: [], edges: [] };
    }

    if (edition !== "sixth") {
      return buildEditionMapView(graph, selectedNode.id);
    }

    if (selectedNode.type === "process") {
      return buildProcessView(graph, selectedNode.id, filters);
    }

    if (selectedNode.type === "artifact") {
      return buildArtifactView(graph, selectedNode.id, filters);
    }

    return buildTechniqueView(graph, selectedNode.id, filters);
  }, [edition, filters, graph, selectedNode]);
  const viewNodeIds = useMemo(() => view.nodes.map((node) => node.id).join("|"), [view.nodes]);
  const viewEdgeIds = useMemo(() => view.edges.map((edge) => edge.id).join("|"), [view.edges]);
  const displayNodes = useMemo<IttoFlowNode[]>(
    () =>
      view.nodes.map((node) => {
        return {
          ...node,
          draggable: true,
          position: manualPositions[node.id] ?? node.position,
          data: {
            ...node.data,
            nodeTypeLabel: messages.nodeTypes[node.data.nodeType],
            isDraggable: true
          }
        };
      }),
    [manualPositions, view.nodes]
  );
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
  const legendItems = useMemo(
    () => getLegendItems(selectedNode?.type, edition, messages),
    [edition, messages, selectedNode?.type]
  );

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

  useEffect(() => {
    setManualPositions({});
  }, [
    selectedNodeId,
    viewNodeIds,
    viewEdgeIds,
    filters.knowledgeArea,
    filters.nodeType,
    filters.processGroup
  ]);

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
          nodes={displayNodes}
          edges={visibleEdges}
          nodeTypes={NODE_TYPES}
          onInit={(instance) => {
            flowInstanceRef.current = instance;
          }}
          onNodeClick={(_, node) => {
            if (draggedNodeRef.current) {
              draggedNodeRef.current = false;
              return;
            }

            setSelectedEdgeId(null);
            onSelectNode(node.id);
          }}
          onNodeDragStart={() => {
            draggedNodeRef.current = true;
          }}
          onNodeDrag={(_, node) => {
            setManualPositions((positions) => ({
              ...positions,
              [node.id]: node.position
            }));
          }}
          onNodeDragStop={(_, node) => {
            setManualPositions((positions) => ({
              ...positions,
              [node.id]: node.position
            }));
            window.setTimeout(() => {
              draggedNodeRef.current = false;
            }, 0);
          }}
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onPaneClick={() => setSelectedEdgeId(null)}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={readableMinZoom}
          maxZoom={1.3}
          nodesDraggable
          panOnDrag
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  );
}

const NODE_TYPES = {
  processNode: IttoNode,
  artifactNode: IttoNode,
  techniqueNode: IttoNode,
  genericNode: IttoNode
};

function IttoNode({ data }: NodeProps<IttoFlowNode>) {
  const className = [
    "itto-node",
    getNodeClassName(data.nodeType),
    data.isFocus ? "itto-node--focus" : "",
    data.isRecent ? "itto-node--recent" : "",
    data.isDraggable ? "itto-node--draggable" : "",
    data.muted ? "itto-node--muted" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <Handle id="target-top" type="target" position={Position.Top} className="react-flow__handle--vertical" />
      <Handle id="target-left" type="target" position={Position.Left} />
      <div className="itto-node__kind">{data.nodeTypeLabel ?? data.nodeType}</div>
      <div className="itto-node__label">{data.label}</div>
      {data.nodeType === "process" ? (
        <div className="itto-node__meta">
          {data.processGroupShortLabel ?? data.processGroupLabel ?? data.processGroup} /{" "}
          {data.knowledgeAreaShortLabel ?? data.knowledgeAreaLabel ?? data.knowledgeArea}
        </div>
      ) : data.category ? (
        <div className="itto-node__meta">{data.category}</div>
      ) : null}
      <Handle id="source-right" type="source" position={Position.Right} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} className="react-flow__handle--vertical" />
    </div>
  );
}

type LegendEntry =
  | { type: "node"; nodeType: NodeType; label: string }
  | { type: "line"; relation: "input" | "output" | "update" | "uses" | "supports" | "applies" | "maps" | "contains" | "references"; label: string };

function getLegendItems(selectedType: NodeType | undefined, edition: EditionId, messages: Messages): LegendEntry[] {
  if (edition !== "sixth") {
    return [
      { type: "node", nodeType: "principle", label: messages.nodeTypes.principle },
      { type: "node", nodeType: "performanceDomain", label: messages.nodeTypes.performanceDomain },
      { type: "line", relation: "supports", label: messages.supports },
      { type: "line", relation: "applies", label: messages.appliesTo },
      { type: "line", relation: "contains", label: messages.contains },
      { type: "line", relation: "references", label: messages.references }
    ];
  }

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

  if (relation === "supports") {
    return messages.supports;
  }

  if (relation === "applies_to") {
    return messages.appliesTo;
  }

  if (relation === "maps_to") {
    return messages.mapsTo;
  }

  if (relation === "contains") {
    return messages.contains;
  }

  if (relation === "references") {
    return messages.references;
  }

  return messages.inputs;
}

function getNodeClassName(nodeType: NodeType): string {
  if (nodeType === "process") {
    return "itto-node--process";
  }

  if (nodeType === "technique" || nodeType === "method") {
    return "itto-node--technique";
  }

  if (nodeType === "artifact") {
    return "itto-node--artifact";
  }

  if (nodeType === "principle") {
    return "itto-node--principle";
  }

  if (nodeType === "performanceDomain") {
    return "itto-node--domain";
  }

  if (nodeType === "focusArea") {
    return "itto-node--focus-area";
  }

  if (nodeType === "processGuidance") {
    return "itto-node--guidance";
  }

  return "itto-node--model";
}

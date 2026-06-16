import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getConsumersForArtifact,
  getIncomingEdgesForNode,
  getInputsForProcess,
  getNodeById,
  getOutgoingEdgesForNode,
  getOutputsForProcess,
  getProcessesUsingTechnique,
  getProducersForArtifact,
  getTechniquesForProcess,
  getUpdatesForProcess,
  getUpdatersForArtifact
} from "../graph/selectors";
import type { EditionId } from "../data/editions";
import type { GraphSource } from "../graph/graphIndex";
import { getNodeTypeLabel, type Locale, type Messages } from "../i18n";
import type { IttoEdge, IttoNode, RelationType } from "../types/graph";

type DetailTab = {
  id: string;
  title: string;
  count: number;
  content: ReactNode;
};

type DetailPanelProps = {
  graph: GraphSource;
  selectedNodeId: string;
  edition: EditionId;
  messages: Messages;
  locale: Locale;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectNode: (nodeId: string) => void;
};

export function DetailPanel({
  graph,
  selectedNodeId,
  edition,
  messages,
  locale,
  isCollapsed,
  onToggleCollapsed,
  onSelectNode
}: DetailPanelProps) {
  const selectedNode = getNodeById(graph, selectedNodeId);

  if (isCollapsed) {
    return (
      <aside className="detail-panel panel-collapsed" aria-label={messages.selectedNodeDetails}>
        <button
          type="button"
          className="panel-collapse-button"
          aria-label={`${messages.expandPanel}: ${messages.detailPanel}`}
          onClick={onToggleCollapsed}
        >
          <span>{messages.detailPanel}</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="detail-panel" aria-label={messages.selectedNodeDetails}>
      <div className="panel-heading panel-heading--with-action">
        <div>
          <p className="eyebrow">{messages.detailPanel}</p>
          <h2>{selectedNode?.label ?? messages.noSelection}</h2>
        </div>
        <button
          type="button"
          className="panel-icon-button"
          aria-label={`${messages.collapsePanel}: ${messages.detailPanel}`}
          onClick={onToggleCollapsed}
        >
          &gt;
        </button>
      </div>
      {selectedNode ? (
        edition !== "sixth" ? (
          <EditionNodeDetails graph={graph} node={selectedNode} messages={messages} locale={locale} onSelectNode={onSelectNode} />
        ) : selectedNode.type === "process" ? (
          <ProcessDetails graph={graph} node={selectedNode} messages={messages} locale={locale} onSelectNode={onSelectNode} />
        ) : selectedNode.type === "artifact" ? (
          <ArtifactDetails graph={graph} node={selectedNode} messages={messages} locale={locale} onSelectNode={onSelectNode} />
        ) : (
          <TechniqueDetails graph={graph} node={selectedNode} messages={messages} locale={locale} onSelectNode={onSelectNode} />
        )
      ) : (
        <p className="empty-text">{messages.chooseNode}</p>
      )}
    </aside>
  );
}

function EditionNodeDetails({
  graph,
  node,
  messages,
  locale,
  onSelectNode
}: {
  graph: GraphSource;
  node: IttoNode;
  messages: Messages;
  locale: Locale;
  onSelectNode: (nodeId: string) => void;
}) {
  const incomingEdges = getIncomingEdgesForNode(graph, node.id);
  const outgoingEdges = getOutgoingEdgesForNode(graph, node.id);
  const incomingSections = toRelationSections(graph, incomingEdges, "source", messages, locale, onSelectNode, true);
  const outgoingSections = toRelationSections(graph, outgoingEdges, "target", messages, locale, onSelectNode, false);
  const sections: DetailTab[] = [
    {
      id: "related-from",
      title: messages.relatedFrom,
      count: incomingEdges.length,
      content: <RelationGroups title={messages.relatedFrom} sections={incomingSections} messages={messages} />
    },
    {
      id: "related-to",
      title: messages.relatedTo,
      count: outgoingEdges.length,
      content: <RelationGroups title={messages.relatedTo} sections={outgoingSections} messages={messages} />
    }
  ];

  return (
    <div className="details-stack">
      <div className="detail-meta">
        <span>{getNodeTypeLabel(node.type, locale)}</span>
        {node.category ? <span>{node.category}</span> : null}
      </div>
      <DetailTabs sections={sections} resetKey={node.id} />
    </div>
  );
}

function ProcessDetails({
  graph,
  node,
  messages,
  locale,
  onSelectNode
}: {
  graph: GraphSource;
  node: IttoNode;
  messages: Messages;
  locale: Locale;
  onSelectNode: (nodeId: string) => void;
}) {
  const inputs = getInputsForProcess(graph, node.id);
  const outputs = getOutputsForProcess(graph, node.id);
  const updates = getUpdatesForProcess(graph, node.id);
  const techniques = getTechniquesForProcess(graph, node.id);
  const sections: DetailTab[] = [
    {
      id: "inputs",
      title: messages.inputs,
      count: inputs.length,
      content: <NodeList title={messages.inputs} nodes={inputs} messages={messages} locale={locale} onSelectNode={onSelectNode} />
    },
    {
      id: "techniques",
      title: messages.toolsAndTechniques,
      count: techniques.length,
      content: <TechniqueList nodes={techniques} messages={messages} onSelectNode={onSelectNode} />
    },
    {
      id: "outputs",
      title: messages.outputs,
      count: outputs.length,
      content: <NodeList title={messages.outputs} nodes={outputs} messages={messages} locale={locale} onSelectNode={onSelectNode} />
    },
    {
      id: "updates",
      title: messages.updates,
      count: updates.length,
      content: <NodeList title={messages.updates} nodes={updates} messages={messages} locale={locale} onSelectNode={onSelectNode} />
    }
  ];

  return (
    <div className="details-stack">
      <div className="detail-meta">
        <span>{node.processGroupLabel ?? node.processGroup}</span>
        <span>{node.knowledgeAreaLabel ?? node.knowledgeArea}</span>
      </div>
      <DetailTabs sections={sections} resetKey={node.id} />
    </div>
  );
}

function ArtifactDetails({
  graph,
  node,
  messages,
  locale,
  onSelectNode
}: {
  graph: GraphSource;
  node: IttoNode;
  messages: Messages;
  locale: Locale;
  onSelectNode: (nodeId: string) => void;
}) {
  const producers = getProducersForArtifact(graph, node.id);
  const updaters = getUpdatersForArtifact(graph, node.id);
  const consumers = getConsumersForArtifact(graph, node.id);
  const sections: DetailTab[] = [
    {
      id: "produced-by",
      title: messages.producedBy,
      count: producers.length,
      content: <NodeList title={messages.producedBy} nodes={producers} messages={messages} locale={locale} onSelectNode={onSelectNode} />
    },
    {
      id: "updated-by",
      title: messages.updatedBy,
      count: updaters.length,
      content: <NodeList title={messages.updatedBy} nodes={updaters} messages={messages} locale={locale} onSelectNode={onSelectNode} />
    },
    {
      id: "used-as-input-by",
      title: messages.usedAsInputBy,
      count: consumers.length,
      content: <NodeList title={messages.usedAsInputBy} nodes={consumers} messages={messages} locale={locale} onSelectNode={onSelectNode} />
    }
  ];

  return (
    <div className="details-stack">
      <div className="detail-meta">
        <span>{getNodeTypeLabel("artifact", locale)}</span>
      </div>
      <DetailTabs sections={sections} resetKey={node.id} />
    </div>
  );
}

function TechniqueDetails({
  graph,
  node,
  messages,
  locale,
  onSelectNode
}: {
  graph: GraphSource;
  node: IttoNode;
  messages: Messages;
  locale: Locale;
  onSelectNode: (nodeId: string) => void;
}) {
  const processes = getProcessesUsingTechnique(graph, node.id);
  const sections: DetailTab[] = [
    {
      id: "used-by",
      title: messages.usedBy,
      count: processes.length,
      content: <NodeList title={messages.usedBy} nodes={processes} messages={messages} locale={locale} onSelectNode={onSelectNode} />
    }
  ];

  return (
    <div className="details-stack">
      <div className="detail-meta">
        <span>{messages.toolsAndTechniques}</span>
        {node.category ? <span>{node.category}</span> : null}
      </div>
      <DetailTabs sections={sections} resetKey={node.id} />
    </div>
  );
}

function DetailTabs({ sections, resetKey }: { sections: DetailTab[]; resetKey: string }) {
  const sectionIds = useMemo(() => sections.map((section) => section.id).join("|"), [sections]);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    setActiveId(sections[0]?.id ?? "");
  }, [resetKey, sectionIds]);

  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];

  if (!activeSection) {
    return null;
  }

  return (
    <div className="detail-tabs-wrap">
      <div className="detail-tabs" role="tablist" aria-label="Detail sections">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={section.id === activeSection.id}
            className={section.id === activeSection.id ? "is-active" : ""}
            onClick={() => setActiveId(section.id)}
          >
            <span>{section.title}</span>
            <small>{section.count}</small>
          </button>
        ))}
      </div>
      <div className="detail-tab-panel" role="tabpanel">
        {activeSection.content}
      </div>
    </div>
  );
}

function TechniqueList({
  nodes,
  messages,
  onSelectNode
}: {
  nodes: IttoNode[];
  messages: Messages;
  onSelectNode: (nodeId: string) => void;
}) {
  const groups = nodes.reduce<Record<string, IttoNode[]>>((grouped, node) => {
    const key = node.category ?? "Other";
    grouped[key] = [...(grouped[key] ?? []), node];
    return grouped;
  }, {});

  return (
    <section className="detail-section">
      <h3>{messages.toolsAndTechniques}</h3>
      {nodes.length > 0 ? (
        <div className="technique-groups">
          {Object.entries(groups).map(([category, items]) => (
            <div className="technique-group" key={category}>
              <h4>{category}</h4>
              <ul className="node-list">
                {items.map((node) => (
                  <li key={node.id}>
                    <button type="button" onClick={() => onSelectNode(node.id)}>
                      <span>{node.label}</span>
                      <small>{node.category ?? messages.toolsAndTechniques}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-text">{messages.noMappedTools}</p>
      )}
    </section>
  );
}

function NodeList({
  title,
  nodes,
  messages,
  locale,
  onSelectNode
}: {
  title: string;
  nodes: IttoNode[];
  messages: Messages;
  locale: Locale;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      {nodes.length > 0 ? (
        <ul className="node-list">
          {nodes.map((node) => (
            <li key={node.id}>
              <button type="button" onClick={() => onSelectNode(node.id)}>
                <span>{node.label}</span>
                <small>{getNodeSecondaryLabel(node, locale)}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-text">{messages.noMappedNodes}</p>
      )}
    </section>
  );
}

type RelationSection = {
  relation: RelationType;
  title: string;
  nodes: IttoNode[];
  content: ReactNode;
};

function RelationGroups({
  title,
  sections,
  messages
}: {
  title: string;
  sections: RelationSection[];
  messages: Messages;
}) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      {sections.length > 0 ? (
        <div className="technique-groups">
          {sections.map((section) => (
            <div className="technique-group" key={`${section.relation}-${section.title}`}>
              <h4>{section.title}</h4>
              {section.content}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-text">{messages.noMappedNodes}</p>
      )}
    </section>
  );
}

function toRelationSections(
  graph: GraphSource,
  edges: IttoEdge[],
  endpoint: "source" | "target",
  messages: Messages,
  locale: Locale,
  onSelectNode: (nodeId: string) => void,
  reverseLabel: boolean
): RelationSection[] {
  const grouped = new Map<RelationType, IttoNode[]>();

  for (const edge of edges) {
    const relatedNode = getNodeById(graph, edge[endpoint]);
    if (!relatedNode) {
      continue;
    }

    grouped.set(edge.relation, [...(grouped.get(edge.relation) ?? []), relatedNode]);
  }

  return Array.from(grouped.entries()).map(([relation, nodes]) => ({
    relation,
    title: getRelationLabel(relation, messages, reverseLabel),
    nodes,
    content: <NodeList title={getRelationLabel(relation, messages, reverseLabel)} nodes={nodes} messages={messages} locale={locale} onSelectNode={onSelectNode} />
  }));
}

function getRelationLabel(relation: RelationType, messages: Messages, reverseLabel: boolean): string {
  if (relation === "supports") {
    return reverseLabel ? messages.supportedBy : messages.supports;
  }

  if (relation === "applies_to") {
    return reverseLabel ? messages.appliedBy : messages.appliesTo;
  }

  if (relation === "maps_to") {
    return reverseLabel ? messages.mappedFrom : messages.mapsTo;
  }

  if (relation === "contains") {
    return reverseLabel ? messages.containedIn : messages.contains;
  }

  if (relation === "references") {
    return reverseLabel ? messages.referencedBy : messages.references;
  }

  if (relation === "outputs") {
    return reverseLabel ? messages.producedBy : messages.outputs;
  }

  if (relation === "updates") {
    return reverseLabel ? messages.updatedBy : messages.updates;
  }

  if (relation === "uses") {
    return reverseLabel ? messages.usedBy : messages.toolsAndTechniques;
  }

  return reverseLabel ? messages.usedAsInputBy : messages.inputs;
}

function getNodeSecondaryLabel(node: IttoNode, locale: Locale): string {
  if (node.type === "process") {
    const group = node.processGroupShortLabel ?? node.processGroupLabel ?? node.processGroup;
    const area = node.knowledgeAreaShortLabel ?? node.knowledgeAreaLabel ?? node.knowledgeArea;
    return [group, area].filter(Boolean).join(" / ") || getNodeTypeLabel(node.type, locale);
  }

  return getNodeTypeLabel(node.type, locale);
}

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getConsumersForArtifact,
  getInputsForProcess,
  getNodeById,
  getOutputsForProcess,
  getProcessesUsingTechnique,
  getProducersForArtifact,
  getTechniquesForProcess,
  getUpdatesForProcess,
  getUpdatersForArtifact
} from "../graph/selectors";
import { getNodeTypeLabel, type Locale, type Messages } from "../i18n";
import type { IttoGraph, IttoNode } from "../types/graph";

type DetailTab = {
  id: string;
  title: string;
  count: number;
  content: ReactNode;
};

type DetailPanelProps = {
  graph: IttoGraph;
  selectedNodeId: string;
  messages: Messages;
  locale: Locale;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectNode: (nodeId: string) => void;
};

export function DetailPanel({
  graph,
  selectedNodeId,
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
        selectedNode.type === "process" ? (
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

function ProcessDetails({
  graph,
  node,
  messages,
  locale,
  onSelectNode
}: {
  graph: IttoGraph;
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
  graph: IttoGraph;
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
  graph: IttoGraph;
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
                <small>{getNodeTypeLabel(node.type, locale)}</small>
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

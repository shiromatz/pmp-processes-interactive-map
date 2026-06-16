import type { GraphSource } from "../graph/graphIndex";
import { getNodesByType } from "../graph/selectors";
import { formatItemCount, getNodeTypeLabel, type Locale, type Messages } from "../i18n";
import type { NodeType } from "../types/graph";

type EditionMatrixProps = {
  graph: GraphSource;
  selectedNodeId: string;
  nodeTypes: NodeType[];
  messages: Messages;
  locale: Locale;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectNode: (nodeId: string) => void;
};

export function EditionMatrix({
  graph,
  selectedNodeId,
  nodeTypes,
  messages,
  locale,
  isCollapsed,
  onToggleCollapsed,
  onSelectNode
}: EditionMatrixProps) {
  const groups = nodeTypes
    .map((type) => ({
      type,
      label: getNodeTypeLabel(type, locale),
      nodes: getNodesByType(graph, type)
    }))
    .filter((group) => group.nodes.length > 0);
  const itemCount = groups.reduce((sum, group) => sum + group.nodes.length, 0);

  if (isCollapsed) {
    return (
      <section className="matrix-panel panel-collapsed" aria-label={messages.editionOverview}>
        <button
          type="button"
          className="panel-collapse-button"
          aria-label={`${messages.expandPanel}: ${messages.editionOverview}`}
          onClick={onToggleCollapsed}
        >
          <span>{messages.editionOverview}</span>
        </button>
      </section>
    );
  }

  return (
    <section className="matrix-panel edition-matrix-panel" aria-label={messages.editionOverview}>
      <div className="panel-heading panel-heading--with-action">
        <div>
          <p className="eyebrow">{messages.editionOverview}</p>
          <h2>{formatItemCount(itemCount, locale)}</h2>
        </div>
        <button
          type="button"
          className="panel-icon-button"
          aria-label={`${messages.collapsePanel}: ${messages.editionOverview}`}
          onClick={onToggleCollapsed}
        >
          &lt;
        </button>
      </div>
      <div className="edition-matrix">
        {groups.map((group) => (
          <section className="edition-group" key={group.type} aria-label={group.label}>
            <h3>{group.label}</h3>
            <div className="edition-node-list">
              {group.nodes.map((node) => (
                <button
                  type="button"
                  key={node.id}
                  className={[
                    "edition-node-chip",
                    `edition-node-chip--${node.type}`,
                    selectedNodeId === node.id ? "is-selected" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectNode(node.id)}
                >
                  <span>{node.label}</span>
                  {node.category ? <small>{node.category}</small> : null}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

import { KNOWLEDGE_AREAS, PROCESS_GROUPS } from "../data/constants";
import type { GraphSource } from "../graph/graphIndex";
import { filterProcesses, getProcessNodes, nodeMatchesFilters } from "../graph/selectors";
import { formatProcessCount, getKnowledgeAreaShortLabel, getProcessGroupShortLabel, type Locale, type Messages } from "../i18n";
import type { GraphFilters, ProcessRelationHighlight } from "../types/graph";

type ProcessMatrixProps = {
  graph: GraphSource;
  selectedNodeId: string;
  filters: GraphFilters;
  messages: Messages;
  locale: Locale;
  processRelationHighlights: Map<string, Set<ProcessRelationHighlight>>;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectNode: (nodeId: string) => void;
};

export function ProcessMatrix({
  graph,
  selectedNodeId,
  filters,
  messages,
  locale,
  processRelationHighlights,
  isCollapsed,
  onToggleCollapsed,
  onSelectNode
}: ProcessMatrixProps) {
  const processCount = getProcessNodes(graph).length;

  if (isCollapsed) {
    return (
      <section className="matrix-panel panel-collapsed" aria-label={messages.processMatrix}>
        <button
          type="button"
          className="panel-collapse-button"
          aria-label={`${messages.expandPanel}: ${messages.processMatrix}`}
          onClick={onToggleCollapsed}
        >
          <span>{messages.processMatrix}</span>
        </button>
      </section>
    );
  }

  return (
    <section className="matrix-panel" aria-label={messages.processMatrix}>
      <div className="panel-heading panel-heading--with-action">
        <div>
          <p className="eyebrow">{messages.processMatrix}</p>
          <h2>{formatProcessCount(processCount, locale)}</h2>
        </div>
        <button
          type="button"
          className="panel-icon-button"
          aria-label={`${messages.collapsePanel}: ${messages.processMatrix}`}
          onClick={onToggleCollapsed}
        >
          &lt;
        </button>
      </div>
      <div className="process-matrix" role="table" aria-label={messages.knowledgeAreaByProcessGroup}>
        <div className="matrix-row matrix-row--header" role="row">
          <div className="matrix-cell matrix-cell--area" role="columnheader">
            {messages.knowledgeArea}
          </div>
          {PROCESS_GROUPS.map((group) => (
            <div className="matrix-cell matrix-cell--group" role="columnheader" key={group}>
              {getProcessGroupShortLabel(group, locale)}
            </div>
          ))}
        </div>

        {KNOWLEDGE_AREAS.map((area) => (
          <div className="matrix-row" role="row" key={area}>
            <div className="matrix-cell matrix-cell--area" role="rowheader">
              {getKnowledgeAreaShortLabel(area, locale)}
            </div>
            {PROCESS_GROUPS.map((group) => {
              const processes = filterProcesses(graph, area, group);

              return (
                <div className="matrix-cell" role="cell" key={`${area}-${group}`}>
                  {processes.map((process) => {
                    const highlights = processRelationHighlights.get(process.id) ?? new Set<ProcessRelationHighlight>();
                    const relationHighlights = PROCESS_RELATION_ORDER.filter((highlight) => highlights.has(highlight));
                    const relationLabels = relationHighlights.map((highlight) => getRelationHighlightLabel(highlight, messages));
                    const isHighlighted = highlights.size > 0;
                    const className = [
                      "process-chip",
                      selectedNodeId === process.id ? "is-selected" : "",
                      highlights.has("related") ? "is-related" : "",
                      relationHighlights.length > 0 ? "has-relation-highlight" : "",
                      relationHighlights.includes("produced") ? "is-produced" : "",
                      relationHighlights.includes("usedAsInput") ? "is-used-as-input" : "",
                      relationHighlights.includes("updated") ? "is-updated" : "",
                      !isHighlighted && !nodeMatchesFilters(process, filters) ? "is-muted" : ""
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        type="button"
                        key={process.id}
                        className={className}
                        aria-label={relationLabels.length > 0 ? `${process.label}: ${relationLabels.join(", ")}` : process.label}
                        onClick={() => onSelectNode(process.id)}
                      >
                        <span>{process.label}</span>
                        {relationHighlights.length > 0 ? (
                          <span className="process-chip__relations" aria-hidden="true">
                            {relationHighlights.map((highlight) => (
                              <span
                                key={highlight}
                                className={`process-chip__relation-line process-chip__relation-line--${highlight}`}
                              />
                            ))}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

const PROCESS_RELATION_ORDER: ProcessRelationHighlight[] = ["produced", "usedAsInput", "updated"];

function getRelationHighlightLabel(highlight: ProcessRelationHighlight, messages: Messages): string {
  if (highlight === "produced") {
    return messages.producedBy;
  }

  if (highlight === "usedAsInput") {
    return messages.usedAsInputBy;
  }

  if (highlight === "updated") {
    return messages.updatedBy;
  }

  return messages.usedBy;
}

import { KNOWLEDGE_AREAS, PROCESS_GROUPS } from "../data/constants";
import { filterProcesses, getProcessNodes, nodeMatchesFilters } from "../graph/selectors";
import { formatProcessCount, getKnowledgeAreaShortLabel, getProcessGroupShortLabel, type Locale, type Messages } from "../i18n";
import type { GraphFilters, IttoGraph } from "../types/graph";

type ProcessMatrixProps = {
  graph: IttoGraph;
  selectedNodeId: string;
  filters: GraphFilters;
  messages: Messages;
  locale: Locale;
  relatedProcessIds: Set<string>;
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
  relatedProcessIds,
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
                    const isRelated = relatedProcessIds.has(process.id);
                    const className = [
                      "process-chip",
                      selectedNodeId === process.id ? "is-selected" : "",
                      isRelated ? "is-related" : "",
                      !isRelated && !nodeMatchesFilters(process, filters) ? "is-muted" : ""
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        type="button"
                        key={process.id}
                        className={className}
                        onClick={() => onSelectNode(process.id)}
                      >
                        {process.label}
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

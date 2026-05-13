import { KNOWLEDGE_AREAS, PROCESS_GROUPS } from "../data/constants";
import { filterProcesses, getProcessNodes, nodeMatchesFilters } from "../graph/selectors";
import type { GraphFilters, IttoGraph } from "../types/graph";

type ProcessMatrixProps = {
  graph: IttoGraph;
  selectedNodeId: string;
  filters: GraphFilters;
  onSelectNode: (nodeId: string) => void;
};

const SHORT_GROUP_LABELS: Record<string, string> = {
  Initiating: "Initiating",
  Planning: "Planning",
  Executing: "Executing",
  "Monitoring and Controlling": "M&C",
  Closing: "Closing"
};

export function ProcessMatrix({
  graph,
  selectedNodeId,
  filters,
  onSelectNode
}: ProcessMatrixProps) {
  const processCount = getProcessNodes(graph).length;

  return (
    <section className="matrix-panel" aria-label="Process matrix">
      <div className="panel-heading">
        <p className="eyebrow">Process Matrix</p>
        <h2>{processCount} Processes</h2>
      </div>
      <div className="process-matrix" role="table" aria-label="Knowledge area by process group">
        <div className="matrix-row matrix-row--header" role="row">
          <div className="matrix-cell matrix-cell--area" role="columnheader">
            Knowledge Area
          </div>
          {PROCESS_GROUPS.map((group) => (
            <div className="matrix-cell matrix-cell--group" role="columnheader" key={group}>
              {SHORT_GROUP_LABELS[group]}
            </div>
          ))}
        </div>

        {KNOWLEDGE_AREAS.map((area) => (
          <div className="matrix-row" role="row" key={area}>
            <div className="matrix-cell matrix-cell--area" role="rowheader">
              {area.replace("Project ", "").replace(" Management", "")}
            </div>
            {PROCESS_GROUPS.map((group) => {
              const processes = filterProcesses(graph, area, group);

              return (
                <div className="matrix-cell" role="cell" key={`${area}-${group}`}>
                  {processes.map((process) => {
                    const className = [
                      "process-chip",
                      selectedNodeId === process.id ? "is-selected" : "",
                      !nodeMatchesFilters(process, filters) ? "is-muted" : ""
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

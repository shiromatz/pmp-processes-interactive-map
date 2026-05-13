import { KNOWLEDGE_AREAS, PROCESS_GROUPS } from "../data/constants";
import type { GraphFilters, KnowledgeArea, ProcessGroup } from "../types/graph";

type FilterBarProps = {
  filters: GraphFilters;
  onChange: (filters: GraphFilters) => void;
};

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar" aria-label="Filters">
      <label>
        <span>Process Group</span>
        <select
          value={filters.processGroup}
          onChange={(event) =>
            onChange({ ...filters, processGroup: event.target.value as ProcessGroup | "all" })
          }
        >
          <option value="all">All groups</option>
          {PROCESS_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Knowledge Area</span>
        <select
          value={filters.knowledgeArea}
          onChange={(event) =>
            onChange({ ...filters, knowledgeArea: event.target.value as KnowledgeArea | "all" })
          }
        >
          <option value="all">All areas</option>
          {KNOWLEDGE_AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Node Type</span>
        <select
          value={filters.nodeType}
          onChange={(event) =>
            onChange({ ...filters, nodeType: event.target.value as GraphFilters["nodeType"] })
          }
        >
          <option value="all">All nodes</option>
          <option value="process">Processes only</option>
          <option value="artifact">Artifacts only</option>
        </select>
      </label>

      <div className="depth-control" aria-label="Downstream depth">
        <span>Downstream</span>
        <div className="segmented-control">
          <button
            type="button"
            className={filters.downstreamDepth === 1 ? "is-active" : ""}
            onClick={() => onChange({ ...filters, downstreamDepth: 1 })}
          >
            1
          </button>
          <button
            type="button"
            className={filters.downstreamDepth === 2 ? "is-active" : ""}
            onClick={() => onChange({ ...filters, downstreamDepth: 2 })}
          >
            2
          </button>
        </div>
      </div>
    </div>
  );
}

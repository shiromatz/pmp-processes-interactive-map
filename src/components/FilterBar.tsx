import { KNOWLEDGE_AREAS, PROCESS_GROUPS } from "../data/constants";
import { getKnowledgeAreaLabel, getProcessGroupLabel, type Locale, type Messages } from "../i18n";
import type { GraphFilters, KnowledgeArea, ProcessGroup } from "../types/graph";

type FilterBarProps = {
  filters: GraphFilters;
  messages: Messages;
  locale: Locale;
  onChange: (filters: GraphFilters) => void;
};

export function FilterBar({ filters, messages, locale, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar" aria-label={messages.filters}>
      <label>
        <span>{messages.processGroup}</span>
        <select
          value={filters.processGroup}
          onChange={(event) =>
            onChange({ ...filters, processGroup: event.target.value as ProcessGroup | "all" })
          }
        >
          <option value="all">{messages.allGroups}</option>
          {PROCESS_GROUPS.map((group) => (
            <option key={group} value={group}>
              {getProcessGroupLabel(group, locale)}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>{messages.knowledgeArea}</span>
        <select
          value={filters.knowledgeArea}
          onChange={(event) =>
            onChange({ ...filters, knowledgeArea: event.target.value as KnowledgeArea | "all" })
          }
        >
          <option value="all">{messages.allAreas}</option>
          {KNOWLEDGE_AREAS.map((area) => (
            <option key={area} value={area}>
              {getKnowledgeAreaLabel(area, locale)}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>{messages.nodeType}</span>
        <select
          value={filters.nodeType}
          onChange={(event) =>
            onChange({ ...filters, nodeType: event.target.value as GraphFilters["nodeType"] })
          }
        >
          <option value="all">{messages.allNodes}</option>
          <option value="process">{messages.processesOnly}</option>
          <option value="artifact">{messages.artifactsOnly}</option>
        </select>
      </label>
    </div>
  );
}

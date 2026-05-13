import { useMemo, useState, type KeyboardEvent } from "react";
import { searchNodes } from "../graph/selectors";
import type { GraphFilters, IttoGraph, IttoNode } from "../types/graph";

type SearchBoxProps = {
  graph: IttoGraph;
  filters: GraphFilters;
  onSelectNode: (nodeId: string) => void;
};

export function SearchBox({ graph, filters, onSelectNode }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const results = useMemo(
    () => searchNodes(graph, query, filters.nodeType),
    [filters.nodeType, graph, query]
  );

  const selectNode = (node: IttoNode) => {
    onSelectNode(node.id);
    setQuery(node.label);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && results[0]) {
      event.preventDefault();
      selectNode(results[0]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-box">
      <label htmlFor="node-search">Search</label>
      <input
        id="node-search"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Process, artifact, T&T, KA, or group"
        autoComplete="off"
      />
      {isOpen && results.length > 0 ? (
        <div className="search-results" role="listbox" aria-label="Search results">
          {results.map((node) => (
            <button key={node.id} type="button" onMouseDown={() => selectNode(node)}>
              <span>{node.label}</span>
              <small>{getNodeSummary(node)}</small>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getNodeSummary(node: IttoNode): string {
  if (node.type === "process") {
    return `${node.processGroup} / ${node.knowledgeArea}`;
  }

  if (node.type === "technique") {
    return node.category ? `T&T / ${node.category}` : "T&T";
  }

  return "Artifact";
}

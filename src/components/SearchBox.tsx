import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { searchNodes } from "../graph/selectors";
import type { GraphSource } from "../graph/graphIndex";
import { getNodeTypeLabel, type Locale, type Messages } from "../i18n";
import type { GraphFilters, IttoNode } from "../types/graph";

type SearchBoxProps = {
  graph: GraphSource;
  filters: GraphFilters;
  messages: Messages;
  locale: Locale;
  onSelectNode: (nodeId: string) => void;
};

export function SearchBox({ graph, filters, messages, locale, onSelectNode }: SearchBoxProps) {
  const inputId = useId();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const results = useMemo(
    () => searchNodes(graph, query, filters.nodeType),
    [filters.nodeType, graph, query]
  );
  const hasResults = isOpen && results.length > 0;
  const activeResult = hasResults ? results[activeIndex] ?? results[0] : undefined;

  useEffect(() => {
    setActiveIndex(0);
  }, [query, filters.nodeType]);

  useEffect(() => {
    if (activeIndex >= results.length) {
      setActiveIndex(Math.max(results.length - 1, 0));
    }
  }, [activeIndex, results.length]);

  const selectNode = (node: IttoNode) => {
    onSelectNode(node.id);
    setQuery(node.label);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
      return;
    }

    if (event.key === "Home" && hasResults) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End" && hasResults) {
      event.preventDefault();
      setActiveIndex(results.length - 1);
      return;
    }

    if (event.key === "Enter" && activeResult) {
      event.preventDefault();
      selectNode(activeResult);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-box">
      <label htmlFor={inputId}>{messages.search}</label>
      <input
        id={inputId}
        type="search"
        role="combobox"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={messages.searchPlaceholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={hasResults ? listboxId : undefined}
        aria-expanded={hasResults}
        aria-activedescendant={activeResult ? `${listboxId}-${activeResult.id}` : undefined}
      />
      {hasResults ? (
        <div id={listboxId} className="search-results" role="listbox" aria-label={messages.searchResults}>
          {results.map((node, index) => (
            <button
              id={`${listboxId}-${node.id}`}
              key={node.id}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={() => selectNode(node)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span>{node.label}</span>
              <small>{getNodeSummary(node, locale)}</small>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getNodeSummary(node: IttoNode, locale: Locale): string {
  if (node.type === "process") {
    return `${node.processGroupLabel ?? node.processGroup} / ${node.knowledgeAreaLabel ?? node.knowledgeArea}`;
  }

  if (node.type === "technique") {
    return node.category ? `${getNodeTypeLabel(node.type, locale)} / ${node.category}` : getNodeTypeLabel(node.type, locale);
  }

  return getNodeTypeLabel(node.type, locale);
}

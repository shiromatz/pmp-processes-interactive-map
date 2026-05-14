import { useEffect, useMemo, useState } from "react";
import { DetailPanel } from "./components/DetailPanel";
import { FilterBar } from "./components/FilterBar";
import { GraphView } from "./components/GraphView";
import { ProcessMatrix } from "./components/ProcessMatrix";
import { SearchBox } from "./components/SearchBox";
import ittoData from "./data/itto.json";
import {
  getConsumersForArtifact,
  getNodeById,
  getProcessesUsingTechnique,
  getProducersForArtifact,
  getUpdatersForArtifact
} from "./graph/selectors";
import { createGraphIndex } from "./graph/graphIndex";
import { DEFAULT_LOCALE, LOCALE_OPTIONS, getMessages, isLocale, localizeGraph, type Locale } from "./i18n";
import type { GraphFilters, IttoGraph, ProcessRelationHighlight } from "./types/graph";

const baseGraph = ittoData as IttoGraph;
const baseGraphIndex = createGraphIndex(baseGraph);
const DEFAULT_NODE_ID = "develop_project_management_plan";
const LOCALE_STORAGE_KEY = "pmp-itto-locale";

const defaultFilters: GraphFilters = {
  processGroup: "all",
  knowledgeArea: "all",
  nodeType: "all"
};

const FOOTER_LINKS = [
  {
    label: "Repository",
    href: "https://github.com/shiromatz/pmp-processes-interactive-map"
  },
  {
    label: "README",
    href: "https://github.com/shiromatz/pmp-processes-interactive-map#readme"
  },
  {
    label: "Notice",
    href: "https://github.com/shiromatz/pmp-processes-interactive-map/blob/main/NOTICE.md"
  },
  {
    label: "License",
    href: "https://github.com/shiromatz/pmp-processes-interactive-map/blob/main/LICENSE"
  }
];

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(() => getInitialNodeId());
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());
  const [filters, setFilters] = useState<GraphFilters>(defaultFilters);
  const [isMatrixCollapsed, setIsMatrixCollapsed] = useState(false);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);
  const graph = useMemo(() => localizeGraph(baseGraph, locale), [locale]);
  const graphIndex = useMemo(() => createGraphIndex(graph), [graph]);
  const messages = useMemo(() => getMessages(locale), [locale]);
  const selectedNode = useMemo(() => getNodeById(graphIndex, selectedNodeId), [graphIndex, selectedNodeId]);
  const processRelationHighlights = useMemo(() => {
    const highlights = new Map<string, Set<ProcessRelationHighlight>>();
    const addHighlight = (nodeId: string, highlight: ProcessRelationHighlight) => {
      highlights.set(nodeId, new Set([...(highlights.get(nodeId) ?? []), highlight]));
    };

    if (!selectedNode) {
      return highlights;
    }

    if (selectedNode.type === "artifact") {
      getProducersForArtifact(graphIndex, selectedNode.id).forEach((node) => addHighlight(node.id, "produced"));
      getConsumersForArtifact(graphIndex, selectedNode.id).forEach((node) => addHighlight(node.id, "usedAsInput"));
      getUpdatersForArtifact(graphIndex, selectedNode.id).forEach((node) => addHighlight(node.id, "updated"));
      return highlights;
    }

    if (selectedNode.type === "technique") {
      getProcessesUsingTechnique(graphIndex, selectedNode.id).forEach((node) => addHighlight(node.id, "related"));
      return highlights;
    }

    return highlights;
  }, [graphIndex, selectedNode]);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedNodeId(getInitialNodeId());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!selectedNode) {
      setSelectedNodeId(DEFAULT_NODE_ID);
    }
  }, [selectedNode]);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const selectNode = (nodeId: string) => {
    if (!getNodeById(graphIndex, nodeId)) {
      return;
    }

    setSelectedNodeId(nodeId);
    const url = new URL(window.location.href);
    url.searchParams.set("node", nodeId);
    window.history.pushState({}, "", url);
  };

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLocale);
    window.history.replaceState({}, "", url);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>{messages.title}</h1>
        </div>
        <div className="app-header__side">
          <label className="language-control">
            <span>{messages.language}</span>
            <select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>
              {LOCALE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="app-header__summary">{messages.summary}</p>
          <p className="app-header__scope-note">{messages.dataScopeNote}</p>
        </div>
      </header>

      <section className="top-panel" aria-label={messages.searchAndFilters}>
        <SearchBox graph={graphIndex} filters={filters} messages={messages} locale={locale} onSelectNode={selectNode} />
        <FilterBar filters={filters} messages={messages} locale={locale} onChange={setFilters} />
      </section>

      <main
        className={[
          "workspace-layout",
          isMatrixCollapsed ? "is-left-collapsed" : "",
          isDetailCollapsed ? "is-right-collapsed" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ProcessMatrix
          graph={graphIndex}
          selectedNodeId={selectedNodeId}
          filters={filters}
          messages={messages}
          locale={locale}
          processRelationHighlights={processRelationHighlights}
          isCollapsed={isMatrixCollapsed}
          onToggleCollapsed={() => setIsMatrixCollapsed((collapsed) => !collapsed)}
          onSelectNode={selectNode}
        />
        <GraphView
          graph={graphIndex}
          selectedNodeId={selectedNodeId}
          filters={filters}
          messages={messages}
          onSelectNode={selectNode}
        />
        <DetailPanel
          graph={graphIndex}
          selectedNodeId={selectedNodeId}
          messages={messages}
          locale={locale}
          isCollapsed={isDetailCollapsed}
          onToggleCollapsed={() => setIsDetailCollapsed((collapsed) => !collapsed)}
          onSelectNode={selectNode}
        />
      </main>

      <footer className="app-footer">
        <div className="app-footer__notice">
          {messages.disclaimer.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <nav className="app-footer__links" aria-label="Project links">
          {FOOTER_LINKS.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}

function getInitialNodeId(): string {
  const params = new URLSearchParams(window.location.search);
  const nodeId = params.get("node");

  if (nodeId && getNodeById(baseGraphIndex, nodeId)) {
    return nodeId;
  }

  return DEFAULT_NODE_ID;
}

function getInitialLocale(): Locale {
  const params = new URLSearchParams(window.location.search);
  const localeParam = params.get("lang");

  if (isLocale(localeParam)) {
    return localeParam;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isLocale(storedLocale)) {
    return storedLocale;
  }

  const browserLanguage = window.navigator.language;
  if (browserLanguage.startsWith("ja")) {
    return "ja";
  }

  if (browserLanguage.toLowerCase().startsWith("zh")) {
    return "zh-CN";
  }

  return DEFAULT_LOCALE;
}

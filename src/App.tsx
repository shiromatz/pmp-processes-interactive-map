import { useEffect, useMemo, useState } from "react";
import { DetailPanel } from "./components/DetailPanel";
import { FilterBar } from "./components/FilterBar";
import { GraphView } from "./components/GraphView";
import { ProcessMatrix } from "./components/ProcessMatrix";
import { SearchBox } from "./components/SearchBox";
import ittoData from "./data/itto.json";
import { getNodeById } from "./graph/selectors";
import { DEFAULT_LOCALE, LOCALE_OPTIONS, getMessages, isLocale, localizeGraph, type Locale } from "./i18n";
import type { GraphFilters, IttoGraph } from "./types/graph";

const baseGraph = ittoData as IttoGraph;
const DEFAULT_NODE_ID = "develop_project_management_plan";
const LOCALE_STORAGE_KEY = "pmp-itto-locale";

const defaultFilters: GraphFilters = {
  processGroup: "all",
  knowledgeArea: "all",
  nodeType: "all",
  downstreamDepth: 2,
  showTechniques: false
};

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(() => getInitialNodeId());
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());
  const [filters, setFilters] = useState<GraphFilters>(defaultFilters);
  const graph = useMemo(() => localizeGraph(baseGraph, locale), [locale]);
  const messages = useMemo(() => getMessages(locale), [locale]);
  const selectedNode = useMemo(() => getNodeById(graph, selectedNodeId), [graph, selectedNodeId]);

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
    if (!getNodeById(graph, nodeId)) {
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
          <p className="eyebrow">{messages.eyebrow}</p>
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
        </div>
      </header>

      <section className="top-panel" aria-label={messages.searchAndFilters}>
        <SearchBox graph={graph} filters={filters} messages={messages} locale={locale} onSelectNode={selectNode} />
        <FilterBar filters={filters} messages={messages} locale={locale} onChange={setFilters} />
      </section>

      <main className="workspace-layout">
        <ProcessMatrix
          graph={graph}
          selectedNodeId={selectedNodeId}
          filters={filters}
          messages={messages}
          locale={locale}
          onSelectNode={selectNode}
        />
        <GraphView
          graph={graph}
          selectedNodeId={selectedNodeId}
          filters={filters}
          messages={messages}
          onSelectNode={selectNode}
        />
        <DetailPanel graph={graph} selectedNodeId={selectedNodeId} messages={messages} locale={locale} onSelectNode={selectNode} />
      </main>

      <footer className="app-footer">
        {messages.disclaimer.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </footer>
    </div>
  );
}

function getInitialNodeId(): string {
  const params = new URLSearchParams(window.location.search);
  const nodeId = params.get("node");

  if (nodeId && getNodeById(baseGraph, nodeId)) {
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

import { useEffect, useMemo, useState } from "react";
import { DetailPanel } from "./components/DetailPanel";
import { EditionMatrix } from "./components/EditionMatrix";
import { FilterBar } from "./components/FilterBar";
import { GraphView } from "./components/GraphView";
import { ProcessMatrix } from "./components/ProcessMatrix";
import { SearchBox } from "./components/SearchBox";
import { DEFAULT_EDITION, EDITION_CONFIGS, EDITION_OPTIONS, type EditionId, isEdition } from "./data/editions";
import {
  getConsumersForArtifact,
  getNodeById,
  getProcessesUsingTechnique,
  getProducersForArtifact,
  getUpdatersForArtifact
} from "./graph/selectors";
import { createGraphIndex } from "./graph/graphIndex";
import {
  DEFAULT_LOCALE,
  LOCALE_OPTIONS,
  getEditionLabel,
  getEditionSummary,
  getMessages,
  isLocale,
  localizeGraph,
  type Locale
} from "./i18n";
import type { GraphFilters, IttoGraph, ProcessRelationHighlight } from "./types/graph";

const LOCALE_STORAGE_KEY = "pmp-itto-locale";
const EDITION_STORAGE_KEY = "pmbok-edition";

const defaultFilters: GraphFilters = {
  processGroup: "all",
  knowledgeArea: "all",
  nodeType: "all"
};

const FOOTER_LINKS = [
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
  const [edition, setEdition] = useState<EditionId>(() => getInitialEdition());
  const [selectedNodeId, setSelectedNodeId] = useState(() => getInitialNodeId(EDITION_CONFIGS[getInitialEdition()].graph));
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());
  const [filters, setFilters] = useState<GraphFilters>(defaultFilters);
  const [isMatrixCollapsed, setIsMatrixCollapsed] = useState(false);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);
  const editionConfig = EDITION_CONFIGS[edition];
  const graph = useMemo(() => localizeGraph(editionConfig.graph, locale), [editionConfig.graph, locale]);
  const graphIndex = useMemo(() => createGraphIndex(graph), [graph]);
  const messages = useMemo(() => getMessages(locale), [locale]);
  const editionSummary = useMemo(() => getEditionSummary(edition, locale), [edition, locale]);
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
      const nextEdition = getInitialEdition();
      setEdition(nextEdition);
      setSelectedNodeId(getInitialNodeId(EDITION_CONFIGS[nextEdition].graph));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!selectedNode) {
      setSelectedNodeId(editionConfig.defaultNodeId);
    }
  }, [editionConfig.defaultNodeId, selectedNode]);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem(EDITION_STORAGE_KEY, edition);
  }, [edition]);

  const selectNode = (nodeId: string) => {
    if (!getNodeById(graphIndex, nodeId)) {
      return;
    }

    setSelectedNodeId(nodeId);
    const url = new URL(window.location.href);
    url.searchParams.set("node", nodeId);
    window.history.pushState({}, "", url);
  };

  const changeEdition = (nextEdition: EditionId) => {
    const nextConfig = EDITION_CONFIGS[nextEdition];
    setEdition(nextEdition);
    setSelectedNodeId(nextConfig.defaultNodeId);
    setFilters(defaultFilters);
    const url = new URL(window.location.href);
    url.searchParams.set("edition", nextEdition);
    url.searchParams.set("node", nextConfig.defaultNodeId);
    window.history.replaceState({}, "", url);
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
          <p className="app-header__subtitle">{messages.subtitle}</p>
        </div>
        <div className="app-header__side">
          <div className="header-controls">
            <label className="language-control">
              <span>{messages.edition}</span>
              <select value={edition} onChange={(event) => changeEdition(event.target.value as EditionId)}>
                {EDITION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {getEditionLabel(option, locale)}
                  </option>
                ))}
              </select>
            </label>
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
          </div>
          <p className="app-header__summary">{editionSummary}</p>
        </div>
      </header>

      <section className={`top-panel${edition === "sixth" ? "" : " top-panel--overview"}`} aria-label={messages.searchAndFilters}>
        <SearchBox graph={graphIndex} filters={filters} messages={messages} locale={locale} onSelectNode={selectNode} />
        {edition === "sixth" ? (
          <FilterBar filters={filters} messages={messages} locale={locale} onChange={setFilters} />
        ) : (
          <div className="edition-scope" aria-label={messages.relationshipOverview}>
            <span>{getEditionLabel(edition, locale)}</span>
            <strong>{editionSummary}</strong>
          </div>
        )}
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
        {edition === "sixth" ? (
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
        ) : (
          <EditionMatrix
            graph={graphIndex}
            selectedNodeId={selectedNodeId}
            nodeTypes={editionConfig.matrixNodeTypes}
            messages={messages}
            locale={locale}
            isCollapsed={isMatrixCollapsed}
            onToggleCollapsed={() => setIsMatrixCollapsed((collapsed) => !collapsed)}
            onSelectNode={selectNode}
          />
        )}
        <GraphView
          graph={graphIndex}
          selectedNodeId={selectedNodeId}
          filters={filters}
          edition={edition}
          messages={messages}
          onSelectNode={selectNode}
        />
        <DetailPanel
          graph={graphIndex}
          selectedNodeId={selectedNodeId}
          edition={edition}
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

function getInitialEdition(): EditionId {
  const params = new URLSearchParams(window.location.search);
  const editionParam = params.get("edition");

  if (isEdition(editionParam)) {
    return editionParam;
  }

  const storedEdition = window.localStorage.getItem(EDITION_STORAGE_KEY);
  if (isEdition(storedEdition)) {
    return storedEdition;
  }

  return DEFAULT_EDITION;
}

function getInitialNodeId(graph: IttoGraph): string {
  const params = new URLSearchParams(window.location.search);
  const nodeId = params.get("node");
  const graphIndex = createGraphIndex(graph);

  if (nodeId && getNodeById(graphIndex, nodeId)) {
    return nodeId;
  }

  return EDITION_CONFIGS[getInitialEdition()].defaultNodeId;
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

  return DEFAULT_LOCALE;
}

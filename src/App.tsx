import { useEffect, useMemo, useState } from "react";
import { DetailPanel } from "./components/DetailPanel";
import { FilterBar } from "./components/FilterBar";
import { GraphView } from "./components/GraphView";
import { ProcessMatrix } from "./components/ProcessMatrix";
import { SearchBox } from "./components/SearchBox";
import ittoData from "./data/itto.json";
import { getNodeById } from "./graph/selectors";
import type { GraphFilters, IttoGraph } from "./types/graph";

const graph = ittoData as IttoGraph;
const DEFAULT_NODE_ID = "develop_project_management_plan";

const defaultFilters: GraphFilters = {
  processGroup: "all",
  knowledgeArea: "all",
  nodeType: "all",
  downstreamDepth: 2
};

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(() => getInitialNodeId());
  const [filters, setFilters] = useState<GraphFilters>(defaultFilters);
  const selectedNode = useMemo(() => getNodeById(graph, selectedNodeId), [selectedNodeId]);

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

  const selectNode = (nodeId: string) => {
    if (!getNodeById(graph, nodeId)) {
      return;
    }

    setSelectedNodeId(nodeId);
    const url = new URL(window.location.href);
    url.searchParams.set("node", nodeId);
    window.history.pushState({}, "", url);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Unofficial Study Aid</p>
          <h1>PMP ITTO Relationship Explorer</h1>
        </div>
        <p className="app-header__summary">
          Explore process inputs, outputs, and downstream artifact usage in a selected-node-centered flow.
        </p>
      </header>

      <section className="top-panel" aria-label="Search and filters">
        <SearchBox graph={graph} filters={filters} onSelectNode={selectNode} />
        <FilterBar filters={filters} onChange={setFilters} />
      </section>

      <main className="workspace-layout">
        <ProcessMatrix
          graph={graph}
          selectedNodeId={selectedNodeId}
          filters={filters}
          onSelectNode={selectNode}
        />
        <GraphView
          graph={graph}
          selectedNodeId={selectedNodeId}
          filters={filters}
          onSelectNode={selectNode}
        />
        <DetailPanel graph={graph} selectedNodeId={selectedNodeId} onSelectNode={selectNode} />
      </main>

      <footer className="app-footer">
        This site is an unofficial study aid. It is not affiliated with, endorsed by, or sponsored by
        Project Management Institute, Inc. PMI, PMP, and PMBOK are trademarks of Project Management
        Institute, Inc.
      </footer>
    </div>
  );
}

function getInitialNodeId(): string {
  const params = new URLSearchParams(window.location.search);
  const nodeId = params.get("node");

  if (nodeId && getNodeById(graph, nodeId)) {
    return nodeId;
  }

  return DEFAULT_NODE_ID;
}

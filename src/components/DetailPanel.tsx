import {
  getConsumersForArtifact,
  getDownstreamUsage,
  getInputsForProcess,
  getNodeById,
  getOutputsForProcess,
  getProcessesUsingTechnique,
  getProducersForArtifact,
  getTechniquesForProcess,
  getUpdatesForProcess,
  getUpdatersForArtifact
} from "../graph/selectors";
import type { IttoGraph, IttoNode } from "../types/graph";

type DetailPanelProps = {
  graph: IttoGraph;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
};

export function DetailPanel({ graph, selectedNodeId, onSelectNode }: DetailPanelProps) {
  const selectedNode = getNodeById(graph, selectedNodeId);

  return (
    <aside className="detail-panel" aria-label="Selected node details">
      <div className="panel-heading">
        <p className="eyebrow">Detail Panel</p>
        <h2>{selectedNode?.label ?? "No selection"}</h2>
      </div>
      {selectedNode ? (
        selectedNode.type === "process" ? (
          <ProcessDetails graph={graph} node={selectedNode} onSelectNode={onSelectNode} />
        ) : selectedNode.type === "artifact" ? (
          <ArtifactDetails graph={graph} node={selectedNode} onSelectNode={onSelectNode} />
        ) : (
          <TechniqueDetails graph={graph} node={selectedNode} onSelectNode={onSelectNode} />
        )
      ) : (
        <p className="empty-text">Choose a process or artifact to inspect relationships.</p>
      )}
    </aside>
  );
}

function ProcessDetails({
  graph,
  node,
  onSelectNode
}: {
  graph: IttoGraph;
  node: IttoNode;
  onSelectNode: (nodeId: string) => void;
}) {
  const inputs = getInputsForProcess(graph, node.id);
  const outputs = getOutputsForProcess(graph, node.id);
  const updates = getUpdatesForProcess(graph, node.id);
  const techniques = getTechniquesForProcess(graph, node.id);
  const downstream = getDownstreamUsage(graph, node.id);

  return (
    <div className="details-stack">
      <div className="detail-meta">
        <span>{node.processGroup}</span>
        <span>{node.knowledgeArea}</span>
      </div>
      <NodeList title="Inputs" nodes={inputs} onSelectNode={onSelectNode} />
      <TechniqueList nodes={techniques} onSelectNode={onSelectNode} />
      <NodeList title="Outputs" nodes={outputs} onSelectNode={onSelectNode} />
      <NodeList title="Updates" nodes={updates} onSelectNode={onSelectNode} />
      <section className="detail-section">
        <h3>Downstream Usage</h3>
        {downstream.length > 0 ? (
          downstream.map(({ output, consumers }) => (
            <div className="usage-group" key={output.id}>
              <button type="button" onClick={() => onSelectNode(output.id)}>
                {output.label}
              </button>
              {consumers.length > 0 ? (
                <ul>
                  {consumers.map((consumer) => (
                    <li key={consumer.id}>
                      <button type="button" onClick={() => onSelectNode(consumer.id)}>
                        {consumer.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">No mapped consumers.</p>
              )}
            </div>
          ))
        ) : (
          <p className="empty-text">No mapped downstream usage.</p>
        )}
      </section>
    </div>
  );
}

function ArtifactDetails({
  graph,
  node,
  onSelectNode
}: {
  graph: IttoGraph;
  node: IttoNode;
  onSelectNode: (nodeId: string) => void;
}) {
  const producers = getProducersForArtifact(graph, node.id);
  const updaters = getUpdatersForArtifact(graph, node.id);
  const consumers = getConsumersForArtifact(graph, node.id);

  return (
    <div className="details-stack">
      <div className="detail-meta">
        <span>Artifact</span>
      </div>
      <NodeList title="Produced By" nodes={producers} onSelectNode={onSelectNode} />
      <NodeList title="Updated By" nodes={updaters} onSelectNode={onSelectNode} />
      <NodeList title="Used As Input By" nodes={consumers} onSelectNode={onSelectNode} />
    </div>
  );
}

function TechniqueDetails({
  graph,
  node,
  onSelectNode
}: {
  graph: IttoGraph;
  node: IttoNode;
  onSelectNode: (nodeId: string) => void;
}) {
  const processes = getProcessesUsingTechnique(graph, node.id);

  return (
    <div className="details-stack">
      <div className="detail-meta">
        <span>Tools & Techniques</span>
        {node.category ? <span>{node.category}</span> : null}
      </div>
      <NodeList title="Used By" nodes={processes} onSelectNode={onSelectNode} />
    </div>
  );
}

function TechniqueList({
  nodes,
  onSelectNode
}: {
  nodes: IttoNode[];
  onSelectNode: (nodeId: string) => void;
}) {
  const groups = nodes.reduce<Record<string, IttoNode[]>>((grouped, node) => {
    const key = node.category ?? "Other";
    grouped[key] = [...(grouped[key] ?? []), node];
    return grouped;
  }, {});

  return (
    <section className="detail-section">
      <h3>Tools & Techniques</h3>
      {nodes.length > 0 ? (
        <div className="technique-groups">
          {Object.entries(groups).map(([category, items]) => (
            <div className="technique-group" key={category}>
              <h4>{category}</h4>
              <ul className="node-list">
                {items.map((node) => (
                  <li key={node.id}>
                    <button type="button" onClick={() => onSelectNode(node.id)}>
                      <span>{node.label}</span>
                      <small>{node.category ?? "T&T"}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-text">No mapped tools or techniques.</p>
      )}
    </section>
  );
}

function NodeList({
  title,
  nodes,
  onSelectNode
}: {
  title: string;
  nodes: IttoNode[];
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      {nodes.length > 0 ? (
        <ul className="node-list">
          {nodes.map((node) => (
            <li key={node.id}>
              <button type="button" onClick={() => onSelectNode(node.id)}>
                <span>{node.label}</span>
                <small>{node.type}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-text">No mapped nodes.</p>
      )}
    </section>
  );
}

import graph from "../src/data/itto.json" with { type: "json" };

const REQUIRED_PROCESS_COUNT = 49;
const deprecatedNodeIds = new Set([
  "project_documents_updates",
  "project_management_plan_updates",
  "organizational_process_assets_updates"
]);

const requiredEdges = [
  ["identify_stakeholders", "assumption_log", "updates"],
  ["create_wbs", "assumption_log", "updates"],
  ["define_scope", "assumption_log", "updates"],
  ["direct_and_manage_project_work", "assumption_log", "updates"],
  ["assumption_log", "define_scope", "input_to"],
  ["assumption_log", "sequence_activities", "input_to"],
  ["assumption_log", "identify_risks", "input_to"],
  ["conduct_procurements", "agreements", "outputs"],
  ["control_procurements", "procurement_documentation", "updates"]
];

const errors = [];
const nodeIds = new Set(graph.nodes.map((node) => node.id));
const processCount = graph.nodes.filter((node) => node.type === "process").length;

if (processCount !== REQUIRED_PROCESS_COUNT) {
  errors.push(`Expected ${REQUIRED_PROCESS_COUNT} process nodes, found ${processCount}.`);
}

for (const node of graph.nodes) {
  if (deprecatedNodeIds.has(node.id)) {
    errors.push(`Deprecated aggregate update node is still present: ${node.id}.`);
  }
}

const seenEdges = new Set();
for (const edge of graph.edges) {
  if (!nodeIds.has(edge.source)) {
    errors.push(`Missing edge source node: ${edge.source}.`);
  }

  if (!nodeIds.has(edge.target)) {
    errors.push(`Missing edge target node: ${edge.target}.`);
  }

  const key = `${edge.source}->${edge.target}:${edge.relation}`;
  if (seenEdges.has(key)) {
    errors.push(`Duplicate edge: ${key}.`);
  }
  seenEdges.add(key);
}

for (const [source, target, relation] of requiredEdges) {
  const key = `${source}->${target}:${relation}`;
  if (!seenEdges.has(key)) {
    errors.push(`Required edge is missing: ${key}.`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const relationCounts = graph.edges.reduce((counts, edge) => {
  counts[edge.relation] = (counts[edge.relation] ?? 0) + 1;
  return counts;
}, {});

console.log(
  JSON.stringify(
    {
      nodes: graph.nodes.length,
      processCount,
      edges: graph.edges.length,
      relationCounts
    },
    null,
    2
  )
);

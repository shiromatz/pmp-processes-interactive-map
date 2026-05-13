import graph from "../src/data/itto.json" with { type: "json" };
import locales from "../src/i18n/locales.json" with { type: "json" };

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
  ["control_procurements", "procurement_documentation", "updates"],
  ["develop_project_charter", "tt_brainstorming", "uses"],
  ["create_wbs", "tt_decomposition", "uses"],
  ["identify_stakeholders", "tt_stakeholder_mapping_representation", "uses"],
  ["monitor_stakeholder_engagement", "tt_stakeholder_engagement_assessment_matrix", "uses"]
];

const errors = [];
const nodeIds = new Set(graph.nodes.map((node) => node.id));
const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
const processCount = graph.nodes.filter((node) => node.type === "process").length;
const processIds = graph.nodes.filter((node) => node.type === "process").map((node) => node.id);
const techniqueIds = graph.nodes.filter((node) => node.type === "technique").map((node) => node.id);
const localizedLocales = ["ja", "zh-CN"];

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

  if (edge.relation === "uses") {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);

    if (source?.type !== "process") {
      errors.push(`Tools and techniques edge must start from a process: ${key}.`);
    }

    if (target?.type !== "technique") {
      errors.push(`Tools and techniques edge must target a technique: ${key}.`);
    }
  }
}

for (const [source, target, relation] of requiredEdges) {
  const key = `${source}->${target}:${relation}`;
  if (!seenEdges.has(key)) {
    errors.push(`Required edge is missing: ${key}.`);
  }
}

for (const processId of processIds) {
  if (!graph.edges.some((edge) => edge.source === processId && edge.relation === "uses")) {
    errors.push(`Process has no tools and techniques mapped: ${processId}.`);
  }
}

for (const techniqueId of techniqueIds) {
  if (!graph.edges.some((edge) => edge.target === techniqueId && edge.relation === "uses")) {
    errors.push(`Technique is not mapped to any process: ${techniqueId}.`);
  }
}

for (const locale of localizedLocales) {
  const data = locales[locale];

  if (!data) {
    errors.push(`Missing locale data: ${locale}.`);
    continue;
  }

  for (const node of graph.nodes) {
    if (!data.nodeLabels[node.id]) {
      errors.push(`Missing ${locale} node label: ${node.id}.`);
    }
  }

  for (const group of new Set(graph.nodes.map((node) => node.processGroup).filter(Boolean))) {
    if (!data.processGroups[group] || !data.processGroupShort[group]) {
      errors.push(`Missing ${locale} process group label: ${group}.`);
    }
  }

  for (const area of new Set(graph.nodes.map((node) => node.knowledgeArea).filter(Boolean))) {
    if (!data.knowledgeAreas[area] || !data.knowledgeAreaShort[area]) {
      errors.push(`Missing ${locale} knowledge area label: ${area}.`);
    }
  }

  for (const category of new Set(graph.nodes.map((node) => node.category).filter(Boolean))) {
    if (!data.techniqueCategories[category]) {
      errors.push(`Missing ${locale} technique category label: ${category}.`);
    }
  }

  if (!Array.isArray(data.messages?.disclaimer) || data.messages.disclaimer.length < 3) {
    errors.push(`Locale disclaimer must include affiliation, trademark, and no-warranty text: ${locale}.`);
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

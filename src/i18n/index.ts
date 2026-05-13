import localeData from "./locales.json";
import type { IttoGraph, IttoNode, KnowledgeArea, NodeType, ProcessGroup } from "../types/graph";

export type Locale = "en" | "ja" | "zh-CN";

export const LOCALE_OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en", label: localeData.en.languageName },
  { value: "ja", label: localeData.ja.languageName },
  { value: "zh-CN", label: localeData["zh-CN"].languageName }
];

export const DEFAULT_LOCALE: Locale = "en";

export type Messages = (typeof localeData)[Locale]["messages"];

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "ja" || value === "zh-CN";
}

export function getMessages(locale: Locale): Messages {
  return localeData[locale].messages;
}

export function localizeGraph(graph: IttoGraph, locale: Locale): IttoGraph {
  return {
    nodes: graph.nodes.map((node) => localizeNode(node, locale)),
    edges: graph.edges
  };
}

export function getProcessGroupLabel(group: ProcessGroup, locale: Locale): string {
  return localeData[locale].processGroups[group] ?? group;
}

export function getProcessGroupShortLabel(group: ProcessGroup, locale: Locale): string {
  return localeData[locale].processGroupShort[group] ?? getProcessGroupLabel(group, locale);
}

export function getKnowledgeAreaLabel(area: KnowledgeArea, locale: Locale): string {
  return localeData[locale].knowledgeAreas[area] ?? area;
}

export function getKnowledgeAreaShortLabel(area: KnowledgeArea, locale: Locale): string {
  return localeData[locale].knowledgeAreaShort[area] ?? getKnowledgeAreaLabel(area, locale);
}

export function getNodeTypeLabel(type: NodeType, locale: Locale): string {
  return getMessages(locale).nodeTypes[type];
}

export function formatProcessCount(count: number, locale: Locale): string {
  const suffix = getMessages(locale).processCountSuffix;
  return locale === "en" ? `${count} ${suffix}` : `${count}${suffix}`;
}

function localizeNode(node: IttoNode, locale: Locale): IttoNode {
  const nodeLabels = localeData[locale].nodeLabels as Record<string, string>;
  const techniqueCategories = localeData[locale].techniqueCategories as Record<string, string>;
  const localizedLabel = nodeLabels[node.id] ?? node.label;
  const localizedCategory = node.category
    ? techniqueCategories[node.category] ?? node.category
    : undefined;

  return {
    ...node,
    label: localizedLabel,
    category: localizedCategory,
    englishLabel: node.label,
    englishCategory: node.category,
    processGroupLabel: node.processGroup
      ? localeData[locale].processGroups[node.processGroup] ?? node.processGroup
      : undefined,
    knowledgeAreaLabel: node.knowledgeArea
      ? localeData[locale].knowledgeAreas[node.knowledgeArea] ?? node.knowledgeArea
      : undefined
  };
}

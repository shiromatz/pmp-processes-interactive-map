# PMP ITTO Relationship Explorer Specification

## Purpose

PMP ITTO Relationship Explorer is an unofficial static study aid for exploring PMBOK Guide Sixth Edition process, artifact, and tools-and-techniques relationships.

The app is intended to help learners inspect relationships around a selected item:

- which artifacts a process uses as inputs
- which artifacts a process outputs or updates
- which processes produce, update, or consume an artifact
- which processes use a tools-and-techniques item

It is not a PMP Exam Content Outline and should not be treated as a complete or current exam-preparation source.

## Data Scope

The source data is stored in `src/data/itto.json`.

Current scope:

- 49 PMBOK Guide Sixth Edition process nodes
- artifact nodes used as inputs, outputs, or updates
- tools-and-techniques nodes
- localized node labels for English, Japanese, and Simplified Chinese
- relationship mappings for `input_to`, `outputs`, `updates`, and `uses`

The data may contain errors, omissions, or interpretation differences. Users should verify exam-critical decisions against current PMI materials.

## Technology

- Vite
- React
- TypeScript
- React Flow (`@xyflow/react`)
- JSON data
- GitHub Pages static hosting

The app does not use a backend, authentication, database, or client-side router.

## Data Model

`IttoGraph` contains normalized `nodes` and `edges`.

Node types:

- `process`
- `artifact`
- `technique`

Relationship types:

- `input_to`: artifact -> process
- `outputs`: process -> artifact
- `updates`: process -> artifact
- `uses`: process -> technique

`src/graph/graphIndex.ts` builds lookup maps from the graph so selectors and graph-view builders do not repeatedly scan every edge.

## Main UI

The first screen is the working explorer, not a landing page.

Main regions:

- Header: title, language selector, summary, and data-scope notice
- Search and filters
- Process Matrix
- Graph View
- Detail Panel
- Footer notices and project links

Supported locales:

- English
- Japanese
- Simplified Chinese

The document `lang` attribute and user preference are updated when the selected locale changes.

## Search

Search matches:

- localized node label
- English node label
- node type
- technique category
- knowledge area
- process group

The search field is implemented as a combobox with a listbox popup. It supports:

- click selection
- `Enter` selection
- `Escape` close
- `ArrowUp` / `ArrowDown` active result movement
- `Home` / `End` result navigation

## Filters

Filters:

- Process Group
- Knowledge Area
- Node Type

Node Type options intentionally remain:

- All nodes
- Processes only
- Artifacts only

Tools-and-techniques items remain searchable and selectable, but there is no dedicated "techniques only" filter in the current UI.

## Process Matrix

The matrix displays the 49 process nodes by knowledge area and process group.

When the selected node is an artifact, related processes are highlighted by relationship:

- produced
- used as input
- updated

When the selected node is a technique, related processes are highlighted as related.

## Graph View

The graph uses React Flow with fixed layout helpers and draggable nodes.

### Process Focus

The process focus view shows:

- input artifacts on the left
- selected process in the center
- output and update artifacts on the right

If an artifact is both an input and an output/update for the selected process, it remains on the input side to avoid duplicate nodes in the same view.

Downstream consumer processes are intentionally not displayed in process focus. Users can select an artifact to inspect its producers, updaters, and consumers.

### Artifact Focus

The artifact focus view shows:

- producer and updater processes on the left
- selected artifact in the center
- consumer processes on the right

Consumer processes are arranged with the process matrix ordering when possible.

### Technique Focus

The technique focus view shows:

- related process nodes above
- selected tools-and-techniques node below
- vertical `uses` edges from process nodes to the technique node

High-degree techniques such as Expert Judgment remain fully visible in the current UI.

## Detail Panel

Process details show tabs for:

- Inputs
- Tools & Techniques
- Outputs
- Updates

Artifact details show tabs for:

- Produced By
- Updated By
- Used As Input By

Technique details show:

- Used By

## URL State

The selected node is shared through `?node=...`.

The selected language is stored in `?lang=...` and `localStorage`.

Invalid node ids fall back to `develop_project_management_plan`.

## Responsive Behavior

Desktop uses a full-height, three-column workspace with independently scrollable side panels.

Mobile uses page-level vertical scrolling so the matrix, graph, detail panel, and footer are not compressed into a tiny fixed viewport. Matrix and detail panels keep bounded internal scrolling to avoid extremely tall sections.

## Validation

Data validation is handled by:

```bash
npm run validate:data
```

The validator checks:

- 49 process nodes
- no deprecated aggregate update nodes
- valid edge endpoints
- duplicate edges
- required relationship samples
- every process has at least one mapped technique
- every technique maps to at least one process
- Japanese and Simplified Chinese node/category/group labels
- localized disclaimer coverage

Build verification is handled by:

```bash
npm run build
```

## Deployment

The Vite base path is:

```text
/pmp-processes-interactive-map/
```

GitHub Pages is published from the `gh-pages` branch.

`.github/workflows/pages.yml` runs install, data validation, and production build checks on pull requests and pushes to `main`. On pushes to `main`, it commits the built `dist` files to the `gh-pages` branch.

The repository's Pages source should be configured as:

```text
Settings -> Pages -> Build and deployment -> Source: Deploy from a branch
Branch: gh-pages / root
```

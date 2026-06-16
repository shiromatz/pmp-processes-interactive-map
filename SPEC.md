# PMBOK® Guide Relationship Explorer Specification

## Purpose

PMBOK® Guide Relationship Explorer is an unofficial static study aid for exploring PMBOK® Guide relationship structures by edition.

The app is intended to help learners inspect:

- Sixth Edition process, artifact, and tools-and-techniques relationships
- Seventh Edition principle, performance domain, and models/methods/artifacts overview relationships
- Eighth Edition principle, performance domain, focus area, and non-prescriptive process-guidance overview relationships

It is not a PMP Exam Content Outline and should not be treated as a complete or current exam-preparation source.

## Data Scope

Source data is stored in:

- `src/data/itto.json`
- `src/data/pmbok-seventh.json`
- `src/data/pmbok-eighth.json`
- `src/data/editions.ts`

Current scope:

- PMBOK® Guide Sixth Edition 49-process ITTO nodes and relationships
- PMBOK® Guide Seventh Edition high-level overview nodes for 12 principles, 8 performance domains, and models/methods/artifacts
- PMBOK® Guide Eighth Edition high-level overview nodes for 6 principles, 7 performance domains, focus areas, non-prescriptive process guidance, and selected expanded-coverage topics
- localized node labels for English and Japanese

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

`IttoGraph` contains normalized `nodes` and `edges`. The name remains for compatibility with the original Sixth Edition ITTO implementation.

Node types:

- `process`
- `artifact`
- `technique`
- `principle`
- `performanceDomain`
- `model`
- `method`
- `focusArea`
- `processGuidance`

Relationship types:

- `input_to`
- `outputs`
- `updates`
- `uses`
- `supports`
- `applies_to`
- `maps_to`
- `contains`
- `references`

`src/graph/graphIndex.ts` builds lookup maps for both Sixth Edition ITTO relationships and generic incoming/outgoing relationships used by Seventh and Eighth Edition views.

## Main UI

The first screen is the working explorer, not a landing page.

Main regions:

- Header: title, subtitle, edition selector, language selector, and edition summary
- Search and filters/edition scope
- Process Matrix for Sixth Edition or Edition Overview for Seventh/Eighth Edition
- Graph View
- Detail Panel
- Footer notices and project links

Supported locales:

- English
- Japanese

The document `lang` attribute and user preference are updated when the selected locale changes. Legacy `zh-CN` URL or localStorage values fall back to English.

## Edition Selector

The edition selector appears in the header to the left of the language selector.

Supported values:

- `sixth`
- `seventh`
- `eighth`

The selected edition is stored in `?edition=...` and `localStorage`.

Changing the edition resets the selected node to that edition's default node and resets Sixth Edition filters.

## Search

Search matches:

- localized node label
- English node label
- node type
- category
- knowledge area
- process group

The search field is implemented as a combobox with a listbox popup. It supports:

- click selection
- `Enter` selection
- `Escape` close
- `ArrowUp` / `ArrowDown` active result movement
- `Home` / `End` result navigation

## Filters

Sixth Edition filters:

- Process Group
- Knowledge Area
- Node Type

Seventh and Eighth Edition views hide these Sixth Edition-specific filters and instead show the current edition scope.

## Left Panel

Sixth Edition displays the 49 process nodes by knowledge area and process group.

Seventh and Eighth Edition display grouped overview nodes by node type, such as principles, performance domains, focus areas, and process guidance.

## Graph View

The graph uses React Flow with fixed layout helpers and draggable nodes.

### Sixth Edition Process Focus

The process focus view shows:

- input artifacts on the left
- selected process in the center
- output and update artifacts on the right

### Sixth Edition Artifact Focus

The artifact focus view shows:

- producer and updater processes on the left
- selected artifact in the center
- consumer processes on the right

### Sixth Edition Technique Focus

The technique focus view shows:

- related process nodes above
- selected tools-and-techniques node below
- vertical `uses` edges from process nodes to the technique node

### Seventh and Eighth Edition Focus

The generic edition focus view shows:

- incoming related nodes on the left
- selected node in the center
- outgoing related nodes on the right

## Detail Panel

Sixth Edition process details show tabs for:

- Inputs
- Tools & Techniques
- Outputs
- Updates

Sixth Edition artifact details show tabs for:

- Produced By
- Updated By
- Used As Input By

Sixth Edition technique details show:

- Used By

Seventh and Eighth Edition details show:

- Related From
- Related To

The related nodes are grouped by relationship label.

## URL State

The selected node is shared through `?node=...`.

The selected language is stored in `?lang=...` and `localStorage`.

The selected edition is stored in `?edition=...` and `localStorage`.

Invalid node ids fall back to the selected edition's default node.

Invalid edition ids fall back to `sixth`.

Invalid language ids fall back to English unless the browser language starts with Japanese.

## Responsive Behavior

Desktop uses a full-height, three-column workspace with independently scrollable side panels.

Mobile uses page-level vertical scrolling so the matrix/overview, graph, detail panel, and footer are not compressed into a tiny fixed viewport.

## Validation

Data validation is handled by:

```bash
npm run validate:data
```

The validator checks:

- Sixth Edition 49 process nodes
- no deprecated aggregate update nodes
- valid edge endpoints
- duplicate edges
- required Sixth Edition relationship samples
- every Sixth Edition process has at least one mapped technique
- every Sixth Edition technique maps to at least one process
- Japanese labels for all nodes and categories
- Seventh Edition expected high-level counts and connectivity
- Eighth Edition expected high-level counts and connectivity
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

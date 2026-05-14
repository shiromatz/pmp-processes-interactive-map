# PMP ITTO Relationship Explorer

An unofficial static study aid for exploring PMP process, artifact, and tools and techniques relationships. The app is available in English, Japanese, and Simplified Chinese.

Use the app here: https://shiromatz.github.io/pmp-processes-interactive-map/

## How to Use

- Select a display language from the header.
- Search for a process, artifact, or T&T item, or select a process from the Process Matrix.
- Use the Process Group, Knowledge Area, and Node Type filters to narrow the visible matrix and graph context.
- Read the Detail Panel tabs to inspect inputs, tools and techniques, outputs, updates, producers, updaters, and consumers.
- Click a process, artifact, or T&T item in the Detail Panel or Graph View to make it the graph focus.
- Drag nodes in Graph View temporarily to inspect overlapping edges. Drag the empty canvas to pan the graph. The layout resets when the selected node or filters change.
- Use the graph controls to zoom or fit the current graph into view.

## Graph View

The Graph View is centered on the selected node:

- Process focus: input artifacts appear on the left, the selected process appears in the center, and output/update artifacts appear on the right. If an artifact is both an input and an update for the selected process, it remains on the input side.
- Artifact focus: producing, using, and updating processes are grouped around the selected artifact and ordered by process group and knowledge area where possible.
- Tools & Techniques focus: related process cards are placed above the selected T&T card, with links drawn from each process card's bottom edge to the T&T card's top edge.

The Detail Panel keeps the T&T navigation path: selecting a T&T item from a process opens its related-process graph.

## Data Scope

The study data is based on PMBOK Guide Sixth Edition process/ITTO structure. It may contain errors or omissions, so verify critical study decisions against official PMI materials.

This app is a PMBOK Guide Sixth Edition 49-process/ITTO reference, not a current PMP Exam Content Outline. PMI has announced a new PMP exam launching on July 9, 2026, and candidates planning to take the current version are directed by PMI to sit for it before July 8, 2026. For exam preparation, check PMI's current [PMP exam information](https://www.pmi.org/certifications/project-management-pmp/new-exam) and [PMBOK Guide](https://www.pmi.org/standards/pmbok) pages.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

Original software code is licensed under the MIT License. See [LICENSE](LICENSE).

PMI trademark, PMBOK-related content, unofficial study-aid, and data warranty notices are documented in [NOTICE.md](NOTICE.md).

## Deployment

The Vite base path is configured for:

```text
/pmp-processes-interactive-map/
```

`.github/workflows/pages.yml` runs `npm ci`, `npm run validate:data`, and `npm run build` on pull requests and pushes to `main`. On pushes to `main`, it publishes the built `dist` files to the `gh-pages` branch.

Repository setting:

```text
Settings -> Pages -> Build and deployment -> Source: Deploy from a branch
Branch: gh-pages / root
```

## Notice

Unofficial study aid. Not affiliated with, endorsed by, or sponsored by PMI.
PMI, PMP, and PMBOK are trademarks of Project Management Institute, Inc.
Content may contain errors or omissions. Use at your own risk; no warranty is provided for accuracy, completeness, or fitness for purpose.
Based on PMBOK Guide Sixth Edition.

本ツールは非公式の学習補助ツールです。PMIによる承認・後援・提携を受けたものではありません。
PMI、PMP、PMBOKはProject Management Institute, Inc.の商標です。
内容には誤りや漏れが含まれる可能性があります。利用は自己責任で行ってください。正確性、完全性、特定目的への適合性を保証するものではありません。
PMBOK Guide 第6版に基づいています。

本工具是非官方学习辅助工具，未获得PMI的认可、赞助或关联。
PMI、PMP 和 PMBOK 是 Project Management Institute, Inc. 的商标。
内容可能包含错误或遗漏。请自行承担使用风险；不保证其准确性、完整性或特定用途适用性。
基于《PMBOK指南》第六版。

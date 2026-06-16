# PMBOK® Guide Relationship Explorer

Unofficial PMP® certification study aid for exploring PMBOK® Guide relationships by edition. The app is available in English and Japanese.

Use the app here: https://shiromatz.github.io/pmp-processes-interactive-map/

## How to Use

- Select a PMBOK® Guide edition and display language from the header.
- Search for a process, artifact, principle, performance domain, focus area, or tools-and-techniques item.
- In Sixth Edition mode, use the Process Group, Knowledge Area, and Node Type filters to narrow the ITTO view.
- In Seventh and Eighth Edition modes, select items from the Edition Overview panel to inspect relationship mappings.
- Click a node in the Detail Panel or Graph View to make it the graph focus.
- Drag nodes in Graph View temporarily to inspect overlapping edges. Drag the empty canvas to pan the graph.
- Use the graph controls to zoom or fit the current graph into view.

## Edition Scope

| Edition | Scope |
|---|---|
| Sixth Edition | 49-process ITTO relationship map: processes, inputs, outputs, updates, and tools and techniques. |
| Seventh Edition | High-level relationship map for 12 principles, 8 performance domains, and overview nodes for models, methods, and artifacts. |
| Eighth Edition | High-level relationship map for 6 principles, 7 performance domains, focus areas, non-prescriptive process guidance, and selected expanded-coverage topics. |

The study data may contain errors, omissions, or interpretation differences. Verify exam-critical decisions against current PMI materials.

This app is not a PMP Exam Content Outline and should not be treated as a complete or current exam-preparation source. For exam preparation, check PMI's current [PMP exam information](https://www.pmi.org/certifications/project-management-pmp/new-exam) and [PMBOK® Guide](https://www.pmi.org/standards/pmbok) pages.

## Graph View

The Graph View is centered on the selected node.

- Sixth Edition process focus: input artifacts appear on the left, the selected process appears in the center, and output/update artifacts appear on the right.
- Sixth Edition artifact focus: producing, using, and updating processes are grouped around the selected artifact.
- Sixth Edition tools-and-techniques focus: related process cards are placed above the selected tools-and-techniques card.
- Seventh and Eighth Edition focus: incoming relationships appear on the left and outgoing relationships appear on the right.

## Local Development

```bash
npm install
npm run dev
```

## Validation and Build

```bash
npm run validate:data
npm run build
```

## License

Original software code is licensed under the MIT License. See [LICENSE](LICENSE).

PMI trademark, PMBOK® Guide-related content, unofficial study-aid, and data warranty notices are documented in [NOTICE.md](NOTICE.md).

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
PMI, PMP, and PMBOK are registered marks of Project Management Institute, Inc.
Content may contain errors or omissions. Use at your own risk; no warranty is provided for accuracy, completeness, currency, or fitness for purpose.
Based on PMBOK® Guide edition structures and public PMI information.

本ツールは非公式の学習補助ツールです。PMIによる承認・後援・提携を受けたものではありません。
PMI、PMP、PMBOKはProject Management Institute, Inc.の登録商標です。
内容には誤りや漏れが含まれる可能性があります。利用は自己責任で行ってください。正確性、完全性、最新性、特定目的への適合性を保証するものではありません。
PMBOK® Guideの版別構造およびPMI公開情報に基づいています。

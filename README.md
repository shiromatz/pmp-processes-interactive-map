# PMP ITTO Relationship Explorer

An unofficial static study aid for exploring PMP process and artifact relationships.

The app shows a selected-node-centered left-to-right dependency graph:

- Process focus: inputs -> process -> outputs -> consumer processes
- Artifact focus: producer processes -> artifact -> consumer processes

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

The Vite base path is configured for:

```text
/pmp-processes-interactive-map/
```

Deployment is published from the `gh-pages` branch.

## Notice

Unofficial study aid. Not affiliated with, endorsed by, or sponsored by PMI.
PMI, PMP, and PMBOK are trademarks of Project Management Institute, Inc.
本ツールは非公式の学習補助ツールです。PMIによる承認・後援・提携を受けたものではありません。
PMI、PMP、PMBOKはProject Management Institute, Inc.の商標です。

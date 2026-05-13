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

This site is an unofficial study aid for project management certification preparation.
It is not affiliated with, endorsed by, or sponsored by Project Management Institute, Inc.
PMI, PMP, and PMBOK are trademarks of Project Management Institute, Inc.

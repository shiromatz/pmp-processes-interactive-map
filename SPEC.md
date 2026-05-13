以下をそのまま `SPEC.md` などに保存して、Codex に渡せます。
React Flow はノードとエッジからなるインタラクティブなフローグラフ構築に適したReactライブラリで、今回の「左→中央→右」型の依存関係表示に合います。GitHub Pages は静的ファイルの公開に対応し、Vite公式もGitHub Pages + GitHub Actionsでの静的デプロイ手順を案内しています。([React Flow][1])

````md
# PMP ITTO Relationship Explorer 仕様書

## 1. 目的

PMP学習者が、49プロセスと各プロセスのInputs / Outputsの関係を、クリック操作で直感的に確認できる静的Webアプリを作る。

本アプリは、PMBOK Guideの表を丸暗記するための一覧表ではなく、以下を理解するための学習補助ツールである。

- 各プロセスが何をInputとして使うか
- 各プロセスが何をOutputとして生成するか
- あるOutputが、後続のどのプロセスでInputとして使われるか
- あるArtifact / Documentが、どのプロセスで作られ、どのプロセスで使われるか

## 2. アプリ名案

- PMP ITTO Relationship Explorer
- PMP Process & ITTO Flow Explorer
- 49 Processes ITTO Graph Explorer

## 3. 基本コンセプト

選択したノードを中心に、左側に入力元、右側に出力先・利用先を表示する。

このアプリで使う可視化方式は、同心円型ネットワークではなく、以下のような「選択ノード中心の有向依存関係グラフ」である。

- 英語表現:
  - focus-centered directed dependency graph
  - data-lineage-style ITTO graph
  - left-to-right dependency graph
  - selected-node-centered graph view

- 日本語表現:
  - 選択ノード中心の有向依存関係グラフ
  - 入出力関係の左→右フロー図
  - ITTO関係探索ビュー

## 4. 技術構成

### 4.1 推奨スタック

- Vite
- React
- TypeScript
- React Flow
- JSONデータ
- GitHub Pages

### 4.2 ホスティング

GitHub Pagesで静的配信する。

サーバーサイド処理、DB、ログイン、APIは初期版では不要。

### 4.3 初期版で使わないもの

- サーバーDB
- ユーザー認証
- バックエンドAPI
- ELK.js
- Dagre
- Firebase
- Supabase

初期版では、自動グラフレイアウトではなく、固定カラム方式で十分とする。

## 5. 対象範囲

### 5.1 初期MVPの対象

初期版では以下のみ対象にする。

- 49 Processes
- Inputs
- Outputs
- Knowledge Area
- Process Group

### 5.2 初期MVPで対象外にするもの

以下は初期版では対象外にする。

- Tools & Techniques
- 詳細なPMBOK本文説明
- 試験問題機能
- ユーザー別進捗保存
- ログイン
- クラウド同期

理由:

Tools & Techniquesは `Expert Judgment` や `Data Analysis` など多くのプロセスに共通する項目が多く、初期段階で入れるとグラフが過密になる。学習効果の高いInput / Outputの流れを先に実装する。

## 6. 主要UI

画面は以下の4領域で構成する。

```text
+-------------------------------------------------------------+
| Search / Filters                                             |
+-------------------+---------------------------+-------------+
| Process Matrix    | Graph View                | Detail Panel |
|                   |                           |              |
| 49 processes      | selected-node-centered    | selected     |
| by KA / PG        | dependency graph          | node details |
+-------------------+---------------------------+-------------+
````

### 6.1 上部: Search / Filters

機能:

* ノード検索
* Process Groupフィルタ
* Knowledge Areaフィルタ
* ノード種別フィルタ
* downstream depth切替

初期版のフィルタ:

* Process Group

  * Initiating
  * Planning
  * Executing
  * Monitoring and Controlling
  * Closing

* Knowledge Area

  * Project Integration Management
  * Project Scope Management
  * Project Schedule Management
  * Project Cost Management
  * Project Quality Management
  * Project Resource Management
  * Project Communications Management
  * Project Risk Management
  * Project Procurement Management
  * Project Stakeholder Management

* Node Type

  * Process
  * Artifact

### 6.2 左ペイン: Process Matrix

49プロセスをKnowledge Area × Process Groupのマトリクスで表示する。

目的:

* 49プロセスの位置関係を把握する
* 任意のプロセスをクリックしてGraph Viewの中心にする

クリック時の挙動:

* クリックされたプロセスをselectedNodeに設定
* Graph Viewを再構築
* Detail Panelを更新

### 6.3 中央: Graph View

React Flowで表示する。

基本方針:

* 選択ノードを中央に固定
* 左側に入力元
* 右側に出力先
* さらに右側に後続プロセスを表示
* ノードクリックで再中心化する

### 6.4 右ペイン: Detail Panel

選択ノードの詳細を表示する。

Process選択時:

* Process名
* Knowledge Area
* Process Group
* Inputs
* Outputs
* OutputsをInputとして使う後続プロセス

Artifact選択時:

* Artifact名
* このArtifactをOutputするプロセス
* このArtifactをInputとして使うプロセス

## 7. ノード種別

### 7.1 Process Node

PMPのプロセスを表す。

例:

```json
{
  "id": "develop_project_management_plan",
  "label": "Develop Project Management Plan",
  "type": "process",
  "knowledgeArea": "Project Integration Management",
  "processGroup": "Planning"
}
```

### 7.2 Artifact Node

Input / Outputとして使われる文書、計画、記録、成果物などを表す。

例:

```json
{
  "id": "project_management_plan",
  "label": "Project Management Plan",
  "type": "artifact"
}
```

初期版では、InputとOutputを別ノード種別に分けない。同じArtifactがOutputにもInputにもなるため、同一IDで管理する。

## 8. エッジ種別

### 8.1 input_to

ArtifactがProcessのInputであることを表す。

```json
{
  "source": "project_charter",
  "target": "develop_project_management_plan",
  "relation": "input_to"
}
```

意味:

```text
Project Charter -> Develop Project Management Plan
```

### 8.2 outputs

ProcessがArtifactをOutputすることを表す。

```json
{
  "source": "develop_project_management_plan",
  "target": "project_management_plan",
  "relation": "outputs"
}
```

意味:

```text
Develop Project Management Plan -> Project Management Plan
```

## 9. データモデル

### 9.1 全体構造

`src/data/itto.json` に以下の形式で保存する。

```json
{
  "nodes": [],
  "edges": []
}
```

### 9.2 nodes

```json
[
  {
    "id": "develop_project_management_plan",
    "label": "Develop Project Management Plan",
    "type": "process",
    "knowledgeArea": "Project Integration Management",
    "processGroup": "Planning"
  },
  {
    "id": "project_charter",
    "label": "Project Charter",
    "type": "artifact"
  },
  {
    "id": "project_management_plan",
    "label": "Project Management Plan",
    "type": "artifact"
  }
]
```

### 9.3 edges

```json
[
  {
    "source": "project_charter",
    "target": "develop_project_management_plan",
    "relation": "input_to"
  },
  {
    "source": "develop_project_management_plan",
    "target": "project_management_plan",
    "relation": "outputs"
  },
  {
    "source": "project_management_plan",
    "target": "direct_and_manage_project_work",
    "relation": "input_to"
  }
]
```

## 10. 表示ロジック

### 10.1 Processをクリックした場合

選択ノードがProcessの場合、以下を表示する。

```text
Layer -1        Layer 0        Layer +1        Layer +2
Inputs          Process        Outputs         Consumer Processes
```

例:

```text
Inputs                          Selected Process                    Outputs                    Used As Input By

Project Charter          ─┐
EEFs                     ─┼──> Develop Project Management Plan ───> Project Management Plan ───> Direct and Manage Project Work
OPAs                     ─┘                                                                  ├─ Manage Project Knowledge
Outputs from other...    ────────────────────────────────────────────────────────────────────├─ Monitor and Control Project Work
                                                                                              ├─ Perform Integrated Change Control
                                                                                              └─ Close Project or Phase
```

必要な抽出処理:

```ts
const inputs = edges
  .filter(e => e.target === selectedProcessId && e.relation === "input_to")
  .map(e => e.source);

const outputs = edges
  .filter(e => e.source === selectedProcessId && e.relation === "outputs")
  .map(e => e.target);

const downstreamProcesses = outputs.flatMap(outputId =>
  edges
    .filter(e => e.source === outputId && e.relation === "input_to")
    .map(e => ({
      outputId,
      processId: e.target
    }))
);
```

### 10.2 Artifactをクリックした場合

選択ノードがArtifactの場合、以下を表示する。

```text
Layer -1        Layer 0        Layer +1
Producers       Artifact       Consumers
```

例:

```text
Produced By                              Selected Artifact               Used As Input By

Develop Project Management Plan ───>    Project Management Plan   ───>   Direct and Manage Project Work
                                                                            Manage Project Knowledge
                                                                            Monitor and Control Project Work
                                                                            Perform Integrated Change Control
                                                                            Close Project or Phase
```

必要な抽出処理:

```ts
const producers = edges
  .filter(e => e.target === selectedArtifactId && e.relation === "outputs")
  .map(e => e.source);

const consumers = edges
  .filter(e => e.source === selectedArtifactId && e.relation === "input_to")
  .map(e => e.target);
```

## 11. 固定カラムレイアウト

初期版では、レイアウトエンジンを使わず、x座標を固定する。

### 11.1 Process中心ビュー

```ts
const columnX = {
  inputs: 0,
  focus: 360,
  outputs: 720,
  consumers: 1080
};
```

### 11.2 Artifact中心ビュー

```ts
const columnX = {
  producers: 0,
  focus: 360,
  consumers: 720
};
```

### 11.3 縦並び

```ts
function verticalPositions<T>(
  items: T[],
  x: number,
  startY = 80,
  gap = 90
) {
  return items.map((item, index) => ({
    ...item,
    position: {
      x,
      y: startY + index * gap
    }
  }));
}
```

### 11.4 中央ノードのy位置

選択ノードは常に中央付近に置く。

```ts
const focusPosition = {
  x: columnX.focus,
  y: 220
};
```

## 12. React Flowノード仕様

React Flowには、以下の形式でnodes / edgesを渡す。

### 12.1 React Flow Node

```ts
type FlowNodeData = {
  label: string;
  nodeType: "process" | "artifact";
  knowledgeArea?: string;
  processGroup?: string;
};

type FlowNode = {
  id: string;
  type: "processNode" | "artifactNode";
  position: { x: number; y: number };
  data: FlowNodeData;
};
```

### 12.2 React Flow Edge

```ts
type FlowEdgeData = {
  relation: "input_to" | "outputs";
};

type FlowEdge = {
  id: string;
  source: string;
  target: string;
  type: "smoothstep";
  data: FlowEdgeData;
};
```

### 12.3 エッジ表示

初期版では `smoothstep` を使う。

方向は必ず左から右に流す。

```text
Artifact -> Process -> Artifact -> Process
```

## 13. クリック挙動

### 13.1 ノードクリック

任意のノードをクリックすると、そのノードを中心にGraph Viewを再構築する。

```ts
function handleNodeClick(nodeId: string) {
  setSelectedNodeId(nodeId);
  updateUrlQuery(nodeId);
}
```

### 13.2 URLクエリ

選択ノードはURLクエリに反映する。

例:

```text
?p=develop_project_management_plan
?n=project_management_plan
```

推奨:

```text
?node=project_management_plan
```

URL共有時に同じノードを開けるようにする。

### 13.3 初期表示

URLに `node` がある場合:

* そのノードを選択状態にする

URLに `node` がない場合:

* `develop_project_charter` または `develop_project_management_plan` を初期表示にする

## 14. 検索仕様

検索対象:

* Process label
* Artifact label
* Knowledge Area
* Process Group

挙動:

* 入力文字列に部分一致するノードを候補表示
* 候補クリックでselectedNodeに設定
* Enterキーで最上位候補を選択

## 15. フィルタ仕様

### 15.1 Process Group Filter

指定されたProcess Groupに属するプロセスを強調または表示対象にする。

初期版では、非該当ノードを完全に消すのではなく、薄く表示する方がよい。

### 15.2 Knowledge Area Filter

指定されたKnowledge Areaに属するプロセスを強調または表示対象にする。

### 15.3 Node Type Filter

以下を切替可能にする。

* Processes only
* Artifacts only
* All

ただしGraph Viewでは関係表示に必要なノードは残す。

## 16. Detail Panel仕様

### 16.1 Process詳細

表示項目:

```text
Process Name
Knowledge Area
Process Group

Inputs
- ...

Outputs
- ...

Downstream Usage
- Output A
  - Used by Process X
  - Used by Process Y
```

### 16.2 Artifact詳細

表示項目:

```text
Artifact Name

Produced By
- Process A
- Process B

Used As Input By
- Process X
- Process Y
```

## 17. ファイル構成

推奨構成:

```text
pmp-itto-explorer/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ data/
│  │  └─ itto.json
│  ├─ types/
│  │  └─ graph.ts
│  ├─ components/
│  │  ├─ GraphView.tsx
│  │  ├─ ProcessMatrix.tsx
│  │  ├─ DetailPanel.tsx
│  │  ├─ SearchBox.tsx
│  │  └─ FilterBar.tsx
│  ├─ graph/
│  │  ├─ selectors.ts
│  │  ├─ buildProcessView.ts
│  │  ├─ buildArtifactView.ts
│  │  └─ layout.ts
│  └─ styles/
│     └─ app.css
└─ .github/
   └─ workflows/
      └─ deploy.yml
```

## 18. TypeScript型定義

`src/types/graph.ts`

```ts
export type NodeType = "process" | "artifact";

export type RelationType = "input_to" | "outputs";

export type ProcessGroup =
  | "Initiating"
  | "Planning"
  | "Executing"
  | "Monitoring and Controlling"
  | "Closing";

export type KnowledgeArea =
  | "Project Integration Management"
  | "Project Scope Management"
  | "Project Schedule Management"
  | "Project Cost Management"
  | "Project Quality Management"
  | "Project Resource Management"
  | "Project Communications Management"
  | "Project Risk Management"
  | "Project Procurement Management"
  | "Project Stakeholder Management";

export type IttoNode = {
  id: string;
  label: string;
  type: NodeType;
  knowledgeArea?: KnowledgeArea;
  processGroup?: ProcessGroup;
};

export type IttoEdge = {
  source: string;
  target: string;
  relation: RelationType;
};

export type IttoGraph = {
  nodes: IttoNode[];
  edges: IttoEdge[];
};
```

## 19. ビュー生成関数

### 19.1 `buildProcessView`

入力:

```ts
buildProcessView(graph: IttoGraph, selectedProcessId: string): {
  nodes: FlowNode[];
  edges: FlowEdge[];
}
```

役割:

* 選択Processを中心に置く
* Inputsを左に置く
* Outputsを右に置く
* OutputをInputとして使うConsumer Processesをさらに右に置く
* React Flow用nodes / edgesを返す

### 19.2 `buildArtifactView`

入力:

```ts
buildArtifactView(graph: IttoGraph, selectedArtifactId: string): {
  nodes: FlowNode[];
  edges: FlowEdge[];
}
```

役割:

* 選択Artifactを中心に置く
* Producer Processesを左に置く
* Consumer Processesを右に置く
* React Flow用nodes / edgesを返す

## 20. GitHub Pages対応

### 20.1 Vite base設定

リポジトリ名が `pmp-itto-explorer` の場合:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/pmp-itto-explorer/"
});
```

カスタムドメインまたはユーザーサイト直下で配信する場合:

```ts
export default defineConfig({
  plugins: [react()],
  base: "/"
});
```

### 20.2 React Router

初期版ではReact Routerを使わない。

理由:

* GitHub PagesでSPAルーティングの直接アクセス時に404対策が必要になる
* 今回はクエリパラメータだけで十分

選択ノード共有は以下で行う。

```text
?node=project_management_plan
```

## 21. GitHub Actions

`.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

GitHub repository settings:

```text
Settings
-> Pages
-> Build and deployment
-> Source: GitHub Actions
```

## 22. package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

## 23. MVP実装手順

### Step 1: プロジェクト作成

```bash
npm create vite@latest pmp-itto-explorer -- --template react-ts
cd pmp-itto-explorer
npm install
npm install @xyflow/react
```

### Step 2: JSONデータ作成

`src/data/itto.json` を作る。

最初は全49プロセスを入れなくてよい。以下のようなIntegration Managementの一部から開始する。

* Develop Project Charter
* Develop Project Management Plan
* Direct and Manage Project Work
* Manage Project Knowledge
* Monitor and Control Project Work
* Perform Integrated Change Control
* Close Project or Phase

### Step 3: 型定義作成

`src/types/graph.ts` を作る。

### Step 4: ビュー生成関数作成

* `buildProcessView.ts`
* `buildArtifactView.ts`
* `layout.ts`

### Step 5: GraphView作成

React Flowでnodes / edgesを描画する。

### Step 6: ProcessMatrix作成

49プロセスのマトリクスを作る。

### Step 7: DetailPanel作成

選択ノードの詳細を表示する。

### Step 8: SearchBox作成

ノード検索を追加する。

### Step 9: URL query対応

`?node=...` を読み書きする。

### Step 10: GitHub Pagesデプロイ

GitHub Actionsでデプロイする。

## 24. UIデザイン方針

### 24.1 ノード色

色はCSS変数で管理する。

```css
:root {
  --process-bg: #eef4ff;
  --artifact-bg: #f8f8f8;
  --focus-border: #111827;
  --edge-input: #6b7280;
  --edge-output: #2563eb;
}
```

### 24.2 ノード表示

Process Node:

```text
[Process]
Develop Project Management Plan
Planning / Integration
```

Artifact Node:

```text
[Artifact]
Project Management Plan
```

### 24.3 中心ノード

中心ノードは太枠にする。

```css
.node--focus {
  border: 2px solid var(--focus-border);
  font-weight: 600;
}
```

## 25. 著作権・商標・公開上の注意

公開する場合、PMBOK GuideやPMI公式教材の表、説明文、ITTO一覧をそのまま転載しない。

安全寄りの方針:

* 本文説明をコピーしない
* 表の丸写しを避ける
* 自分の学習用に再整理したデータにする
* 公式教材ではない旨を明記する
* PMI / PMP / PMBOKが商標である旨を明記する
* 必要に応じてprivate repositoryまたは個人利用にする

表示する免責文例:

```text
This site is an unofficial study aid for project management certification preparation.
It is not affiliated with, endorsed by, or sponsored by Project Management Institute, Inc.
PMI, PMP, and PMBOK are trademarks of Project Management Institute, Inc.
```

日本語:

```text
本サイトはプロジェクトマネジメント学習用の非公式補助ツールです。
PMI、PMP、PMBOKの公式教材ではなく、Project Management Institute, Inc.による承認・後援・提携を受けたものではありません。
PMI、PMP、PMBOKはProject Management Institute, Inc.の商標です。
```

## 26. 将来拡張

### 26.1 Tools & Techniques追加

初期版の安定後に追加する。

追加時の注意:

* Expert Judgmentなどの汎用T&Tは接続数が多くなりすぎる
* T&Tは初期表示では非表示
* Toggleで表示する
* T&T中心ビューを別途用意する

### 26.2 Quiz Mode

例:

* このプロセスのInputは何か
* このArtifactをOutputするプロセスは何か
* このArtifactをInputとして使うプロセスは何か

### 26.3 学習状態保存

localStorageに以下を保存する。

* visited nodes
* pinned nodes
* quiz results
* hidden nodes

### 26.4 ELK.js導入

将来的に分岐が複雑になった場合のみ導入する。

初期版では固定カラム方式を維持する。

## 27. 完了条件

MVPの完了条件:

* GitHub Pagesで閲覧できる
* 49プロセスのマトリクスが表示される
* Processをクリックすると、Inputs / Process / Outputs / Consumer Processesが左から右に表示される
* Artifactをクリックすると、Producer Processes / Artifact / Consumer Processesが左から右に表示される
* Graph上のノードをクリックすると、そのノード中心に再描画される
* 検索でProcessまたはArtifactを選択できる
* Detail Panelに選択ノードの関係情報が表示される
* `?node=...` で選択状態を共有できる
* GitHub Actionsで自動デプロイできる

## 28. Codexへの実装指示例

以下の指示で実装を開始する。

```text
Build a Vite + React + TypeScript app for a PMP ITTO Relationship Explorer.

Use @xyflow/react for the graph view.

Implement a selected-node-centered left-to-right dependency graph.

Data is stored in src/data/itto.json with normalized nodes and edges.

There are two node types:
- process
- artifact

There are two edge relation types:
- input_to: artifact -> process
- outputs: process -> artifact

When the selected node is a process:
- show its inputs in the left column
- show the selected process in the center
- show its outputs in the right column
- show downstream consumer processes further right

When the selected node is an artifact:
- show producer processes on the left
- show the selected artifact in the center
- show consumer processes on the right

Use fixed column x positions instead of ELK or Dagre.

Create the following components:
- App
- GraphView
- ProcessMatrix
- DetailPanel
- SearchBox
- FilterBar

Create graph utility functions:
- buildProcessView
- buildArtifactView
- layoutVerticalColumn
- getNodeById
- getInputsForProcess
- getOutputsForProcess
- getProducersForArtifact
- getConsumersForArtifact

Do not use React Router.
Use URLSearchParams with ?node=... for shareable selected node state.

Prepare the project for GitHub Pages deployment using Vite base config and GitHub Actions.
```

```
::contentReference[oaicite:1]{index=1}
```

[1]: https://reactflow.dev/?utm_source=chatgpt.com "React Flow: Node-Based UIs in React"

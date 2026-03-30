diff --git a/.github/workflows/board-sync.yml b/.github/workflows/board-sync.yml
index 056ec96..533519a 100644
--- a/.github/workflows/board-sync.yml
+++ b/.github/workflows/board-sync.yml
@@ -11,6 +11,11 @@ on:
     types: [submitted]
   workflow_dispatch:
 
+# Previne condições de corrida em commits simultâneos no mesmo branch/PR
+concurrency:
+  group: board-sync-${{ github.event.pull_request.number || github.ref }}
+  cancel-in-progress: true
+
 jobs:
   sync:
     runs-on: ubuntu-latest
@@ -22,6 +27,8 @@ jobs:
     steps:
       - name: Checkout
         uses: actions/checkout@v4
+        with:
+          fetch-depth: 0
 
       - name: Setup Node
         uses: actions/setup-node@v4
@@ -41,5 +48,7 @@ jobs:
           git add SPRINT.md
           if ! git diff --staged --quiet; then
             git commit -m "chore: auto-update SPRINT.md"
+            # Sincroniza com as mudanças remotas antes de empurrar para evitar [rejected]
+            git pull --rebase origin ${{ github.event.pull_request.head.ref || github.ref_name }}
             git push origin HEAD:${{ github.event.pull_request.head.ref || github.ref_name }}
           fi
diff --git a/README.md b/README.md
index a40da30..fecae05 100644
--- a/README.md
+++ b/README.md
@@ -42,8 +42,8 @@ ISP Simulator is a **state-driven network simulation engine** with a React-based
 
 This repository follows a clean, modular structure. Key systems are isolated in pure functions and connected to the UI via Zustand and custom hooks.
 
-- **[Project Blueprint](.gemini/antigravity/brain/a4bb2621-873e-44f9-a349-d9aff5436f00/project_blueprint.md)**: Read our full architectural blueprint, refactoring plan, and coding standards.
-- **[Git Workflow](.gemini/antigravity/brain/a4bb2621-873e-44f9-a349-d9aff5436f00/git_workflow.md)**: Explore our branch strategies and commit conventions.
+- **[Project Blueprint](docs/blueprint.md)**: Read our full architectural blueprint, refactoring plan, and coding standards.
+- **[Git Workflow](docs/workflow.md)**: Explore our branch strategies and commit conventions.
 
 ### Folder Structure Overview
 - `src/components/`: Reusable, simple UI elements.
diff --git a/SPRINT.md b/SPRINT.md
index 486afa3..5e0c139 100644
--- a/SPRINT.md
+++ b/SPRINT.md
@@ -1,27 +1,20 @@
 # 🏃 SPRINT BOARD
 
-> Last updated: Wed, 25 Mar 2026 05:57:35 GMT (UTC)
+> Last updated: Fri, 27 Mar 2026 01:41:00 GMT (UTC)
 
 ## 🚨 Critical Path (Blockers)
 
 | Type | #ID | Task/PR Title | Status/Problem |
 | :--- | :--- | :--- | :--- |
-| 📌 Issue | #46 | [[BUG] UI Formatting: Scientific Notation Fix](https://github.com/walace-lopes-peng/isp-simulator/issues/46) | `bug`, `ui`, `ux` |
-| 📌 Issue | #43 | [[BUG] Phantom Green Circle & Visual Artifacts](https://github.com/walace-lopes-peng/isp-simulator/issues/43) | `bug`, `ui`, `vfx` |
-| 📌 Issue | #41 | [[UX/BUG] Node Disappearance on Range/Zoom](https://github.com/walace-lopes-peng/isp-simulator/issues/41) | `bug`, `ui`, `ux` |
-| 📌 Issue | #40 | [[BUG] Link Path Misplacement (Zustand/SVG Sync)](https://github.com/walace-lopes-peng/isp-simulator/issues/40) | `bug`, `logic`, `vfx` |
-| 📌 Issue | #19 | [chore: implement project governance and contributing standards](https://github.com/walace-lopes-peng/isp-simulator/issues/19) | `docs`, `chore`, `P1-high`, `v1-blocker`, `config` |
-| 📌 Issue | #14 | [Implementar Renderização do Mapa Base Geográfico (SVG)](https://github.com/walace-lopes-peng/isp-simulator/issues/14) | `feat`, `P1-high`, `v1-blocker`, `ui`, `network-nodes` |
 | 📌 Issue | #13 | [Implementar Kernel de Estado Global (Zustand)](https://github.com/walace-lopes-peng/isp-simulator/issues/13) | `feat`, `P1-high`, `v1-blocker`, `store`, `state-risk` |
+| 📌 Issue | #2 | [[Bug] [Logic] Revenue Black Hole at Layer 1 Focus](https://github.com/walace-lopes-peng/isp-simulator/issues/2) | `fix`, `P0-blocker`, `v1-blocker`, `store`, `state-risk`, `economy` |
+| 📌 Issue | #7 | [[Feature] UI Overhaul: Real Geographical Map Interface](https://github.com/walace-lopes-peng/isp-simulator/issues/7) | `feat`, `P0-blocker`, `v1-blocker`, `ui`, `ai-agent`, `network-nodes` |
+| 📌 Issue | #6 | [[UX] Confusing 'Aggregate' State at Initial Zoom (10%)](https://github.com/walace-lopes-peng/isp-simulator/issues/6) | `P1-high`, `v1-blocker`, `ui`, `ai-agent`, `needs-qa` |
 | 📌 Issue | #11 | [[Docs] Developer Onboarding & Gameplay Tutorial System](https://github.com/walace-lopes-peng/isp-simulator/issues/11) | `docs`, `P1-high`, `v1-blocker`, `ai-agent` |
 | 📌 Issue | #10 | [[UX/Gameplay] Intuitive Connective Mechanics & Core Utility](https://github.com/walace-lopes-peng/isp-simulator/issues/10) | `feat`, `P0-blocker`, `v1-blocker`, `topology-engine`, `events` |
 | 📌 Issue | #9 | [[Bug] Node Interaction & Positioning Glitches](https://github.com/walace-lopes-peng/isp-simulator/issues/9) | `fix`, `P1-high`, `v1-blocker`, `ui-3d`, `ai-agent` |
 | 📌 Issue | #8 | [[Bug] Responsive Design: Scale Issues on Desktop & Mobile](https://github.com/walace-lopes-peng/isp-simulator/issues/8) | `fix`, `P1-high`, `v1-blocker`, `ui-theme`, `ai-agent` |
-| 📌 Issue | #7 | [[Feature] UI Overhaul: Real Geographical Map Interface](https://github.com/walace-lopes-peng/isp-simulator/issues/7) | `feat`, `P0-blocker`, `v1-blocker`, `ui`, `ai-agent`, `network-nodes` |
-| 📌 Issue | #6 | [[UX] Confusing 'Aggregate' State at Initial Zoom (10%)](https://github.com/walace-lopes-peng/isp-simulator/issues/6) | `P1-high`, `v1-blocker`, `ui`, `ai-agent`, `needs-qa` |
 | 📌 Issue | #3 | [[Bug] [Visual] Nodes Detached from Perspective Geometry](https://github.com/walace-lopes-peng/isp-simulator/issues/3) | `fix`, `P1-high`, `v1-blocker`, `ui-3d`, `ai-agent` |
-| 📌 Issue | #2 | [[Bug] [Logic] Revenue Black Hole at Layer 1 Focus](https://github.com/walace-lopes-peng/isp-simulator/issues/2) | `fix`, `P0-blocker`, `v1-blocker`, `store`, `state-risk`, `economy` |
-| 📌 Issue | #1 | [feat: implement intelligent project management workflows & AI agent skills](https://github.com/walace-lopes-peng/isp-simulator/issues/1) | `documentation`, `feature`, `workflow`, `architecture`, `feat`, `docs`, `v1-blocker`, `config`, `needs-review` |
 
 ## 🏗️ Phase 1: The Kernel
 
@@ -31,33 +24,35 @@
 | 📌 Issue | #38 | [[LOGIC] Dynamic Routing & Pathfinding (Realistic Links)](https://github.com/walace-lopes-peng/isp-simulator/issues/38) | `simulation`, `logic`, `vfx` |
 | 📌 Issue | #37 | [[FEAT] Proximity-Based Fog of War](https://github.com/walace-lopes-peng/isp-simulator/issues/37) | `simulation`, `logic`, `ux` |
 | 📌 Issue | #30 | [feat: Living World - Random Incident System](https://github.com/walace-lopes-peng/isp-simulator/issues/30) | `simulation`, `logic`, `difficulty` |
-| 📌 Issue | #17 | [Implementar Navegação de Escala Macro e Micro (Zoom)](https://github.com/walace-lopes-peng/isp-simulator/issues/17) | `feat`, `topology-engine`, `ui`, `performance` |
-| 📌 Issue | #15 | [Desenvolver Sistema Lógico de Fluxo de Dados (Traffic Logic)](https://github.com/walace-lopes-peng/isp-simulator/issues/15) | `feat`, `P2-medium`, `topology-engine`, `simulation`, `traffic` |
 | 📌 Issue | #5 | [[Code Quality] Stale Store Actions Cleanup](https://github.com/walace-lopes-peng/isp-simulator/issues/5) | `chore`, `P2-medium`, `store`, `ai-agent`, `tech-debt`, `cleanup` |
 | 📌 Issue | #4 | [[Bug] [Logic] Era Transition Threshold Inconsistency](https://github.com/walace-lopes-peng/isp-simulator/issues/4) | `fix`, `P2-medium`, `store`, `simulation`, `state-risk` |
+| 📌 Issue | #15 | [Desenvolver Sistema Lógico de Fluxo de Dados (Traffic Logic)](https://github.com/walace-lopes-peng/isp-simulator/issues/15) | `feat`, `P2-medium`, `topology-engine`, `simulation`, `traffic` |
 
 ## 🏠 Phase 2: The Garage & Immersion
 
 | Type | #ID | Task/PR Title | Status/Problem |
 | :--- | :--- | :--- | :--- |
+| 📌 Issue | #61 | [[FEAT] Multi-Region Preset System & Layered SVG Maps](https://github.com/walace-lopes-peng/isp-simulator/issues/61) | `feat`, `simulation`, `ui`, `arch`, `ux` |
+| 📌 Issue | #60 | [[FEAT] Discrete Map Navigation via Snap ViewBox (Range System)](https://github.com/walace-lopes-peng/isp-simulator/issues/60) | `feat`, `simulation`, `ui`, `ux` |
 | 📌 Issue | #50 | [[EPIC][FEAT] Implementation of Scenario Engine & 'Cyber-Iron Curtain' Expansion](https://github.com/walace-lopes-peng/isp-simulator/issues/50) | `architecture`, `feat`, `P2-medium`, `immersion`, `epic` |
 | 📌 Issue | #48 | [[UX] Signal Pulse & Range Visualization](https://github.com/walace-lopes-peng/isp-simulator/issues/48) | `immersion`, `vfx`, `ux` |
 | 📌 Issue | #47 | [[FEAT] Era-Specific System Overlays (OS Immersion)](https://github.com/walace-lopes-peng/isp-simulator/issues/47) | `feat`, `ui`, `immersion` |
 | 📌 Issue | #45 | [[UX] Interactive Linking Flow (Visual Feedback)](https://github.com/walace-lopes-peng/isp-simulator/issues/45) | `ui`, `vfx`, `ux` |
 | 📌 Issue | #42 | [[UX] UI Layout Overhaul (Map Obstruction)](https://github.com/walace-lopes-peng/isp-simulator/issues/42) | `ui`, `immersion`, `ux` |
 | 📌 Issue | #36 | [[UX] Physical Node Representation (Realistic Assets)](https://github.com/walace-lopes-peng/isp-simulator/issues/36) | `ui`, `immersion`, `vfx` |
-| 📌 Issue | #35 | [[ARCH] Local-to-Global Semantic Layering](https://github.com/walace-lopes-peng/isp-simulator/issues/35) | `ui`, `immersion`, `arch` |
 | 📌 Issue | #34 | [[UX] Physical Node Representation (Realistic Assets)](https://github.com/walace-lopes-peng/isp-simulator/issues/34) | `ui`, `immersion`, `vfx` |
-| 📌 Issue | #33 | [[ARCH] Local-to-Global Semantic Layering](https://github.com/walace-lopes-peng/isp-simulator/issues/33) | `ui`, `immersion`, `arch` |
 | 📌 Issue | #32 | [feat: Historical News Ticker & Incident Alerts](https://github.com/walace-lopes-peng/isp-simulator/issues/32) | `ui`, `immersion`, `narrative` |
 | 📌 Issue | #31 | [ux: Procedural Audio Feedback Loop](https://github.com/walace-lopes-peng/isp-simulator/issues/31) | `immersion`, `audio`, `vfx` |
 | 📌 Issue | #29 | [ux: Era-Specific Visual Overlays & Post-Processing](https://github.com/walace-lopes-peng/isp-simulator/issues/29) | `ui`, `immersion`, `shaders` |
-| 📌 Issue | #16 | [Construir Motor de Temas Históricos Baseado em Era](https://github.com/walace-lopes-peng/isp-simulator/issues/16) | `feat`, `v1-polish`, `ui-theme`, `events` |
 
 ## ⏳ Awaiting Review
 
 | Type | #ID | Task/PR Title | Status/Problem |
 | :--- | :--- | :--- | :--- |
+| 📦 PR | #63 | [feat: Discrete Map Navigation (Snap ViewBox) #60](https://github.com/walace-lopes-peng/isp-simulator/pull/63) | ⏳ Awaiting Review |
+| 📦 PR | #62 | [fix: resolve Revenue Black Hole at Layer 1 focus #2](https://github.com/walace-lopes-peng/isp-simulator/pull/62) | ⏳ Awaiting Review |
+| 📦 PR | #59 | [feat: implement Developer Debug Suite (Cheat Menu) #44](https://github.com/walace-lopes-peng/isp-simulator/pull/59) | ⏳ Awaiting Review |
+| 📦 PR | #58 | [feat: harden state kernel with OPEX and refined simulation logic](https://github.com/walace-lopes-peng/isp-simulator/pull/58) | ⏳ Awaiting Review |
 | 📦 PR | #25 | [chore: implement formal project governance and PR standards](https://github.com/walace-lopes-peng/isp-simulator/pull/25) | ⏳ Awaiting Review |
 | 📦 PR | #24 | [fix: resolve revenue black hole and era transition thresholds](https://github.com/walace-lopes-peng/isp-simulator/pull/24) | ⏳ Awaiting Review |
 
@@ -65,5 +60,5 @@
 
 | Type | #ID | Task/PR Title | Status/Problem |
 | :--- | :--- | :--- | :--- |
-| 📌 Issue | #49 | [docs: initialize Project North Star and Strategic Blueprint](https://github.com/walace-lopes-peng/isp-simulator/issues/49) | `documentation`, `architecture`, `P1-high` |
+| 📌 Issue | #51 | [docs: [LEGAL] Copyright and Asset Usage Verification](https://github.com/walace-lopes-peng/isp-simulator/issues/51) | `documentation`, `dev-tools` |
 
diff --git a/docs/blueprint.md b/docs/blueprint.md
new file mode 100644
index 0000000..5837ffd
--- /dev/null
+++ b/docs/blueprint.md
@@ -0,0 +1,81 @@
+# ISP Simulator: Project Blueprint & Architecture
+
+As the technical lead, this blueprint transforms our working prototype into a scalable, professional, and maintainable game repository. This document serves as the guide for our upcoming refactor and future development.
+
+## 1. 📂 Folder Structure & Architectural Decisions
+
+Our goal is **Separation of Concerns**. UI should not contain game math; global state should be minimal.
+
+```text
+src/
+├── assets/          # Static files (images, sounds, icons)
+├── components/      # Dumb, reusable UI components (Buttons, Modals, ProgressBars)
+├── features/        # Smart, scoped components handling specific game systems (Map, HUD, Nodes)
+├── hooks/           # Custom React hooks bridging systems/store to UI (useGameLoop, useEconomy)
+├── store/           # Zustand state management (split into logical slices if needed)
+├── systems/         # PURE GAME LOGIC classes/functions (Engine, Economy, Traffic). NO REACT HERE.
+├── styles/          # Global CSS, Tailwind configurations, animation keyframes
+├── types/           # Global TypeScript interfaces (ISPNode, Era, GameState)
+└── utils/           # Helper functions (math, string formatting, array manipulation)
+```
+
+**Why this structure?**
+- **Testability**: Pure functions in `systems/` can be unit tested without mounting React components.
+- **Maintainability**: When the UI changes, `systems/` remains untouched. When math changes, UI is untouched.
+- **Scalability**: Adding a new feature (e.g., "Research Tree") simply means adding a new folder in `features/` and logic in `systems/`.
+
+---
+
+## 2. 🔄 Refactoring Plan (Step-by-Step)
+
+To move from our monolithic prototype to this structure, we will execute the following refactoring steps in order:
+
+1. **Extract Types & Utilities**
+   - Move `ISPNode`, `Era`, etc., to `src/types/game.ts`.
+   - Move config constants (like `ERAS`) to `src/utils/constants.ts`.
+
+2. **Isolate Game Logic (Systems)**
+   - Create `src/systems/engine.ts` to handle the `tick` calculation.
+   - Create `src/systems/economy.ts` for revenue, upgrade costs, and congestion penalties.
+   - Refactor `useISPStore` to strictly hold state and call these pure system functions inside its actions.
+
+3. **Break Down the Monolith (`App.tsx`)**
+   - Extract `LogisticMap` to `src/features/map/LogisticMap.tsx`.
+   - Extract `NodeModule` to `src/features/nodes/NodeCard.tsx`.
+   - Extract HUDs (`ZoomSlider`, `HUDStats`) to `src/features/hud/`.
+   - Extract small generic UI like `StatusIndicator` to `src/components/`.
+
+4. **Implement Custom Hooks**
+   - Create `src/hooks/useGameLoop.ts` to handle `setInterval` and trigger the store's `tick` action, keeping `App.tsx` clean.
+
+---
+
+## 3. 🧩 File Organization & Examples
+
+### The "Dumb/Smart" Component Rule
+- **`components/ProgressBar.tsx` (Dumb)**: Takes `value` and `max` as props. Renders a div.
+- **`features/nodes/NodeCard.tsx` (Smart)**: Takes a `nodeId`, connects to Zustand, gets live traffic data, and uses `ProgressBar` to render it.
+
+---
+
+## 4. 📐 Coding Standards & Conventions
+
+- **Naming:**
+  - Components/Interfaces: `PascalCase` (`NodeCard.tsx`, `ISPNode`).
+  - Functions/Hooks/Variables: `camelCase` (`useGameLoop`, `calculateRevenue`).
+  - Constants: `UPPER_SNAKE_CASE` (`MAX_NODES`).
+- **State Usage Rules:**
+  - Avoid large object selectors. Use specific atomic selectors to prevent unnecessary re-renders.
+- **File Organization:**
+  - One primary component per file.
+
+---
+
+## 5. 🗺️ Next Development Steps (Roadmap)
+
+Once the architectural refactor is complete, we will focus on these gameplay features in order:
+
+1. **Map System Expansion:** Finalize the visual transitions between `zoomLevel` states (Local vs Global).
+2. **Node Connections (Cables):** Allow players to explicitly buy connections between nodes to route traffic.
+3. **Data Flow Animations:** Enhance the SVG map with moving particles along the flow lines.
+4. **Scaling System & Events:** Introduce random events (fiber cuts, DDOS attacks) and technology research.
diff --git a/docs/workflow.md b/docs/workflow.md
new file mode 100644
index 0000000..0a8daf1
--- /dev/null
+++ b/docs/workflow.md
@@ -0,0 +1,44 @@
+# Git Workflow for Solo Developers
+
+A streamlined, professional approach to version control for the ISP Simulator project.
+
+## 🌿 Branch Strategy
+
+| Branch | Purpose | Stability |
+| :--- | :--- | :--- |
+| `main` | Production-ready releases. | High (Always buildable) |
+| `dev` | Integration branch for features. | Medium (Internal testing) |
+| `feature/*` | Individual feature/bug development. | Low (Experimental) |
+
+## 📝 Commit Naming (Conventional Commits)
+
+Use concise, clear prefixes to summarize your intent:
+
+- `feat: ` New gameplay feature
+- `fix: ` Bug fix
+- `refactor: ` Code improvement without behavior change
+- `docs: ` Documentation updates
+- `style: ` UI/CSS changes only
+
+## 🛠️ Feature Flow (The Solo "PR")
+
+Even as a solo dev, following a mini-flow prevents "commit soup":
+
+1.  **Branch Out**: `git checkout -b feature/map-system dev`
+2.  **Iterate**: Commit early, commit often.
+3.  **Merge Back**: `git checkout dev` -> `git merge feature/map-system`
+4.  **Release**: Every few features, merge `dev` into `main`.
+
+## 🎫 Issue Tracking (The "To-Do" List)
+Use GitHub Issues as your backlog. 
+- Create a simple issue for each feature.
+- Link commits: `feat: add slider #12` (automatically links to issue #12).
+
+---
+
+## 🚀 Release Strategy
+
+1.  Ensure `dev` build is successful: `npm run build`.
+2.  Merge `dev` into `main`.
+3.  Tag the release: `git tag -a v1.0.0 -m "Initial Mechanic Alpha"`.
+4.  Push tags: `git push origin --tags`.
diff --git a/issues-list.json b/issues-list.json
new file mode 100644
index 0000000..967ce46
--- /dev/null
+++ b/issues-list.json
@@ -0,0 +1 @@
+[{"labels":[{"id":"LA_kwDORvG2YM8AAAACciql-g","name":"documentation","description":"Improvements or additions to documentation","color":"0075ca"},{"id":"LA_kwDORvG2YM8AAAACcr1ufw","name":"dev-tools","description":"","color":"EDEDED"}],"number":51,"title":"docs: [LEGAL] Copyright and Asset Usage Verification"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACci9Q5A","name":"architecture","description":"","color":"0dceb8"},{"id":"LA_kwDORvG2YM8AAAACcnrrnA","name":"feat","description":"New feature","color":"a2eeef"},{"id":"LA_kwDORvG2YM8AAAACcnrvog","name":"P2-medium","description":"Normal priority","color":"fbca04"},{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcr-v5A","name":"epic","description":"","color":"5319e7"}],"number":50,"title":"[EPIC][FEAT] Implementation of Scenario Engine & 'Cyber-Iron Curtain' Expansion"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACciql-g","name":"documentation","description":"Improvements or additions to documentation","color":"0075ca"},{"id":"LA_kwDORvG2YM8AAAACci9Q5A","name":"architecture","description":"","color":"0dceb8"},{"id":"LA_kwDORvG2YM8AAAACcnrvJw","name":"P1-high","description":"Should be fixed soon","color":"d93f0b"}],"number":49,"title":"docs: initialize Project North Star and Strategic Blueprint"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcriosw","name":"vfx","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcrl9pw","name":"ux","description":"","color":"EDEDED"}],"number":48,"title":"[UX] Signal Pulse & Range Visualization"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrrnA","name":"feat","description":"New feature","color":"a2eeef"},{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"}],"number":47,"title":"[FEAT] Era-Specific System Overlays (OS Immersion)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACciql8Q","name":"bug","description":"Something isn't working","color":"d73a4a"},{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcrl9pw","name":"ux","description":"","color":"EDEDED"}],"number":46,"title":"[BUG] UI Formatting: Scientific Notation Fix"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriosw","name":"vfx","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcrl9pw","name":"ux","description":"","color":"EDEDED"}],"number":45,"title":"[UX] Interactive Linking Flow (Visual Feedback)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrrnA","name":"feat","description":"New feature","color":"a2eeef"},{"id":"LA_kwDORvG2YM8AAAACcnruTg","name":"test","description":"Tests added/updated","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcrinxg","name":"logic","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcr1ufw","name":"dev-tools","description":"","color":"EDEDED"}],"number":44,"title":"[FEAT] Developer Debug Suite (Cheat Menu)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACciql8Q","name":"bug","description":"Something isn't working","color":"d73a4a"},{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriosw","name":"vfx","description":"","color":"EDEDED"}],"number":43,"title":"[BUG] Phantom Green Circle & Visual Artifacts"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcrl9pw","name":"ux","description":"","color":"EDEDED"}],"number":42,"title":"[UX] UI Layout Overhaul (Map Obstruction)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACciql8Q","name":"bug","description":"Something isn't working","color":"d73a4a"},{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcrl9pw","name":"ux","description":"","color":"EDEDED"}],"number":41,"title":"[UX/BUG] Node Disappearance on Range/Zoom"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrz4w","name":"simulation","description":"Traffic, ticks, runtime systems","color":"5319e7"},{"id":"LA_kwDORvG2YM8AAAACcrinxg","name":"logic","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcriosw","name":"vfx","description":"","color":"EDEDED"}],"number":38,"title":"[LOGIC] Dynamic Routing & Pathfinding (Realistic Links)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrz4w","name":"simulation","description":"Traffic, ticks, runtime systems","color":"5319e7"},{"id":"LA_kwDORvG2YM8AAAACcrinxg","name":"logic","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcrl9pw","name":"ux","description":"","color":"EDEDED"}],"number":37,"title":"[FEAT] Proximity-Based Fog of War"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcriosw","name":"vfx","description":"","color":"EDEDED"}],"number":36,"title":"[UX] Physical Node Representation (Realistic Assets)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcrlW6Q","name":"arch","description":"","color":"A2EEF9"}],"number":35,"title":"[ARCH] Local-to-Global Semantic Layering"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcriosw","name":"vfx","description":"","color":"EDEDED"}],"number":34,"title":"[UX] Physical Node Representation (Realistic Assets)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcrlW6Q","name":"arch","description":"","color":"A2EEF9"}],"number":33,"title":"[ARCH] Local-to-Global Semantic Layering"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcripBA","name":"narrative","description":"","color":"EDEDED"}],"number":32,"title":"feat: Historical News Ticker & Incident Alerts"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcrioZQ","name":"audio","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcriosw","name":"vfx","description":"","color":"EDEDED"}],"number":31,"title":"ux: Procedural Audio Feedback Loop"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrz4w","name":"simulation","description":"Traffic, ticks, runtime systems","color":"5319e7"},{"id":"LA_kwDORvG2YM8AAAACcrinxg","name":"logic","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcrioJw","name":"difficulty","description":"","color":"EDEDED"}],"number":30,"title":"feat: Living World - Random Incident System"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcriLLA","name":"immersion","description":"","color":"EDEDED"},{"id":"LA_kwDORvG2YM8AAAACcrinkA","name":"shaders","description":"","color":"EDEDED"}],"number":29,"title":"ux: Era-Specific Visual Overlays & Post-Processing"},{"labels":[],"number":27,"title":"🏃 SPRINT BOARD"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrspQ","name":"docs","description":"Documentation only","color":"0075ca"},{"id":"LA_kwDORvG2YM8AAAACcnrtzQ","name":"chore","description":"Tooling, config, maintenance","color":"fbca04"},{"id":"LA_kwDORvG2YM8AAAACcnrvJw","name":"P1-high","description":"Should be fixed soon","color":"d93f0b"},{"id":"LA_kwDORvG2YM8AAAACcnrwYg","name":"v1-blocker","description":"Required for v1.0 launch","color":"b60205"},{"id":"LA_kwDORvG2YM8AAAACcnr2Vg","name":"config","description":"Config files","color":"e4e669"}],"number":19,"title":"chore: implement project governance and contributing standards"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrrnA","name":"feat","description":"New feature","color":"a2eeef"},{"id":"LA_kwDORvG2YM8AAAACcnryog","name":"topology-engine","description":"Graph logic / BFS / connectivity","color":"006b75"},{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcnr25A","name":"performance","description":"Optimization issues","color":"d4c5f9"}],"number":17,"title":"Implementar Navegação de Escala Macro e Micro (Zoom)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrrnA","name":"feat","description":"New feature","color":"a2eeef"},{"id":"LA_kwDORvG2YM8AAAACcnrxTw","name":"v1-polish","description":"UX/UI improvements before release","color":"5319e7"},{"id":"LA_kwDORvG2YM8AAAACcnr1Ug","name":"ui-theme","description":"Tailwind / styling / themes","color":"c5def5"},{"id":"LA_kwDORvG2YM8AAAACcnr9yg","name":"events","description":"Random events (fiber cuts, spikes)","color":"5319e7"}],"number":16,"title":"Construir Motor de Temas Históricos Baseado em Era"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrrnA","name":"feat","description":"New feature","color":"a2eeef"},{"id":"LA_kwDORvG2YM8AAAACcnrvog","name":"P2-medium","description":"Normal priority","color":"fbca04"},{"id":"LA_kwDORvG2YM8AAAACcnryog","name":"topology-engine","description":"Graph logic / BFS / connectivity","color":"006b75"},{"id":"LA_kwDORvG2YM8AAAACcnrz4w","name":"simulation","description":"Traffic, ticks, runtime systems","color":"5319e7"},{"id":"LA_kwDORvG2YM8AAAACcnr_Tw","name":"traffic","description":"Data flow logic","color":"0052cc"}],"number":15,"title":"Desenvolver Sistema Lógico de Fluxo de Dados (Traffic Logic)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrrnA","name":"feat","description":"New feature","color":"a2eeef"},{"id":"LA_kwDORvG2YM8AAAACcnrvJw","name":"P1-high","description":"Should be fixed soon","color":"d93f0b"},{"id":"LA_kwDORvG2YM8AAAACcnrwYg","name":"v1-blocker","description":"Required for v1.0 launch","color":"b60205"},{"id":"LA_kwDORvG2YM8AAAACcnr0Mg","name":"ui","description":"General UI","color":"1d76db"},{"id":"LA_kwDORvG2YM8AAAACcnr-0w","name":"network-nodes","description":"Node behavior","color":"006b75"}],"number":14,"title":"Implementar Renderização do Mapa Base Geográfico (SVG)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrrnA","name":"feat","description":"New feature","color":"a2eeef"},{"id":"LA_kwDORvG2YM8AAAACcnrvJw","name":"P1-high","description":"Should be fixed soon","color":"d93f0b"},{"id":"LA_kwDORvG2YM8AAAACcnrwYg","name":"v1-blocker","description":"Required for v1.0 launch","color":"b60205"},{"id":"LA_kwDORvG2YM8AAAACcnrzCg","name":"store","description":"useISPStore and state logic","color":"0052cc"},{"id":"LA_kwDORvG2YM8AAAACcnr6Kg","name":"state-risk","description":"Might break store contract","color":"d93f0b"}],"number":13,"title":"Implementar Kernel de Estado Global (Zustand)"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrspQ","name":"docs","description":"Documentation only","color":"0075ca"},{"id":"LA_kwDORvG2YM8AAAACcnrvJw","name":"P1-high","description":"Should be fixed soon","color":"d93f0b"},{"id":"LA_kwDORvG2YM8AAAACcnrwYg","name":"v1-blocker","description":"Required for v1.0 launch","color":"b60205"},{"id":"LA_kwDORvG2YM8AAAACcnr3TA","name":"ai-agent","description":"Work intended for AI execution","color":"000000"}],"number":11,"title":"[Docs] Developer Onboarding & Gameplay Tutorial System"},{"labels":[{"id":"LA_kwDORvG2YM8AAAACcnrrnA","name":"feat","description":"New feature","color":"a2eeef"},{"id":"LA_kwDORvG2YM8AAAACcnruyA","name":"P0-blocker","description":"Must fix before release","color":"b60205"},{"id":"LA_kwDORvG2YM8AAAACcnrwYg","name":"v1-blocker","description":"Required for v1.0 launch","color":"b60205"},{"id":"LA_kwDORvG2YM8AAAACcnryog","name":"topology-engine","description":"Graph logic / BFS / connectivity","color":"006b75"},{"id":"LA_kwDORvG2YM8AAAACcnr9yg","name":"events","description":"Random events (fiber cuts, spikes)","color":"5319e7"}],"number":10,"title":"[UX/Gameplay] Intuitive Connective Mechanics & Core Utility"}]
diff --git a/src/App.tsx b/src/App.tsx
index 3ce23f1..a654b33 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -1,5 +1,6 @@
 import React, { useEffect, useRef } from 'react';
-import { useISPStore } from './store/useISPStore';
+import { useISPStore, RANGE_PRESETS, RangeLevel } from './store/useISPStore';
+import DebugConsole from './components/DebugConsole';
 
 // --- NEW UI PANELS ---
 
@@ -15,7 +16,7 @@ const TopBar = () => {
   return (
     <div className={`h-14 w-full flex items-center justify-between px-6 border-b border-white/10 ${currentEra === '90s' ? 'win95-outset' : 'bg-black/40 backdrop-blur-md'} fixed top-0 z-50 glass-panel`}>
       <div className="flex items-center gap-8">
-        <div className={currentEra === '90s' ? 'win95-header' : ''}>
+        <div>
           <h1 className={`text-xs font-black tracking-widest uppercase ${currentEra === '90s' ? 'text-white' : 'text-emerald-500'}`}>Logistic Map // Core</h1>
           <p className={`text-[8px] font-mono ${currentEra === '90s' ? 'text-white/70' : 'text-slate-500'}`}>SYSTEM_REVENUE_ACTIVE</p>
         </div>
@@ -46,7 +47,7 @@ const TopBar = () => {
 };
 
 const Sidebar = () => {
-  const { selectedNodeId, nodes, links, upgradeNode, money, selectNode, connectNodes, isLinking, toggleLinking, currentEra } = useISPStore();
+  const { selectedNodeId, nodes, links, upgradeNode, money, selectNode, connectNodes, isLinking, toggleLinking, currentEra, isGodMode } = useISPStore();
   const node = nodes.find(n => n.id === selectedNodeId);
 
   if (!node) return (
@@ -109,12 +110,12 @@ const Sidebar = () => {
 
       <button 
         onClick={() => upgradeNode(node.id)}
-        disabled={money < cost}
+        disabled={!isGodMode && money < cost}
         className={`w-full py-3 rounded border font-black text-[10px] uppercase tracking-widest transition-all
-          ${money >= cost ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0:10px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 text-slate-700 cursor-not-allowed opacity-50'}
+          ${isGodMode || money >= cost ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0:10px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 text-slate-700 cursor-not-allowed opacity-50'}
         `}
       >
-        {money >= cost ? `Upgrade // $${cost.toLocaleString()}` : `Insufficient Funds // $${cost.toLocaleString()}`}
+        {isGodMode ? `God Upgrade // FREE` : money >= cost ? `Upgrade // $${cost.toLocaleString()}` : `Insufficient Funds // $${cost.toLocaleString()}`}
       </button>
     </div>
   );
@@ -147,34 +148,29 @@ const LogPanel = () => {
 // --- LOGISTIC MAP CORE ---
 
 const LogisticMap = () => {
-  const { nodes, links, zoomLevel, selectNode, selectedNodeId, connectNodes, setZoom, isLinking, currentEra } = useISPStore();
-  const center = { x: 400, y: 400 };
-  const ringRadii = [80, 180, 280, 380];
-
-  const maxTier = zoomLevel <= 25 ? 1 : zoomLevel <= 50 ? 2 : zoomLevel <= 75 ? 3 : 4;
+  const { nodes, links, rangeLevel, selectNode, selectedNodeId, connectNodes, setRange, isLinking, currentEra } = useISPStore();
+  const currentRange = RANGE_PRESETS[rangeLevel];
+  const maxTier = rangeLevel;
   const { money, addNode, addLog } = useISPStore();
 
   const getLoadColor = (load: number) => {
-    if (load >= 0.9) return '#ef4444'; // Red
-    if (load >= 0.5) return '#fbbf24'; // Amber
-    return '#10b981'; // Green (Emerald-500 equivalent)
+    if (load >= 0.9) return '#ef4444';
+    if (load >= 0.5) return '#fbbf24';
+    return '#10b981';
   };
 
   const handleWheel = (e: React.WheelEvent) => {
-    const delta = e.deltaY;
-    const newZoom = Math.max(0, Math.min(100, zoomLevel - delta / 5));
-    setZoom(newZoom);
+    if (e.deltaY > 0 && rangeLevel < 4) setRange((rangeLevel + 1) as RangeLevel);
+    else if (e.deltaY < 0 && rangeLevel > 1) setRange((rangeLevel - 1) as RangeLevel);
   };
 
   const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
-    // If we're clicking a node, stopPropagation should prevent this
     const svg = e.currentTarget;
     const pt = svg.createSVGPoint();
     pt.x = e.clientX;
     pt.y = e.clientY;
     const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
     
-    // Simple build logic: if clicking empty space, suggest building
     if (!selectedNodeId) {
         const cost = 500;
         const coverageRange = 250;
@@ -221,46 +217,34 @@ const LogisticMap = () => {
         .node-healthy { animation: pulse-steady 2s infinite ease-in-out; stroke: #22d3ee; }
         .node-saturated { animation: pulse-fast 1s infinite ease-in-out; stroke: #fbbf24; }
         .node-critical { animation: glitch-flicker 0.4s infinite linear; stroke: #ef4444; }
-        
-        .node-circle {
-          transform-box: fill-box;
-          transform-origin: center;
-        }
-        
-        @keyframes dash {
-          to {
-            stroke-dashoffset: -20;
-          }
-        }
-        .link-flow {
-          animation: dash 1s linear infinite;
-        }
+        .node-circle { transform-box: fill-box; transform-origin: center; }
+        @keyframes dash { to { stroke-dashoffset: -20; } }
+        .link-flow { animation: dash 1s linear infinite; }
+        .map-svg { transition: view-box 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
       `}</style>
       
-      <div className="absolute top-4 left-6 z-50 p-3 bg-black/40 backdrop-blur rounded-lg border border-white/5">
-        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Network Focus // {Math.round(zoomLevel)}%</label>
-        <input 
-          type="range" min="0" max="100" step="1"
-          value={zoomLevel}
-          onChange={(e) => setZoom(parseInt(e.target.value))}
-          className="w-48 accent-emerald-500 bg-slate-800 h-1 rounded-full cursor-pointer"
-        />
-        <div className="flex justify-between text-[7px] font-mono text-slate-600 mt-2 uppercase tracking-tighter">
-          <span>Local</span>
-          <span>Regional</span>
-          <span>National</span>
-          <span>Global</span>
+      <div className="absolute top-4 left-6 z-50 p-3 bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl">
+        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">Network Focus // {currentRange.name}</label>
+        <div className="flex gap-1">
+          {([1, 2, 3, 4] as const).map(level => (
+            <button 
+              key={level}
+              onClick={() => setRange(level)}
+              className={`px-3 py-1.5 text-[9px] font-black border transition-all duration-300 ${rangeLevel === level ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
+            >
+              LEVEL {level}
+            </button>
+          ))}
         </div>
       </div>
 
       <div className="flex-1 flex items-center justify-center p-4">
         <svg 
-          viewBox="0 0 800 800" 
+          viewBox={currentRange.viewBox} 
           preserveAspectRatio="xMidYMid slice" 
-          className="w-full h-full max-h-[80vh] aspect-square drop-shadow-2xl overflow-visible rounded-lg border border-white/5 shadow-inner bg-[#040d1a]"
+          className="w-full h-full max-h-[85vh] aspect-square drop-shadow-2xl overflow-visible rounded-lg border border-white/10 shadow-inner bg-[#040d1a] map-svg"
           onClick={handleMapClick}
         >
-          {/* Geographical Map Layer */}
           <defs>
             <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
               <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
@@ -274,37 +258,28 @@ const LogisticMap = () => {
             </filter>
           </defs>
           
-          <image href="/assets/world-map.png" width="800" height="800" opacity="0.5" preserveAspectRatio="xMidYMid slice" />
+          <image href="/assets/world-map.png" width="800" height="800" opacity="0.4" preserveAspectRatio="xMidYMid slice" />
           <rect width="800" height="800" fill="url(#grid)" pointerEvents="none" />
 
-          {/* Physical Cables */}
           {links.map(link => {
             const src = nodes.find(n => n.id === link.sourceId);
             const tgt = nodes.find(n => n.id === link.targetId);
             if (!src || !tgt) return null;
-
+            if (src.layer > maxTier && tgt.layer > maxTier) return null;
             const load = (tgt.traffic / tgt.bandwidth);
             const strokeColor = getLoadColor(load);
-            
-            // REFIX: Ensure links anchor at exact integer coordinates of the node center
             const x1 = Math.floor(src.x);
             const y1 = Math.floor(src.y);
             const x2 = Math.floor(tgt.x);
             const y2 = Math.floor(tgt.y);
-
-            const midX = (x1 + x2) / 2;
-            const midY = (y1 + y2) / 2;
             const dx = x2 - x1;
             const dy = y2 - y1;
             const dist = Math.sqrt(dx * dx + dy * dy);
-            
             const offset = dist * 0.15;
             const angle = Math.atan2(dy, dx);
-            const controlX = midX + offset * Math.cos(angle - Math.PI / 2);
-            const controlY = midY + offset * Math.sin(angle - Math.PI / 2);
-
+            const controlX = (x1 + x2) / 2 + offset * Math.cos(angle - Math.PI / 2);
+            const controlY = (y1 + y2) / 2 + offset * Math.sin(angle - Math.PI / 2);
             const strokeWidth = 1 + (link.bandwidth / 1000) * 1.5;
-
             return (
               <path 
                 key={link.id}
@@ -314,32 +289,26 @@ const LogisticMap = () => {
                 stroke={strokeColor}
                 strokeWidth={strokeWidth}
                 filter={currentEra === 'modern' ? "url(#glow)" : "none"}
-                strokeDasharray={currentEra === '70s' ? "2,2" : "5,5"}
+                strokeDasharray={currentEra === '70s' ? "2,2" : "none"}
               />
             );
           })}
 
-          {/* Sectors */}
           {[1, 2, 3, 4].map(layerNum => {
             const layerNodes = nodes.filter(n => n.layer === layerNum);
-            const isVisible = layerNum <= maxTier;
-
-            if (!isVisible) return null; // CLEANUP: Removed aggregate node logic
+            if (layerNum === 1 && rangeLevel === 4) return null;
+            if (layerNum > maxTier) return null;
 
             return (
               <g key={`layer-${layerNum}`} className="animate-in fade-in duration-700">
                 {layerNodes.map((node) => {
-                  const load = node.traffic / node.bandwidth;
+                   const load = node.traffic / node.bandwidth;
                    const stateClass = load >= 1.0 ? 'node-critical' : load > 0.8 ? 'node-saturated' : 'node-healthy';
                    const isSelected = selectedNodeId === node.id;
-                   
-                   // Dynamic Radius based on zoomLevel and layer
-                   const baseR = layerNum === 1 ? 12 : 8;
-                   const zoomScale = 0.4 + (zoomLevel / 100) * 0.6; // Smaller at Global (0), Larger at Local (100)
-                   const r = baseR * zoomScale;
-                   
+                   const baseR = layerNum === 1 ? 14 : 9;
+                   const rangeScale = 1.0 - (rangeLevel - 1) * 0.15;
+                   const r = baseR * rangeScale;
                    const isOffline = node.traffic === 0 && node.id !== '0';
-
                    return (
                      <g key={node.id} className="cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
@@ -355,21 +324,18 @@ const LogisticMap = () => {
                         className={`node-circle transition-all duration-300 stroke-2 fill-slate-900 ${isOffline ? 'stroke-slate-700 opacity-40' : stateClass} ${isSelected ? 'stroke-white scale-110' : ''}`}
                       />
                       <text 
-                        x={node.x} y={node.y + r + 12} 
+                        x={node.x} y={node.y + r + 14} 
                         textAnchor="middle"
                         className={`text-[8px] font-black font-mono select-none pointer-events-none uppercase transition-all backdrop-blur-sm ${isOffline ? 'opacity-20' : 'fill-slate-300'}`}
                       >
-                        {node.name}
+                        {rangeLevel < 4 ? node.name : ''} 
                       </text>
                     </g>
-                  );
+                   );
                 })}
               </g>
             );
           })}
-
-          {/* Central Processor Hub (Visual Only) */}
-          <rect x={383} y={248} width="24" height="24" rx="4" className="fill-emerald-500/20 stroke-emerald-500/40 stroke-1 animate-pulse pointer-events-none" />
         </svg>
       </div>
     </div>
@@ -377,12 +343,12 @@ const LogisticMap = () => {
 };
 
 const App = () => {
-  const { tick, currentEra } = useISPStore();
+  const { tick, currentEra, tickRate } = useISPStore();
 
   useEffect(() => {
-    const timer = setInterval(() => tick(), 1000);
+    const timer = setInterval(() => tick(), tickRate);
     return () => clearInterval(timer);
-  }, [tick]);
+  }, [tick, tickRate]);
 
   return (
     <div className={`theme-${currentEra} h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-hidden`}>
@@ -396,6 +362,8 @@ const App = () => {
         <Sidebar />
       </div>
 
+      {import.meta.env.DEV && <DebugConsole />}
+
       <footer className="h-6 bg-black border-t border-white/5 px-4 flex items-center justify-between z-50">
         <span className="text-[8px] font-mono text-slate-700 tracking-wider">PROTOCOL_VX // TOPOLOGY_SYNCED</span>
         <div className="flex gap-2">
diff --git a/src/components/DebugConsole.tsx b/src/components/DebugConsole.tsx
new file mode 100644
index 0000000..325a127
--- /dev/null
+++ b/src/components/DebugConsole.tsx
@@ -0,0 +1,115 @@
+import React, { useState, useEffect } from 'react';
+import { useISPStore, Era } from '../store/useISPStore';
+
+const DebugConsole: React.FC = () => {
+  const [isVisible, setIsVisible] = useState(false);
+  const { 
+    money, 
+    addMoney, 
+    resetTopology, 
+    isGodMode, 
+    toggleGodMode, 
+    tickRate, 
+    setTickRate, 
+    currentEra, 
+    setEra,
+    addLog
+  } = useISPStore();
+
+  useEffect(() => {
+    const handleKeyDown = (e: KeyboardEvent) => {
+      if (e.shiftKey && e.key.toLowerCase() === 'd') {
+        setIsVisible(prev => !prev);
+      }
+    };
+
+    window.addEventListener('keydown', handleKeyDown);
+    return () => window.removeEventListener('keydown', handleKeyDown);
+  }, []);
+
+  if (!isVisible) return null;
+
+  return (
+    <div className="fixed bottom-20 left-6 z-[100] w-72 bg-black/80 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.1)] font-mono animate-in fade-in slide-in-from-bottom-4 duration-300">
+      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
+        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
+          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
+          Developer Debug Suite
+        </h3>
+        <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white text-xs">×</button>
+      </div>
+
+      <div className="space-y-4">
+        {/* Economic Cheats */}
+        <div>
+          <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-2 block">Economic Hooks</label>
+          <div className="grid grid-cols-2 gap-2">
+            <button 
+              onClick={() => { addMoney(10000); addLog("DEBUG: Injected $10,000", false); }}
+              className="py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase hover:bg-emerald-500/20 transition-all"
+            >
+              Add $10k
+            </button>
+            <button 
+              onClick={() => { toggleGodMode(); addLog(`DEBUG: God Mode ${!isGodMode ? 'ON' : 'OFF'}`, false); }}
+              className={`py-1.5 border text-[9px] uppercase transition-all ${isGodMode ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white-10 text-slate-400 hover:bg-white/10'}`}
+            >
+              God Mode: {isGodMode ? 'ON' : 'OFF'}
+            </button>
+          </div>
+        </div>
+
+        {/* Era Manipulation */}
+        <div>
+          <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-2 block">Era Simulation</label>
+          <div className="flex gap-2">
+            {(['70s', '90s', 'modern'] as Era[]).map(era => (
+              <button 
+                key={era}
+                onClick={() => { setEra(era); addLog(`DEBUG: Era jumped to ${era}`, false); }}
+                className={`flex-1 py-1 border text-[8px] uppercase transition-all ${currentEra === era ? 'bg-white/20 border-white/40 text-white font-bold' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
+              >
+                {era}
+              </button>
+            ))}
+          </div>
+        </div>
+
+        {/* Time Control */}
+        <div>
+          <div className="flex justify-between items-center mb-1">
+            <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter block">Tick Delta</label>
+            <span className="text-[9px] text-emerald-500">{tickRate}ms</span>
+          </div>
+          <input 
+            type="range" min="100" max="2000" step="100"
+            value={tickRate}
+            onChange={(e) => setTickRate(parseInt(e.target.value))}
+            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
+          />
+          <div className="flex justify-between text-[7px] text-slate-700 mt-1">
+            <span>FAST (0.1s)</span>
+            <span>SLOW (2s)</span>
+          </div>
+        </div>
+
+        {/* Destructive Tools */}
+        <div className="pt-2 border-t border-white/5">
+          <button 
+            onClick={() => { if(confirm("Reset entire topology?")) { resetTopology(); addLog("DEBUG: Topology wiped", true); } }}
+            className="w-full py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase hover:bg-red-500/20 transition-all font-bold"
+          >
+            Reset Topology
+          </button>
+        </div>
+      </div>
+
+      <div className="mt-4 text-[7px] text-slate-600 border-t border-white/5 pt-2">
+        <p>MODE: {import.meta.env.MODE}</p>
+        <p>ACTIVE_CAPITAL: ${money.toLocaleString()}</p>
+      </div>
+    </div>
+  );
+};
+
+export default DebugConsole;
diff --git a/src/store/useISPStore.ts b/src/store/useISPStore.ts
index ee37aa3..5af80e3 100644
--- a/src/store/useISPStore.ts
+++ b/src/store/useISPStore.ts
@@ -21,11 +21,14 @@ export interface ISPLink {
   type: 'cable' | 'fiber' | 'satellite';
 }
 
-const ERAS = {
-  '70s': { threshold: 0, next: '90s' as Era },
-  '90s': { threshold: 10000, next: 'modern' as Era },
-  'modern': { threshold: 100000, next: null }
-};
+export const RANGE_PRESETS = {
+  1: { name: 'LOCAL', viewBox: '250 150 300 300', tier: 1 },
+  2: { name: 'REGIONAL', viewBox: '50 100 400 300', tier: 2 },
+  3: { name: 'NATIONAL', viewBox: '0 0 800 600', tier: 3 },
+  4: { name: 'GLOBAL', viewBox: '0 0 800 800', tier: 4 },
+} as const;
+
+export type RangeLevel = keyof typeof RANGE_PRESETS;
 
 interface ISPStore {
   money: number;
@@ -34,9 +37,11 @@ interface ISPStore {
   links: ISPLink[];
   totalData: number;
   logs: string[];
-  zoomLevel: number;
+  rangeLevel: RangeLevel;
   selectedNodeId: string | null;
   isLinking: boolean;
+  isGodMode: boolean;
+  tickRate: number;
   
   // Actions
   tick: () => void;
@@ -44,38 +49,41 @@ interface ISPStore {
   addNode: (node: ISPNode) => void;
   setEra: (era: Era) => void;
   addLog: (msg: string, isCritical?: boolean) => void;
-  setZoom: (level: number) => void;
+  setRange: (level: RangeLevel) => void;
   selectNode: (id: string | null) => void;
   connectNodes: (sourceId: string, targetId: string) => void;
   toggleLinking: () => void;
+  
+  // Debug Actions
+  addMoney: (amount: number) => void;
+  resetTopology: () => void;
+  toggleGodMode: () => void;
+  setTickRate: (rate: number) => void;
 }
 
 export const useISPStore = create<ISPStore>((set, get) => ({
   money: 5000,
   currentEra: 'modern',
   totalData: 0,
-  zoomLevel: 10,
+  rangeLevel: 1,
   selectedNodeId: null,
   isLinking: false,
+  isGodMode: false,
+  tickRate: 1000,
   logs: ['[SYSTEM] Graph Topology Online. Connect nodes to Core to start revenue.'],
   links: [],
   nodes: [
-    // Layer 1: Local (Core)
-    { id: '0', name: 'Core Gateway', bandwidth: 100, traffic: 0, level: 1, layer: 1, x: 395, y: 260, region: 'EMEA' },
-    // Layer 2: Regional
-    { id: 'l2-0', name: 'West Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 110, y: 280, region: 'AMER' },
-    { id: 'l2-1', name: 'East Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 220, y: 280, region: 'AMER' },
-    // Layer 3: National
-    { id: 'l3-0', name: 'Sampa Hub', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 265, y: 590, region: 'AMER' },
-    { id: 'l3-1', name: 'Tokyo Exchange', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 715, y: 290, region: 'APAC' },
-    // Layer 4: Global
-    { id: 'l4-0', name: 'Transatlantic Cable', bandwidth: 5000, traffic: 0, level: 1, layer: 4, x: 300, y: 310, region: 'EMEA' },
-    { id: 'l4-1', name: 'Pacific Link', bandwidth: 2000, traffic: 0, level: 1, layer: 4, x: 730, y: 610, region: 'APAC' },
+    { id: '0', name: 'Core Gateway', bandwidth: 100, traffic: 0, level: 1, layer: 1, x: 395, y: 260 },
+    { id: 'l2-0', name: 'West Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 110, y: 280 },
+    { id: 'l2-1', name: 'East Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 220, y: 280 },
+    { id: 'l3-0', name: 'Sampa Hub', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 265, y: 590 },
+    { id: 'l3-1', name: 'Tokyo Exchange', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 715, y: 290 },
+    { id: 'l4-0', name: 'Transatlantic Cable', bandwidth: 5000, traffic: 0, level: 1, layer: 4, x: 300, y: 310 },
+    { id: 'l4-1', name: 'Pacific Link', bandwidth: 2000, traffic: 0, level: 1, layer: 4, x: 730, y: 610 },
   ],
 
   tick: () => {
     set((state) => {
-      // 1. BFS for Reachability from Core (ID '0')
       const core = state.nodes.find(n => n.id === '0');
       const reachableIds = new Set<string>();
       
@@ -97,12 +105,6 @@ export const useISPStore = create<ISPStore>((set, get) => ({
         }
       }
 
-      // Check for new disconnections for logging
-      const newlyDisconnected = state.nodes.filter(n => !reachableIds.has(n.id) && n.id !== '0');
-      // Note: We could track previous state to only log when it *becomes* disconnected, 
-      // but for now let's just ensure nodes not reachable are greyed/inactive in UI and yield no revenue.
-
-      // 2. Sim Loop: Node Traffic Drift
       const updatedNodes = state.nodes.map(node => {
         if (!reachableIds.has(node.id)) return { ...node, traffic: 0 };
         const targetScaling = node.layer === 1 ? 0.1 : 0.5;
@@ -111,14 +113,20 @@ export const useISPStore = create<ISPStore>((set, get) => ({
         return { ...node, traffic: Math.max(10, Math.min(node.traffic + drift, node.bandwidth * 1.5)) };
       });
 
-      // 3. Revenue
-      const activeTier = state.zoomLevel <= 25 ? 1 : state.zoomLevel <= 50 ? 2 : state.zoomLevel <= 75 ? 3 : 4;
-      const activeNodes = updatedNodes.filter(n => n.layer === activeTier && n.layer > 1 && reachableIds.has(n.id));
-      const rawRevenue = activeNodes.reduce((sum, n) => sum + n.traffic, 0);
-      const hasOverload = activeNodes.some(n => n.traffic > n.bandwidth);
-      const revenue = Math.floor(hasOverload ? rawRevenue * 0.4 : rawRevenue * 0.8);
+      // 3. Revenue (Hybrid Formula from Issue #2)
+      const activeTier = state.rangeLevel;
+      const allProfitableNodes = updatedNodes.filter(n => n.layer > 1 && reachableIds.has(n.id));
+
+      const rawRevenue = allProfitableNodes.reduce((sum, n) => {
+        const isFocused = n.layer === activeTier;
+        const multiplier = isFocused ? 0.8 : 0.2; // 80% if focused, 20% passive background
+        const nodeRevenue = n.traffic * multiplier;
+        const isCongested = n.traffic > n.bandwidth;
+        return sum + (isCongested ? nodeRevenue * 0.5 : nodeRevenue);
+      }, 0);
+
+      const revenue = Math.floor(rawRevenue);
 
-      // 4. Update Stats
       const totalLoad = updatedNodes.reduce((sum, n) => sum + n.traffic, 0);
       const newTotalData = state.totalData + totalLoad;
       let nextEra = state.currentEra;
@@ -128,18 +136,8 @@ export const useISPStore = create<ISPStore>((set, get) => ({
       const timestamp = new Date().toLocaleTimeString();
       let newLogs = [...state.logs];
       
-      // Log newly disconnected nodes (simplified check)
-      updatedNodes.forEach(node => {
-        const wasReachable = state.nodes.find(n => n.id === node.id)?.traffic !== 0 || node.layer === 1; // approximation
-        if (!reachableIds.has(node.id) && wasReachable && node.id !== '0' && Math.random() > 0.9) {
-           newLogs = [`[${timestamp}] ! Node [${node.name}] disconnected from Core`, ...newLogs].slice(0, 20);
-        }
-      });
-
       if (revenue > 0 && Math.random() > 0.8) {
-        newLogs = [`[${timestamp}] Revenue: +$${revenue} (Focus: Tier ${activeTier})`, ...newLogs].slice(0, 20);
-      } else if (reachableIds.size === 1 && Math.random() > 0.95) {
-        newLogs = [`[${timestamp}] ! ISOLATED: Fiber connectivity required.`, ...newLogs].slice(0, 20);
+        newLogs = [`[${timestamp}] Revenue: +$${revenue} (Combined Focus)`, ...newLogs].slice(0, 20);
       }
 
       return {
@@ -153,41 +151,28 @@ export const useISPStore = create<ISPStore>((set, get) => ({
   },
 
   connectNodes: (srcId, tgtId) => set((state) => {
-    // Explicit string conversion to prevent number/string mismatch
     const sId = String(srcId);
     const tId = String(tgtId);
-    
+    if (state.links.some(l => (l.sourceId === sId && l.targetId === tId) || (l.sourceId === tId && l.targetId === sId))) return state;
+
     const src = state.nodes.find(n => String(n.id) === sId);
     const tgt = state.nodes.find(n => String(n.id) === tId);
-    
     if (!src || !tgt || sId === tId) return state;
 
-    if (state.links.some(l => (l.sourceId === sId && l.targetId === tId) || (l.sourceId === tId && l.targetId === sId))) {
-      return { ...state, isLinking: false, logs: [`[ERROR] Redundant link bypassed.`, ...state.logs].slice(0, 15) };
-    }
-
     const dist = Math.sqrt(Math.pow(src.x - tgt.x, 2) + Math.pow(src.y - tgt.y, 2));
-    const baseCost = 100;
-    const distanceMultiplier = 1.5;
-    const cost = Math.floor(baseCost + (dist * distanceMultiplier));
+    const cost = Math.floor(100 + (dist * 1.5));
     
-    if (state.money < cost) {
+    if (!state.isGodMode && state.money < cost) {
       return { ...state, isLinking: false, logs: [`[ERROR] Low credit: $${cost} required.`, ...state.logs].slice(0, 15) };
     }
 
-    const newLink: ISPLink = {
-      id: `link-${Date.now()}`,
-      sourceId: sId,
-      targetId: tId,
-      bandwidth: 1000,
-      type: 'fiber'
-    };
+    const newLink: ISPLink = { id: `link-${Date.now()}`, sourceId: sId, targetId: tId, bandwidth: 1000, type: 'fiber' };
 
     return {
-      money: state.money - cost,
+      money: state.isGodMode ? state.money : state.money - cost,
       links: [...state.links, newLink],
       isLinking: false,
-      logs: [`[LINK] Established fiber (-$${cost})`, ...state.logs].slice(0, 15)
+      logs: [`[LINK] Established fiber (${state.isGodMode ? 'FREE' : `-$${cost}`})`, ...state.logs].slice(0, 15)
     };
   }),
 
@@ -196,18 +181,33 @@ export const useISPStore = create<ISPStore>((set, get) => ({
     const node = state.nodes.find(n => n.id === id);
     if (!node) return state;
     const cost = Math.floor(50 * Math.pow(1.15, node.level));
-    if (state.money < cost) return state;
+    if (!state.isGodMode && state.money < cost) return state;
     return {
-      money: state.money - cost,
+      money: state.isGodMode ? state.money : state.money - cost,
       nodes: state.nodes.map(n => n.id === id ? { ...n, level: n.level + 1, bandwidth: Math.floor(n.bandwidth * 1.4) } : n),
-      logs: [`[SUCCESS] ${node.name} optimized to LVL ${node.level + 1}.`, ...state.logs].slice(0, 15)
+      logs: [`[SUCCESS] ${node.name} optimized (LVL ${node.level + 1}).`, ...state.logs].slice(0, 15)
     };
   }),
   selectNode: (id) => set({ selectedNodeId: id }),
-  setZoom: (level) => set({ zoomLevel: level }),
+  setRange: (level) => set({ rangeLevel: level }),
   addLog: (msg, isCritical = false) => set((state) => ({
     logs: [`[${new Date().toLocaleTimeString()}] ${isCritical ? '!!! ' : ''}${msg}`, ...state.logs].slice(0, 20)
   })),
   addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
   setEra: (era) => set({ currentEra: era }),
+  addMoney: (amount) => set((state) => ({ money: state.money + amount })),
+  toggleGodMode: () => set((state) => ({ isGodMode: !state.isGodMode })),
+  setTickRate: (rate) => set({ tickRate: rate }),
+  resetTopology: () => set((state) => ({
+    links: [],
+    nodes: [
+      { id: '0', name: 'Core Gateway', bandwidth: 100, traffic: 0, level: 1, layer: 1, x: 395, y: 260 },
+      { id: 'l2-0', name: 'West Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 110, y: 280 },
+      { id: 'l2-1', name: 'East Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 220, y: 280 },
+      { id: 'l3-0', name: 'Sampa Hub', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 265, y: 590 },
+      { id: 'l3-1', name: 'Tokyo Exchange', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 715, y: 290 },
+      { id: 'l4-0', name: 'Transatlantic Cable', bandwidth: 5000, traffic: 0, level: 1, layer: 4, x: 300, y: 310 },
+      { id: 'l4-1', name: 'Pacific Link', bandwidth: 2000, traffic: 0, level: 1, layer: 4, x: 730, y: 610 },
+    ]
+  })),
 }));

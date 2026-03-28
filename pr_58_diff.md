diff --git a/.github/workflows/board-sync.yml b/.github/workflows/board-sync.yml
index 056ec96..8b12794 100644
--- a/.github/workflows/board-sync.yml
+++ b/.github/workflows/board-sync.yml
@@ -11,6 +11,10 @@ on:
     types: [submitted]
   workflow_dispatch:
 
+concurrency:
+  group: ${{ github.workflow }}-${{ github.ref }}
+  cancel-in-progress: true
+
 jobs:
   sync:
     runs-on: ubuntu-latest
@@ -41,5 +45,6 @@ jobs:
           git add SPRINT.md
           if ! git diff --staged --quiet; then
             git commit -m "chore: auto-update SPRINT.md"
+            git pull --rebase origin ${{ github.event.pull_request.head.ref || github.ref_name }}
             git push origin HEAD:${{ github.event.pull_request.head.ref || github.ref_name }}
           fi
diff --git a/SPRINT.md b/SPRINT.md
index 486afa3..620f12b 100644
--- a/SPRINT.md
+++ b/SPRINT.md
@@ -1,26 +1,28 @@
 # 🏃 SPRINT BOARD
 
-> Last updated: Wed, 25 Mar 2026 05:57:35 GMT (UTC)
+> Last updated: Wed, 25 Mar 2026 06:05:06 GMT (UTC)
+
+> ⚠️ **CRITICAL: Project logic is unanchored. Finish the Blueprint first.**
 
 ## 🚨 Critical Path (Blockers)
 
 | Type | #ID | Task/PR Title | Status/Problem |
 | :--- | :--- | :--- | :--- |
+| 📌 Issue | #40 | [[BUG] Link Path Misplacement (Zustand/SVG Sync)](https://github.com/walace-lopes-peng/isp-simulator/issues/40) | `bug`, `logic`, `vfx` |
+| 📌 Issue | #13 | [Implementar Kernel de Estado Global (Zustand)](https://github.com/walace-lopes-peng/isp-simulator/issues/13) | `feat`, `P1-high`, `v1-blocker`, `store`, `state-risk` |
+| 📌 Issue | #2 | [[Bug] [Logic] Revenue Black Hole at Layer 1 Focus](https://github.com/walace-lopes-peng/isp-simulator/issues/2) | `fix`, `P0-blocker`, `v1-blocker`, `store`, `state-risk`, `economy` |
 | 📌 Issue | #46 | [[BUG] UI Formatting: Scientific Notation Fix](https://github.com/walace-lopes-peng/isp-simulator/issues/46) | `bug`, `ui`, `ux` |
 | 📌 Issue | #43 | [[BUG] Phantom Green Circle & Visual Artifacts](https://github.com/walace-lopes-peng/isp-simulator/issues/43) | `bug`, `ui`, `vfx` |
 | 📌 Issue | #41 | [[UX/BUG] Node Disappearance on Range/Zoom](https://github.com/walace-lopes-peng/isp-simulator/issues/41) | `bug`, `ui`, `ux` |
-| 📌 Issue | #40 | [[BUG] Link Path Misplacement (Zustand/SVG Sync)](https://github.com/walace-lopes-peng/isp-simulator/issues/40) | `bug`, `logic`, `vfx` |
-| 📌 Issue | #19 | [chore: implement project governance and contributing standards](https://github.com/walace-lopes-peng/isp-simulator/issues/19) | `docs`, `chore`, `P1-high`, `v1-blocker`, `config` |
 | 📌 Issue | #14 | [Implementar Renderização do Mapa Base Geográfico (SVG)](https://github.com/walace-lopes-peng/isp-simulator/issues/14) | `feat`, `P1-high`, `v1-blocker`, `ui`, `network-nodes` |
-| 📌 Issue | #13 | [Implementar Kernel de Estado Global (Zustand)](https://github.com/walace-lopes-peng/isp-simulator/issues/13) | `feat`, `P1-high`, `v1-blocker`, `store`, `state-risk` |
+| 📌 Issue | #7 | [[Feature] UI Overhaul: Real Geographical Map Interface](https://github.com/walace-lopes-peng/isp-simulator/issues/7) | `feat`, `P0-blocker`, `v1-blocker`, `ui`, `ai-agent`, `network-nodes` |
+| 📌 Issue | #6 | [[UX] Confusing 'Aggregate' State at Initial Zoom (10%)](https://github.com/walace-lopes-peng/isp-simulator/issues/6) | `P1-high`, `v1-blocker`, `ui`, `ai-agent`, `needs-qa` |
+| 📌 Issue | #19 | [chore: implement project governance and contributing standards](https://github.com/walace-lopes-peng/isp-simulator/issues/19) | `docs`, `chore`, `P1-high`, `v1-blocker`, `config` |
 | 📌 Issue | #11 | [[Docs] Developer Onboarding & Gameplay Tutorial System](https://github.com/walace-lopes-peng/isp-simulator/issues/11) | `docs`, `P1-high`, `v1-blocker`, `ai-agent` |
 | 📌 Issue | #10 | [[UX/Gameplay] Intuitive Connective Mechanics & Core Utility](https://github.com/walace-lopes-peng/isp-simulator/issues/10) | `feat`, `P0-blocker`, `v1-blocker`, `topology-engine`, `events` |
 | 📌 Issue | #9 | [[Bug] Node Interaction & Positioning Glitches](https://github.com/walace-lopes-peng/isp-simulator/issues/9) | `fix`, `P1-high`, `v1-blocker`, `ui-3d`, `ai-agent` |
 | 📌 Issue | #8 | [[Bug] Responsive Design: Scale Issues on Desktop & Mobile](https://github.com/walace-lopes-peng/isp-simulator/issues/8) | `fix`, `P1-high`, `v1-blocker`, `ui-theme`, `ai-agent` |
-| 📌 Issue | #7 | [[Feature] UI Overhaul: Real Geographical Map Interface](https://github.com/walace-lopes-peng/isp-simulator/issues/7) | `feat`, `P0-blocker`, `v1-blocker`, `ui`, `ai-agent`, `network-nodes` |
-| 📌 Issue | #6 | [[UX] Confusing 'Aggregate' State at Initial Zoom (10%)](https://github.com/walace-lopes-peng/isp-simulator/issues/6) | `P1-high`, `v1-blocker`, `ui`, `ai-agent`, `needs-qa` |
 | 📌 Issue | #3 | [[Bug] [Visual] Nodes Detached from Perspective Geometry](https://github.com/walace-lopes-peng/isp-simulator/issues/3) | `fix`, `P1-high`, `v1-blocker`, `ui-3d`, `ai-agent` |
-| 📌 Issue | #2 | [[Bug] [Logic] Revenue Black Hole at Layer 1 Focus](https://github.com/walace-lopes-peng/isp-simulator/issues/2) | `fix`, `P0-blocker`, `v1-blocker`, `store`, `state-risk`, `economy` |
 | 📌 Issue | #1 | [feat: implement intelligent project management workflows & AI agent skills](https://github.com/walace-lopes-peng/isp-simulator/issues/1) | `documentation`, `feature`, `workflow`, `architecture`, `feat`, `docs`, `v1-blocker`, `config`, `needs-review` |
 
 ## 🏗️ Phase 1: The Kernel
@@ -31,10 +33,10 @@
 | 📌 Issue | #38 | [[LOGIC] Dynamic Routing & Pathfinding (Realistic Links)](https://github.com/walace-lopes-peng/isp-simulator/issues/38) | `simulation`, `logic`, `vfx` |
 | 📌 Issue | #37 | [[FEAT] Proximity-Based Fog of War](https://github.com/walace-lopes-peng/isp-simulator/issues/37) | `simulation`, `logic`, `ux` |
 | 📌 Issue | #30 | [feat: Living World - Random Incident System](https://github.com/walace-lopes-peng/isp-simulator/issues/30) | `simulation`, `logic`, `difficulty` |
-| 📌 Issue | #17 | [Implementar Navegação de Escala Macro e Micro (Zoom)](https://github.com/walace-lopes-peng/isp-simulator/issues/17) | `feat`, `topology-engine`, `ui`, `performance` |
-| 📌 Issue | #15 | [Desenvolver Sistema Lógico de Fluxo de Dados (Traffic Logic)](https://github.com/walace-lopes-peng/isp-simulator/issues/15) | `feat`, `P2-medium`, `topology-engine`, `simulation`, `traffic` |
 | 📌 Issue | #5 | [[Code Quality] Stale Store Actions Cleanup](https://github.com/walace-lopes-peng/isp-simulator/issues/5) | `chore`, `P2-medium`, `store`, `ai-agent`, `tech-debt`, `cleanup` |
 | 📌 Issue | #4 | [[Bug] [Logic] Era Transition Threshold Inconsistency](https://github.com/walace-lopes-peng/isp-simulator/issues/4) | `fix`, `P2-medium`, `store`, `simulation`, `state-risk` |
+| 📌 Issue | #17 | [Implementar Navegação de Escala Macro e Micro (Zoom)](https://github.com/walace-lopes-peng/isp-simulator/issues/17) | `feat`, `topology-engine`, `ui`, `performance` |
+| 📌 Issue | #15 | [Desenvolver Sistema Lógico de Fluxo de Dados (Traffic Logic)](https://github.com/walace-lopes-peng/isp-simulator/issues/15) | `feat`, `P2-medium`, `topology-engine`, `simulation`, `traffic` |
 
 ## 🏠 Phase 2: The Garage & Immersion
 
@@ -65,5 +67,6 @@
 
 | Type | #ID | Task/PR Title | Status/Problem |
 | :--- | :--- | :--- | :--- |
+| 📌 Issue | #51 | [docs: [LEGAL] Copyright and Asset Usage Verification](https://github.com/walace-lopes-peng/isp-simulator/issues/51) | `documentation`, `dev-tools` |
 | 📌 Issue | #49 | [docs: initialize Project North Star and Strategic Blueprint](https://github.com/walace-lopes-peng/isp-simulator/issues/49) | `documentation`, `architecture`, `P1-high` |
 
diff --git a/scripts/sync-board.js b/scripts/sync-board.js
index 3f48f00..aa38e06 100644
--- a/scripts/sync-board.js
+++ b/scripts/sync-board.js
@@ -18,6 +18,51 @@ async function fetchAll(path) {
   return response.json();
 }
 
+async function closeIssue(issueNumber) {
+  console.log(`Closing Issue #${issueNumber}...`);
+  const response = await fetch(`${API_URL}/issues/${issueNumber}`, {
+    method: 'PATCH',
+    headers: {
+      Authorization: `token ${GITHUB_TOKEN}`,
+      Accept: 'application/vnd.github.v3+json',
+      'Content-Type': 'application/json',
+      'User-Agent': 'ISP-Simulator-Bot'
+    },
+    body: JSON.stringify({ state: 'closed' }),
+  });
+  if (!response.ok) {
+    console.error(`Failed to close issue #${issueNumber}: ${response.statusText}`);
+  } else {
+    console.log(`Issue #${issueNumber} closed successfully.`);
+  }
+}
+
+async function handleAutoClosing() {
+  const eventPath = process.env.GITHUB_EVENT_PATH;
+  if (!eventPath) return;
+
+  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
+  
+  // Only trigger on merged pull requests
+  if (event.action === 'closed' && event.pull_request && event.pull_request.merged) {
+    const body = event.pull_request.body || "";
+    const issueRegex = /(?:close|closes|fixes|fix|resolve|resolves)\s+#(\d+)/gi;
+    let match;
+    const closedIssues = new Set();
+
+    while ((match = issueRegex.exec(body)) !== null) {
+      closedIssues.add(match[1]);
+    }
+
+    if (closedIssues.size > 0) {
+      console.log(`Detected PR merge with issue closing keywords. Processing: ${Array.from(closedIssues).join(', ')}`);
+      for (const issueId of closedIssues) {
+        await closeIssue(issueId);
+      }
+    }
+  }
+}
+
 async function getPRReviewStatus(prNumber) {
   const reviews = await fetchAll(`/pulls/${prNumber}/reviews`);
   if (reviews.some(r => r.state === 'CHANGES_REQUESTED')) return 'BLOCKED';
@@ -27,11 +72,24 @@ async function getPRReviewStatus(prNumber) {
 
 async function run() {
   try {
+    console.log(`Starting Board Sync for ${REPO}...`);
+    if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is missing");
+    if (!REPO) throw new Error("GITHUB_REPOSITORY is missing");
+
+    try {
+      await handleAutoClosing();
+    } catch (autoCloseError) {
+      console.error('Non-critical error in handleAutoClosing:', autoCloseError.message);
+    }
+
     console.log(`Fetching issues and PRs for ${REPO}...`);
-    
-    // Fetch all open items (GitHub includes both issues and PRs in this API)
     const items = await fetchAll('/issues?state=open&per_page=100');
     
+    if (!Array.isArray(items)) {
+      console.error('Unexpected response from GitHub API (not an array):', items);
+      throw new Error('GitHub API did not return an array of issues');
+    }
+    
     // Smart Priority Sync: Weight calculation
     items.forEach(item => {
       const labels = item.labels ? item.labels.map(l => l.name) : [];
diff --git a/src/store/useISPStore.ts b/src/store/useISPStore.ts
index ee37aa3..6b68748 100644
--- a/src/store/useISPStore.ts
+++ b/src/store/useISPStore.ts
@@ -97,54 +97,56 @@ export const useISPStore = create<ISPStore>((set, get) => ({
         }
       }
 
-      // Check for new disconnections for logging
-      const newlyDisconnected = state.nodes.filter(n => !reachableIds.has(n.id) && n.id !== '0');
-      // Note: We could track previous state to only log when it *becomes* disconnected, 
-      // but for now let's just ensure nodes not reachable are greyed/inactive in UI and yield no revenue.
-
-      // 2. Sim Loop: Node Traffic Drift
+      // 2. Sim Loop: Node Traffic and OPEX calculations
+      let totalMaintenanceCost = 0;
       const updatedNodes = state.nodes.map(node => {
+        // Maintenance Cost (OPEX)
+        const baseCost = node.layer === 1 ? 50 : node.layer === 2 ? 20 : node.layer === 3 ? 10 : 5;
+        totalMaintenanceCost += Math.floor(baseCost * Math.pow(1.1, node.level - 1));
+
         if (!reachableIds.has(node.id)) return { ...node, traffic: 0 };
+
+        // Traffic Drift
         const targetScaling = node.layer === 1 ? 0.1 : 0.5;
         const targetTraffic = node.bandwidth * (targetScaling + Math.random() * 0.3);
         const drift = (targetTraffic - node.traffic) * 0.15;
         return { ...node, traffic: Math.max(10, Math.min(node.traffic + drift, node.bandwidth * 1.5)) };
       });
 
+      // Link OPEX
+      totalMaintenanceCost += state.links.length * 5;
+
       // 3. Revenue
-      const activeTier = state.zoomLevel <= 25 ? 1 : state.zoomLevel <= 50 ? 2 : state.zoomLevel <= 75 ? 3 : 4;
-      const activeNodes = updatedNodes.filter(n => n.layer === activeTier && n.layer > 1 && reachableIds.has(n.id));
-      const rawRevenue = activeNodes.reduce((sum, n) => sum + n.traffic, 0);
+      // Rule: Sum traffic of all active nodes connected to Core gateway
+      const activeNodes = updatedNodes.filter(n => n.id !== '0' && reachableIds.has(n.id));
+      const totalTraffic = activeNodes.reduce((sum, n) => sum + n.traffic, 0);
+      
+      // Multiplier based on zoom/era focus (Simplified version of user's request)
       const hasOverload = activeNodes.some(n => n.traffic > n.bandwidth);
-      const revenue = Math.floor(hasOverload ? rawRevenue * 0.4 : rawRevenue * 0.8);
+      const revenue = Math.floor(hasOverload ? totalTraffic * 0.5 : totalTraffic * 1.0);
 
-      // 4. Update Stats
-      const totalLoad = updatedNodes.reduce((sum, n) => sum + n.traffic, 0);
-      const newTotalData = state.totalData + totalLoad;
+      // 4. Update Stats & Economy
+      const newTotalData = state.totalData + Math.floor(totalTraffic / 10);
       let nextEra = state.currentEra;
-      if (newTotalData > 500000) nextEra = 'modern';
-      else if (newTotalData > 50000) nextEra = '90s';
+      if (newTotalData > 1000000) nextEra = 'modern';
+      else if (newTotalData > 100000) nextEra = '90s';
 
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
+      // Event: Logs for revenue/OPEX
       if (revenue > 0 && Math.random() > 0.8) {
-        newLogs = [`[${timestamp}] Revenue: +$${revenue} (Focus: Tier ${activeTier})`, ...newLogs].slice(0, 20);
-      } else if (reachableIds.size === 1 && Math.random() > 0.95) {
-        newLogs = [`[${timestamp}] ! ISOLATED: Fiber connectivity required.`, ...newLogs].slice(0, 20);
+        newLogs = [`[${timestamp}] Revenue: +$${revenue} | OPEX: -$${totalMaintenanceCost}`, ...newLogs].slice(0, 20);
+      }
+
+      // Event: Overload Alert
+      if (hasOverload && Math.random() > 0.9) {
+        newLogs = [`[${timestamp}] ! CRITICAL: Network Saturation detected. Overload penalty active.`, ...newLogs].slice(0, 20);
       }
 
       return {
         nodes: updatedNodes,
-        money: state.money + revenue,
+        money: state.money + revenue - totalMaintenanceCost,
         totalData: newTotalData,
         currentEra: nextEra,
         logs: newLogs
diff --git a/verifyStore.ts b/verifyStore.ts
index fc9c8ad..ff2e85c 100644
--- a/verifyStore.ts
+++ b/verifyStore.ts
@@ -1,32 +1,36 @@
 import { useISPStore } from './src/store/useISPStore';
 
-// Manual simulation since Zustand hooks are usually used in React components
-// However, the core logic is testable through the store object itself
-
 const store = useISPStore.getState();
 
-console.log('Initial State:', store.money, store.nodes);
+console.log('--- Initial State ---');
+console.log('Era:', store.currentEra);
+console.log('Money:', store.money);
+console.log('Nodes:', store.nodes.length);
+
+// 1. Setup a link to enable connectivity
+console.log('\n--- Connecting West Coast Hub to Core ---');
+useISPStore.getState().connectNodes('l2-0', '0');
+console.log('Money after connection cost:', useISPStore.getState().money);
 
-// simulate a few ticks
-console.log('--- Simulating 5 ticks ---');
-for (let i = 0; i < 5; i++) {
+// 2. Simulate ticks and watch Economy
+console.log('\n--- Simulating 10 ticks (Economy Loop) ---');
+for (let i = 0; i < 10; i++) {
+  const prevMoney = useISPStore.getState().money;
   useISPStore.getState().tick();
-  console.log(`Tick ${i + 1}: Money = ${useISPStore.getState().money}`);
+  const state = useISPStore.getState();
+  const diff = state.money - prevMoney;
+  console.log(`Tick ${i + 1}: Money = ${state.money} (Change: ${diff > 0 ? '+' : ''}${diff}), Data = ${state.totalData}`);
+  
+  if (state.logs[0].includes('Revenue')) {
+    console.log('  >> Log:', state.logs[0]);
+  }
 }
 
-// Upgrade node
-console.log('--- Upgrading Core Gateway ---');
-useISPStore.getState().upgradeNode('0');
-console.log('Post-upgrade Money:', useISPStore.getState().money);
-console.log('Post-upgrade Nodes:', useISPStore.getState().nodes);
-
-// Overload node
-console.log('--- Overloading Node ---');
+// 3. Check for Overload Penalty
+console.log('\n--- Simulating Overload ---');
 useISPStore.setState({
-    nodes: [
-        { id: '0', name: 'Core Gateway', bandwidth: 10, traffic: 30, level: 1, layer: 1, x: 400, y: 400 }
-    ]
+    nodes: useISPStore.getState().nodes.map(n => n.id === 'l2-0' ? { ...n, bandwidth: 5, traffic: 20 } : n)
 });
-console.log('Setting traffic to 30 and bandwidth to 10...');
 useISPStore.getState().tick();
-console.log('Money after overload tick (penalized):', useISPStore.getState().money);
+console.log('Latest Log:', useISPStore.getState().logs[0]);
+console.log('Money after overload tick:', useISPStore.getState().money);

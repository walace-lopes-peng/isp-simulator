---
name: workflow-refactoring
description: Protocols for refactoring complex layers of the ISP Simulator without breaking the Kernel MVP loop.
---

# Workflow Refactoring Protocol

When refactoring the ISP Simulator, maintaining the integrity of the active game state is the highest priority. Follow these defined steps:

### 1. Snapshot Development State
Commit cleanly before initiating wide-scale changes.

// turbo

```powershell
git add .
git commit -m "chore: snapshot before refactor"
```

### 2. Decouple Component from Store
If refactoring visual components (like the `LogisticMap` SVG layout), mock store variables locally first. Do not touch `useISPStore.ts` until the SVG layout is pixel-perfect.

### 3. Graph Topology Safety
If migrating from a concentric-ring model to absolute coordinates (`{x, y}`), ensure backwards compatibility. Write mapping scripts or fallback coordinates for existing `ISPNode` implementations to prevent `NaN` errors on render.

### 4. Regression Test Run
Run the dev server and explicitly change eras and zoom levels to ensure state reactivity remains unharmed.

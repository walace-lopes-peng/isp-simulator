# Incident Response & Debugging Protocol

When the ISP Simulator enters a crash state or specific features fail drastically (e.g., "The nodes are not connecting"), follow these steps:

## Level 1: The Build Artifact Shadow
**Symptom**: The UI simply reverts to an old state, components vanish (like `LogisticMap` turning dark), or you see no console errors despite correct `.tsx` code.
**Fix**: 
1. The TypeScript compiler (`tsc`) might have compiled `.js` files alongside `.tsx` files in `src/`. Vite prioritizes `.js` if mapping overlaps.
2. Run a deep wipe: `Get-ChildItem src/ -Include *.js, *.js.map -Recurse | Remove-Item -Force`
3. Clear `dist/`.
4. Restart the Dev Server.

## Level 2: Graph Connectivity Failure
**Symptom**: Clicking nodes registers, but `links` array is not populated, or capital deducts without rendering.
**Fix**:
1. Check ID type matching (`String` vs `Number`). A classic `link.sourceId === node.id` will silently fail if types mismatch.
2. Verify explicit state writes in `connectNodes`. Ensure that the state payload includes: `links: [...state.links, newLink]`.

## Level 3: Traffic Propagation Freezes
**Symptom**: Network is connected, but nodes report 0 throughput. Graph is "ISOLATED".
**Fix**:
1. Inspect the BFS Reachability algorithm in `useISPStore.ts`.
2. Trace the path from Core (Layer 1). If Core drops off the active nodes array (due to semantic zoom logic filtering early), reachability collapses. Ensure Core ID is always mapped correctly before iteration.

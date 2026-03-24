---
description: Safe Refactoring Practices
---
# Workflow Refactoring Protocol

When refactoring the ISP Simulator, maintaining the integrity of the active game state is the highest priority. 

1. **Snapshot Development State**:
   - Commit cleanly before initiating wide-scale changes. Use messages like `chore: snapshot before refactor`.

2. **Decouple Component from Store**:
   - Mock store variables locally if you are refactoring visual components (like the `LogisticMap`) to ensure pure layout isolation.
   - If refactoring the store, write a visual test case or ensure the fallback values render safely on a broken state.

3. **Managing Stale Artifacts (The Vitest/TSC Trap)**:
   - Always verify that Vite is reading `.tsx` files. 
   - Running `tsc` may leave stale `.js` files next to `.tsx` references. If the map or components vanish suddenly, immediately delete `dist/` and any generated `.js` files traversing `src/`.

4. **Graph Topology Safety**:
   - Never break the `links` schema. If upgrading from distance-based links to region-based ones, map existing IDs properly.

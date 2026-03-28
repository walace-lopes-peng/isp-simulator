# Description
**Feature**: Implementation of the decoupled Web Worker simulation engine and v1.6 "Cities: Skylines" roadmap foundations.

## Context
To achieve the "Cities: Skylines for ISPs" vision, the simulation must handle thousands of nodes without impacting UI performance. This PR migrates the "Brain" (physics, economy, topology) to a background thread and establishes the high-fidelity 60Hz tick system.

## What was Changed

### src/systems/SimulationWorker.ts
- **New background engine for graph math and economics**.
- Implemented $dT$ scaling for frame-rate independence (Emergency Fix v1.6.1).
- Added logic for reachability (BFS) and node traffic drift.

### src/store/useISPStore.ts
- **Refactored to asymmetrically sync with the worker**.
- Implemented asynchronous "Snapshot Sync" every 16ms (60Hz).
- Restored 80/20 Tier Focus logic for the new range system.

### src/App.tsx
- **Initialized worker and implemented the "Arcade Terminal" command logger**.
- Updated `LogPanel` with high-contrast "Phosphor" theme for the 70s era.

### docs/blueprint.md
- **Upgraded to v1.6 Master Roadmap**.
- Defined 3-month execution plan (MVP -> Progression -> 3D Transition).

### .agent/
- **Hardened governance rules for branch integrity and zero autonomy**.

## QA Checklist
- [x] Logic is in `useISPStore.ts` and `SimulationWorker.ts`.
- [x] Build passes (`npm run build`).
- [x] Debt recovery implemented (capital reset to $5k).

## Impact on Ship Path
This is the **foundational kernel** for Month 1 (MVP). It unblocks Week 2 (Routing & Packet Physics) and prepares the state for the Month 3 (3D Transition) by ensuring coordinate precision and decoupled logic. This is the GROUND for the rest of the project.

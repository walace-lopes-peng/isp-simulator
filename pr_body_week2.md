# Description
**Feature**: Implementation of weighted Dijkstra pathfinding and exponential signal attenuation ($e^{-kd}$) for the v1.6 "Cities: Skylines" evolution.

## Context
This PR transforms the simulation from a simple reachability engine into a high-fidelity "Packet-Flow" kernel. By implementing Dijkstra's algorithm, data now seeks the most efficient path based on latency and bandwidth. The addition of signal attenuation physics introduces strategic friction, requiring players to build hubs and repeaters to maintain network performance over long distances.

## What was Changed

### src/systems/SimulationWorker.ts
- **Upgraded to weighted Dijkstra search** (Priority Queue based).
- Implemented Euclidean distance calculation for all links.
- Added **Exponential Signal Attenuation** ($e^{-0.002 \cdot d}$) affecting traffic and revenue.

### src/store/useISPStore.ts
- **Refactored to handle per-node Latency and Signal Strength**.
- Added global `avgLatency` tracking for network-wide health reporting.
- Updated node types to reflect physics metrics.

### src/App.tsx
- **Updated TopBar and Sidebar** with real-time physics metrics (ms, %).
- Enhanced "Arcade Terminal" with system-level command feedback.

## QA Checklist
- [x] Dijkstra complexity $O((V+E)\text{log }V)$ verified for throughput.
- [x] Signal Strength drops over long distances ($>300$px).
- [x] Build passes (`npm run build`).

## Impact on Ship Path
This completes the **"Kernel Expansion"** phase. It unblocks **Week 3 (Visual Polish & 90s Era Transition)** and establishes the foundational physics for future tech tree upgrades (Repeaters, Fiber optics).

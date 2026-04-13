# Project Architecture: ISP Simulator

## What the System Is
The ISP Simulator is a state-driven network simulation engine with a React-based visualization layer. It simulates the technical and economic expansion of an internet service provider across historical eras.

## Core Systems
- **Graph Topology**: Powered by a BFS connectivity algorithm to determine network reachability.
- **Traffic Simulation**: A mathematical model that calculates load, bandwidth saturation, and packet loss.
- **Centralized State**: Managed exclusively via a Zustand store (`useISPStore.ts`), acting as the single source of truth.
- **Frame-based Update Loop**: Driven by a coordinated `tick()` function to ensure synchronization between simulation logic and UI rendering.

## Core Invariants
- **Source of Truth**: The UI is a projection of state, not a source of logic. No business logic should reside in React components.
- **Connectivity Anchor**: All traffic must originate from or route back to the "Layer 1" (Core Gateway) node.
- **Deterministic Simulation**: A given state plus a simulation tick must produce a predictable next state.

## What Must Never Change
- **State Isolation**: The separation between the simulation engine (store) and the rendering layer (React).
- **Coordinate System**: Nodes must use absolute coordinates for deterministic map positioning.
- **Tick Integrity**: The simulation runs on a configurable tick rate (default: 16ms for 60 FPS, adjustable via Debug Console).

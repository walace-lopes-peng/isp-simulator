# 🔍 Senior Code Review Skills

Standardized review protocol for the ISP Simulator. Use these rules to evaluate any PR.

## 1. State Isolation (Zustand)
- **Rule**: All mathematical transformations (revenue, BFS, era scaling) MUST occur inside `useISPStore.ts`.
- **Failure**: Any `Math.floor` or `sum` calculation inside a React component is a blocker.

## 2. Type Safety & ID Handling
- **Rule**: Always use `String(id)` when comparing node or link identifiers.
- **Context**: Prevents silent logic failure when IDs come from different sources (DOM, JSON, API).
- **Example**: `const node = nodes.find(n => String(n.id) === String(targetId))`

## 3. Topologia & BFS
- **Rule**: Any change to `nodes` or `links` must be validated against the BFS reachability loop.
- **Check**: Does the change break the path to Layer 1 (Core Gateway)?

## 4. UI Rendering (Performance)
- **Rule**: Minimize re-renders in the global `tick`.
- **Check**: Pure components only. Use `memo` where applicable for high-density node clusters.

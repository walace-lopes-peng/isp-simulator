# ISP Simulator — Tech Lead Code Project Guide

## What This Project Is

Minimalist strategic network simulator where the user expands an ISP backbone across three eras (70s, 90s, Modern). Client-side only — no backend, no auth, no database. Target users: Web desktop users exploring graph algorithms and idle-game mechanics.

## Dev Commands

```bash
npm run dev      # Dev server at http://localhost:5174 (or next available port)
npm run build    # Production build → dist/
npm run preview  # Serve dist/ locally
```

## Architecture

Main app logic is strictly decoupled. The UI is a pure rendering layer over a mathematically rigorous Graph Topology engine.

- `src/main.tsx` — mounts React app, sets up global styling
- `src/App.tsx` — layout, sidebar, log panel, and semantic zoom wrapper
- `src/store/useISPStore.ts` — single source of truth (Zustand). Contains BFS reachability algorithm, state tick loop, era transitions, and all revenue math
- `src/index.css` — Tailwind directives and visual era theming classes (`.theme-70s`, etc)

## Code Conventions

- UI strings in **English**, all code identifiers in **English**
- **Tailwind only** for styling — no scoped CSS blocks unless there is no Tailwind equivalent (like complex `@keyframes`)
- React FC components — no class components
- `useISPStore` for state — no Redux, no Context API for core loops
- Strictly absolute coordinates for `nodes` (`x`, `y`) — no flexbox or grid for the Network Map items

## The Topology System

The `links` and `nodes` arrays in `useISPStore.ts` drive the entire game. Traffic only accrues on nodes that have a valid BFS path back to `Layer 1` (Core Gateway). Modifying this system requires strict ID type matching (`String` representation).

## Do Not Touch (Intentional Decisions)

- `requestAnimationFrame` or `setInterval` ticking pure mathematical functions in `App.tsx`'s root `useEffect` — do not create distributed or nested intervals across child components.
- The `zoomLevel` thresholds (25, 50, 75) dictating Layer 1 vs Layer 4 visibility.
- Erasing `dist/` and `src/*.js` when Vita fails to update the `.tsx` UI.

## Git Workflow

All feature/fix PRs target `dev` (or `releases`), never `main` directly. 

- `feat/*` or `fix/*` -> merged into `dev`
- `dev` -> merged into `main` at milestones for production deploy

## Roadmap Context

**Phase 1 & 2:** MVP Kernel and Map rendering (Done)
- Zustand store, simple node scaling, CSS eras, semantic zoom, coordinate graph.

**Phase 3:** Graph Topology Connectivity (Done)
- BFS traffic reachability, `connectNodes` action, physical cable rendering. 

**v1.0 (Next):** Dynamic progression and events
- Tech tree research logic.
- Random events (fiber cuts, traffic spikes).

# AGENTS.md

Canonical reference for AI agents operating in this repository.

## Commands

```bash
npm run dev        # Dev server at http://localhost:5173 (HMR)
npm run build      # TypeScript check + Vite production build -> dist/
npm test           # Vitest (run mode, no watch)
npm run preview    # Serve production build locally

# Architectural compliance linter (run before PRs)
node scripts/ai-linter.js
```

Pre-PR checklist: `npm run build && npm test && node scripts/ai-linter.js`

## Architecture

**ISP Simulator** -- a browser-based game simulating ISP expansion across 6 historical eras (70s through Modern). React 19 + TypeScript + Zustand + Vite + Tailwind.

### The Iron Rules

1. **Zustand is the SSoT.** ALL business logic and math lives in `src/store/useISPStore.ts`, primarily inside `tick()`. React components are dumb projectors of state -- zero business logic.
2. **State isolation is non-negotiable.** The simulation engine (store + systems) and the rendering layer (React) must remain completely separated.
3. **Absolute coordinates only.** Nodes use deterministic `x,y` positioning via Mercator projection (`src/utils/geoUtils.ts`). No relative positioning on the map.
4. **Tick integrity.** The simulation runs on a configurable `tick()` pulse (default 16ms / ~60 FPS). All state transitions happen through this heartbeat.
5. **Connectivity anchor.** All traffic must trace back to the Core Gateway (node ID `'0'`, Layer 1) via BFS reachability.

### Layer Map

```
src/store/useISPStore.ts   -- State + all game logic (SSoT)
src/systems/               -- Pure calculation functions (SimulationWorker: Dijkstra, attenuation physics, traffic sim)
src/components/            -- Dumb UI components (rendering only)
src/utils/                 -- Helpers (geoUtils for Mercator projection)
src/config/eraConfig.json  -- Era definitions with modifiers (attenuation, revenue, maintenance)
```

### Data Flow

```
User interaction -> React component -> Zustand store action -> SimulationWorker (async) -> Store state update -> React re-render (via Zustand subscription)
```

### Key Types (defined in useISPStore.ts)

- `ISPNodeType`: `'terminal' | 'hub_local' | 'hub_regional' | 'backbone'`
- `RangeLevel`: `1 | 2 | 3 | 4` (LOCAL, REGIONAL, NATIONAL, GLOBAL zoom)
- Node IDs are strings -- always cast with `String(id)`

### Era System

Six eras in `src/config/eraConfig.json`, each with `modifiers` (signalAttenuation, revenueMultiplier, maintenanceCost), `unlockCondition` (money + totalData thresholds), and `uiTheme` CSS class. Attenuation formula: `K_ATTENUATION = (era modifier) / 1000`.

### Formulas

- Link cost: `100 + (Distance * 1.5)`
- Upgrade cost: `50 * (1.15 ^ level)`, grants +40% bandwidth

## Workflow & Conventions

### Git

- **Branches:** `main` (production) / `dev` (integration) / `feature/*` or `fix/*`
- **Never work on `main` or `dev`** unless explicitly instructed
- **Conventional Commits:** `type(scope): description (#issue_id)` -- types: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`, `test`
- **Anchor to issues:** Every commit references a GitHub issue ID
- **Atomic commits:** Group related store + UI changes together

### TDD (Mandatory)

Write a failing Vitest test BEFORE implementing logic. Tests are colocated: `Foo.test.ts` next to `Foo.ts`.

### PRs

- Read `.github/PULL_REQUEST_TEMPLATE.md` before creating any PR
- Every PR must include a "Manual QA Runbook" (step-by-step verification)
- Run the pre-PR checklist (build + test + ai-linter) before submitting

## Governance Files

| File | Purpose |
|------|---------|
| `docs/blueprint.md` | PROJECT_BLUEPRINT -- the living architectural vision (primary source of truth) |
| `AI_RULES.md` | Mandatory operational constraints (Gold Standard, TDD, token conservation) |
| `agent-instructions.md` | Master protocol for AI agents |
| `ARCHITECTURE.md` | Core invariants and what must never change |
| `.agent/code-standards.md` | Code style patterns (Portuguese) |
| `.agent/balancing-logic.md` | Game balance documentation |
| `.agent/git_steward_protocol.md` | Git workflow enforcement |
| `ROADMAP.md` | Strategic roadmap (Pioneer/Expansion/Domination phases) |
| `SPRINT.md` | Auto-updated sprint board with active issues |

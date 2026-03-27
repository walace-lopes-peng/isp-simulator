# ISP Simulator: Project Blueprint & Architecture

As the technical lead, this blueprint transforms our working prototype into a scalable, professional, and maintainable game repository. This document serves as the guide for our upcoming refactor and future development.

## 1. 📂 Folder Structure & Architectural Decisions

Our goal is **Separation of Concerns**. UI should not contain game math; global state should be minimal.

```text
src/
├── assets/          # Static files (images, sounds, icons)
├── components/      # Dumb, reusable UI components (Buttons, Modals, ProgressBars)
├── features/        # Smart, scoped components handling specific game systems (Map, HUD, Nodes)
├── hooks/           # Custom React hooks bridging systems/store to UI (useGameLoop, useEconomy)
├── store/           # Zustand state management (split into logical slices if needed)
├── systems/         # PURE GAME LOGIC classes/functions (Engine, Economy, Traffic). NO REACT HERE.
├── styles/          # Global CSS, Tailwind configurations, animation keyframes
├── types/           # Global TypeScript interfaces (ISPNode, Era, GameState)
└── utils/           # Helper functions (math, string formatting, array manipulation)
```

**Why this structure?**
- **Testability**: Pure functions in `systems/` can be unit tested without mounting React components.
- **Maintainability**: When the UI changes, `systems/` remains untouched. When math changes, UI is untouched.
- **Scalability**: Adding a new feature (e.g., "Research Tree") simply means adding a new folder in `features/` and logic in `systems/`.

---

## 2. 🔄 Refactoring Plan (Step-by-Step)

To move from our monolithic prototype to this structure, we will execute the following refactoring steps in order:

1. **Extract Types & Utilities**
   - Move `ISPNode`, `Era`, etc., to `src/types/game.ts`.
   - Move config constants (like `ERAS`) to `src/utils/constants.ts`.

2. **Isolate Game Logic (Systems)**
   - Create `src/systems/engine.ts` to handle the `tick` calculation.
   - Create `src/systems/economy.ts` for revenue, upgrade costs, and congestion penalties.
   - Refactor `useISPStore` to strictly hold state and call these pure system functions inside its actions.

3. **Break Down the Monolith (`App.tsx`)**
   - Extract `LogisticMap` to `src/features/map/LogisticMap.tsx`.
   - Extract `NodeModule` to `src/features/nodes/NodeCard.tsx`.
   - Extract HUDs (`ZoomSlider`, `HUDStats`) to `src/features/hud/`.
   - Extract small generic UI like `StatusIndicator` to `src/components/`.

4. **Implement Custom Hooks**
   - Create `src/hooks/useGameLoop.ts` to handle `setInterval` and trigger the store's `tick` action, keeping `App.tsx` clean.

---

## 3. 🧩 File Organization & Examples

### The "Dumb/Smart" Component Rule
- **`components/ProgressBar.tsx` (Dumb)**: Takes `value` and `max` as props. Renders a div.
- **`features/nodes/NodeCard.tsx` (Smart)**: Takes a `nodeId`, connects to Zustand, gets live traffic data, and uses `ProgressBar` to render it.

---

## 4. 📐 Coding Standards & Conventions

- **Naming:**
  - Components/Interfaces: `PascalCase` (`NodeCard.tsx`, `ISPNode`).
  - Functions/Hooks/Variables: `camelCase` (`useGameLoop`, `calculateRevenue`).
  - Constants: `UPPER_SNAKE_CASE` (`MAX_NODES`).
- **State Usage Rules:**
  - Avoid large object selectors. Use specific atomic selectors to prevent unnecessary re-renders.
- **File Organization:**
  - One primary component per file.

---

## 5. 🗺️ Next Development Steps (Roadmap)

Once the architectural refactor is complete, we will focus on these gameplay features in order:

1. **Map System Expansion:** Finalize the visual transitions between `zoomLevel` states (Local vs Global).
2. **Node Connections (Cables):** Allow players to explicitly buy connections between nodes to route traffic.
3. **Data Flow Animations:** Enhance the SVG map with moving particles along the flow lines.
4. **Scaling System & Events:** Introduce random events (fiber cuts, DDOS attacks) and technology research.

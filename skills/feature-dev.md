---
name: feature-dev
description: Implement new mechanics, UI updates, or game rules for the ISP Simulator. Use when the user requests a new feature mapped to the ROADMAP.
---

# Feature Development Protocol

Use this skill when the user wants to add a new game element. The output should ensure strict separation of concerns and maintain the Graph Topology invariants.

## Inputs to confirm from context
Infer these when possible. Ask only if the missing detail would materially change the result.

- Is this purely visual (Tailwind) or logic-driven (Zustand)?
- Does this interact with the BFS reachability algorithm?
- Does it require a new state slice in `useISPStore.ts`?

## Phase 1: State Definition First
Always begin feature development at the store level.

1. Open `src/store/useISPStore.ts`.
2. Update the relevant TS interfaces (`ISPStore`, `ISPNode`, or `ISPLink`).
3. Define the initial fallback states for backwards compatibility.

## Phase 2: Actions & Pure Logic
Write the logic without touching the UI.

1. Create the Zustand action.
2. If it affects traffic routing, update the BFS loop in `tick()`.
3. Use `Set`, `Array.map`, and pure functions. Never use DOM selectors here.

## Phase 3: Visual Representation (React)
Wire the logic to the visual layer.

1. Identify the component in `App.tsx`.
2. Read the state precisely: `const { newState } = useISPStore();`
3. Wire the UI exclusively using Tailwind tokens (`bg-slate-900`, etc).

## Phase 4: Verify Thematic Constraints

- Ensure the feature honors `.theme-70s`, `.theme-90s`, and `.theme-modern` class names applied at the root container.
- DO NOT hardcode colors (like `bg-red-500` instead of a thematic variable) if it clashes with the visual epoch.

## Fallback behavior
If the new feature completely breaks the `LogisticMap` (e.g., blank screen):
- Revert the `useISPStore.ts` logic to the last working snapshot.
- State clearly to the user which algorithm failed (e.g., "The BFS queue stalled due to an invalid link ID").

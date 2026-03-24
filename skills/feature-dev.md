---
description: Feature Development Guidelines for the ISP Simulator
---
# Feature Development Workflow

When implementing new features for the ISP Simulator, you must follow this strict sequence:

1. **State Definition First**: 
   - Open `src/store/useISPStore.ts`.
   - Update the relevant interface (`ISPStore`, `ISPNode`, or `ISPLink`).
   - Provide fallback states to avoid breaking backwards compatibility with existing saves or live instances.

2. **Actions & Pure Logic**:
   - Write the Zustand action.
   - If the feature involves graph updates (like adding cables, nodes, or hubs), you must account for `x, y` mapping and BFS reachability calculations.
   - Use `Array.map`, `Set`, and strictly pure functions.

3. **Visual Representation (React)**:
   - Identify which component needs the new state slice.
   - Fetch exactly what you need cleanly using `const { item } = useISPStore();`.
   - Wire the UI exclusively using Tailwind CSS tokens (`bg-slate-900`, `text-emerald-500`, etc).

4. **Verify Thematic Constraints**:
   - Ensure you are honoring the `.theme-70s`, `.theme-90s`, and `.theme-modern` global modifiers.
   - DO NOT hardcode colors that clash with visual epochs.

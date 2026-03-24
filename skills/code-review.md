---
description: Tech Lead Code Review Standards
---
# Code Review Standards

As the Tech Lead, enforce the following rules when reviewing PRs or validating changes:

## 1. Architectural Coupling
- 🔴 REJECT any PR that mixes game logic (traffic calculations, cost formulas) into React components.
- 🟢 APPROVE PRs that cleanly dispatch store actions (e.g., `upgradeNode(node.id)`) from the UI.

## 2. Performance & Interval Safety
- Check for rogue `setInterval`, `setTimeout`, or un-debounced event listeners.
- The simulation loop must trigger from a single root `setInterval`/`useEffect` calling `tick()` (usually `App.tsx`). Multiple timers will desync the game.

## 3. Typings and Contracts
- Look closely at ID types. Graph linking issues often stem from confusing `String(id)` with `Number(id)`. Ensure uniform ID types (`string` preferred, e.g., `l1-0`, `link-timestamp`).

## 4. UI Cleanliness
- Review SVG elements for proper standard props (e.g., `strokeWidth`, `strokeDasharray`).
- Warn against custom CSS classes when a Tailwind equivalent exists, unless absolutely necessary for complex `@keyframes`.

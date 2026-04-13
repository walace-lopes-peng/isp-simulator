# Master Protocol

## 1. Token Conservation
- Keep replies under 3 sentences.
- Output max 30 lines of code unless creating a new file.
- Start directly with the solution; do not summarize the prompt.
- Ask for permission before structural repo scans.

## 2. Pre-Flight & Governance
- Read `PROJECT_BLUEPRINT.md`, `.agent/git_steward_protocol.md`, and `.github/PULL_REQUEST_TEMPLATE.md` before acting.
- Verify active branch (`feat/` or `fix/`). Do not work on `main` or `dev` unless explicitly instructed.
- Anchor all work to specific Issue IDs or Milestones (e.g., `#11`).
- Require explicit "Implement" prompt before making architectural pivots or introducing major systems.
- Group related changes atomically per commit.
- Use Conventional Commits: `type(scope): description (#id)`.

## 3. Structural Guardrails
- Core Logic: Use Zustand (`src/store/useISPStore.ts`) for all math and business logic, exclusively within `tick()`.
- UI: Use React components solely for rendering (Dumb UI).
- Stylization: Apply Vanilla/Tailwind CSS emphasizing Cyberpunk/Windows 95/Neon aesthetics.
- Positioning: Use absolute `x,y` coordinates for map elements.
- Typing: Enforce strict types (`Era`, `ISPNode`, `ISPLink`). Cast numeric IDs using `String(id)`.

## 4. Performance & Validation
- Throttle `tick()` to prevent render loop overload.
- Optimize SVG maps to minimize path points.
- Run `npm run build`, `npm test`, and `node scripts/ai-linter.js` before submitting any PR.
- Critical architectural violations trigger automatic REVERT.

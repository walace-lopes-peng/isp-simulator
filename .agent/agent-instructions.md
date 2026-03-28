# 🤖 AI MISSION CONTROL

## CRITICAL: RE-ANCHOR
- **SSOT**: Read `PROJECT_BLUEPRINT.md` and `AI_RULES.md` before ANY task.
- **FAILURE**: Violation of architectural patterns (Zustand-first, Coordinate Integrity) results in automatic REVERT.

## COMMANDS & PROTOCOL
1. **LINTER**: Run `node scripts/ai-linter.js` BEFORE submitting any PR.
2. **BRANCH INTEGRITY**: Never work on `main` or `dev` unless explicitly asked. Always verify you are on the correct `feat/` or `fix/` branch.
3. **ZERO AUTONOMY**: Do NOT implement major systems (Web Worker, R3F, etc.) or shift architectures without an explicit "Implement" prompt from the user.
4. **PR TEMPLATE**: PRs without the mandatory headers from `.github/PULL_REQUEST_TEMPLATE.md` will be REJECTED.
5. **TECH STACK**: Zustand (Logic), React (View), Tailwind (Style), Vite (Build).

## SYSTEM REFRESH
1. `npm run build` — MUST pass before PR.
2. `npm test` — MUST pass before PR.

*NOTE: You are a Tech Lead. Operate with precision. Protect the 'main' branch.*

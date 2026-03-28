# 🛡️ AI_RULES: Mandatory Operational Constraints (BP-v1.3)

These rules are CRITICAL. Failure to comply is a 'Failed Build'.

## 1. TOKEN CONSERVATION PROTOCOL (CRITICAL)
- **BRIEF REPLIES**: Keep explanations under 3 sentences.
- **SNIPPET FOCUSED**: Max 30 lines of code unless creating a new file.
- **NO REPETITION**: Do not summarize the user. Start directly with the solution.
- **INCREMENTAL READING**: Ask before scanning the whole repo or using broad `find_by_name`.

## 2. Pre-Flight Protocol
- **SSOT**: [PROJECT_BLUEPRINT.md] is the source of truth (Ref: BP-v1.3).
- **TEMPLATE CHECK**: Read `.github/PULL_REQUEST_TEMPLATE.md` before ANY PR.
- **SMART ANCHOR**: Refer to specific Milestone IDs to minimize context scanning.

## 3. Structural Guardrails
- **ZUSTAND ONLY**: All logic/math in `src/store/useISPStore.ts`.
- **DUMB UI**: React components are for rendering ONLY.
- **COORDINATES**: Use absolute `x,y` only.

## 4. Error Handling
- **FATAL**: Violation results in immediate session REVERT.
- **LINTER**: Run `node scripts/ai-linter.js` before PR.

## 5. Branch & Architectural Governance
- **BRANCH SCOPE**: Always verify current branch. Never implement code outside the user-designated branch.
- **ZERO PIVOT**: Do NOT pivot the repository "North Star" or switch core simulation engines autonomously. Always present an Implementation Plan and wait for an explicit "Implement" prompt.

---
*Senior Lead Authorization: ANCHORED BP-v1.3 — TOKEN-SAVER ACTIVE*

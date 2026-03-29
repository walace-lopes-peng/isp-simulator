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

## 5. THE GOLD STANDARD (Staff Workflow) (CRITICAL)
- **TDD MANDATORY**: Propose a Vitest `test` file that fails before implementing logic.
- **SEVEN-STEP AUDIT**: Self-audit for performance (leaks) and resilience (edge cases).
- **PR RUNBOOK**: Every PR MUST include a "Manual QA Runbook" (Step-by-step).
- **ARCHITECTURE**: Separation of concerns (Zustand logic vs. Worker physics) is non-negotiable.

---
*Senior Lead Authorization: ANCHORED BP-v1.4 — GOLD STANDARD ACTIVE*

# ISP SIMULATOR: MASTER PROTOCOL

## 1. 🛡️ TOKEN CONSERVATION (MANDATORY)
- **Zero Chatter**: No intros ("Sure!"), no summaries, no "Hope this helps." Start with code/data.
- **Partial Diffs**: Never output full files. Use `// ...` for unchanged code. Max 30 lines/snippet.
- **Brevity**: Explanations must be $\le$ 2 sentences. If code is clear, 0 sentences.
- **Incremental**: Ask before scanning the full repo.

## 2. 🛠️ TECHNICAL GUARDRAILS
- **State Isolation**: ALL math/logic (revenue, scaling, BFS) MUST stay in `src/store/useISPStore.ts`.
- **Dumb UI**: React components render only. No `Math.floor` or calculations in JSX.
- **ID Handling**: Always use `String(id)` for comparisons to prevent JSON/API type mismatches.
- **Topology**: Every node/link change must be validated against the BFS loop to Layer 1.

## 3. 🎭 GIT STEWARD & SPRINT PROTOCOL
- **Atomic Commits**: Group logic (Store) and view (UI) changes in one commit.
- **Conventional**: `type(scope): description (#issue_id)`. Anchor every task to an Issue ID.
- **Sprint Integrity**: Do NOT modify project metadata, sprint board automation, or milestone files unless explicitly commanded.
- **Pre-Flight**: Run `node scripts/ai-linter.js`, `npm run build`, and `npm test` before any PR.

## 4. 📋 PR & REVIEW CHECKLIST
Every PR submission MUST include:
- **Summary**: 1-sentence impact.
- **Logic Check**: Confirming all math is in Zustand.
- **Topology Check**: Confirming BFS reachability is intact.
- **Issue Ref**: Linked #ID.
*Reject PRs missing these headers.*

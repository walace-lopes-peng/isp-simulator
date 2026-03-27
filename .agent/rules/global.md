# Global Governance Rules

These rules ensure architectural integrity and professional repository management.

## 1. Mandatory Planning Artifacts
- **Task Management**: Always start any non-trivial task by creating/updating a `task.md` artifact to track progress.
- **Implementation Plan**: Before modifying code, create an `implementation_plan.md` and wait for user approval (LGTM).

## 2. Core Architecture (Strict)
- **SSoT (Single Source of Truth)**: ALL simulation logic, economic math, and state transitions MUST reside3. **Execution (Phase-based)**
   - **Phase 1: State Definition**: Open `src/store/useISPStore.ts` and update interfaces and initial states.
   - **Phase 2: Actions & Logic**: Implement the Zustand actions and logic (e.g., BFS updates) before touching the UI.
   - **Phase 3: Visuals**: Wire the state to the UI components using Tailwind tokens.
   - **Phase 4: Theme Audit**: Verify the feature honors the era-specific container classes.
venue, latency, or traffic inside a `.tsx` file.
- **Era Consistency**: Use dynamic Tailwind classes for styling. Use `.theme-70s`, `.theme-90s`, and `.theme-modern` class names applied at the root container. Never hardcode colors that are not theme-aware.
- **BFS Integrity**: Any change to the topology or traffic must maintain the BFS reachability algorithm in the `tick()` loop. If the `LogisticMap` breaks (e.g., blank screen), revert the logic to the last working snapshot.

## 3. GitHub & Branching Protocol
- **Default Branch**: Use `dev` as the primary development branch.
- **Branch Naming**: Follow the pattern `feature/issue-XX-short-description`.
- **PR Template**: ALWAYS use the project's PR template and fill in the QA checklist.
- **No Direct PRs**: Never open a PR without the user's explicit consent.

## 4. Development Tools
- **Debug Menu**: Always keep the `DebugConsole` functional. Ensure it remains toggled by `Shift + D` and is only rendered in `DEV` mode.

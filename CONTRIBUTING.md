# Contribution Guide

> **Before starting:** Check the active Sprint Board or Issues list to see what is currently in progress, what needs review, and what you should NOT touch yet. 

To maintain the architectural stability of the **ISP Simulator** and ensure a clean kernel MVP, we follow a strict and robust workflow.

## Branch Workflow

All contributions must follow our naming conventions and integration flow:

### 1. Branch Types
- **Features**: Use the prefix `feat/` (e.g., `feat/tech-tree`).
- **Fixes**: Use the prefix `fix/` (e.g., `fix/bfs-isolation`).
- **Architecture/Refactoring**: Use `docs/` or `refactor/` (e.g., `refactor/store-slices`).

### 2. Base Target
> [!IMPORTANT]
> All `feat/` and `fix/` Pull Requests must target the **`dev`** branch.

DO NOT open Pull Requests directly against `main` unless it is a critical production hotfix.

### 3. Integration Pipeline
- **`feat/*` or `fix/*`** → Merged into **`dev`**.
- **`dev`** → Accumulates changes and undergoes integration testing.
- **`main`** → Receives the merge from `dev` at specific milestones for a stable production release.

## Commit Standards

We strictly use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` for new features or topology mechanics.
- `fix:` for bug fixes in logic or UI.
- `docs:` for documentation updates (like `agent-instructions.md`).
- `refactor:` for code restructurings that do not change external behavior.

## Code Review (Tech Lead Rules)

Every PR approval must meet minimum quality standards to protect the Graph Topology engine. Generic or empty reviews ("LGTM") are unacceptable.

### Rules

1. **Mandatory Issue Reference** — Every Pull Request MUST include the issue it addresses using the `Closes #NUMBER` syntax in the summary.
   
2. **Leanness & Accuracy** — Do not use placeholders like "N/A". If a section of the PR template is not relevant to your changes, simply remove it.
   
3. **Architectural Focus** — Screenshots are NOT required and are considered less relevant than technical context. Focus your description on the "Why" and the architectural impact.

4. **Mandatory Body** — Every approval MUST state exactly what was tested in the simulation. Empty approvals will be rejected.
   
5. **Inline Comments** — When discussing code architecture, point to specific lines using inline GitHub comments.

6. **Structured Feedback for Change Requests** — Organize feedback into clear sections:
   - **Blockers** — Violations of the separation of concerns (e.g., placing traffic logic in React).
   - **Praise** — Acknowledge elegant graph iterations.

7. **QA Checklist Enforcement** — The reviewer must personally verify the items marked by the author in the PR checklist (e.g., "Tested BFS isolation").

6. **Cross Validation** — The author cannot be the sole approver. If the Tech Lead opens a PR, another peer must validate the architectural constraints before merging.

---

Thank you for contributing to the **ISP Simulator**! Keeping our architecture decoupled keeps our network running.

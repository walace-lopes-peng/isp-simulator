---
description: Implement a new feature from an issue.
---

1. **Research & Sync**
   - Read the issue description using `gh issue view ID`.
   - Checkout `dev` and pull latest changes: `git checkout dev && git pull origin dev`.
   - Create a feature branch: `git checkout -b feature/issue-ID-description`.

2. **Planning**
   - Create/Update `task.md` with detailed steps.
   - Create `implementation_plan.md` following the repository conventions.
   - Present the plan to the user and wait for `LGTM`.

3. **Execution**
   - Modify `useISPStore.ts` first (logic layer).
   - Implement/Update UI components (visual layer).
   - Use `conventional commits` throughout the process.

4. **Verification**
   - Run `npm run build` to ensure no regressions.
   - (Optional) Use `verifyStore.ts` for logic simulations.
   - Create a `walkthrough.md` artifact showing the results.

5. **Closing**
   - Create a Pull Request using the project template: `gh pr create --body-file ... --base dev`.
   - Notify the user of the final result.

---
description: Fix a bug or logic error.
---

1. **Diagnosis**
   - Reproduce the error if possible.
   - Create a small verification script (e.g. in `/tmp/`) to isolate the logic flaw.
   - Document findings in `task.md`.

2. **Fix**
   - Correct the logic in `useISPStore.ts`.
   - Apply UI fixes if the bug is visual.

3. **Validation**
   - Run the verification script again to confirm the fix.
   - Run `npm run build`.

4. **Update & Notify**
   - Commit the fix with `fix: ...`.
   - Present the solution and proof of fix to the user via a `walkthrough.md`.

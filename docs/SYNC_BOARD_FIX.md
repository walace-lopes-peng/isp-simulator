# Sprint Board Sync Fix Guide 🏃

## The Problem
The project is configured as `"type": "module"` in `package.json`, which means Node.js treats all `.js` files as ES modules. The `sync-board.js` script was using `require()`, which is a CommonJS feature and causes a `ReferenceError: require is not defined` in modern Node environments.

## Solution: Convert to ES Modules (Recommended)
This keeps the codebase consistent with modern standards.

### Steps
1. **Change imports**: Replace `const fs = require('fs');` with `import fs from 'fs';`.
2. **Update script execution**: Ensure you are using a compatible Node version (v18+ recommended).

### Alternative: Rename to .cjs
If you want to keep using CommonJS without changing the code:
1. Rename `scripts/sync-board.js` to `scripts/sync-board.cjs`.
2. Update `.github/workflows/sprint-board-sync.yml` to call the new filename.

## Verification
Run the script locally to confirm it parses correctly:
```bash
node scripts/sync-board.js
```
*Note: This will fail with a 401/404 if GITHUB_TOKEN is missing, but it confirms the syntax is valid.*

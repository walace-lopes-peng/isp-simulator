# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**All project context, architecture, and conventions are in [AGENTS.md](AGENTS.md).** Read it first.

## Quick Reference

```bash
npm run dev                    # Dev server (localhost:5173)
npm run build                  # TypeScript + Vite build
npm test                       # Vitest
node scripts/ai-linter.js     # Architectural linter
```

## Critical Constraints

- **Zustand SSoT**: All logic in `src/store/useISPStore.ts`. React components render only.
- **TDD mandatory**: Failing test first, then implementation.
- **Conventional Commits**: `type(scope): description (#issue_id)`
- **Never work on `main`/`dev`** without explicit instruction.
- **Pre-PR**: `npm run build && npm test && node scripts/ai-linter.js`

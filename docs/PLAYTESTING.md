# Playtesting Guide

This document describes how to validate game milestones through playtesting.

## Current Milestone: v0.3

See [V03_PLAYTEST_PROTOCOL.md](playtests/V03_PLAYTEST_PROTOCOL.md) for the complete protocol.

### When to Playtest

Run the v0.3 playtest when all core loop issues are closed:
- [x] #146 - localStorage persistence
- [x] #147 - First-session milestones
- [ ] #8 - Responsive design
- [ ] #151 - Fix stale docs
- [ ] #11 - Developer onboarding
- [ ] #152 - npm audit fix
- [ ] #5 - Store cleanup

### How to Playtest

1. Use the [observation sheet](playtests/PLAYTEST_OBSERVATION_SHEET.md).
2. Follow the 15-minute protocol defined in the primary protocol.
3. Compare completed tests to the [example report](playtests/EXAMPLE_PLAYTEST_REPORT.md).
4. Document specific playtest results in `docs/playtests/v0.3-playtest-YYYY-MM-DD.md`.

### Pass/Fail Criteria

See protocol document for complete criteria. Summary:
- ✅ Core loop is understandable
- ✅ Economic decisions create tension
- ✅ Era progression works (advance to 1980s in 15 minutes)
- ✅ No critical confusion or bugs
- ✅ State persists correctly across reloads
- ✅ Milestones trigger correctly

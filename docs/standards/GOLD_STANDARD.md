# 🏆 The Gold Standard (Staff Workflow)

This document defines the mandatory development standards for the ISP Simulator. All engineers (and AI assistants) must adhere to these protocols.

## 1. TDD Mandatory (Test-Driven Development)
- **Workflow**: Create a Vitest `.test.ts` file covering the expected behavior *before* writing the implementation.
- **Verification**: Run `npm test` and ensure the new test fails first, then passes after implementation.
- **Scope**: All Store logic (`src/store/`) and Physics logic (`src/systems/`) must have >80% test coverage.

## 2. Store/Worker Decoupling
- **Zustand Store**: Responsible for reactive state, UI flags, and selection.
- **Simulation Worker**: Responsible for heavy mathematical physics, traffic routing, and economic ticks.
- **Constraint**: Never pass complex React objects or whole stores to the Worker. Pass only primitive data clusters.

## 3. Atomic PR Protocole
Every Pull Request must follow the [PR Template](file:///c:/Users/walac/Documents/Projetos/ISP%20Game/.github/PULL_REQUEST_TEMPLATE.md) and include:
- **Test Report**: Output from Vitest for all related files.
- **Manual QA Runbook**: A step-by-step checklist for a human to verify UI and interaction behavior.

## 4. UI Rendering (Dumb UI)
- React components must contain **zero** physics logic.
- Animations should be CSS-driven or simple SVG state transitions.
- Coordinate systems must remain absolute to prevent scaling drift.

---
*Authorized by Senior Lead: Ref BP-v1.4*

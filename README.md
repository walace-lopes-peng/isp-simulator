# ISP Simulation Engine – Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Building for Production](#building-for-production)
7. [Running the Production Build](#running-the-production-build)
8. [Linting & Formatting](#linting--formatting)
9. [Version Control](#version-control)
10. [Troubleshooting](#troubleshooting)
11. [Further Reading & Resources](#further-reading--resources)

---

### ISP Simulator

A React + Zustand browser-based game simulating the evolution of an Internet Service Provider from local networks to global infrastructure.

## 🚀 Quick Start

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

## 🏗️ Architecture & Development

This repository follows a clean, modular structure. Key systems are isolated in pure functions and connected to the UI via Zustand and custom hooks.

- **[Project Blueprint](.gemini/antigravity/brain/a4bb2621-873e-44f9-a349-d9aff5436f00/project_blueprint.md)**: Read our full architectural blueprint, refactoring plan, and coding standards.
- **[Git Workflow](.gemini/antigravity/brain/a4bb2621-873e-44f9-a349-d9aff5436f00/git_workflow.md)**: Explore our branch strategies and commit conventions.

### Folder Structure Overview
- `src/components/`: Reusable, simple UI elements.
- `src/features/`: Smart components (Map, HUD).
- `src/systems/`: Pure game mechanics (Engine, Economy).
- `src/store/`: Zustand state management.

---

### Project Overview
This repository contains an **ISP Simulation Engine** built with **React**, **TypeScript**, and **Tailwind CSS**. The core logic lives in a single `App.tsx` file, powered by a Zustand store (`useISPStore.ts`). The UI adapts to three eras (`70s`, `90s`, `modern`) using Tailwind‑based themes.

---

### Prerequisites
- **Node.js** (>= 18) and **npm** (>= 9)
- **Git**
- **Vite** (installed locally via `npm install -D vite`)
- **Tailwind CSS** (installed locally via `npm install -D tailwindcss postcss autoprefixer`)
- **React** and **React‑DOM** (installed as regular dependencies)

---

### Setup
```bash
# Clone the repo (if you haven't already)
git clone <repo‑url>
cd "c:\Users\walac\Documents\Projetos\ISP Game"

# Install dependencies
npm ci

# Initialise Tailwind (already provided, but you can re‑run if needed)
npx tailwindcss init -p
```

---

### Development Workflow
1. **Start the dev server**
   ```bash
   npm run dev
   ```
   Vite will serve the app at `http://localhost:5173` with hot‑module reloading.
2. **Edit source files** (`src/**/*.tsx`, `src/**/*.css`). The UI updates automatically.
3. **Commit early and often** – use feature branches for new functionality.

---

### Testing
The project currently ships a lightweight verification script (`verifyStore.ts`). For a proper test suite:
1. **Add Jest & React Testing Library**
   ```bash
   npm install -D jest @testing-library/react @testing-library/jest-dom ts-jest
   ```
2. **Create a `jest.config.ts`** and write unit tests under `src/__tests__/`.
3. **Run tests**
   ```bash
   npm test
   ```
   (The `test` script in `package.json` can be repurposed for Jest.)

---

### Building for Production
```bash
npm run build
```
This runs `tsc && vite build`, emitting optimized assets to the `dist/` folder.

---

### Running the Production Build
```bash
npm run preview
```
Vite serves the built files locally so you can verify the production bundle.

---

### Linting & Formatting
- **ESLint** (optional) – `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`.
- **Prettier** – `npm install -D prettier`.
- Add scripts to `package.json`:
  ```json
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.ts\" \"src/**/*.tsx\""
  }
  ```
- Run `npm run lint` and `npm run format` before committing.

---

### Version Control
- **Branching model**: `main` (stable), `dev` (integration), feature branches (`feat/*`).
- **Pull requests**: Require review, passing tests, and linting before merge.
- **Commit messages**: Follow Conventional Commits (`feat:`, `fix:`, `chore:`).

---

### Troubleshooting
| Symptom | Likely Cause | Fix |
|---|---|---|
| `Cannot find module 'react'` | Missing dependencies | Run `npm install` again |
| Tailwind classes not applied | `index.css` not imported | Ensure `import './index.css';` is present in `main.tsx` |
| Build fails with `unknown at-rule @tailwind` | PostCSS config missing | Verify `postcss.config.js` contains `require('tailwindcss'), require('autoprefixer')` |
| Runtime errors in `App.tsx` | TypeScript config (`tsconfig.json`) not set for JSX | Ensure `"jsx": "react-jsx"` in `compilerOptions` |

---

### Further Reading & Resources
- **React Docs** – https://react.dev/
- **Zustand** – https://github.com/pmndrs/zustand
- **Tailwind CSS** – https://tailwindcss.com/docs
- **Vite** – https://vitejs.dev/guide/
- **Conventional Commits** – https://www.conventionalcommits.org/

---

*Happy coding!*

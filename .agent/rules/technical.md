# Technical Standards

Guidelines for code quality and version control.

## 1. Coding Standards
- **TypeScript**: Use strict typing. Avoid `any` at all costs.
- **Zustand**: Leverage selectors for performance and maintain the store's "brain" status.
- **Tailwind**: Use the project's established utility patterns for glassmorphism and era-specific aesthetics.

## 2. Version Control
- **Conventional Commits**: Use `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- **Atomic Commits**: Group related changes. Avoid large, monolithic commits.

## 3. Environment
- **Shell**: Always assume **PowerShell 7 (pwsh)**.
- **Build**: Ensure `npm run build` passes before any PR or merge.

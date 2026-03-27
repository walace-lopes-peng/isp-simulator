# Git Workflow for Solo Developers

A streamlined, professional approach to version control for the ISP Simulator project.

## 🌿 Branch Strategy

| Branch | Purpose | Stability |
| :--- | :--- | :--- |
| `main` | Production-ready releases. | High (Always buildable) |
| `dev` | Integration branch for features. | Medium (Internal testing) |
| `feature/*` | Individual feature/bug development. | Low (Experimental) |

## 📝 Commit Naming (Conventional Commits)

Use concise, clear prefixes to summarize your intent:

- `feat: ` New gameplay feature
- `fix: ` Bug fix
- `refactor: ` Code improvement without behavior change
- `docs: ` Documentation updates
- `style: ` UI/CSS changes only

## 🛠️ Feature Flow (The Solo "PR")

Even as a solo dev, following a mini-flow prevents "commit soup":

1.  **Branch Out**: `git checkout -b feature/map-system dev`
2.  **Iterate**: Commit early, commit often.
3.  **Merge Back**: `git checkout dev` -> `git merge feature/map-system`
4.  **Release**: Every few features, merge `dev` into `main`.

## 🎫 Issue Tracking (The "To-Do" List)
Use GitHub Issues as your backlog. 
- Create a simple issue for each feature.
- Link commits: `feat: add slider #12` (automatically links to issue #12).

---

## 🚀 Release Strategy

1.  Ensure `dev` build is successful: `npm run build`.
2.  Merge `dev` into `main`.
3.  Tag the release: `git tag -a v1.0.0 -m "Initial Mechanic Alpha"`.
4.  Push tags: `git push origin --tags`.

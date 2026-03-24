## 📝 Summary
[Provide a brief description of the changes and the problem they solve.]

**Closes #[ISSUE_NUMBER]**

---

## 🏗️ Architectural Context
- **Affected Systems**: (e.g., Store, UI, Topology Engine)
- **State Invariants**: [Confirm that no state logic has been leaked into the UI layer.]
- **Performance Impact**: [Note if `requestAnimationFrame` ticks or BFS iterations were modified.]

---

## ✅ Checklist

### 1. Consistency & Standards
- [ ] **Branching**: Follows `feat/`, `fix/`, `refactor/`, or `docs/` convention.
- [ ] **Commits**: Follows [Conventional Commits](https://www.conventionalcommits.org/).
- [ ] **Base Target**: Targets the `dev` branch (not `main`).

### 2. Implementation Quality
- [ ] **Isolation**: No business logic in React components.
- [ ] **Typing**: TypeScript interfaces updated and strict.
- [ ] **Styling**: Uses Tailwind CSS tokens (no hardcoded colors).

### 3. Simulation & QA
- [ ] **Loop Integrity**: Verified that the 1s `tick()` remains stable.
- [ ] **Graph Topology**: Verified node connectivity and BFS reachability.
- [ ] **No Console Errors**: Verified in browser devtools.

---

## 📝 Tech Lead Review Notes
[Special instructions or context for the reviewer regarding architectural decisions.]

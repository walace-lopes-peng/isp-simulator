# 🛠️ Feature Development Skills

Guidelines for implementing new mechanics and UI features in the ISP Simulator.

## 1. Era Consistency
- **Rule**: Every new UI element must respect the three eras: `70s`, `90s`, and `modern`.
- **Implementation**: Avoid hardcoded CSS colors. Use Tailwind classes that adapt to the parent theme container.

## 2. Numerical Invariants
- **Latency ($L$):** $L = Traffic / Bandwidth$.
- **Revenue ($R$):** $R = \sum(Traffic) \times Multiplier$.
- **Rule**: Never lower the complexity of these formulas for "easier" gameplay without Tech Lead approval.

## 3. Project Management (Sprint Board)
- **Rule**: Every PR must close an issue (`Closes #ID`).
- **Rule**: New features must be tagged with `P2-normal` or higher.

## 4. Agentic Sync
- **Rule**: If core logic changes, update `agent-instructions.md` and this document immediately.

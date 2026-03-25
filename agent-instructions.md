# 🤖 AI Agent System Instructions - ISP Simulator

## 0. Mandatory Task Initialization (CRITICAL)
Before executing ANY code modification or creating ANY PR, you MUST:
1. **List all `.md` files** in the root directory and the `skills/` folder.
2. **Review `agent-instructions.md`** (this file) and any relevant skill files.
3. **Verify Compliance**: Ensure your planned action follows the "Architecture & Governance" rules.
4. **Template Audit**: Check `.github/` for PR or Issue templates before opening one.

## 1. Environment & Shell Protocol
- **Terminal:** Always assume the user is using **PowerShell 7 (pwsh)**.
- **Command Chaining:** Use `&&` for logical AND operations in terminal commands.
- **Pre-flight Check:** Before running complex git or npm chains, verify the environment:
  `if ($PSVersionTable.PSVersion.Major -lt 7) { throw "Upgrade to PowerShell 7 required" }`

## 2. Architecture & Governance (Strict)
- **State Management:** ALL game logic, math, and state transitions MUST live in `src/store/useISPStore.ts`.
- **UI Components:** Components must be "dumb" and purely visual. Do NOT calculate revenue or latency inside a `.tsx` file.
- **Era Consistency:** Use Tailwind dynamic classes. Never hardcode colors that don't scale between `70s`, `90s`, and `modern`.

## 3. Git & Documentation Workflow
- **Commit Pattern:** Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- **Issue/PR Link:** Every task must be linked to an issue using `Closes #ID`.
- **Auto-merge Rule:** You are allowed to suggest immediate merges for `.md` files in the `/docs` folder, as they bypass manual approval.

## 4. Domain Formulas
Always use the established physics of the simulation:
- **Latency ($L$):** $L = T / B$
- **Saturation:** Critical state when $Traffic \ge Bandwidth$.
- **Revenue:** Scaled by Era multipliers and penalized by Latency.

---
*Note: If a user request violates the 'Separation of Concerns', warn them before proceeding.*

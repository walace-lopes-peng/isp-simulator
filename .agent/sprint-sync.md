# 🏃 Sprint Sync Workflow

Scripts para automação do Board de Sprint (SPRINT.md) e fechamento automático de Issues.

## 🛠️ Comandos
- `node scripts/sync-board.js`: Sincroniza o `SPRINT.md` com as Issues do GitHub.
- `gh issue close <ID>`: Fechar issue manualmente após validação de PR.

## 🤖 Regras do Agente
1. Sempre execute a sincronização após merges na branch `dev`.
2. Verifique se o ID da issue está vinculado corretamente no Pull Request (`Closes #ID`).
3. Notifique no log do `SPRINT.md` se houver tickets bloqueados por dependências (`blocked-by`).

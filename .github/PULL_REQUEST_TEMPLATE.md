# Description Let's keep the ISP engine running smoothly.

[Feature/Fix]: [Short description]

Resolve a Issue #[Number], que bloqueava [qualquer contexto]. 

Closes #[Number]
Unblocks #[Number]

## Context

[Por que essa alteração é necessária? O que ela resolve? Exemplo: "O sistema de zoom cortava o Core Node da visibilidade do BFS."]

## 🏗️ Descrição Técnica (O "Código Sênior")
[Racional por trás das decisões arquiteturais. Como a lógica foi desacoplada? Como a Store e os Workers interagem?]

### Alterações em Destaque:
- **[Componente/Store]**: [Racional e lógica aplicada.]

## 🧪 Relatório de Testes (Vitest)
[Resumo da execução dos testes unitários e de integração.]
- [ ] Todos os testes passaram (`npm test`).
- [ ] Cobertura de testes mantida ou aumentada.

## 🕹️ Manual QA Runbook (Walkthrough)
[Guia passo-a-passo para validação manual no navegador.]
1. Inicie o servidor: `npm run dev`.
2. Abra o simulador no navegador.
3. [Ação 1]: [Resultado esperado].
4. [Ação 2]: [Resultado esperado].

## ✅ Gold Standard Checklist
- [ ] **TDD**: O arquivo de teste foi proposto antes da implementação?
- [ ] **Desacoplamento**: Lógica pesada está no `SimulationWorker.ts`?
- [ ] **Tipagem**: TypeScript `interface` e `types` estão rigorosamente definidos?
- [ ] **Auditoria**: Performance e resiliência foram verificadas?

## 🚀 Impacto no Roadmap
[Como isso avança o MVP? Resolve bloqueadores de eras ou física?]

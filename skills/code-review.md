---
name: code-review
description: Code Review Standards for Pull Requests, based on Gitflow and QA requirements.
---

# Code Review Protocol

> **Before starting:** Ensure the PR targets the `dev` branch, not `main`.

Toda aprovação de PR deve seguir padrões mínimos de qualidade. Reviews genéricas (ex: "looks good") não são aceitáveis.

## 1. Fluxo de Branches
- **Funcionalidades**: Prefixo `feat/`
- **Correções**: Prefixo `fix/`
- **Destino Base**: Todos os PRs devem mirar a branch `dev` (não `main`).

## 2. Regras de Revisão (Tech Lead)

### A. Corpo Obrigatório
Toda aprovação DEVE declarar o que foi testado no simulador (ex: "Testei a compra de nós, o BFS e a dedução de custo").

### B. Feedback Estruturado
Ao solicitar alterações, organize o feedback em:
- **Bloqueadores**: Regras do Kernel quebradas (ex: lógica dentro do React).
- **Avisos**: Tailwind fora do padrão da era.
- **Acertos**: O que ficou bom na topologia.

### C. Acoplamento Arquitetural
- 🔴 REJECT any PR that mixes game logic (traffic calculations) into React components.
- 🟢 APPROVE PRs that cleanly dispatch `useISPStore` actions.

### D. Checklist de QA Visual e de Performance
- O PR não introduziu múltiplos `setInterval`?
- As classes do Tailwind (ex. `animate-pulse`) não estão causando lag no SVG?
- O autor do PR marcou a caixa de "Testei o BFS de reachability"? Se sim, verifique cruzado.

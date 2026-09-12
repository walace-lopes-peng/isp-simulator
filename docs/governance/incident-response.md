---
name: incident-response
description: Workflow for debugging build failures, "missing map" issues, and graph topology freezes.
---

# Incident Response Workflow

When the ISP Simulator enters a crash state or specific features fail drastically (e.g., "The nodes are not connecting"), execute the following step-by-step terminal and logic checks:

### 1. Limpar Sombras de Build (The TSC Trap)

**Sintoma:** O Vite renderiza uma versão antiga, a tela fica preta, ou não há erro no console mesmo alterando arquivos `.tsx`.

> Isso ocorre porque o TypeScript (`tsc`) compilou artefatos `.js` na pasta `src/` que o Vite tenta servir prioritariamente.

**Execute os comandos abaixo para limpar o projeto:**

// turbo-all

```powershell
Remove-Item -Recurse -Force dist
Get-ChildItem src/ -Include *.js, *.js.map, *.d.ts, *.d.ts.map -Recurse | Remove-Item -Force
npm run dev
```

### 2. Validar Falha de Conectividade (Graph Topology)

**Sintoma:** Ao clicar em dois nós, o botão 'ESTABLISH LINK' desliga mas o SVG não desenha o cabo, e o `$cost` não desconta.

1. Inspecione o action `connectNodes` no Zustang.
2. Certifique-se de que os IDs estão sofrendo cast para `String()`: `const sId = String(srcId);`.
3. Verifique se o loop `state.links.some(...)` não está bloqueando conexões válidas por erro de tipagem.

### 3. Validar Falha de Reachability (BFS Isolado)

**Sintoma:** Cabos renderizam, mas o Load se mantém em 0, e a UI mostra "ISOLATED".

1. Localize a constante `reachableIds` no `tick()`.
2. Verifique se o Core Node (Layer 1) está presente na varredura. Se o Zoom Level estiver cortando a array original, o Core desaparece e o BFS trava.
3. Se o `const core = state.nodes.find(n => n.layer === 1);` for nulo, a rede cai imediatamente.

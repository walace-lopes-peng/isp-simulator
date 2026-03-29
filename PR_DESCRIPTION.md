# Description Let's keep the ISP engine running smoothly.

[Feature/Fix]: Implementation of weighted Dijkstra pathfinding, exponential signal attenuation ($e^{-kd}$), and Heatmap optimizations.

Resolve a Issue #86, que bloqueava a performance durante as transições de mapa e o rendering espaciais em alta definição.

Closes #86
Unblocks Week 3 (Visual Polish & 90s Era Transition)

## Context

This PR transforms the simulation from a simple reachability engine into a high-fidelity "Packet-Flow" kernel and resolves critical UI freezes during map scale transitions. By implementing Dijkstra's algorithm, data now seeks the most efficient path based on latency and bandwidth. The addition of signal attenuation physics introduces strategic friction. Additionally, refactoring the heatmap to use an offscreen canvas buffer ensures smooth 60FPS rendering performance.

## What was Changed

### src/systems/SimulationWorker.ts
- **Upgraded to weighted Dijkstra search** (Priority Queue based).
- **Exponential Signal Attenuation**: Adicionada a física de atenuação ($e^{-0.002 \cdot d}$) afetando tráfego e receita.

### src/store/useISPStore.ts
- **Per-node Physics Metrics**: Refatorado para lidar com Latency e Signal Strength por nó.
- **Global Metrics**: Adicionado tracking de `avgLatency` global.

### src/App.tsx
- **UI Metrics**: Atualizado o TopBar e Sidebar para mostrar métricas de física em tempo real.

### src/components/HeatmapLayer.tsx
- **Offscreen Canvas Buffer**: Otimizado o uso de canvas para cache do estado do heatmap. Evitando re-renders pesados através de `React.memo` para garantir performance (Issue #86).

## QA Checklist
Validado manualmente no simulador local (Vite/React):

- [x] Lógica foi inserida puramente no `useISPStore.ts` e `SimulationWorker.ts`, sem estado local complexo no React.
- [x] Nós isolados registram "0" tráfego corretamente.
- [x] `connectNodes` e algoritmos topológicos continuam calculando com casting de tipagem seguro `String(id)`.
- [x] Componente visual utiliza apenas Tailwind dentro do padrão das eras (`theme-70s`, etc).
- [x] O deploy/build local via `npm run build` passa sem erros.

## Impacto no Ship Path
This completes the **"Kernel Expansion"** phase. It unblocks **Week 3 (Visual Polish & 90s Era Transition)** e estabelece a física fundamental para upgrades futuros da tech tree (Repetidores, Fibra Ótica). Resolve os gargalos de performance do renderizador de Heatmap base.

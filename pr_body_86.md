# Description Let's keep the ISP engine running smoothly.

[Feature/Fix]: Procedural Demand Heatmap Grid (Canvas 2D spatial physics)

Resolve a Issue #86, que altera o motor de física do jogo de geração passiva de recursos para um sistema espacial matricial 40x40 onde as torres precisam absorver hotspots para lucrar.

Closes #86

## Context

Até a Issue #85, a "receita" de um nó vinha de um multiplicador aleatório focado no level do nó. Com esse PR, o jogo passa a ter um loop autêntico de Sandbox Tycoon: Uma Grade de Demanda de 400 blocos (celulas) é gerada via clustering matemático de hotspots, mapeando as células industriais, comerciais e residenciais. Além disso o WebWorker precisa validar fisicamente quais torres interceptam quais zonas.

## What was Changed

### src/store/useISPStore.ts
- **O que mudou e porquê**: Interface `DemandCell` registrada e criada a utilidade `generateDemand()` chamada nativamente no onMount do `initWorker`. Criação dos seeds gerando mapas procedurais e orgânicos.

### src/systems/SimulationWorker.ts
- **O que mudou e porquê**: Física de receita completamente re-escrita. O Worker loopa todos os `DemandCells` passando pelas fórmulas de Espaço Euclidiano baseadas no `COVERAGE_RADIUS = 150` pixels do Node; Eficiências radias entre `10% - 100%` são repassadas ao `nodeRevenueMap`.

### src/components/HeatmapLayer.tsx
- **O que mudou e porquê**: O Canvas API nativo rodando a 60FPS. Exibe as tags via `globalCompositeOperation = 'screen'` e `shadowBlur` de performance nativa gerando os blocos "Night City" sem causar freeze nos vetores SVG de topologia.

### src/App.tsx
- **O que mudou e porquê**: Importação limpa do `<HeatmapLayer />` através da tag `<foreignObject>` injetado nativamente debaixo dos links e conectores D3 do SVG; Isso atrelou o canvas ao Hook de câmera e Pan/Zoom automaticamente.

## QA Checklist
Validado manualmente no simulador local (Vite/React):

- [x] Lógica foi inserida puramente no `useISPStore.ts`, sem estado local complexo no React.
- [x] Nós isolados registram "0" tráfego corretamente.
- [X] `connectNodes` e algoritmos topológicos continuam calculando com casting de tipagem seguro `String(id)`.
- [X] Componente visual utiliza apenas Tailwind dentro do padrão das eras (`theme-70s`, etc) ou primitivas de HTML5 aceleradas HW.
- [x] O deploy/build local via `npm run build` passa sem erros.

## Impacto no Ship Path
[LOGIC] O jogo finalmente saiu do modo passivo. Os players agora vão engajar com as mecânicas "Local Sprint" abrindo caminho para o Route Switching!

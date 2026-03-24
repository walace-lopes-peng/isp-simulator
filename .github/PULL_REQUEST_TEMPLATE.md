# Description Let's keep the ISP engine running smoothly.

[Feature/Fix]: [Short description]

Resolve a Issue #[Number], que bloqueava [qualquer contexto]. 

Closes #[Number]
Unblocks #[Number]

## Context

[Por que essa alteração é necessária? O que ela resolve? Exemplo: "O sistema de zoom cortava o Core Node da visibilidade do BFS."]

## What was Changed

### [Nome do Arquivo 1]
- **[O que mudou e porquê]**: [Detalhes da alteração lógica ou visual, citando o Zustand ou Tailwind.]

### [Nome do Arquivo 2]
- **[O que mudou e porquê]**: [Detalhes.]

## QA Checklist
Validado manualmente no simulador local (Vite/React):

- [ ] Lógica foi inserida puramente no `useISPStore.ts`, sem estado local complexo no React.
- [ ] Nós isolados registram "0" tráfego corretamente.
- [ ] `connectNodes` e algoritmos topológicos continuam calculando com casting de tipagem seguro `String(id)`.
- [ ] Componente visual utiliza apenas Tailwind dentro do padrão das eras (`theme-70s`, etc).
- [ ] O deploy/build local via `npm run build` passa sem erros.

## Impacto no Ship Path
[Como isso avança o Roadmap? É um bloqueador resolvido do MVP? Prepara terreno para eventos aleatórios e Tech Tree?]

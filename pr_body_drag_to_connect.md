# Description Let's keep the ISP engine running smoothly.

[Feature]: Drag-to-Connect Interactive System

Resolve Issue #74 (Week 3 Milestone), which blocked high-fidelity network expansion.

Closes #74

## Context

Current button-based link creation provided high friction and lacked visual feedback on signal constraints. This PR implements a direct manipulation model (Drag-to-Connect) with real-time SVG overlays for range and hierarchy validation. This aligns with the "Cities: Skylines for ISPs" vision defined in the v1.6 Blueprint.

## What was Changed

### src/store/useISPStore.ts
- **State Expansion**: Added `dragSourceId` and `dragPos` for interaction tracking.
- **Validation Logic**: Extracted `validateLink` helper to provide 60fps feedback during movement without redundant link creation attempts.

### src/App.tsx
- **Pointer Infrastructure**: Replaced React `onClick` with `PointerDown/Move/Up` to support both Mouse and Touch.
- **Visual Feedback**: 
    - `GhostLine`: Emerald/Ruby dynamic line showing valid/invalid paths.
    - `RangeOverlay`: Signal attenuation circle (350u radius) visualization.
    - `Target Filtering`: Opacity-based node dimming for incompatible hierarchy/distance.

### src/systems/SimulationWorker.ts
- **Kernel Restoration**: Recovered the Week 2 Dijkstra engine (physics-based routing) to ensure the Week 3 interaction layer has a valid data-plane.

## QA Checklist
Validado manualmente no simulador local (Vite/React):

- [x] Lógica foi inserida puramente no `useISPStore.ts`, sem estado local complexo no React.
- [x] Nós isolados registram "0" tráfego corretamente.
- [x] Lógica de 'range' visual reflete os limites de atenuação do Kernel.
- [x] O deploy/build local via `npm run build` passa sem erros (21 modules).

## Impacto no Ship Path
Acelera significativamente o gameplay do 'Core tier' (Week 3) and prepares for the 90s Era transition where high expansion speed is required to outpace capital attrition.

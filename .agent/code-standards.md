# 🏗️ Code Standards: ISP Game

Padrões de desenvolvimento para garantir a integridade da simulação e performance UI.

## ⚛️ Zustand & State Logic
- **Store Centralizada**: Todo o cálculo matemático deve ocorrer dentro do `tick()` no `useISPStore.ts`.
- **Pure Functions**: Evite lógica de negócio dentro dos componentes React.
- **Typing**: Use tipos estritos para `Era`, `ISPNode` e `ISPLink`. Sempre use `String(id)` para evitar conflitos de tipos em IDs numéricos vindos de APIs.

## 🎨 UI & UX
- **Dumb Components**: Componentes devem apenas refletir o estado do `useISPStore`.
- **Absolute Positioning**: O mapa geográfico usa coordenadas absolutas para garantir consistência visual em diferentes zooms.
- **VFX & Gradiants**: Priorize uma estética cyberpunk/retro (Windows 95 + Neon).

## 🚀 Performance
- **Throttling**: O `tick()` deve ser balanceado para não sobrecarregar o render loop.
- **Asset Loading**: Mapas SVG devem ser otimizados para redução de path points.

# 🗺️ PROJECT_BLUEPRINT: ISP Tycoon (The Living Doc)

## 1. Visão Geral (The North Star)
O jogo é um simulador de infraestrutura histórica. O jogador começa em uma garagem (anos 70) e deve evoluir tecnologicamente até gerenciar o backbone da internet global (Moderno). O foco não é 'clicar', mas gerenciar Topologia vs. Demanda.

> [!NOTE]
> Este documento é a "Semente" do projeto. Todas as decisões de design e arquitetura devem ser validadas contra esta visão.

## 2. O Motor de Fluxo (Core Loop)
Substituir a receita estática por Entrega de Pacotes (Packet-Flow):
- **Nós de Usuário**: Geram 'Requests'.
- **Nós de Serviço**: São o destino (Mainframes/Data Centers).
- **Receita**: Gerada apenas quando um pacote completa a viagem de ida e volta.
- **Perda**: Links sobrecarregados (Capacidade < Tráfego) causam Packet Loss, destruindo a receita.

## 3. Progressão de Eras (Historical Evolution)

### 📟 Era 1: A Vanguarda (Anos 70)
- **Escala**: Local (Grid de Bairro/Universidade). Mapa-múndi bloqueado.
- **UI**: Terminal CRT, fósforo verde, comandos via console.
- **Hardware**: Modems acústicos e cabos de cobre (300bps).
- **Desafio**: Falhas físicas de hardware e curto alcance.

### 💾 Era 2: A Corrida do Ouro (Anos 90)
- **Escala**: Regional (Cidade/País). Zoom Semântico desbloqueado.
- **UI**: Estilo Windows 95, cinza chanfrado, fontes pixeladas.
- **Hardware**: Modems 56k, primeiros backbones de fibra.
- **Desafio**: Explosão de demanda residencial e congestionamento massivo.

### 🌐 Era 3: O Titã (Moderno)
- **Escala**: Global (Cabos submarinos e Satélites).
- **UI**: Dark Mode, minimalista, transparências (estilo SaaS).
- **Hardware**: Fibra óptica de Terabit, Starlink.
- **Desafio**: Ataques DDoS, latência transcontinental e manutenção de custos globais.

## 4. O Motor de Cenários (Modular Engine)
O sistema deve suportar 'Cenários' que sobrescrevem o Blueprint original:
- **Guerra Fria**: EUA vs URSS. Mudança de idioma (Cirílico), UI militar e mecânicas de sabotagem/espionagem.
- **Marte 2050**: Colonização espacial com latência de 20 minutos por pacote.

## 5. Mapeamento de Milestones (Project Board)
Alinhado com a automação do [sync-board.js](file:///c:/Users/walac/Documents/Projetos/ISP%20Game/scripts/sync-board.js), o projeto segue este fluxo de prioridade:

1.  **🎯 Strategic Core**: Mudanças no Blueprint ou Visão North Star.
2.  **🚨 Critical Path**: Blockers técnicos (P0) e bugs impeditivos.
3.  **🏗️ Phase 1: The Kernel**: Lógica central, `useISPStore`, algoritmos de topologia.
4.  **🏠 Phase 2: The Garage**: UI/UX, Imersão (VFX/SFX), Shader de CRT.
5.  **📌 Future Expansion**: Novas eras, multiplayer, sistemas avançados.

Consulte o [ROADMAP.md](file:///c:/Users/walac/Documents/Projetos/ISP%20Game/ROADMAP.md) para detalhes cronológicos.

## 6. Arquitetura de Software (The Onion)
Construímos de dentro para fora para garantir estabilidade funcional:
- **Camada 1: Store (Core Logic)**: Zustand as SSoT. Toda a matemática de tráfego e economia.
- **Camada 2: Simulation**: Handlers de eventos, timers e o loop de `tick()`.
- **Camada 3: UI Layer (React)**: Projeções visuais do estado. Componentes puros de visualização.
- **Camada 4: Immersion**: Shaders, Áudio Procedural, Overlays estéticos.

Mais detalhes em [ARCHITECTURE.md](file:///c:/Users/walac/Documents/Projetos/ISP%20Game/ARCHITECTURE.md).

## 7. Filosofia de Design (Retro-Cyberpunk)
O ISP Tycoon não é apenas um tycoon; é uma ferramenta de "arqueologia técnica".
- **Realismo Estético**: Se é 1995, a barra de progresso deve parecer do Win95.
- **UX Reativa**: Todo link deve "respirar" de acordo com a carga de dados.
- **Feedback Híbrido**: Misturar visualização moderna de dados com interfaces obsoletas.

## 8. Regras Técnicas (Guardrails)
- **Zustand First**: Proibido lógica de negócio em componentes.
- **No Static Magic**: Constantes devem ser descentralizadas no `ERA_CONFIGS`.
- **Coordinate Integrity**: Usar coordenadas absolutas para garantir consistência no zoom.
- **Documentation First**: Mudanças arquiteturais exigem atualização deste Blueprint.

---
*Single Source of Truth - Veja também: [CONTRIBUTING.md](file:///c:/Users/walac/Documents/Projetos/ISP%20Game/CONTRIBUTING.md)*

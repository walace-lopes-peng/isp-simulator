# 🗺️ PROJECT_BLUEPRINT: ISP Tycoon (The Living Doc - v1.4)

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

## 4. 🌳 Hierarquia de Infraestructura (Infrastructure Hierarchy)
A simulação impõe uma topologia em camadas (Layered Hierarchy):
- **Terminal (Tier 0)**: Nós de usuário final. Conectam-se apenas a **LEP**.
- **LEP (Tier 1 - Local Exchange Point)**: Hubs locais. Conectam Terminais a **PoPs**.
- **PoP (Tier 2 - Point of Presence)**: Agregadores regionais. Conectam LEPs a **Gateways**.
- **Tier-1 Gateway (Tier 3-4)**: Backbone global. Capaz de estabelecer links transcontinentais.

*Regra de Ouro: Links diretos que saltam mais de 1 nível de hierarquia são proibidos por custo e latência prohibitivos.*

## 5. Fórmulas de Negócio (Imutáveis)

### A. Cálculo de Receita (Hybrid Revenue)
A receita é calculada por nó ativo (Layer > 1):
- **Tier Focada (Zoom)**: Receita base * 0.8.
- **Tiers em Background**: Receita base * 0.2.
- **Penalidade de Congestionamento**: Se `traffic > bandwidth`, a receita do nó é reduzida significativamente.

### B. Upgrade de Nó
O custo de upgrade segue uma curva exponencial:
- `Cost = 50 * (1.15 ^ level)`
- Upgrade aumenta o `bandwidth` em 40% (`* 1.4`).

### C. Conexão de Nós (Links)
O custo de conexão baseado em distância:
- `Cost = 100 + (Distance * 1.5)`

## 6. Regras de Topologia & Estabilidade
1. **Core Connectivity**: Nenhum nó gera receita se não estiver conectado (direta ou indiretamente) ao **Core Gateway (ID: '0')**.
2. **Network Health (Survival)**:
   - `Health = (Capacidade - Tráfego) - Penalidades de Hazard.`
   - Se `Health < 50%`, multiplicador de receita = `0.5x`.
3. **Hazards**: 'Signal Noise' (70s), 'Thermal Load' (90s) e 'Latency' (Moderno) impactam o `Health` global.

## 7. Arquitetura de Software (The Onion)
- **Camada 1: Store (Core Logic)**: Zustand as SSoT. Toda a matemática de tráfego e economia.
- **Camada 2: Simulation**: Handlers de eventos e o loop de `tick()`.
- **Camada 3: UI Layer (React)**: Projeções visuais do estado.
- **Camada 4: Immersion**: Shaders, Áudio, Overlays estéticos.

## 8. Governança Técnica (Guardrails)
- **Zustand First**: Proibido lógica de negócio em componentes.
- **Coordinate Integrity**: Usar coordenadas absolutas para consistência no zoom.
- **Documentation First**: Mudanças arquiteturais exigem atualização deste Blueprint.

---
*Single Source of Truth - Veja também: [CONTRIBUTING.md](file:///c:/Users/walac/Documents/Projetos/ISP%20Game/CONTRIBUTING.md)*

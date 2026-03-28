# 🗺️ PROJECT_BLUEPRINT: ISP Tycoon (The Living Doc - v1.5)

## 1. Visão Geral (The North Star)
O jogo é um simulador de infraestrutura histórica. O jogador começa em uma garagem (anos 70) e deve evoluir tecnologicamente até gerenciar o backbone da internet global (Moderno). O foco não é 'clicar', mas gerenciar Topologia vs. Demanda.

> [!NOTE]
> Este documento é a "Semente" do projeto. Todas as decisões de design e arquitetura devem ser validadas contra esta visão.

## 2. 📂 Arquitetura & Estrutura (Separation of Concerns)
Nossa meta é que a UI seja apenas uma projeção do estado.

```text
src/
├── components/      # Componentes UI reutilizáveis (Dumb)
├── features/        # Sistemas complexos (Map, HUD, Nodes) (Smart)
├── systems/         # Lógica pura de jogo (Engine, Economy). SEM REACT.
├── store/           # Zustand state management (SSoT)
├── types/           # Interfaces TypeScript globais
└── utils/           # Math helpers e constantes
```

**Benefícios:**
- **Testabilidade**: Lógica em `systems/` pode ser testada unitariamente.
- **Manutenibilidade**: Mudanças na UI não afetam a matemática da simulação.

## 3. O Motor de Fluxo (Core Loop)
O loop principal (`tick`) processa a rede de forma holística:
- **Reachability**: Fluxo de dados exige conexão ativa com o **Core Gateway (ID: '0')**.
- **Packet Flow**: Receita baseada na entrega de tráfego bem-sucedida.
- **Congestionamento**: Se `traffic > bandwidth`, ocorre perda de pacotes e penalidade de receita.
- **Network Health**: Impactado por Hazards (Ruído, Calor, Latência). Health < 50% corta a eficiência pela metade.

## 4. 🌳 Hierarquia de Infraestrutura (Topology Guidelines)
A simulação impõe uma topologia em camadas:
- **Terminal (Tier 0)**: Usuários finais. Conectam-se apenas a **LEPs**.
- **LEP (Tier 1)**: Hubs locais. Conectam Terminais a **PoPs**.
- **PoP (Tier 2)**: Agregadores regionais. Conectam LEPs a **Gateways**.
- **Tier-1 Gateway (Tier 3-4)**: Backbone global. Capaz de peering transcontinental.

*Regra de Ouro: Links diretos que saltam níveis (ex: Terminal -> Gateway) são bloqueados por custo proibitivo.*

## 5. Fórmulas de Negócio (Imutáveis)

### A. Cálculo de Receita (Tier-Focus Focus)
A receita é calculada por nó ativo (Layer > 1):
- **Range Focado (rangeLevel)**: Receita base * 0.8.
- **Ranges em Background**: Receita base * 0.2.
- **Health Multiplier**: `avgHealth < 50 ? 0.5 : 1.0`.

### B. Economia de Upgrade & Link
- **Upgrade Cost**: `50 * (1.15 ^ level)`. Aumenta bandwidth em 40%.
- **Link Cost**: `100 + (Distance * 1.5)`.
- **OPEX (Manutenção)**: Nós e Links geram custos passivos por tick.

## 6. Governança Técnica (Guardrails)
- **Zustand First**: Proibido lógica de negócio persistente em componentes React.
- **Coordinate Integrity**: Usar coordenadas absolutas para garantir alinhamento de links no zoom/viewbox.
- **Discrete Navigation**: O mapa utiliza o sistema **Snap ViewBox** (Range 1-4) para focar em Tiers específicos.

---
*Single Source of Truth - v1.5 [Dev Branch]*

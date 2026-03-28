# 💡 BRAINSTORM & DESIGN ICEBOX

Este arquivo atua como o **Design Backlog (Icebox)** do projeto ISP Simulator, seguindo a metodologia de game design de estúdios AAA. Ele é um repositório curado de grandes ideias que esperam escopo ou maturidade técnica para se tornarem Issues.

> [!CAUTION]
> **REGRA DE OPERAÇÃO DO AGENTE (MANDATÓRIA):**
> Hipótese: Novas ideias de gameplay, UI ou mecânicas sugeridas em chat devem ser inseridas APENAS neste arquivo (`BRAINSTORM.md`) sob o status "🟢 Livre". É estritamente **proibido** criar ou "graduar" uma ideia desta lista para uma Issue oficial do GitHub sem a aprovação explícita e em prompt do usuário.

---

## Estrutura de Prioridades (Matriz)
Ao avaliar a lista abaixo, o processo de graduação deve usar a seguinte matriz:
* **Prioridade 1 (Quick Wins)**: Alto Impacto / Baixo Esforço
* **Prioridade 2 (Major Projects)**: Alto Impacto / Alto Esforço
* **Prioridade 3 (Fill-ins)**: Baixo Impacto / Baixo Esforço
* **Descartar**: Baixo Impacto / Alto Esforço

---

## 🏛️ Pilar: Infraestrutura e Topologia

* **[ID-B01] BGP Simplificado**
  * **Conceito**: Gestão de rotas via **Peering** (troca de tráfego direta e gratuita entre ISPs adjacentes) vs **Transit** (pagamento a provedores Tier-1 para entregar pacotes globalmente).
  * **Impacto**: Alto no gameplay estratégico de rede.
  * **Complexidade**: Alta de implementação.
  * **Status**: 🟡 Em Análise

* **[ID-B02] Physical Latency (L)**
  * **Conceito**: Cálculo de atraso real inserido na engine de entrega de pacotes. Baseado em métricas de distância (fibras longas = maior ms) e saltos (cada *hop* adiciona processamento).
  * **Impacto**: Médio no modelo de Revenue.
  * **Complexidade**: Média.
  * **Status**: 🟢 Livre

---

## 📈 Pilar: Economia e Mercado

* **[ID-B03] Service Zoning**
  * **Conceito**: Especialização de Hubs/Gateways para prover serviços específicos da era. Ex: DNS local (70s/80s), Mail Servers / Hospedagem Web (90s) ou Edge CDNs (Moderno).
  * **Impacto**: Médio na árvore tecnológica e UI do Node.
  * **Complexidade**: Média.
  * **Status**: 🟢 Livre

* **[ID-B04] SLA & Reputation Contracts**
  * **Conceito**: Contratos de clientes e corporações que exigem um *baseline* exato (ex: 99.9% de uptime). Quebras constantes de SLA resultam em multas pesadas.
  * **Impacto**: Alto no "Game Over / Failure State".
  * **Complexidade**: Média de implementação na Engine.
  * **Status**: 🟢 Livre

* **[ID-B07] Revenue Model Diversification (Contracts & Liquidity)**
  * **Conceito**: Escolha estratégica entre Fluxo de Caixa (Lump Sum) e Sustentabilidade (Recurring Revenue).
  * **Ideias para Geração de Revenue**:
    1. Assinatura (SLA-Based MRR)
    2. Taxa de Instalação (Setup Fee)
    3. Subsídios Governamentais (Era 70/80)
    4. Acordos de Trânsito IP (Tier-1 Peering)
  * **Impacto**: Alto. Define a capacidade de expansão agressiva vs. sobrevivência a longo prazo.
  * **Complexidade**: Média. Requer balanceamento de juros compostos e inflação por era.
  * **Status**: 🟢 Livre


---

## ⚠️ Pilar: Crises e Incidentes

* **[ID-B05] DDoS Mitigation**
  * **Conceito**: Eventos cíclicos de saturação massiva de pacotes direcionada a um Hub específico, exigindo do jogador a instalação de hardwares de mitigação de tráfego ("Scrubbing centers").
  * **Impacto**: Alto, gerando crises curtas de alta tensão.
  * **Complexidade**: Média.
  * **Status**: 🟢 Livre

* **[ID-B06] Cable Cut Events**
  * **Conceito**: Rompimento físico imediato de uma rota vital devido a fatores externos simulados: Âncoras e terremotos (Cabos Marítimos) ou obras civis (Áreas Urbanas densas). Força roteamento BGP ou reparo técnico urgente via OPEX.
  * **Impacto**: Médio na UI, Alto no balanço.
  * **Complexidade**: Baixa (apenas evento pseudoaleatório no TICK que seta `capacity` do link para 0).
  * **Status**: 🟢 Livre

---

## ⏳ Pilar: Gestão de Tempo e Progressão

* **[ID-B08] Time Control & Historical Ticking**
  * **Conceito**: Sistema de controle de velocidade (Pause, 1x, 2x, 4x) com mapeamento de Ticks para datas históricas.
  * **Características**:
    1. Escala de Tempo Dupla (Ticks vs. Calendário e Pausa Ativa)
    2. Tick de Simulação Assíncrono (Simplificação gráfica em 4x)
    3. Eventos Históricos Discretos (Gatilhos de Era baseados em data)
    4. Gestão de "Backlog de Trabalho" (Ações de construção levam tempo de calendário)
  * **Impacto**: Alto. Essencial para gerenciamento de crises e planejamento logarítmico.
  * **Complexidade**: Média. Requer sincronização entre animações de pacotes e o relógio da UI.
  * **Status**: 🟢 Livre

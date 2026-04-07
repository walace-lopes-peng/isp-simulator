# **ISP SIMULATOR: STRATEGIC ROADMAP (NORTH STAR)**

## **1. Visão Geral do Produto**
Simulador de gerenciamento de infraestrutura de internet evolutivo. O jogador inicia como um operador de rede local nos anos 70 e progride tecnologicamente até se tornar um provedor global de Tier-1 na era moderna.

---

## **2. Fases de Progressão (Eras)**

### **Fase 1: O Alicerce (Anos 70 - Local)**
*   **Escala:** Bairro/Cidade.
*   **Tecnologia:** IMPs, Mainframes, Linhas de Cobre Dedicadas.
*   **Interface:** Terminal/Prompt de comando (Fóssil).
*   **Desafio:** **Ruído de Sinal** e **Latência de Chaveamento**.
*   **Economia:** Contratos governamentais e acadêmicos.

### **Fase 2: A Expansão (Anos 90 - Regional/Nacional)**
*   **Escala:** Estado/País.
*   **Tecnologia:** Modems Dial-up, DSL, Roteadores Primitivos.
*   **Interface:** GUI inspirada em Windows 95/Classic OS (Bevel edges).
*   **Desafio:** **Saturação de Linha** e **Carga Térmica** em Hubs.
*   **Economia:** Assinaturas residenciais em massa.

### **Fase 3: A Dominação (Atualidade - Global)**
*   **Escala:** Continental/Transoceânica.
*   **Tecnologia:** Fibra Óptica (FTTH), Cabos Submarinos, Satélites.
*   **Interface:** Dashboard moderno, minimalista e dark mode.
*   **Desafio:** **Latência Física (ms)** e **Congestionamento de Backbone**.
*   **Economia:** Venda de trânsito IP e acordos de Peering.

---

## **3. Arquitetura de Redes (Hierarquia)**
O jogo impõe uma topologia de árvore obrigatória:
1.  **Terminal Nodes:** Clientes finais (casas, empresas).
2.  **LEP (Local Exchange Point):** Agregador de bairro (Obrigatório Fase 1).
3.  **PoP (Point of Presence):** Hub regional (Obrigatório Fase 2).
4.  **Tier-1 Gateway:** Conexão transoceânica (Obrigatório Fase 3).

---

## **4. Pilares de Gameplay & Desafios**
*   **Network Health:** Métrica baseada em (Capacidade - Carga) - Penalidades.
*   **Hazards Dinâmicos:** Ruído (Cobre), Calor (Hubs), Rompimento de Cabos (Âncoras/Terremotos).
*   **Semantic Zoom:** Troca de assets SVG conforme o `range` (Local vs. Global).

---

## **5. Protocolo de Governança de IA (Regras de Agente)**

### **Regra de Atualização Contínua (Mandatória)**
**Qualquer alteração na lógica de negócio, novas mecânicas aprovadas ou mudanças de direção técnica devem ser refletidas imediatamente neste ROADMAP e no `PROJECT_BLUEPRINT.md`.**

### **Hierarquia de Instrução**
1.  `.agent/`: Instruções de comportamento e comandos CLI.
2.  `PROJECT_BLUEPRINT.md`: Regras técnicas imutáveis e fórmulas.
3.  `ROADMAP.md`: Visão de longo prazo e ordem de implementação.
4.  `SPRINT.md`: Tarefas imediatas e bugs (Critical Path).

---

## **6. Próximos Marcos (Milestones)**
1.  **Sync de Estado:** Estabilizar `useISPStore` com suporte a tipos de nós (LEP/PoP).
2.  **Asset Swapping:** Implementar a troca de SVG entre níveis Local/Global.
3.  **Engine de Hazards:** Criar o loop de degradação de sinal por calor/ruído.

**Hipótese:** A separação estrita de mapas por nível (Local/Regional/Global) reduzirá em 40% a carga de renderização no DOM, permitindo simulações de tráfego mais complexas sem perda de FPS."

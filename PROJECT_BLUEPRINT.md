# **PROJECT BLUEPRINT: ISP SIMULATOR**

## **1. Core Architecture**
O motor de simulação é baseado em **Zustand** (`useISPStore.ts`), operando em um loop reativo de `tick()`.

### **Hierarquia de Estado**
- **Nodes (`ISPNode[]`)**: Entidades geográficas com propriedades de tráfego, largura de banda e camada (`layer`).
- **Links (`ISPLink[]`)**: Conexões físicas entre nós com custo de implementação baseado em distância.
- **Global Stats**: `money`, `totalData`, `currentEra`, `zoomLevel`.

---

## **2. Fórmulas de Negócio (Imutáveis)**

### **A. Cálculo de Receita (Hybrid Revenue)**
A receita é calculada por nó ativo (Layer > 1):
- **Tier Focada (Zoom)**: Receita base * 0.8.
- **Tiers em Background**: Receita base * 0.2.
- **Penalidade de Congestionamento**: Se `traffic > bandwidth`, a receita do nó é reduzida em 50%.

### **B. Upgrade de Nó**
O custo de upgrade segue uma curva exponencial:
- `Cost = 50 * (1.15 ^ level)`
- Upgrade aumenta o `bandwidth` em 40% (`* 1.4`).

### **C. Conexão de Nós**
O custo de conexão de link:
- `Cost = 100 + (Distance * 1.5)`

---

## **3. Regras de Topologia**
1.  **Core Connectivity**: Nenhum nó gera receita se não estiver conectado (direta ou indiretamente) ao **Core Gateway (ID: '0')**.
2.  **Reachability BFS**: A cada `tick`, o motor executa uma busca em largura (BFS) a partir do Core para determinar `reachableIds`.

---

## **4. Governança Técnica**
- **Type Safety**: Todos os IDs devem ser convertidos explicitamente para `String` no store para evitar dessincronização de tipos entre o motor e a UI.
- **Semantic Zoom**: O `zoomLevel` (0-100) controla o `activeTier` e a visibilidade de camadas SVG.

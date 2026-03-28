# ⚖️ Balancing Logic: Opex & Revenue

Regras matemáticas para o equilíbrio econômico da simulação de ISP.

## 💸 Revenue (Receita)
- **Fator de Zoom**: 80% da receita vem da Tier focada, 20% das Tiers em background.
- **Qualidade**: Receita baseada no tráfego consumido pelos hubs.
- **Penalidade de Saturação**: Se `traffic > bandwidth`, aplique penalidade de 50% na receita daquele nó.

## 📉 OPEX (Custos Operacionais)
- **Manutenção de Nó**: Custo fixo por nível (`node.level * base_cost`).
- **Custo de Link**: Proporcional à distância e ao tipo de cabo (Fibra vs Satélite).
- **Penalidade de Era**: Custos aumentam 15% a cada transição de Era para refletir a complexidade tecnológica.

## 📈 Milestone Alignment
- Use as constantes `ERAS` no `useISPStore.ts` para gatilhos de progressão. Nunca use números mágicos no loop de simulação.

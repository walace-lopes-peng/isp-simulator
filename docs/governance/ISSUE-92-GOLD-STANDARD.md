# Issue #92: [GOVERNANCE] Establishment of the Development 'Gold Standard' (Staff Workflow)

## 📋 Sumário
Estabelecer um novo **Padrão de Ouro (Gold Standard)** de desenvolvimento para garantir validação rigorosa e excelência técnica em todas as contribuições, seguindo o modelo de sucesso da implementação recente.

---

## 🏗️ Workflow de Engenheiro Staff

A partir de agora, toda tarefa de implementação deve seguir obrigatoriamente estes quatro pilares:

### 1. Fase de Design & TDD (Test-Driven Development)
Antes de qualquer linha de código de produção:
- **Análise de Impacto:** Identificar módulos afetados (Store, Workers, UI).
- **Escopo de Teste:** Definir testes unitários e de integração necessários via **Vitest**.
- **Red-Green Pattern:** Propor o arquivo de teste descrevendo o comportamento esperado (falhando inicialmente) antes da solução.

### 2. Requisitos de Implementação (O "Código Sênior")
- **Arquitetura:** Evitar 'Frankenstein nodes'. Uso nativo de stores (`useISPStore`) com fallbacks de dados e tipagem forte (TypeScript).
- **Lógica vs. Física:** Separação de cálculos pesados em **Workers** (`SimulationWorker`) para manter a UI fluida (60 FPS).
- **Tratamento de Erros:** Proibição de falhas silenciosas. Implementação de logs e tratamento exaustivo de 'Edge Cases' (ex: sinal=0, distância excedida).

### 3. Protocolo de Auditoria e Verificação
Auto-auditoria obrigatória pós-implementação:
- **Performance:** Checagem de vazamentos de memória (memory leaks) e renders desnecessários.
- **Resiliência:** Validação de comportamento sob dados inesperados ou malformados.

### 4. Entrega de PR (Pull Request)
Todo PR deve conter:
- **Descrição Técnica:** O racional por trás das decisões arquiteturais.
- **Relatório de Testes:** Evidência de que a suite Vitest passou 100%.
- **Manual QA Runbook:** Guia passo-a-passo (Walkthrough) para validação manual no navegador (`npm run dev`).

---

## ✅ Critérios de Aceite
- [ ] Documento `GOLD_STANDARD.md` (ou similar) oficializado no repositório.
- [ ] Atualização das `AI_RULES.md` para referenciar este workflow.
- [ ] Modelo de PR atualizado para refletir os novos requisitos.

---
**Status:** OPEN
**Prioridade:** P1-High
**Labels:** `governance`, `architecture`, `documentation`

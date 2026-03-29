# The Development "Gold Standard" (Staff Engineer Workflow) 🛡️

Este documento estabelece os padrões técnicos e operacionais obrigatórios para todas as contribuições no **ISP Simulator**. O objetivo é garantir que nenhuma funcionalidade seja mesclada sem validação rigorosa e excelência arquitetural.

---

## 🏗️ Workflow de Engenheiro Staff

Cada tarefa de implementação deve obrigatoriamente seguir os quatro pilares abaixo:

### 1. Fase de Design & TDD (Test-Driven Development)
Antes de escrever o código da funcionalidade:
- **Análise de Impacto:** Identificar quais módulos existentes (`Store`, `Workers`, `UI`) podem ser afetados pela mudança.
- **Escopo de Teste:** Definir quais testes unitários e de integração são necessários utilizando **Vitest**.
- **Red-Green Pattern:** É obrigatório propor o arquivo de teste descrevendo o comportamento esperado (que deve falhar inicialmente) antes de escrever a solução técnica.

### 2. Requisitos de Implementação (O "Código Sênior")
- **Arquitetura Resiliente:** Evitar 'Frankenstein nodes'. Utilizar as stores (`useISPStore.ts`) de forma nativa, com fallbacks de dados seguros e tipagem TypeScript forte (`interface`).
- **Lógica de Negócio vs. Física:** Separar cálculos matemáticos pesados ou iterativos em **Workers** (`SimulationWorker.ts`) para manter a interface (UI) fluida e responsiva (60 FPS).
- **Tratamento de Erros:** Proibição de falhas silenciosas. Implementar logs claros (`addLog`) e tratamentos exaustivos de 'Edge Cases' (ex: o que acontece se o sinal for 0 ou a distância for excedida?).

### 3. Protocolo de Auditoria e Verificação
Auto-auditoria obrigatória pós-implementação sob duas perspectivas:
- **Perspectiva de Performance:** Verificar se há vazamentos de memória (memory leaks) ou re-renders desnecessários em componentes React.
- **Perspectiva de Segurança/Resiliência:** O código deve ser capaz de lidar com dados inesperados, nulos ou malformados sem quebrar a simulação.

### 4. Entrega de PR (Pull Request)
Todo Pull Request deve conter:
- **Descrição Técnica:** O "porquê" das decisões tomadas e a justificativa arquitetural.
- **Relatório de Testes:** Confirmação explícita de que a suite Vitest passou 100%.
- **Manual QA Runbook:** Um guia passo-a-passo (Walkthrough) para que o revisor/usuário valide manualmente o comportamento no navegador (`npm run dev`).

---

## ✅ Critérios de Aceite para Merges
- Código 100% testado e validado.
- Separação clara entre o motor de simulação e a camada de renderização.
- Documentação atualizada caso novas fórmulas ou padrões sejam introduzidos.

---
**Lead Authorization:** *Staff Verified — BP-v1.4*

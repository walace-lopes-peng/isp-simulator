## [TIPO] Nome da Issue

O objetivo desta issue é [Descreva aqui o objetivo macro da funcionalidade ou correção].

### 🛠️ Especificações Técnicas

1. **Arquitetura de Dados & State Management**
   - **Data Provider**: [Defina a origem dos dados: API, InitialState, JSON mock, etc.]
   - **State Manager**: `useISPStore` [Mencione as chaves do estado afetadas, ex: `nodes`, `traffic`, `revenue`]
   - **Logic Hooks**: [Hook name ou função core afetada, ex: `useBFS`, `tick()`, `calculateRevenue`]

2. **Requisitos de UI/UX**
   - **Estilo (CSS/Tailwind)**: [Cores das Eras: `theme-70s`, `theme-90s`, `theme-modern`]
   - **Feedback Visual**: [Animações, cores de link, estados de hover]
   - **Interatividade**: [Arraste de nós, cliques, zoom levels]

3. **Invariantes Lógicos**
   - [ ] As fórmulas de rede devem respeitar `ARCHITECTURE.md`.
   - [ ] Nenhuma lógica de negócio deve vazar para componentes React.

### ⛓️ Coordenação de Dependências

- **Dependência Crítica**: issue #[ID] [Breve descrição se bloqueia ou é bloqueada].
- **Sincronização Visual**: [Componentes que devem ser atualizados simultaneamente].
- **Qualidade Visual**: [Check-list de consistência de Era].

---

### ✅ Definição de Pronto (DoD)

- [ ] Lógica matemática isolada no Zustand Store.
- [ ] UI respeita o sistema de temas dinâmicos (Tailwind).
- [ ] Teste de estresse: O sistema não quebra com valores extremos.
* [ ] Performance: Garantir renderização estável a 60fps em clusters densos.
- [ ] Documentação atualizada no `/docs` ou `agent-instructions.md`.

---

**Hipótese:** [Insira aqui o valor esperado ou suposição técnica da implementação].

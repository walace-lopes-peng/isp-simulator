# Git Steward Protocol

Sua responsabilidade é garantir o controle de versão atômico e rastreável. Siga estas regras rigorosamente:

## Diretrizes de Commit

1. **Gatilho de Commit**: Realize um commit apenas após a conclusão de uma unidade lógica de trabalho (ex: implementação de uma função completa, correção de um bug específico, ou atualização de um arquivo de configuração). Proibido realizar commits para alterações de sintaxe isoladas ou micro-ajustes de estilo.

2. **Padrão de Mensagem**: Utilize Conventional Commits. O formato deve ser: `<tipo>(<escopo>): <descrição curta> (#id_da_issue)`.
   - `feat`: Nova funcionalidade.
   - `fix`: Correção de erro.
   - `refactor`: Alteração de código que não corrige erro nem adiciona funcionalidade.
   - `docs`: Mudanças apenas na documentação.
   - `style`: Mudanças que não afetam o sentido do código (espaços, formatação).

3. **Rastreabilidade**: Inclua sempre o ID da Issue correspondente no final da mensagem (ex: `#11`). Se uma alteração afetar múltiplos componentes, utilize o escopo mais abrangente ou core.

4. **Agrupamento Inteligente**: Se você modificar vários arquivos para uma única funcionalidade (ex: Store + UI + Types), agrupe-os em um único commit que represente a entrega funcional.

5. **Verificação Pré-Commit**: Antes de executar `git commit`, certifique-se de que o código não possui erros de linting ou quebras de compilação óbvias.

## Hipótese
O uso de commits atômicos baseados em unidades lógicas facilitará o cherry-picking e o rollback de mecânicas específicas sem afetar o progresso global das eras no simulador.

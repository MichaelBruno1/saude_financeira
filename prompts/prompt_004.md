Número: Prompt 004

Título: Cadastro de Gastos Categorizados, Inputs de Cartão e Tabelas de Despesas

Objetivo:
Implementar o fluxo completo de gerenciamento de despesas, incluindo a inserção de gastos com campos específicos, tratamento condicional do formulário para compras no cartão de crédito parcelado, exibição dinâmica em listas tabulares correspondentes ao mês corrente selecionado e suporte para a remoção de gastos cadastrados.

Contexto Atual:
Interface estruturada em abas mensais e controle de múltiplos perfis funcionando perfeitamente de forma integrada com o estado reativo e persistência local.

Arquitetura Afetada:
* `index.html` (Inclusão de formulário/modal de inserção de gastos e tabela de listagem de despesas do mês)
* `js/ui.js` (Mapeamento de inputs de despesas, validação e atualização da tabela de despesas)

Dependências:
* Prompt 003

Milestone:
Milestone 4 — Cadastro de Gastos

Complexidade:
Média

Tempo Estimado:
4 horas

Estimativa de Tokens:
~3.900 tokens

Arquivos Existentes:
* index.html
* js/ui.js
* js/state.js

Arquivos Permitidos:
Qualquer arquivo dentro de `js/` ou `index.html`.

Arquivos Proibidos:
Nenhum.

Arquivos Criados:
Nenhum.

Arquivos Alterados:
* `index.html`
* `js/ui.js`
* `CHANGELOG.md`

Arquivos Removidos:
Nenhum.

Implementação:

1. Modificações no `index.html`:
   - Adicionar o botão "Adicionar Gasto" na área de controle mensal.
   - Criar um formulário modal para inclusão de novos gastos contendo os campos:
     - Descrição (ex: "Compra mercado", "Dentista").
     - Valor do gasto (em moeda decimal).
     - Categoria: Dropdown select obrigatório contendo exatamente: Saúde, Alimentação, Moradia, Cartão de Crédito, Lazer, Serviços por Assinatura, Outros.
     - Campo condicional "Número de Parcelas" (visível apenas se a Categoria selecionada for "Cartão de Crédito"). Por padrão deve iniciar invisível e com valor igual a `1`.
     - Mês de Início: Dropdown select pré-selecionado com o mês ativo atual da aba.
   - Criar uma tabela na área principal de visualização do mês para listar as despesas:
     - Colunas: Descrição, Categoria, Valor, Parcelas (exibe "À vista" ou a contagem, ex: "12x"), Mês Início, Ações.
     - Coluna de Ações: Botão com ícone ou texto "Excluir" para apagar a despesa.

2. Atualizações no `js/ui.js`:
   - Lógica do formulário de gastos:
     - Adicionar um listener do tipo `change` no select de Categorias do formulário. Se o valor for "Cartão de Crédito", remover a classe CSS `hidden` do campo "Número de Parcelas". Para qualquer outra categoria, reinserir a classe `hidden` e forçar o valor para `1`.
   - Método `renderDespesas()`:
     - Filtrar a lista total de despesas do Estado pelo perfil ativo atual.
     - Filtrar adicionalmente as despesas que afetam o mês corrente da aba selecionada (Nota: Neste estágio, mostramos apenas despesas simples iniciadas no mês selecionado. A lógica matemática complexa de projetar parcelas em meses seguintes será desenvolvida na engine do Prompt 005. Atualmente mostre as despesas cujo `mes_inicio` é igual ao mês corrente selecionado).
     - Preencher a tabela de despesas com os registros filtrados de forma limpa.
     - Exibir mensagem amigável "Nenhum gasto cadastrado para este mês." se a tabela estiver vazia.
   - Vincular os eventos de submissão do formulário:
     - Capturar os valores, validar tipos de dados (valor maior que zero, descrição preenchida).
     - Chamar `adicionarDespesa` no Estado, fechar o modal e limpar o formulário.
   - Vincular cliques nos botões "Excluir" das linhas da tabela:
     - Chamar `removerDespesa` no Estado para apagar o registro fisicamente.

Testes Necessários:
* Abrir o modal de adicionar gasto e selecionar "Cartão de Crédito" para validar se o input de parcelas aparece em tela, e se desaparece ao escolher "Lazer".
* Cadastrar diferentes gastos em meses distintos e verificar se eles aparecem exclusivamente nas respectivas abas mensais corretas.
* Clicar no botão "Excluir" de uma despesa cadastrada e checar se ela desaparece da tabela imediatamente e se os dados salvos em LocalStorage permanecem coerentes.

Critérios de Aceite:
* O campo de número de parcelas deve ser validado para aceitar apenas valores numéricos inteiros maiores que `1` (ou `1` para compras não parceladas).
* A listagem de despesas deve manter uma formatação limpa e legível (valores monetários formatados como `R$ 0.00` ou similar local).
* A exclusão de gastos deve despoletar gravação física automática no LocalStorage sem requerer refresh da página.

Definition of Done:
✓ Projeto inicia
✓ Build OK
✓ Sem erros no console
✓ Sem warnings críticos
✓ Formulário dinâmico de gastos testado e operacional
✓ Tabela de despesas preenchida em tempo real por abas
✓ Remoção de gastos implementada com sucesso
✓ CHANGELOG atualizado

Checklist:
[ ] Build OK
[ ] Projeto inicia
[ ] Sem erros
[ ] Sem warnings críticos
[ ] Campos de formulário com regras de visibilidade funcionando
[ ] Cadastro e exclusão de gastos funcionando e integrados no LocalStorage
[ ] Documentação atualizada
[ ] Manifesto atualizado
[ ] Changelog atualizado
[ ] History atualizado
[ ] MVP funcional

Próximos Passos:
Proceder para o Prompt 005 para desenvolver as rotinas lógicas e matemáticas avançadas do Motor Financeiro de cálculo de saldos e projeções matemáticas das parcelas de cartões de crédito.

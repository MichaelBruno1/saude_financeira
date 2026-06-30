Número: Prompt 005

Título: Motor de Cálculos Financeiros e Distribuição de Parcelas de Cartão de Crédito

Objetivo:
Implementar a lógica de negócios e cálculos matemáticos avançados no arquivo `js/engine.js`. O motor deve calcular a projeção temporal das parcelas de cartões de crédito ao longo do ano fiscal atual e subsequente, sumarizar os gastos por categoria de despesa e computar o balanço líquido restante do salário base de forma incremental e precisa.

Contexto Atual:
Interface gráfica contendo cadastros de perfis, salários e fluxo de inserção de gastos categorizados em tabelas funcionando de forma estática com dados locais.

Arquitetura Afetada:
* `js/engine.js` (Implementação de cálculos puramente matemáticos e algoritmos de amortização)
* `js/ui.js` (Substituição da lógica estática de exibição de tabelas pelos resultados calculados da engine)
* `index.html` (Inclusão de boxes informativos de somatórios e balanços na tela)

Dependências:
* Prompt 004

Milestone:
Milestone 5 — Motor de Projeções e Cálculos Financeiros

Complexidade:
Alta

Tempo Estimado:
5 horas

Estimativa de Tokens:
~4.500 tokens

Arquivos Existentes:
* js/engine.js
* js/ui.js
* js/state.js
* index.html

Arquivos Permitidos:
Qualquer arquivo dentro de `js/` ou `index.html`.

Arquivos Proibidos:
Nenhum.

Arquivos Criados:
Nenhum.

Arquivos Alterados:
* `js/engine.js`
* `js/ui.js`
* `index.html`
* `CHANGELOG.md`

Arquivos Removidos:
Nenhum.

Implementação:

1. Codificar o módulo puro `js/engine.js`:
   - Função `distributeExpense(despesa)`: Recebe uma única despesa. Se for de "Cartão de Crédito" e possuir parcelas $P > 1$, calcula um array de tamanho $P$ distribuindo o valor da parcela $V / P$ a partir de `mes_inicio` de forma subsequente (ex: se `mes_inicio` for 10 (Outubro) e tiver 4 parcelas, as parcelas serão devidas nos meses 10, 11, 12 do ano corrente e mês 1 do ano seguinte).
   - Função `calculateMonthlySummary(perfil, mes, despesas)`:
     - Filtra as despesas do perfil.
     - Processa todas as despesas normais devidas no mês solicitado (onde `mes_inicio == mes`).
     - Processa compras parceladas de cartão de crédito que tenham parcelas ativas incidindo no mês selecionado.
     - Retorna um objeto consolidado contendo:
       - `gastosPorCategoria`: Um dicionário mapeando cada uma das 7 categorias para o total acumulado gasto nelas para o mês em questão.
       - `porcentagemPorCategoria`: Dicionário calculando o peso percentual que cada categoria consome do salário do perfil. Formula: `(gastoCategoria / salario) * 100`.
       - `totalGastos`: Soma geral de todas as despesas ativas do mês (considerando apenas a parcela mensal para compras no cartão de crédito).
       - `saldoRestante`: O salário base do perfil deduzido de todos os gastos daquele mês (ou seja, `salario - totalGastos`).

2. Ajustar a renderização da tabela de despesas e cards de resumos em `js/ui.js`:
   - Atualizar `renderDespesas()` para exibir não apenas os gastos fixos criados no mês selecionado, mas também as parcelas vigentes originárias de meses anteriores de cartão de crédito que incidem no mês visualizado (indicando com clareza a parcela, ex: "Parcela 3 de 12", e calculando o valor correspondente da parcela `valorTotal / totalParcelas`).
   - Adicionar boxes ou cards informativos visuais (Widget Blocks) acima da tabela para destacar de forma instantânea:
     - **Salário Mensal** (exibindo o salário base).
     - **Total Gasto no Mês** (soma consolidada de gastos comuns e parcelas daquele mês).
     - **Saldo Disponível** (Salário base subtraído de todas as despesas). Aplicar classes de cor do Tailwind: texto verde se for positivo, texto vermelho se for negativo para atenção visual imediata.

3. Atualizar as chamadas de renderização no `js/app.js` para certificar que as manipulações do DOM de resumo consultem a engine matemática em tempo real.

Testes Necessários:
* Simular cadastro de uma despesa simples de $1000 em "Moradia" em Janeiro. Verificar se o saldo do mês cai exatamente $1000.
* Simular compra de $1200 em "Cartão de Crédito" parcelada em 12 vezes com início em Janeiro. Verificar se em Janeiro é listada apenas a parcela de $100 e se essa parcela de $100 continua a ser cobrada mensalmente nas abas de Fevereiro, Março até Dezembro de forma sequencial.
* Testar compras em meses avançados (ex: compra em Novembro de $300 parcelada em 3 vezes), verificando se as parcelas 1 e 2 aparecem nos meses 11 (Novembro) e 12 (Dezembro) e se a parcela 3 é computada de forma transparente para o Janeiro do ano subsequente.

Critérios de Aceite:
* A distribuição de parcelas de cartão de crédito não deve sofrer com erros de precisão decimal (utilizar arredondamentos ou formatações a duas casas decimais, ex: `toFixed(2)`).
* Para qualquer despesa que não seja da categoria "Cartão de Crédito", o cálculo deve assumir que o gasto é integralmente cobrado de uma única vez no próprio mês de início (`parcelas = 1`).
* Ao deletar um gasto parcelado, todos os meses subsequentes afetados pelas parcelas restantes devem recalcular seus saldos imediatamente.

Definition of Done:
✓ Projeto inicia
✓ Build OK
✓ Sem erros de console e cálculos perfeitos
✓ Tabelas exibem parcelas corretas vigentes e saldos mensais computados
✓ Cards informativos dinâmicos com cores condicionais funcionais
✓ CHANGELOG atualizado

Checklist:
[ ] Build OK
[ ] Projeto inicia
[ ] Sem erros lógicos ou de cálculos matemáticos de parcelamento
[ ] Totalizadores mensais e fatias de salário calculadas na tela de forma fidedigna
[ ] Documentação atualizada
[ ] Manifesto atualizado
[ ] Changelog atualizado
[ ] History atualizado
[ ] MVP funcional

Próximos Passos:
Proceder para o Prompt 006 para implementar o Dashboard de Relatórios completo, incorporando a renderização dinâmica de gráficos de faturamento em pizza e gráficos temporais de projeção de linhas do Chart.js.

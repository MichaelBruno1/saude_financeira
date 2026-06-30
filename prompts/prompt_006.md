Número: Prompt 006

Título: Dashboard de Relatórios e Gráficos Interativos (Line & Pie Charts)

Objetivo:
Implementar a aba especial de "Relatório" no painel, integrando a biblioteca Chart.js no arquivo `js/charts.js` para renderizar gráficos dinâmicos: um gráfico de linha mostrando a evolução acumulada e projeção das parcelas de cartões de crédito ao longo do tempo, e um gráfico de pizza que fatiará os gastos de forma setorial por categorias, além de cartões informativos contendo percentuais de despesas e saldos líquidos.

Contexto Atual:
A aplicação possui controle de estado, persistência em LocalStorage, importação/exportação de CSV, navegação em abas mensais e motor financeiro com cálculos perfeitos de distribuição de parcelas e somas operacionais.

Arquitetura Afetada:
* `index.html` (Desenvolvimento da aba de visualização dos relatórios e posicionamento de elementos `<canvas>`)
* `js/charts.js` (Implementação de instâncias, atualizações e destruição de gráficos do Chart.js)
* `js/ui.js` (Acoplamento dos eventos da aba de relatórios com as chamadas de renderização de gráficos)

Dependências:
* Prompt 005

Milestone:
Milestone 6 — Dashboard de Relatórios com Gráficos Interativos

Complexidade:
Alta

Tempo Estimado:
5 horas

Estimativa de Tokens:
~4.200 tokens

Arquivos Existentes:
* index.html
* js/charts.js
* js/ui.js
* js/engine.js

Arquivos Permitidos:
Qualquer arquivo dentro de `js/` ou `index.html`.

Arquivos Proibidos:
Nenhum.

Arquivos Criados:
Nenhum.

Arquivos Alterados:
* `index.html`
* `js/charts.js`
* `js/ui.js`
* `CHANGELOG.md`

Arquivos Removidos:
Nenhum.

Implementação:

1. No arquivo `index.html`:
   - Estruturar o conteúdo visual do painel "Relatório" (aba especial ativada ao clicar na última aba da barra de navegação).
   - Criar uma grid responsiva contendo:
     - Bloco esquerdo: Gráfico de Pizza para visualização de "Gastos por Categoria".
     - Bloco direito: Gráfico de Linha para "Projeção de Parcelas de Cartão".
     - Barra de ferramentas/Filtros: Dropdown para escolher qual o mês de análise do faturamento de pizza (ou opção de visualização consolidada anual).
     - Painel de Metas/Resumos: Listagem numérica com barras de progresso horizontais coloridas de fatiamento percentual que cada categoria consome do salário total.

2. Desenvolver o módulo de Gráficos em `js/charts.js`:
   - Armazenar referências globais internas das instâncias dos gráficos ativos (`chartPizzaInstance`, `chartLinhaInstance`) para poder destruí-las (`destroy()`) de forma segura antes de renderizar novos gráficos, evitando sobreposições visuais e vazamento de memória (Memory Leak).
   - Método `renderPizzaChart(canvasId, categoriasData)`: Recebe o ID do canvas e as fatias monetárias por categoria calculadas pelo `js/engine.js`. Inicializa ou atualiza o gráfico de pizza (Doughnut ou Pie Chart) com paleta de cores elegantes e bem diferenciadas do Tailwind (ex: Esmeralda para Moradia, Azul para Alimentação, Vermelho para Cartão, etc.).
   - Método `renderLineChart(canvasId, projecaoCartaoData)`: Recebe a série temporal projetada pela engine e monta o gráfico de linha (Line Chart) mostrando a evolução gradual da soma de todas as parcelas do cartão de crédito de mês em mês até que chegue a zero (representando o pagamento total da dívida).
   - Tratar estados vazios: Se o perfil não possuir gastos cadastrados, desenhar uma imagem ou mensagem de placeholder elegante no canvas impedindo gráficos cinzas vazios de quebrarem o layout.

3. Atualizar as rotinas de visualização em `js/ui.js`:
   - No método de seleção de abas, ao alternar para a aba "Relatório":
     - Ocultar a tabela de despesas mensais e controles de adição de despesa.
     - Tornar visível o container do Dashboard de Relatório.
     - Chamar os métodos de cálculos matemáticos de faturamento acumulado em `js/engine.js`.
     - Chamar os renderizadores de gráfico em `js/charts.js` repassando os arrays calculados de dados.
   - Adicionar o controle do seletor de meses de faturamento para que a pizza atualize instantaneamente ao trocar o mês de referência de análise.

Testes Necessários:
* Acessar a aba "Relatório" e validar se os gráficos de linha e pizza aparecem em conformidade de posicionamento e design adaptativo.
* Cadastrar uma compra parcelada de cartão e verificar se o gráfico de linhas traça corretamente a projeção de declínio de valores nos meses futuros em que as parcelas incidem.
* Interagir com filtros de meses do gráfico de pizza e verificar se as fatias orçamentárias se comportam de forma reativa instantaneamente de acordo com os cadastros reais daquele mês específico.

Critérios de Aceite:
* Os gráficos de pizza devem exibir legenda visível contendo o nome da categoria e o respectivo valor formatado ou percentagem representativa.
* As instâncias antigas dos gráficos devem ser incondicionalmente limpas do Canvas antes de novas renderizações para prevenir bugs visuais de renderização fantasmas (ao passar o mouse por cima do gráfico).
* Toda a interface do dashboard deve se adaptar perfeitamente a resoluções de tablets e notebooks sem transbordamento de tela (overflow).

Definition of Done:
✓ Projeto inicia
✓ Build OK
✓ Sem erros no console
✓ Gráfico de pizza interativo de gastos setoriais operacional
✓ Gráfico de linha de projeção acumulada do cartão implementado com sucesso
✓ Painel de métricas percentuais de salário integrado
✓ CHANGELOG atualizado

Checklist:
[ ] Build OK
[ ] Projeto inicia
[ ] Sem erros
[ ] Sem warnings críticos
[ ] Gráfico de fatiamento setorial operacional por categoria
[ ] Gráfico de linhas de projeção de parcelamentos funcional
[ ] Documentação atualizada
[ ] Manifesto atualizado
[ ] Changelog atualizado
[ ] History atualizado
[ ] MVP funcional

Próximos Passos:
Proceder para o Prompt 007 para escrever a bateria de testes unitários que blindará a lógica de negócios e as rotinas de persistência e CSV, efetuando o polimento visual final do sistema.

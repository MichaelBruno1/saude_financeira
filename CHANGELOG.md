# Changelog

Todos os marcos importantes de desenvolvimento do projeto **Saúde Financeira** serão documentados neste arquivo.

## [1.1.2] - 2026-07-02

### Corrigido
- **Diagnóstico de CORS em Chamadas de API Locais (localhost)**:
  - Adicionada detecção inteligente no tratamento de erro da chamada da LLM em `js/ui.js`.
  - Exibição de dicas úteis no caso de requisições de servidores locais (ex: LM Studio ou Ollama) via protocolo `file://`, orientando o usuário a subir o projeto com `npm run dev` ou habilitar permissões de wildcard CORS no servidor local.
  - Bumping de versão para **v1.1.2** em `index.html`.

## [1.1.1] - 2026-07-02

### Corrigido
- **Suporte Offline file:// e Evitação de CORS**:
  - Correção do erro de CORS causado por requisições `fetch()` locais de arquivos JSON e Markdown ao rodar a aplicação diretamente pelo protocolo `file:///`.
  - Migração de `llm_config.json` para `llm_config.js` e de `prompts/analise.md` para `prompts/analise.js`.
  - Importação de dados estáticos via tags `<script>` no `index.html` injetando os dados em variáveis globais `window.App.LlmConfig` e `window.App.LlmPromptTemplate`.
  - Bumping de versão para **v1.1.1** em `index.html`.

## [1.1.0] - 2026-07-02

### Adicionado
- **Análise Financeira com Inteligência Artificial**:
  - Criação do painel de Análise Financeira no painel de relatórios.
  - Implementação do botão "Gerar análise inteligente" para submeter os dados do perfil atual à LLM e exibir o diagnóstico abaixo.
  - Remoção dos campos de IA das configurações e criação do arquivo local de parametrização `llm_config.js` (ignorado no `.gitignore` por segurança).

## [1.0.6] - 2026-06-30

### Removido
- **Desenvolvedor: Depurador de Estado RAM (JSON)**:
  - Remoção completa do painel colapsável de depuração na interface visual (`index.html`).
  - Remoção de variáveis declaradas, listeners de eventos, referências de DOM e atualização de JSON de estado em `js/ui.js`.
  - Bumping de versão para **v1.0.6** em `index.html`.

## [1.0.5] - 2026-06-30

### Corrigido
- **Consolidação de Despesas de Investimento**:
  - Correção na inicialização das categorias nos métodos `calculateMonthlySummary` e `calculateAnnualSummary` em `js/engine.js`.
  - Adição do método auxiliar `getCategoriesList()` para buscar dinamicamente as categorias registradas no estado ativo (incluindo "Investimento" e qualquer categoria criada customizadamente pelo usuário).
  - Evita que gastos da categoria "Investimento" caiam no fallback de "Outros" ao gerar sumários e relatórios.
  - Bumping de versão para **v1.0.5** em `index.html`.

## [1.0.4] - 2026-06-30

### Modificado
- **Status da Categoria Investimento**:
  - Ajuste na lógica de status da categoria "Investimento" no Planejador Financeiro (aba de Relatórios).
  - Status mudado para "Ruim" (badge vermelho) se o gasto real for menor que o limite.
  - Status mantido como "OK" (badge verde) se o gasto real for igual ao limite.
  - Status mudado para "Excelente" (badge ciano) se o gasto real for maior que o limite.
  - Bumping de versão para **v1.0.4** em `index.html`.

## [1.0.3] - 2026-06-30

### Adicionado
- **Mensagem Orçamentária em Tempo Real**:
  - Exibe quantos % serão direcionados para Investimento dinamicamente na aba de configurações.
  - Mensagem especial de conclusão do orçamento quando atinge 100% de limite.

## [1.0.2] - 2026-06-30

### Modificado
- **Estilização e Alinhamento**:
  - Centralização do botão de "Salvar Porcentagens" na tela de editar limites do planejador.
  - Unificação de classe e estilo com o botão "Cadastrar Categoria".

## [1.0.1] - 2026-06-30

### Modificado
- **Ajustes de UI no Planejador**:
  - Remoção da categoria "Financiamento" da tela de limites de configurações.
  - Alinhamento à esquerda para o seletor de método na tela de configurações.
  - Inclusão da observação informando sobre gastos de financiamento considerados como moradia.

## [1.0.0] - 2026-06-30

### Adicionado
- **Planejador Financeiro (`index.html`, `js/ui.js`, `js/state.js`, `js/charts.js`)**:
  - Nova categoria `"Investimento"` adicionada por padrão com a cor representativa `#eab308`.
  - Controle de planejamento reativo com perfis Conservador, Equilibrado e Agressivo.
  - Donut Chart recomendado no Planejador Financeiro da aba de Relatórios (oculta frações com 0%).
  - Tabela comparativa sugerindo limite máximo de gastos por categoria versus despesas reais.
  - Consolidação automática de custos de "Financiamento" como "Moradia" no cálculo comparativo real.
  - Editor numérico de limites percentuais na aba de Configurações, com cálculo dinâmico de soma total e redistribuição automática do saldo residual para "Investimento".
  - Validação estática contra orçamentos que excedem 100% de limite.
  - Bumping de versão do projeto para **v1.0.0** em `index.html`.

## [0.9.0] - 2026-06-30

### Adicionado
- **Sincronização Física no Rodapé (`index.html`)**:
  - Removido o painel "Sincronização Física" do corpo principal do menu lateral e realocado como bloco compacto e integrado no rodapé (`footer`) do menu, melhorando a organização espacial e navegabilidade da sidebar.
  - Atualizada a identificação de versão do projeto para **v0.9.0**.
- **Exportação Completa de Perfil (`js/storage.js`, `js/ui.js`)**:
  - O botão de exportação agora filtra e exporta os dados **exclusivos** do perfil selecionado (perfil ativo).
  - Incluídos despesas normais e financiamentos no mesmo arquivo CSV através da adição de novas colunas representativas (`tipo_registro`, `valor_parcela`, `taxa_tr`).
- **Importação Incremental e Criação de Perfis (`js/state.js`, `js/ui.js`)**:
  - Implementado o método `importarPerfilCSV(importedState)` para realizar carregamento incremental.
  - Se o perfil no CSV já existir no LocalStorage, o sistema atualiza o seu salário e reconstrói suas despesas e financiamentos (preservando outros perfis).
  - Se for um perfil inexistente/diferente, o sistema cria o perfil, carrega seus dados e o seleciona como o perfil ativo em exibição.

## [0.8.0] - 2026-06-30

### Adicionado
- **Aba de Configurações (`index.html`, `js/ui.js`, `js/state.js`)**:
  - Nova aba "Configurações" (`mesAtivo === 15`) adicionada no menu lateral.
  - Tela de configurações contendo cards de gerenciamento de tema, cadastro de categorias e personalização de cores.
- **Customização de Categorias e Cores (`js/state.js`, `js/ui.js`, `js/charts.js`)**:
  - Cadastro dinâmico de novas categorias com nome e cor representativa.
  - Grade de categorias cadastradas com inputs `<input type="color">` individuais para atualização de cores em tempo real.
  - Geração dinâmica de opções de categorias no modal de gastos com base no estado.
  - Exibição de pontos indicadores coloridos (`bullet dots`) dentro dos badges de categoria na tabela de gastos.
  - Gráficos (Donut e barras de progresso de orçamento) atualizados dinamicamente com as cores configuradas pelo usuário.
- **Modo Claro e Tema Responsivo (`css/style.css`, `js/ui.js`)**:
  - Botão interativo para alternar o tema do projeto.
  - Implementação de um conjunto completo de estilos premium para Light Mode (`body.theme-light`), alterando fundos, inputs, tabelas, modais, cabeçalhos, painéis e KPIs de forma suave e polida.

## [0.7.1] - 2026-06-30

### Alterado
- **Ajustes de UI e UX (`index.html` & `js/ui.js`)**:
  - Removidos da visualização do modal de cadastrar gasto os campos de "Mês Início" e "Ano Início", que agora são herdados dinamicamente com base nas abas ativa de ano/mês selecionadas.
  - Reposicionado o dropdown de período do gráfico (`#reports-pizza-month-select`) na aba de relatórios para o canto superior esquerdo, diretamente acima do gráfico de pizza.
  - Centralizado o Simulador de Amortização de financiamentos na tela de Financiamentos para melhor harmonia visual em telas amplas.

## [0.7.0] - 2026-06-30

### Adicionado
- **Arquitetura Multi-Anual (`js/state.js`, `js/engine.js`, `js/ui.js`)**:
  - Reorganização completa da base de despesas indexadas por **Ano** e **Mês**.
  - O motor de cálculo (`getInstallmentInfo`) agora opera sob **indexação absoluta de meses** (`ano * 12 + mês`), resolvendo de forma perfeita o rastreamento e a quebra anual de compras parceladas que cruzam múltiplos anos (ex: cartão 5x feito em novembro).
  - Controle de recorrência reativo que isola despesas recorrentes dentro de seu ano fiscal de criação.
  - Abas de navegação de ano (`year-tabs-container`) geradas e ordenadas dinamicamente com base no ano atual e nos anos que possuam despesas comuns ou parceladas ativas do perfil.
  - Ocultação inteligente de abas de ano se as parcelas existentes pertencerem apenas a contratos de financiamento de longuíssimo prazo, impedindo a poluição visual de abas vazias.
  - Adicionado o campo numérico **Ano Início** no modal de cadastro e edição de despesas, permitindo customização total do período de vigência.
- **Serialização Retrocompatível (`js/storage.js`)**:
  - Exportação e importação de CSV expandidas com suporte nativo às propriedades `ano_inicio` e `recorrente`.
  - Tratamento defensivo e fallback reativo para reabrir arquivos CSV legados sem as novas colunas sem causar quebras ou perda de integridade.

## [0.6.2] - 2026-06-30

### Adicionado
- **Navegação e Sidebar (`index.html` & `js/ui.js`)**:
  - Adicionado o botão "Despesas Mensais" no menu lateral esquerdo para retornar à listagem mensal comum (reabre o último mês ativo ou o mês corrente se vier das abas de relatórios/financiamento).
- **Usabilidade de Gráficos e Relatórios (`js/charts.js`, `js/ui.js`)**:
  - Definidas cores exclusivas e distintas para as novas categorias ("Serviços" e "Financiamento") no gráfico de pizza, solucionando o problema de categorias com cores duplicadas (cinza/outros).
  - Configurado o dropdown de seleção do período do gráfico de pizza para selecionar, por padrão, o mês calendário corrente do sistema ao invés do consolidado anual.

### Removido
- **Informação de Perfil Redundante (`index.html` & `js/ui.js`)**:
  - Removida a exibição do texto "Perfil: Principal" (e correlatos) do cabeçalho superior da tela inicial, mantendo o controle simplificado apenas no seletor lateral.

## [0.6.1] - 2026-06-30

### Adicionado
- **Aba de Financiamentos (`index.html` & `js/ui.js`)**:
  - Nova aba "Financiamento" (representada por `mesAtivo = 14`) que permite gerenciar contratos de crédito imobiliário ou de bens de consumo. Oculta a barra de meses para otimizar espaço de tela.
  - Formulário para cadastrar financiamentos via modal dedicado (`financing-modal`) ao clicar no botão "Cadastrar Financiamento" na barra superior.
  - Exibição de uma tabela com as informações completas dos financiamentos cadastrados: nome/descrição, progresso da parcela atual baseado no mês corrente (ex: `48 de 360`), valor total, T.R., e data de previsão de fim (mês/ano).
  - Permite a edição de T.R. e quantidade de parcelas **exclusivamente** na aba de financiamento, desabilitando (bloqueando) campos inalteráveis (Nome, Valor Total, Valor Parcela, Mês Início, Ano Início) no formulário.
  - Remoção em tempo real de financiamentos pela tabela.
- **Simulador de Amortização Extra (`js/engine.js` & `js/ui.js`)**:
  - Fórmulas matemáticas no motor financeiro para resolver a taxa de juros mensal implícita pelo método numérico Newton-Raphson.
  - Simulador de amortização extraordinária para redução de prazo (amortizando valor extra mensal ou anual direto no saldo devedor).
  - Exibição de economia financeira em juros, meses poupados, prazo residual e tabela comparativa detalhada entre os cenários.
- **Ajustes de Layout e Navegação (`index.html`, `js/ui.js` & `css/style.css`)**:
  - Removido os botões "Relatórios" e "Financiamentos" da barra superior e integrados no menu lateral esquerdo como opções de navegação principal.
  - Posicionado o botão "Adicionar Gasto" no canto esquerdo, anterior às abas dos meses, e redimensionado para corresponder exatamente à altura e estilo das abas.
  - Ajustado o fluxo de navegação para congelar os KPIs do Header (Gasto Total e Saldo Disponível) com os valores do último mês analisado ao alternar para as abas de Relatórios ou Financiamentos.
- **Integração de Financiamento na Tabela Mensal e Relatórios (`js/engine.js`, `js/ui.js`)**:
  - Exibição de parcelas de financiamentos ativos na tabela de despesas mensais sob a categoria "Financiamento", respeitando o mês e o ano de início cadastrados (calculados via diferença absoluta de meses).
  - Ajuste na formatação da coluna "Parcelas" para exibir financiamentos no formato "Parcela X de Y" (idêntico ao cartão de crédito).
  - Removido a coluna "Mês Início" da tabela mensal de despesas lançadas.
  - Exibição de financiamentos como uma categoria própria (**"Financiamento"**) nos gráficos de pizza e barras de progresso do dashboard de relatórios, isolando-o de "Moradia". Todo financiamento cadastrado é obrigatoriamente atribuído a ela.
  - Consolidação do valor de parcelas de financiamento nos KPIs e nos relatórios consolidados mensais e anuais.
- **Nova Categoria e Despesas Recorrentes (`index.html`, `js/engine.js` & `js/ui.js`)**:
  - Adicionado a categoria **"Serviços"** em toda a aplicação (com cor verde/azulada nos relatórios).
  - Adicionada a opção de **Despesas Recorrentes** no formulário de cadastro de despesas. Se marcada como "Sim", a despesa se repete integralmente todos os meses até o último mês do ano corrente (Dezembro).
- **Edição de Despesas (`js/state.js`, `js/ui.js`)**:
  - Implementado fluxo completo de edição (CRUD) reusando o modal de gastos, com possibilidade de alterar descrição, valor total, categoria, mês de início e prazo total de parcelas.
  - Formatação monetária (máscara BRL) ativa em tempo real nos inputs monetários.

## [0.6.0] - 2026-06-30

### Adicionado
- **Dashboard de Relatórios (`index.html` & `js/ui.js`)**:
  - Nova aba "Relatórios" (representada por `mesAtivo = 13`) que exibe um painel analítico avançado contendo gráficos e barras de progresso, ocultando a tabela de despesas e os botões de lançamento comuns.
  - Dropdown seletor de período para o gráfico de pizza (Janeiro a Dezembro + Consolidado Anual).
  - Listagem orçamentária dinâmica com barras de progresso horizontais coloridas refletindo a fatia percentual que cada categoria consome do salário.
- **Gráficos Interativos (`js/charts.js`)**:
  - Integração da biblioteca Chart.js via CDN.
  - Gráfico de Rosca (Doughnut) de divisão de gastos por categorias, com cores representativas, legendas dinâmicas e tooltips mostrando percentuais reais.
  - Gráfico de Linha traçando a projeção mensal acumulada de parcelas de cartão de crédito de Janeiro a Dezembro com gradiente visual sob a curva.
  - placeholders dinâmicos elegantes exibidos se a base de dados estiver vazia.
  - Descarte e limpeza explícita de instâncias de gráficos (`.destroy()`) antes de cada renderização para prevenir bugs visuais na tela.

### Modificado
- `js/engine.js` estendido com funções de Projeção Mensal de Cartão e Consolidado Anual.
- `eslint.config.js` atualizado para declarar a biblioteca global `Chart`.

## [0.5.0] - 2026-06-30

### Adicionado
- **Motor Financeiro (`js/engine.js`)**:
  - Função `getInstallmentInfo` para projetar parcelas ativas no mês visualizado, calculando o índice e o valor proporcional da parcela com arredondamento seguro a duas casas decimais. Suporta rolagem circular de ano fiscal (ex: compra em novembro parcelada em 3 vezes incide em janeiro).
  - Função `calculateMonthlySummary` para totalizar gastos por categoria, calcular o peso percentual de cada categoria sobre o salário base, computar o total geral gasto e o saldo disponível do mês.
- **Card de Saldo Disponível (`index.html` & `js/ui.js`)**: Novo card no cabeçalho superior exibindo o saldo disponível calculado. Modifica o estilo condicionalmente: verde (`text-emerald-400`) para saldos positivos e vermelho (`text-rose-400`) para saldos negativos.
- **Visualização de Parcelas no Mês (`js/ui.js`)**: A tabela agora exibe as parcelas vigentes de cartão de crédito originárias de meses passados (ex: "Parcela 2 de 12" e o respectivo valor amortizado).
- **Recálculo em Cadeia (`js/ui.js`)**: A exclusão ou edição de qualquer dado dispara instantaneamente o recálculo e a atualização de todos os saldos e parcelas dos meses vigentes e subsequentes.

### Modificado
- `index.html` atualizado com o card de Saldo no header e ajuste de textos de KPI.
- `js/ui.js` atualizado para se comunicar com o motor de cálculos em tempo real.

## [0.4.0] - 2026-06-30

### Adicionado
- **Modal de Lançamento de Gastos (`index.html` & `js/ui.js`)**: Botão "Adicionar Gasto" nas abas de meses que abre o modal de cadastro. Os campos incluem descrição, valor decimal, categoria dropdown e mês início dropdown.
- **Campos de Formulário Condicionais (`js/ui.js`)**: Input "Número de Parcelas" aparece somente se a categoria selecionada for "Cartão de Crédito". Para qualquer outra categoria, o campo é ocultado e o valor forçado para `1`.
- **Tabela de Despesas de Mês Inteiro (`index.html` & `js/ui.js`)**: A tabela foi estendida para a largura total da tela, ocultando o formulário estático anterior. Filtra e exibe de imediato os gastos iniciados no mês selecionado.
- **Validações de Entrada (`js/ui.js`)**: Regras que validam descrição não vazia, valores decimais estritamente positivos e número de parcelas inteiras maiores ou iguais a 1.
- **Ações de Exclusão Física (`js/ui.js`)**: Botão "Excluir" em cada linha que deleta o gasto em tempo real do estado central e do LocalStorage.

### Modificado
- `index.html` e `js/ui.js` atualizados com os novos elementos e a lógica de modal condicional e tabela expandida.

## [0.3.0] - 2026-06-30

### Adicionado
- **Abas Mensais (`index.html` & `js/ui.js`)**: Barra horizontal responsiva contendo os 12 meses do ano para navegação. O mês ativo recebe destaque visual e atualiza o estado central.
- **Gestão de Perfis por Modal (`index.html` & `js/ui.js`)**: Botão na barra lateral que abre um modal estilizado para criação de novos perfis com salário inicial.
- **Edição Inline de Salário (`index.html` & `js/ui.js`)**: Permite alterar o salário base do perfil ativo diretamente no header através de um input inline.
- **Depurador de Estado Colapsável (`index.html` & `js/ui.js`)**: O State Debugger foi movido para o rodapé em formato sanfona para manter a interface limpa.
- **Estilos de Componentes (`css/style.css`)**: Regras para abas de meses ativas e animações de escala para modais.

### Modificado
- `js/state.js` estendido com a propriedade `mesAtivo` (default 1) e o método `selecionarMes(mes)`.
- `js/ui.js` refatorado para remover formulários legados de teste e implementar as novas escutas de evento e métodos de renderização (`renderAbas`, `renderPerfis`, `renderSalario`).

## [0.2.0] - 2026-06-30

### Adicionado
- **State Manager (`js/state.js`)**: Gerenciador de estado em memória RAM com suporte à reatividade (padrão Observer). Métodos para manipular múltiplos perfis e despesas de forma reativa.
- **Storage Engine (`js/storage.js`)**: Sincronização síncrona automática com o LocalStorage sob a chave `saude_financeira_db`.
- **Conversor/Parser CSV (`js/storage.js`)**:
  - Conversor de estado em CSV padronizado.
  - Parser robusto de CSV resiliente a quebras de linha (`\r\n` e `\n`), espaços em excesso e aspas.
  - Detecção automática de delimitadores (vírgula `,` e ponto e vírgula `;`).
  - Salvamento de perfis vazios (sem despesas) na exportação/importação de CSV para evitar perda de dados.
- **Estrutura Base e Arquitetura**:
  - Criação da infraestrutura básica ausente (arquivos do Prompt 001).
  - Folha de estilo `css/style.css` com suporte a transições, barras de rolagem personalizadas e glassmorphism.
  - `index.html` com layout de sidebar moderno integrado com Tailwind CSS e Chart.js via CDN.
  - Esqueleto para `js/engine.js` e `js/charts.js` definindo os namespaces de arquitetura.
- **Painel de Validação Temporário**: Adicionado um State Debugger em tempo real na UI para visualização do estado central (JSON) e formulários rápidos para testes manuais.

### Modificado
- `package.json` atualizado com scripts de desenvolvimento local, linting e testes unitários. lite-server corrigido para a versão estável `2.6.1`.
- `eslint.config.js` atualizado para validar ES6+ Vanilla com tratamento correto de escopo e variáveis globais (`setTimeout`, `localStorage`, `App`).

## [0.1.0] - 2026-06-29
- Setup conceitual da arquitetura do projeto.

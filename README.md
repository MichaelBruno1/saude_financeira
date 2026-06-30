# Saúde Financeira

Uma aplicação de gestão de saúde financeira pessoal estritamente cliente (Frontend local) executada a partir de um arquivo único `index.html`.

## Funcionalidades
* **Múltiplos Perfis**: Gerenciamento de perfis com seus respectivos salários bases e chaves isoladas.
* **Calendário Multi-Anual Dinâmico**: Visualização e lançamento de gastos estruturados em abas de anos e meses criados dinamicamente com base nas despesas cadastradas.
* **Configurações Personalizadas**: Aba dedicada para cadastro de novas categorias, paleta colorida interativa para alterar as cores de cada categoria em tempo real, e comutador entre Modo Claro e Modo Escuro.
* **Financiamentos & Simulador de Amortização**: Controle avançado de contratos de financiamento com parcelamento de longo prazo, aplicação de TR e Simulador de Amortização SAC integrado.
* **Cartão de Crédito Parcelado**: Divisão automática de despesas parceladas e recorrências distribuídas nos meses subsequentes.
* **Persistência Local**: Salvamento automático e síncrono de toda a base de dados no LocalStorage.
* **Sincronização Física Avançada**: Importação e exportação de perfis isolados através de arquivos CSV estruturados. A importação é incremental (cria se for novo, atualiza se for existente) e inclui o suporte completo a financiamentos e despesas.
* **Dashboard Financeiro**: Gráficos donuts e lineares responsivos renderizados com as cores customizadas das categorias definidas pelo usuário.
* **Aparência Premium**: Micro-animações nativas, badges de categorias com indicadores coloridos em tempo real e visual otimizado em modos escuro e claro.

## Arquitetura
A aplicação adota o padrão Single Page Application (SPA) em Vanilla JS moderno estruturado em camadas:
* **UI/HTML** (`index.html` e `css/style.css`): Estrutura semântica e estilos base complementares ao Tailwind CSS.
* **State Manager** (`js/state.js`): Gerenciador central do estado da aplicação em memória com suporte a subscrição (design pattern Observer).
* **Storage** (`js/storage.js`): Conversão física bidirecional de CSV e sincronização em LocalStorage.
* **Financial Engine** (`js/engine.js`): Motor de cálculos de parcelamentos e projeções financeiras.
* **Charts Renderer** (`js/charts.js`): Abstração de inicialização e atualização dos gráficos do Chart.js.
* **UI Controller** (`js/ui.js`): Controla a vinculação de eventos do DOM e renderização de abas, modais e tabelas.
* **App Entrada** (`js/app.js`): Inicializa o carregamento de dados e orquestra a aplicação.

## Como Executar
1. Instale as dependências de desenvolvimento:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```
3. Alternativamente, você pode abrir o arquivo `index.html` diretamente em seu navegador (protocolo `file:///`) clicando duas vezes sobre ele.

## Testes e Linter
* **Linting**: Execute `npm run lint` para validar o padrão do código.
* **Testes Unitários**: Execute `npm run test` para rodar os testes com o Vitest.

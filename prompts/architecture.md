# ESPECIFICAÇÃO DE ARQUITETURA DE SISTEMA (ARCHITECTURE)

Esta especificação define detalhadamente a arquitetura do projeto "Saúde Financeira". A estrutura adota princípios de isolamento de responsabilidades, independência de frameworks corporativos pesados, garantindo alta coesão e baixo acoplamento.

## 1. FLUXO DE DADOS E CICLO DE VIDA
A aplicação opera como um circuito fechado guiado por eventos no navegador, seguindo os fluxos descritos abaixo:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           Interface do Utilizador (DOM)                       │
│  - Recebe inputs de salário, despesas, troca de perfis e uploads de CSV.      │
│  - Captura eventos de clique em abas e botões de remoção.                     │
└───────┬───────────────────────────────────────────────────────────────▲───────┘
        │                                                               │
        │ (1) Evento de Entrada                                         │ (4) Renderiza Novos Dados
        ▼                                                               │
┌───────────────────────────────────────────────────────────────┐       │
│                     Estado Centralizado (js/state.js)         │───────┘
│  - Mantém em memória RAM a lista de perfis e despesas.        │
│  - Sincroniza dados instantaneamente com o localstorage.      │
└───────┬───────────────────────────────▲───────────────────────┘
        │                               │
        │ (2) Solicita Cálculos         │ (3) Retorna Projeções e Totais
        ▼                               │
┌───────────────────────────────────────┴───────────────────────────────────────┐
│                    Motor de Cálculos Financeiros (js/engine.js)               │
│  - Distribui parcelas temporais do cartão de crédito entre meses.             │
│  - Calcula fatias orçamentárias (porcentagens por categoria) e saldos.        │
│  - Estrutura os arrays para carregamento nos gráficos de linha e pizza.       │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 2. ESTRUTURA FÍSICA E PAPEL DE CADA MÓDULO

* **`index.html`**
  O esqueleto estático único da aplicação. Define a árvore DOM de forma semântica, contendo as divisões para as abas mensais, os formulários modais de cadastro de perfis e gastos, os containers dos gráficos, a sidebar lateral e as referências aos arquivos scripts clássicos.

* **`css/style.css`**
  Guarda as regras específicas de estilo complementares ao Tailwind CSS (ex: transições personalizadas, comportamento de rolagem de abas, variáveis css de acessibilidade de cores e ajustes de print para relatórios).

* **`js/state.js`**
  * **Responsabilidade**: Gestão e integridade dos dados da aplicação.
  * **Papel**: Controla a entidade global do Estado. Possui métodos para adicionar perfil, remover perfil, selecionar perfil ativo, alterar salário do perfil atual, adicionar despesa e remover despesa. Sempre que o estado sofre modificação, ele dispara o salvamento síncrono no `storage.js` e solicita que o `js/ui.js` atualize as telas correspondentes.

* **`js/storage.js`**
  * **Responsabilidade**: Sincronização externa e serialização física.
  * **Papel**: Converte a árvore de dados complexa de memória do Estado em uma string de texto no formato CSV padrão de mercado (com colunas de Perfil, Salário, Descrição, Valor, Categoria, Mês Início, Parcelas), e vice-versa. Também gerencia a escrita/leitura transparente na chave `saude_financeira_db` do LocalStorage e as rotinas de download de arquivos.

* **`js/engine.js`**
  * **Responsabilidade**: Regras de negócio matemáticas cruas.
  * **Papel**: É um módulo puro (sem dependência do DOM). Ele recebe as estruturas de despesas e salários brutas e retorna os dados consolidados:
    * Gastos agregados por categoria para o mês selecionado.
    * Saldo real disponível (Salário - soma de despesas fixas - parcelas vigentes daquele mês).
    * Array de projeções lineares futuras para compras no cartão de crédito, calculando o peso acumulado das parcelas vigentes em cada mês até que a última seja extinta.

* **`js/ui.js`**
  * **Responsabilidade**: Interação direta com o DOM (User Interface Render).
  * **Papel**: Registra escutas de eventos (Event Listeners) nos formulários e botões da página. Manipula as classes do Tailwind para mostrar e esconder abas, modais e preencher tabelas com as despesas ativas.

* **`js/charts.js`**
  * **Responsabilidade**: Abstração da biblioteca Chart.js.
  * **Papel**: Cria, destrói e atualiza dinamicamente as instâncias de gráficos `<canvas>` de linha e pizza, garantindo que as cores e animações sejam fluidas e representem perfeitamente os vetores matemáticos fornecidos pela `js/engine.js`.

* **`js/app.js`**
  * **Responsabilidade**: Inicialização e Orquestração do Ciclo de Vida.
  * **Papel**: Ponto de entrada JavaScript. Carrega os dados persistidos iniciais do `js/storage.js` para o `js/state.js`, inicializa os escutadores do `js/ui.js` e monta a primeira tela renderizada do utilizador.

## 3. FORMATO DO ARQUIVO CSV PADRONIZADO
Para garantir portabilidade total, o arquivo CSV consumido e produzido pela aplicação segue rigorosamente o formato abaixo:

```csv
perfil,salario_base,descricao,valor,categoria,mes_inicio,parcelas
"Principal",5000.00,"Aluguel",1200.00,"Moradia",1,1
"Principal",5000.00,"Supermercado",450.00,"Alimentação",1,1
"Principal",5000.00,"Smartphone",2400.00,"Cartão de Crédito",2,12
"Secundário",3500.00,"Academia",120.00,"Saúde",1,1
```

*Nota*: Se um gasto não for parcelado (ex: gasto recorrente de aluguel ou lazer do mês), o campo `parcelas` será igual a `1`. O campo `mes_inicio` conterá um valor inteiro de `1` (Janeiro) a `12` (Dezembro) representando o mês de inserção. O parser deve processar essas linhas e recriar o estado dos perfis com fidelidade.

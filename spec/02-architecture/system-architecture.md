# Arquitetura do Sistema — Saúde Financeira

> **Spec Layer**: Architecture  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-07-02

---

## 1. Visão Geral

O **Saúde Financeira** é uma **Single Page Application (SPA)** construída em Vanilla JavaScript puro, sem frameworks client-side. A arquitetura adota o padrão de **Módulos em Namespace Global (Module Pattern + IIFE)**, onde cada arquivo JavaScript expõe sua API através do objeto global `window.App`.

---

## 2. Estilo Arquitetural

| Atributo               | Valor                                      |
|------------------------|--------------------------------------------|
| **Tipo**               | Single Page Application (SPA)             |
| **Padrão Estrutural**  | Module Pattern (IIFE) com namespace global |
| **Padrão de Dados**    | Observer Pattern (Publisher/Subscriber)    |
| **Persistência**       | LocalStorage (JSON) + CSV físico           |
| **Renderização**       | Imperativa / Manual DOM Manipulation       |
| **Runtime**            | Navegador (sem Node.js em produção)        |

---

## 3. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CAMADA DE APRESENTAÇÃO                             │
│  index.html  ←── Estrutura DOM semântica, IDs de referência                │
│  css/style.css ←── Estilos premium, glassmorphism, temas, animações        │
│  Tailwind CSS (CDN) ←── Utilitários responsivos                             │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ Eventos (click, change, submit)
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAMADA CONTROLADORA (UI)                            │
│  js/ui.js  ─── window.App.UI                                               │
│  ├── init()           ← Registra event listeners no DOM                    │
│  ├── render(state)    ← Renderiza toda a UI com base no estado              │
│  └── [helpers]        ← Renderiza perfis, abas, tabelas, modais, configs   │
└───────┬────────────────────────────────────────────────┬────────────────────┘
        │ Chama mutadores                                │ Solicita renderização
        ▼                                                ▼
┌───────────────────────────┐              ┌─────────────────────────────────┐
│    CAMADA DE ESTADO       │              │      CAMADA DE GRÁFICOS         │
│    js/state.js            │              │      js/charts.js               │
│    window.App.State       │              │      window.App.Charts          │
│                           │              │                                 │
│ • Estado privado (_state) │              │ • renderPizzaChart()            │
│ • subscribe(callback)     │              │ • renderLineChart()             │
│ • notify()                │              │ • renderPlannerChart()          │
│ • Mutadores validados     │              │ • Destruição limpa de instâncias│
└───────┬───────────────────┘              └─────────────────────────────────┘
        │ notify() para listeners                        ▲
        │                                                │ Dados calculados
        ├─────────────────────────────────┐              │
        │                                 │          ┌───┴──────────────────┐
        ▼                                 ▼          │   CAMADA DE NEGÓCIO  │
┌────────────────────┐    ┌──────────────────────┐   │   js/engine.js       │
│ PERSISTÊNCIA       │    │ UI RE-RENDERIZA       │   │   window.App.Engine  │
│ js/storage.js      │    │ (via subscribe)       │   │                     │
│ window.App.Storage │    └──────────────────────┘   │ • getInstallmentInfo│
│                    │                                │ • calculateMonthly  │
│ • LocalStorage JSON│                                │ • calculateAnnual   │
│ • Export CSV       │                                │ • solveNewtonRaphson│
│ • Import/Parse CSV │                                │ • simulateAmortiz.  │
└─────────┬──────────┘                                └─────────────────────┘
          │
          ▼
  ┌───────────────────┐    ┌──────────────────────┐
  │   LocalStorage    │    │   Arquivo CSV        │
  │ saude_financeira  │    │   (download/upload)  │
  │       _db         │    │                      │
  └───────────────────┘    └──────────────────────┘
```

---

## 4. Padrões de Projeto Utilizados

### 4.1. Observer Pattern (Padrão Observador)

O `State` funciona como **Subject** (sujeito observável). O `UI` e o `Storage` são **Observers** (observadores) que se inscrevem via `subscribe()`.

```
[State] ──notify()──► [UI.render(state)]
                   ──► [Storage.saveToLocalStorage(state)]
```

**Vantagem**: Desacoplamento total. O `State` não sabe nada sobre UI ou Storage.

### 4.2. Module Pattern (IIFE)

Cada módulo é definido com uma função auto-invocada que encapsula o estado privado e expõe uma API pública:

```javascript
window.App.State = (() => {
  const _state = { /* privado */ };

  return {
    getState() { /* público */ },
    adicionarPerfil() { /* público */ }
  };
})();
```

**Vantagem**: Sem vazamento de variáveis globais, sem colisão de nomes, compatível com `file:///`.

### 4.3. Store Pattern

Um único objeto `_state` representa toda a verdade da aplicação. Modificações só ocorrem via métodos públicos validados, que garantem integridade antes de persistir.

---

## 5. Ciclo de Vida da Aplicação

### 5.1. Inicialização (Bootstrap)

```
1. Navegador carrega index.html
   └── Carrega CDNs (Tailwind, Chart.js)
   └── Carrega scripts em ordem:
       storage.js → state.js → engine.js → charts.js → ui.js → app.js

2. DOMContentLoaded (app.js):
   ├── UI.init()                         → Registra event listeners
   ├── State.subscribe(UI.render)        → UI reage a mudanças de estado
   ├── State.subscribe(Storage.save)     → Storage reage a mudanças de estado
   └── Storage.loadFromLocalStorage()
       ├── [Dados encontrados] → State.loadState(savedState)
       └── [Dados não encontrados] → State.adicionarPerfil("Principal", 3000)

3. State notifica observers → UI renderiza → Storage salva
```

### 5.2. Fluxo de Adição de Despesa

```
1. Usuário preenche formulário e clica em "Adicionar"
2. UI.js captura o evento
3. UI.js valida os campos (descrição, valor, categoria)
4. UI.js chama State.adicionarDespesa(...)
5. State gera ID único, valida e persiste em _state.despesas
6. State chama notify()
7. [Observer 1] Storage.saveToLocalStorage(state) → grava JSON no localStorage
8. [Observer 2] UI.render(state) → 
   ├── Solicita Engine.calculateMonthlySummary() para KPIs
   ├── Atualiza tabela de despesas do mês ativo
   └── Solicita Charts.renderPizzaChart() se estiver na aba de Relatórios
```

---

## 6. Hierarquia de Responsabilidades

| Módulo         | Pode Acessar         | NÃO Pode Acessar          |
|----------------|----------------------|---------------------------|
| `app.js`       | `State`, `Storage`, `UI` | `Engine`, `Charts`    |
| `ui.js`        | `State`, `Engine`, `Charts` | `Storage` (direto) |
| `state.js`     | *(nenhum módulo)*    | DOM, Storage, Engine, Charts |
| `storage.js`   | *(nenhum módulo)*    | DOM, State, Engine, Charts |
| `engine.js`    | `State` (leitura)    | DOM, Storage, Charts     |
| `charts.js`    | `State` (leitura)    | Storage, Engine          |

> **Regra de ouro**: `state.js` não tem dependência de nenhum outro módulo. Ele é o núcleo imutável da arquitetura.

---

## 7. Ordem de Carregamento dos Scripts

A ordem dos `<script>` no `index.html` é **estritamente obrigatória**:

```html
<!-- 1. CDNs externas -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- 2. Configurações locais (sem import/fetch) -->
<script src="llm_config.js"></script>

<!-- 3. Módulos da aplicação (em ordem de dependência) -->
<script src="js/storage.js"></script>
<script src="js/state.js"></script>
<script src="js/engine.js"></script>
<script src="js/charts.js"></script>
<script src="js/ui.js"></script>
<script src="js/app.js"></script>  <!-- ← Ponto de entrada, último a carregar -->
```

> ⚠️ **Não usar `type="module"`** — causa erros CORS no protocolo `file:///`.

---

## 8. Namespace Global `window.App`

O objeto `window.App` é o ponto de integração de todos os módulos:

```javascript
window.App = {
  State:   { /* API do gerenciador de estado */ },
  Storage: { /* API de persistência */          },
  Engine:  { /* API do motor financeiro */      },
  Charts:  { /* API de renderização */          },
  UI:      { /* API da interface */             },

  // Configurações estáticas (injetadas via script tags)
  LlmConfig:          { apiUrl, apiKey, model },
  LlmPromptTemplate:  "string com template..."
};
```

---

## 9. Estrutura de Diretórios

```
saude_financeira/
│
├── index.html              # SPA: estrutura DOM, CDNs, scripts
│
├── css/
│   └── style.css           # Estilos locais: temas, animações, glassmorphism
│
├── js/
│   ├── app.js              # Orquestrador de bootstrap e ciclo de vida
│   ├── state.js            # Gerenciador de estado reativo (Observer/Store)
│   ├── storage.js          # Persistência: LocalStorage e CSV bidirecional
│   ├── engine.js           # Motor de cálculos financeiros (lógica pura)
│   ├── charts.js           # Abstração dos gráficos Chart.js
│   └── ui.js               # Controladora da interface e event listeners
│
├── prompts/
│   └── analise.md          # Template de prompt para análise com IA (arquivo markdown)
│
├── llm_config.js           # Config da LLM local (ignorado no .gitignore)
│
├── docs/
│   └── knowledge_base.md   # Base de conhecimento (engenharia reversa)
│
├── spec/                   # ← Esta pasta: documentação Spec-Driven
│   └── ...
│
├── CHANGELOG.md            # Histórico de versões
├── README.md               # Guia de instalação e uso
├── package.json            # Dependências de desenvolvimento
└── eslint.config.js        # Configurações do linter
```

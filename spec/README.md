# 📋 Spec — Saúde Financeira

> Documentação completa do projeto no padrão **Spec-Driven Development (SDD)**

---

## O que é Spec-Driven Development?

Spec-Driven Development (SDD) é uma abordagem onde toda funcionalidade, módulo e decisão de arquitetura é documentada em especificações formais **antes** e **durante** o desenvolvimento. A especificação é a fonte única de verdade sobre o sistema.

A estrutura abaixo segue as camadas clássicas do SDD:

```
spec/
├── README.md                        ← Este arquivo (índice geral)
│
├── 01-overview/
│   ├── product-vision.md            ← Visão, missão e objetivos do produto
│   ├── user-stories.md              ← Histórias de usuário e critérios de aceite
│   └── constraints.md               ← Restrições técnicas e de negócio
│
├── 02-architecture/
│   ├── system-architecture.md       ← Arquitetura geral do sistema
│   ├── module-contracts.md          ← Contratos de interface entre módulos
│   ├── data-model.md                ← Modelo de dados e entidades
│   └── adr/                         ← Architecture Decision Records (ADRs)
│       ├── ADR-001-vanilla-js.md
│       ├── ADR-002-localstorage.md
│       ├── ADR-003-observer-pattern.md
│       └── ADR-004-csv-sync.md
│
├── 03-modules/
│   ├── state-manager.md             ← Spec do módulo state.js
│   ├── storage-engine.md            ← Spec do módulo storage.js
│   ├── financial-engine.md          ← Spec do módulo engine.js
│   ├── charts-renderer.md           ← Spec do módulo charts.js
│   ├── ui-controller.md             ← Spec do módulo ui.js
│   └── app-bootstrap.md             ← Spec do módulo app.js
│
├── 04-features/
│   ├── feature-profiles.md          ← Feature: Gerenciamento de Perfis
│   ├── feature-expenses.md          ← Feature: CRUD de Despesas
│   ├── feature-installments.md      ← Feature: Parcelamento e Recorrência
│   ├── feature-financing.md         ← Feature: Financiamentos e SAC
│   ├── feature-reports.md           ← Feature: Relatórios e Gráficos
│   ├── feature-planner.md           ← Feature: Planejador Financeiro
│   ├── feature-categories.md        ← Feature: Categorias Customizadas
│   ├── feature-sync.md              ← Feature: Sincronização CSV
│   └── feature-ai-analysis.md       ← Feature: Análise com IA
│
├── 05-api/
│   └── state-api.md                 ← Referência pública da API do State
│
├── 06-data-formats/
│   └── csv-format.md                ← Especificação do formato CSV de exportação/importação
│
└── 07-quality/
    ├── testing-strategy.md          ← Estratégia de testes
    └── technical-debt.md            ← Registro de dívidas técnicas conhecidas
```

---

## Versão do Produto

| Campo       | Valor              |
|-------------|--------------------|
| **Projeto** | Saúde Financeira   |
| **Versão**  | 1.1.2              |
| **Data**    | 2026-07-02         |
| **Status**  | Em Produção Ativa  |

---

## Guia de Leitura

| Seu objetivo                          | Leia primeiro                        |
|---------------------------------------|--------------------------------------|
| Entender o produto                    | `01-overview/product-vision.md`      |
| Entender a arquitetura                | `02-architecture/system-architecture.md` |
| Entender um módulo específico         | `03-modules/<nome>.md`               |
| Entender uma funcionalidade           | `04-features/<nome>.md`              |
| Integrar com o State Manager          | `05-api/state-api.md`                |
| Importar/exportar CSV                 | `06-data-formats/csv-format.md`      |
| Entender decisões arquiteturais       | `02-architecture/adr/`               |

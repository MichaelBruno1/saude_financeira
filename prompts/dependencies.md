# RELAÇÃO DE DEPENDÊNCIAS ENTRE PROMPTS

Este arquivo especifica o grafo direcionado e acíclico de dependências lógicas e físicas entre cada um dos prompts definidos para o projeto Saúde Financeira.

```
                  ┌───────────────────────┐
                  │      Prompt 001       │  (Projeto Base & Infraestrutura)
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │      Prompt 002       │  (State Manager & Storage CSV)
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │      Prompt 003       │  (Perfis, Salário & Abas Mensais)
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │      Prompt 004       │  (CRUD de Gastos & Cartão)
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │      Prompt 005       │  (Motor Financeiro & Projeções)
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │      Prompt 006       │  (Dashboard, Gráficos & Relatórios)
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │      Prompt 007       │  (Testes Automáticos & Polimento)
                  └───────────────────────┘
```

## DETALHAMENTO DAS DEPENDÊNCIAS

* **Prompt 001 (Projeto Base e Infraestrutura)**
  * Depende de: Nenhum.
  * Bloqueia: `Prompt 002`.

* **Prompt 002 (Core de Estado e Persistência CSV/LocalStorage)**
  * Depende de: `Prompt 001`.
  * Bloqueia: `Prompt 003`.

* **Prompt 003 (Abas Mensais e Gestão de Perfis)**
  * Depende de: `Prompt 002`.
  * Bloqueia: `Prompt 004`.

* **Prompt 004 (CRUD de Gastos Categorizados)**
  * Depende de: `Prompt 003`.
  * Bloqueia: `Prompt 005`.

* **Prompt 005 (Motor Financeiro e Cálculos de Projeção)**
  * Depende de: `Prompt 004`.
  * Bloqueia: `Prompt 006`.

* **Prompt 006 (Dashboard de Relatórios com Gráficos)**
  * Depende de: `Prompt 005`.
  * Bloqueia: `Prompt 007`.

* **Prompt 007 (Testes Automáticos, Hardening e Documentação Final)**
  * Depende de: `Prompt 006`.
  * Bloqueia: Nenhum (Conclusão do ciclo de engenharia).

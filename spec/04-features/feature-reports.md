# Feature Spec: Relatórios e Gráficos

> **Spec Layer**: Features  
> **ID**: `FEAT-008` + `FEAT-009` + `FEAT-010`  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-06-30

---

## 1. Visão Geral

A aba de Relatórios (mesAtivo = 13) é um painel analítico avançado que consolida os dados financeiros do perfil em gráficos interativos, barras de progresso orçamentário e o Planejador Financeiro.

---

## 2. Componentes do Dashboard

### 2.1. Seletor de Período
- Dropdown para selecionar mês específico (Jan–Dez) ou "Consolidado Anual".
- Padrão ao abrir: mês calendário atual do sistema.

### 2.2. Gráfico de Rosca (Donut) — Divisão por Categoria
- Exibe a fatia de gastos de cada categoria no período selecionado.
- Cores das fatias = cores definidas pelo usuário (`state.categorias`).
- Tooltip: `"R$ X.XXX,XX (XX.X%)"`.
- Placeholder se não houver gastos.

### 2.3. Gráfico de Linha — Projeção do Cartão de Crédito
- Exibe o total de parcelas de cartão de crédito ativas por mês (Jan–Dez do ano ativo).
- Gradiente azul/indigo sob a curva.
- Placeholder se não houver parcelas de cartão.

### 2.4. Barras de Progresso Orçamentário
- Uma barra por categoria.
- Largura proporcional ao percentual do salário consumido.
- Cor da barra = cor da categoria.
- Exibe: `"{categoria}: R$ {valor} ({pct}%)"`.

### 2.5. Planejador Financeiro
- Ver spec detalhada em [`feature-planner.md`](feature-planner.md).

### 2.6. Análise com IA
- Ver spec detalhada em [`feature-ai-analysis.md`](feature-ai-analysis.md).

---

## 3. KPIs do Header na Aba de Relatórios

Ao navegar para a aba de Relatórios, os KPIs do header ("Gasto Total" e "Saldo Disponível") são **congelados** com os valores do último mês normal visualizado, para não causar confusão.

---

## 4. Critérios de Aceite

- `CA-1`: Ao mudar o seletor de período, o gráfico Donut atualiza imediatamente.
- `CA-2`: Cores do Donut refletem as cores customizadas das categorias.
- `CA-3`: Gráfico de linha exibe 12 pontos mensais corretamente.
- `CA-4`: Barras de progresso são proporcionais ao percentual do salário.
- `CA-5`: Ao navegar de volta para abas de mês, os KPIs voltam a ser dinâmicos.
- `CA-6`: Placeholders elegantes aparecem quando não há dados.

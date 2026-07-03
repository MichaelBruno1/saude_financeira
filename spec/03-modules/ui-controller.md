# Spec do Módulo: UI Controller (`ui.js`)

> **Spec Layer**: Modules  
> **Arquivo**: [`js/ui.js`](file:///c:/projetos/saude_financeira/js/ui.js)  
> **Namespace**: `window.App.UI`  
> **Versão**: 1.1.2

---

## 1. Responsabilidade

O `UI Controller` é a **camada de apresentação imperativa** da aplicação. Ele:
1. Registra event listeners em elementos DOM específicos (`init()`).
2. Re-renderiza a interface completa a cada mudança de estado (`render(state)`).
3. Valida inputs de formulário antes de invocar o State.
4. Coordena a abertura/fechamento de modais.
5. Delega cálculos ao `Engine` e renderização de gráficos ao `Charts`.

---

## 2. Método `init()`

Chamado uma única vez no bootstrap. Responsável por:

- Cachear referências a elementos DOM por ID (ex: `document.getElementById('btn-add-expense')`).
- Registrar event listeners para:
  - Botões de ação (adicionar perfil, despesa, financiamento).
  - Mudanças em dropdowns (seleção de perfil, mês, ano).
  - Submissão de formulários dos modais.
  - Botões de fechar modal (Esc, clique fora, botão ×).
  - Botões de importar/exportar CSV.
  - Toggle de tema.
  - Botão de gerar análise com IA.

---

## 3. Método `render(state)`

Recebe uma cópia do estado e orquestra todas as atualizações da interface:

```
render(state):
  1. Aplicar tema (body.classList → theme-light/theme-dark)
  2. renderPerfis(state)          → Atualiza dropdown de perfis na sidebar
  3. renderSalario(state)         → Atualiza campo de salário no header
  4. renderAnos(state)            → Gera abas de anos dinamicamente
  5. renderAbas(state)            → Gera e destaca abas de meses
  6. renderKPIs(state)            → Atualiza "Gasto Total" e "Saldo Disponível"
  7. [SE mesAtivo 1-12]:
     renderTabelaDespesas(state) → Renderiza tabela do mês ativo
  8. [SE mesAtivo 13 (Relatórios)]:
     renderRelatorios(state)     → Renderiza gráficos, barras de progresso e planejador
  9. [SE mesAtivo 14 (Financiamentos)]:
     renderFinanciamentos(state) → Renderiza tabela de financiamentos e simulador
  10. [SE mesAtivo 15 (Configurações)]:
      renderConfiguracoes(state) → Renderiza aba de temas, categorias e planejamento
```

---

## 4. Abas Especiais (mesAtivo)

| Valor | Aba              | Comportamento                                       |
|-------|------------------|-----------------------------------------------------|
| 1–12  | Mês Normal       | Exibe tabela de despesas do mês + KPIs atualizados  |
| 13    | Relatórios       | Exibe dashboard com gráficos, barras e planejador   |
| 14    | Financiamentos   | Exibe tabela de contratos + Simulador SAC           |
| 15    | Configurações    | Exibe editor de tema, categorias e planejamento     |

---

## 5. Renderização da Tabela de Despesas

A tabela de despesas do mês exibe:

| Coluna       | Fonte                              |
|--------------|------------------------------------|
| Descrição    | `despesa.descricao`               |
| Categoria    | Badge colorido com ponto indicador (`despesa.categoria`) |
| Parcelas     | `"Parcela X de Y"` (se Cartão) ou `"Recorrente"` ou `"—"` |
| Valor        | `info.valorParcela` formatado em BRL |
| Ações        | Botão Editar + Botão Excluir       |

**Filtragem**: Apenas despesas e financiamentos cujo `getInstallmentInfo()` retornar `active: true` no mês/ano ativo.

---

## 6. Renderização de KPIs

```
Total Gasto:      calculateMonthlySummary().totalGastos
Saldo Disponível: calculateMonthlySummary().saldoRestante
```

- Saldo positivo: classe `text-emerald-400` (verde).
- Saldo negativo: classe `text-rose-400` (vermelho).

---

## 7. Geração Dinâmica de Abas de Anos

As abas de anos são geradas com base em:
1. O ano atual.
2. Anos onde existam despesas comuns (`categoria !== "Financiamento"`).
3. Anos onde existam parcelas ativas de cartão de crédito que cruzem o ano.

> Financiamentos de longo prazo (ex: imobiliário de 30 anos) **não** geram abas de anos extras para evitar poluição visual.

---

## 8. Modais

| Modal              | ID DOM             | Trigger                             |
|--------------------|--------------------|-------------------------------------|
| Novo Perfil        | `profile-modal`    | Botão "Novo Perfil" na sidebar      |
| Cadastrar/Editar Despesa | `expense-modal` | Botão "Adicionar Gasto" ou Editar na tabela |
| Cadastrar Financiamento | `financing-modal` | Botão "Cadastrar Financiamento" |

**Padrões de fechamento de modal**:
- Clique no botão ×.
- Clique no overlay (fundo escuro).
- Tecla Esc.

---

## 9. Validações de Formulário

Todas as validações são feitas no `ui.js` **antes** de chamar o `State`:

| Campo               | Validação                                       |
|---------------------|-------------------------------------------------|
| Nome do perfil      | Não vazio (`.trim()`)                           |
| Salário             | Numérico, ≥ 0                                  |
| Descrição da despesa| Não vazia                                       |
| Valor da despesa    | `parseFloat() > 0`                             |
| Número de parcelas  | `parseInt() >= 1`                              |
| Valor do financiamento | `> 0`                                       |

Erros de validação são exibidos via `alert()` ou elemento de erro inline no modal.

---

## 10. Formatação Monetária

Valores monetários são formatados com:

```javascript
value.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2
});
// Resultado: "R$ 1.250,00"
```

---

## 11. Análise com IA

O fluxo de geração de análise financeira:

```
1. Usuário clica em "Gerar análise inteligente"
2. UI coleta dados do perfil ativo:
   - Nome do perfil
   - Salário
   - Método do planejador selecionado
   - Limites do planejador
   - Resumo de gastos mensais
   - Detalhes das despesas do mês
   - Detalhes dos financiamentos
3. UI preenche o template de prompt (window.App.LlmPromptTemplate)
4. UI faz fetch() para window.App.LlmConfig.apiUrl (OpenAI-compatible API)
5. Exibe resposta em Markdown no painel de análise
6. Em caso de erro CORS (protocolo file:///):
   - Exibe dica: "Use npm run dev ou habilite CORS no servidor local"
```

---

## 12. Convenção de IDs do DOM

O `ui.js` utiliza IDs semânticos estáveis do `index.html`. Nunca deve usar seletores CSS de classe para elementos funcionais. Exemplos:

| ID                    | Propósito                             |
|-----------------------|---------------------------------------|
| `btn-add-expense`     | Botão de adicionar despesa            |
| `expense-modal`       | Container do modal de despesa         |
| `month-tabs-container`| Container das abas de meses           |
| `year-tabs-container` | Container das abas de anos            |
| `kpi-total`           | KPI de gasto total                    |
| `kpi-saldo`           | KPI de saldo disponível               |
| `profile-select`      | Dropdown de seleção de perfil         |
| `reports-pizza-canvas`| Canvas do gráfico donut de relatórios |
| `reports-line-canvas` | Canvas do gráfico de linha            |
| `planner-chart-canvas`| Canvas do gráfico do planejador       |

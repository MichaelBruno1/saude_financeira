# Contratos de Interface entre Módulos — Saúde Financeira

> **Spec Layer**: Architecture  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-07-02

---

## Introdução

Este documento define os **contratos de interface** (APIs públicas) que cada módulo expõe ao restante da aplicação. Um contrato de interface especifica:

- **Assinatura** da função (nome, parâmetros e tipos esperados)
- **Retorno** esperado (tipo e estrutura)
- **Efeitos colaterais** (ex: notifica observers, salva no localStorage)
- **Erros** lançados em caso de entrada inválida

---

## Módulo: `window.App.State`

**Arquivo fonte**: [`js/state.js`](file:///c:/projetos/saude_financeira/js/state.js)

### `subscribe(callback: Function) → Function`
Registra um observador para receber o estado atualizado a cada mutação.

| Param      | Tipo       | Descrição                              |
|------------|------------|----------------------------------------|
| `callback` | `Function` | Função chamada com cópia profunda do estado |

**Retorno**: Função de unsubscribe (remove o observador quando chamada).  
**Efeitos**: Nenhum. Apenas registra o observador.  
**Erros**: Silencioso se `callback` não for função.

---

### `getState() → Object`
Retorna uma cópia profunda do estado atual (imutável).

**Retorno**: Objeto com toda a estrutura `_state` copiada via `JSON.parse(JSON.stringify(...))`.  
**Efeitos**: Nenhum.

---

### `loadState(newState: Object) → void`
Substitui o estado completo da aplicação (usado na inicialização e imports).

| Param      | Tipo     | Descrição                              |
|------------|----------|----------------------------------------|
| `newState` | `Object` | Objeto de estado completo (com perfis, despesas, etc.) |

**Efeitos**: Dispara `notify()`.  
**Validações**: Normaliza e sanitiza todas as propriedades antes de aplicar.

---

### `adicionarPerfil(nome: String, salario: Number) → Object`

| Param     | Tipo     | Descrição                                |
|-----------|----------|------------------------------------------|
| `nome`    | `String` | Nome do perfil (não pode estar vazio)    |
| `salario` | `Number` | Salário base (≥ 0)                       |

**Retorno**: Objeto `{ nome, salario }` criado.  
**Efeitos**: Adiciona ao estado, define como `perfilAtivo`, dispara `notify()`.  
**Erros**: `Error("O nome do perfil não pode ser vazio.")` | `Error("O perfil já existe.")`

---

### `removerPerfil(nome: String) → Boolean`

| Param  | Tipo     | Descrição                          |
|--------|----------|------------------------------------|
| `nome` | `String` | Nome exato do perfil a ser removido |

**Retorno**: `true` se bem-sucedido.  
**Efeitos**: Remove perfil, despesas e financiamentos vinculados. Atualiza `perfilAtivo`. Dispara `notify()`.  
**Erros**: `Error("Perfil não encontrado.")`

---

### `atualizarSalario(novoSalario: Number) → Boolean`

| Param         | Tipo     | Descrição                  |
|---------------|----------|----------------------------|
| `novoSalario` | `Number` | Novo valor do salário (≥ 0)|

**Retorno**: `true`.  
**Efeitos**: Atualiza o perfil ativo, dispara `notify()`.  
**Erros**: `Error("Nenhum perfil ativo para atualizar salário.")`

---

### `selecionarPerfil(nome: String) → Boolean`

**Retorno**: `true`.  
**Efeitos**: Define `perfilAtivo`. Dispara `notify()`.  
**Erros**: `Error("Perfil não encontrado.")`

---

### `selecionarMes(mes: Number) → Boolean`

| Param | Tipo     | Descrição              |
|-------|----------|------------------------|
| `mes` | `Number` | Inteiro de 1 a 15      |

> Meses especiais: 13 = Relatórios, 14 = Financiamentos, 15 = Configurações.

**Retorno**: `true` se mudou, `false` se já estava nesse mês.  
**Erros**: `Error("Mês inválido. Deve ser entre 1 e 15.")`

---

### `selecionarAno(ano: Number) → Boolean`

**Retorno**: `true` se mudou, `false` se já estava nesse ano.  
**Erros**: `Error("Ano inválido.")`

---

### `adicionarDespesa(descricao, valor, categoria, mes_inicio, parcelas, recorrente, ano_inicio) → Object`

| Param        | Tipo      | Descrição                                    |
|--------------|-----------|----------------------------------------------|
| `descricao`  | `String`  | Texto descritivo (obrigatório)               |
| `valor`      | `Number`  | Valor total da despesa (> 0 recomendado)     |
| `categoria`  | `String`  | Nome da categoria (fallback: "Outros")       |
| `mes_inicio` | `Number`  | Mês 1–12                                     |
| `parcelas`   | `Number`  | Número de parcelas (≥ 1)                     |
| `recorrente` | `Boolean` | Se repete mensalmente até dezembro do mesmo ano |
| `ano_inicio` | `Number`  | Ano de início                                |

**Retorno**: Objeto despesa criado com `id` único.  
**Efeitos**: Adiciona ao `_state.despesas`. Dispara `notify()`.  
**Erros**: `Error("Não há perfil ativo.")` | `Error("Descrição não pode ser vazia.")`

---

### `removerDespesa(id: String) → Boolean`
**Retorno**: `true`.  
**Efeitos**: Remove do array `_state.despesas`. Dispara `notify()`.  
**Erros**: `Error("Despesa não encontrada.")`

---

### `atualizarDespesa(id, descricao, valor, categoria, mes_inicio, parcelas, recorrente, ano_inicio) → Object`
Mesmos parâmetros que `adicionarDespesa` + `id` da despesa a editar.  
**Retorno**: Objeto despesa atualizado.  
**Efeitos**: Muta o objeto no array. Dispara `notify()`.  
**Erros**: `Error("Despesa não encontrada.")` | `Error("Descrição não pode ser vazia.")`

---

### `adicionarFinanciamento(nome, valorTotal, valorParcela, parcelasTotais, taxaTR, mesInicio, anoInicio) → Object`

| Param           | Tipo     | Descrição                                 |
|-----------------|----------|-------------------------------------------|
| `nome`          | `String` | Nome/descrição do financiamento           |
| `valorTotal`    | `Number` | Valor total financiado (> 0)              |
| `valorParcela`  | `Number` | Valor da parcela mensal (> 0)             |
| `parcelasTotais`| `Number` | Total de parcelas (> 0)                   |
| `taxaTR`        | `Number` | Taxa referencial (≥ 0, em %)              |
| `mesInicio`     | `Number` | Mês de início 1–12                        |
| `anoInicio`     | `Number` | Ano de início                             |

**Retorno**: Objeto financiamento criado com `id`.  
**Efeitos**: Adiciona ao `_state.financiamentos`. Dispara `notify()`.  
**Erros**: Validações de tipo e range em todos os campos numéricos.

---

### `atualizarFinanciamento(id, parcelasTotais, taxaTR) → Object`
Atualiza apenas `parcelasTotais` e `taxaTR` (demais campos são imutáveis).  
**Erros**: `Error("Financiamento não encontrado.")`

---

### `removerFinanciamento(id: String) → Boolean`
**Efeitos**: Remove do array. Dispara `notify()`.

---

### `adicionarCategoria(nome: String, cor: String) → Boolean`
| Param  | Tipo     | Descrição                                   |
|--------|----------|---------------------------------------------|
| `nome` | `String` | Nome único da categoria                     |
| `cor`  | `String` | Cor hexadecimal no formato `#RRGGBB`        |

**Efeitos**: Adiciona à categoria e inicializa `0%` nos 3 planos de planejamento. Dispara `notify()`.  
**Erros**: `Error("Categoria já cadastrada.")` | `Error("Cor inválida.")`

---

### `atualizarCorCategoria(nome: String, cor: String) → Boolean`
**Erros**: `Error("Categoria não encontrada.")` | `Error("Cor inválida.")`

---

### `toggleTheme() → String`
**Retorno**: `"light"` ou `"dark"` (novo valor).  
**Efeitos**: Altera `_state.theme`. Dispara `notify()`.

---

### `atualizarPlanejamento(metodo: String, limites: Object) → Boolean`

| Param    | Tipo     | Descrição                                            |
|----------|----------|------------------------------------------------------|
| `metodo` | `String` | `"Conservador"` | `"Equilibrado"` | `"Agressivo"` |
| `limites`| `Object` | Mapa `{ categoriaNome: percentual }` (soma ≤ 100)   |

**Efeitos**: Atualiza os limites e redistribui sobra para "Investimento". Dispara `notify()`.  
**Erros**: `Error("Método inválido.")` | `Error("Soma ultrapassa 100%.")`

---

### `importarPerfilCSV(importedData: Object) → void`

| Param          | Tipo     | Descrição                                        |
|----------------|----------|--------------------------------------------------|
| `importedData` | `Object` | `{ perfis, despesas, financiamentos }` parseado |

**Efeitos**: Cria ou atualiza perfis incrementalmente. Define o primeiro importado como ativo. Dispara `notify()`.

---

## Módulo: `window.App.Storage`

**Arquivo fonte**: [`js/storage.js`](file:///c:/projetos/saude_financeira/js/storage.js)

### `saveToLocalStorage(data: Object) → Boolean`
Serializa `data` como JSON e grava na chave `saude_financeira_db`.  
**Retorno**: `true` se bem-sucedido, `false` se falhar (ex: localStorage cheio).

### `loadFromLocalStorage() → Object | null`
Lê e desserializa o estado do localStorage.  
**Retorno**: Objeto de estado ou `null` se vazio/corrompido.

### `convertToCSV(data: Object, targetPerfilName?: String) → String`
Serializa despesas e financiamentos do perfil informado (ou ativo) para string CSV.

### `parseFromCSV(csvText: String) → Object`
Interpreta string CSV e retorna `{ perfis, perfilAtivo, despesas, financiamentos }`.  
**Erros**: `Error("CSV vazio")` | `Error("Coluna obrigatória ausente")` | `Error("Nenhum perfil válido importado")`

### `exportAsCSVFile(data: Object, targetPerfilName?: String) → Boolean`
Dispara download de arquivo `.csv` no navegador.  
**Retorno**: `true` se bem-sucedido.

---

## Módulo: `window.App.Engine`

**Arquivo fonte**: [`js/engine.js`](file:///c:/projetos/saude_financeira/js/engine.js)

### `getInstallmentInfo(despesa, mesSelecionado, anoSelecionado) → Object | null`

**Retorno**: `{ active: true, index, total, valorParcela }` ou `null` se inativa no período.

### `calculateMonthlySummary(perfil, mes, despesas, financiamentos, anoSelecionado) → Object`

**Retorno**: `{ gastosPorCategoria, porcentagemPorCategoria, totalGastos, saldoRestante }`

### `calculateAnnualSummary(perfil, despesas, financiamentos, anoSelecionado) → Object`

**Retorno**: Mesmo formato de `calculateMonthlySummary`, mas com valores anuais consolidados.

### `calculateCardProjection(despesas, perfilNome, anoSelecionado) → Number[]`

**Retorno**: Array de 12 posições com o total de parcelas de cartão por mês (Jan=0 a Dez=11).

### `solveImplicitInterestRate(V, P, N) → Number`

| Param | Tipo     | Descrição                            |
|-------|----------|--------------------------------------|
| `V`   | `Number` | Valor principal do financiamento     |
| `P`   | `Number` | Valor da parcela mensal              |
| `N`   | `Number` | Total de parcelas                    |

**Retorno**: Taxa de juros mensal implícita (Newton-Raphson).

### `simulateAmortization(V, P, N, TR, extraVal, extraFrequency) → Object`

**Retorno**:
```javascript
{
  normalMonths, normalInterest, normalTotal,
  amortMonths, amortInterest, amortTotal,
  jurosEconomizados, mesesEconomizados
}
```

---

## Módulo: `window.App.Charts`

**Arquivo fonte**: [`js/charts.js`](file:///c:/projetos/saude_financeira/js/charts.js)

### `renderPizzaChart(canvasId: String, categoryData: Object) → void`
Destrói instância anterior e renderiza gráfico Donut no canvas especificado.

### `renderLineChart(canvasId: String, projectionData: Number[]) → void`
Destrói instância anterior e renderiza gráfico de linha com 12 pontos.

### `renderPlannerChart(canvasId: String, plannerData: Object) → void`
Renderiza gráfico Donut do planejador (filtra categorias com 0%).

---

## Módulo: `window.App.UI`

**Arquivo fonte**: [`js/ui.js`](file:///c:/projetos/saude_financeira/js/ui.js)

### `init() → void`
Registra todos os event listeners no DOM. Deve ser chamado exatamente uma vez (em `app.js`).

### `render(state: Object) → void`
Re-renderiza toda a interface com base no estado fornecido. Chamado pelo observer do State.

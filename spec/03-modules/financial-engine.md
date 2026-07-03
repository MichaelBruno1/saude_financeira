# Spec do Módulo: Financial Engine (`engine.js`)

> **Spec Layer**: Modules  
> **Arquivo**: [`js/engine.js`](file:///c:/projetos/saude_financeira/js/engine.js)  
> **Namespace**: `window.App.Engine`  
> **Versão**: 1.1.2

---

## 1. Responsabilidade

O `Financial Engine` é o módulo de **lógica de negócio pura**. Ele contém todos os cálculos matemáticos da aplicação: projeção de parcelas, consolidação de gastos, simulação de amortização SAC e resolução numérica de taxas de juros implícitas.

> **Princípio**: O `engine.js` não tem conhecimento sobre o DOM, storage ou renderização. É um módulo de computação pura que recebe dados e retorna resultados.

---

## 2. Dependências

- Leitura indireta de `window.App.State.getState()` para obter a lista de categorias dinâmicas em `getCategoriesList()`.

---

## 3. Função Auxiliar Privada: `getCategoriesList()`

```javascript
function getCategoriesList() {
  // Tenta obter categorias do estado ativo
  const state = window.App.State.getState();
  if (state?.categorias) {
    const list = Object.keys(state.categorias);
    if (!list.includes("Financiamento")) list.push("Financiamento");
    if (!list.includes("Outros")) list.push("Outros");
    return list;
  }
  // Fallback para lista hardcoded
  return ["Saúde", "Alimentação", "Moradia", "Cartão de Crédito", "Lazer",
          "Serviços por Assinatura", "Serviços", "Financiamento", "Investimento", "Outros"];
}
```

---

## 4. `getInstallmentInfo(despesa, mesSelecionado, anoSelecionado)`

### Propósito
Determina se uma despesa está **ativa** em um determinado mês/ano e qual o valor da parcela naquele período.

### Algoritmo por Tipo de Despesa

```
despesa.recorrente === true?
├── SIM: Ativa se (anoSelecionado === ano_inicio) E (mes >= mes_inicio) E (mes <= 12)
│        Retorna: { active: true, index: mes - mes_inicio + 1, total: 12 - mes_inicio + 1, valorParcela: valor }
└── NÃO:
    categoria !== "Cartão de Crédito" OU parcelas <= 1?
    ├── SIM: Ativa SOMENTE se mes === mes_inicio E ano === ano_inicio
    │        Retorna: { active: true, index: 1, total: 1, valorParcela: valor }
    └── NÃO (Cartão de Crédito com P > 1):
             Usa indexação absoluta de meses:
             startAbs = ano_inicio * 12 + mes_inicio - 1
             targetAbs = anoSelecionado * 12 + mesSelecionado - 1
             index = targetAbs - startAbs + 1

             Ativa se 1 <= index <= parcelas
             Retorna: { active: true, index, total: parcelas, valorParcela: valor / parcelas }
```

### Indexação Absoluta de Meses

A indexação absoluta resolve o problema de parcelas que cruzam a virada do ano:

```
Compra de R$ 1200 em 12x feita em Nov/2025 (mes=11, ano=2025)
startAbs = 2025 * 12 + 11 - 1 = 24310

Parcela em Jan/2026: targetAbs = 2026 * 12 + 1 - 1 = 24312
index = 24312 - 24310 + 1 = 3 ✓ (Parcela 3 de 12)

Parcela em Out/2026: targetAbs = 2026 * 12 + 10 - 1 = 24321
index = 24321 - 24310 + 1 = 12 ✓ (Parcela 12 de 12)
```

### Retorno

```typescript
// Se ativa:
{ active: true, index: number, total: number, valorParcela: number }

// Se inativa:
null
```

---

## 5. `calculateMonthlySummary(perfil, mes, despesas, financiamentos, anoSelecionado)`

### Propósito
Consolida todos os gastos de um perfil em um mês específico, agrupados por categoria.

### Algoritmo

```
1. Inicializar gastosPorCategoria = { catNome: 0 } para cada categoria
2. Para cada despesa do perfil:
   info = getInstallmentInfo(despesa, mes, ano)
   SE info.active:
     categoria = info.active ? despesa.categoria : "Outros"
     gastosPorCategoria[categoria] += info.valorParcela
3. Para cada financiamento do perfil:
   SE (viewAbs - startAbs + 1) está entre [1, parcelasTotais]:
     gastosPorCategoria["Financiamento"] += financiamento.valorParcela
4. Calcular totalGastos = soma de todos os gastos
5. Calcular porcentagemPorCategoria = gastos / salario * 100
6. Calcular saldoRestante = salario - totalGastos
```

### Retorno

```typescript
{
  gastosPorCategoria: Record<string, number>;   // { "Alimentação": 800.00, ... }
  porcentagemPorCategoria: Record<string, number>; // { "Alimentação": 16.00, ... }
  totalGastos: number;
  saldoRestante: number;
}
```

---

## 6. `calculateAnnualSummary(perfil, despesas, financiamentos, anoSelecionado)`

Chama `calculateMonthlySummary` para cada mês de 1 a 12 e acumula os resultados.

**Retorno**: Mesmo formato de `calculateMonthlySummary`, mas com valores anuais.  
**Salário base anual**: `salarioMensal * 12`.

---

## 7. `calculateCardProjection(despesas, perfilNome, anoSelecionado)`

Itera os 12 meses do ano e, para cada despesa do perfil com `categoria === "Cartão de Crédito"`, soma as parcelas ativas no mês.

**Retorno**: `number[]` com 12 posições (índice 0 = Janeiro, índice 11 = Dezembro).

---

## 8. `solveImplicitInterestRate(V, P, N)` — Newton-Raphson

### Propósito
Resolve a taxa de juros mensal implícita `r` de um financiamento com sistema Price, dado o valor principal `V`, parcela `P` e prazo `N`.

### Algoritmo

```
Equação do sistema Price: P = V * r / (1 - (1 + r)^-N)

Chute inicial: r₀ = (P*N - V) / (V*N)

Para i = 0 até 200 iterações:
  pow = (1 + r)^-N
  f(r) = P - V * r / (1 - pow)
  f'(r) = -V * (1 - pow - N*r*pow) / (1 - pow)²
  r_next = r - f(r) / f'(r)
  
  SE |r_next - r| < 1e-7: convergiu → retorna r_next
  r = r_next

Retorna r após 200 iterações (caso não convirja)
```

**Retorno**: `number` (taxa mensal implícita, ex: `0.00812` = 0.812% ao mês).

---

## 9. `simulateAmortization(V, P, N, TR, extraVal, extraFrequency)`

### Propósito
Simula dois cenários de amortização: sem e com amortizações extraordinárias.

### Parâmetros

| Param           | Tipo     | Descrição                                          |
|-----------------|----------|----------------------------------------------------|
| `V`             | `number` | Valor do saldo devedor inicial                     |
| `P`             | `number` | Valor da parcela mensal                            |
| `N`             | `number` | Número total de parcelas                           |
| `TR`            | `number` | Taxa referencial em % (ex: 0.35)                   |
| `extraVal`      | `number` | Valor da amortização extra (0 = sem extra)         |
| `extraFrequency`| `string` | `"monthly"` ou `"yearly"`                         |

### Algoritmo — Cenário 1 (Normal)

```
saldo = V; juros_acumulados = 0; meses = 0

Para m = 1 até N:
  SE saldo <= 0: quebra
  meses++
  J_t = saldo * rate          // juros do mês
  A_t = P - J_t               // amortização = parcela - juros
  SE A_t <= 0: A_t = 0.01    // salvaguarda
  
  SE saldo < A_t:
    juros_acumulados += saldo * rate
    saldo = 0
  SENÃO:
    juros_acumulados += J_t
    saldo -= A_t
```

### Algoritmo — Cenário 2 (Com Amortizações Extras)

Mesmo algoritmo, mas inclui `extraPayment` na amortização:
- `extraFrequency === "monthly"`: `extraPayment = extraVal` todo mês.
- `extraFrequency === "yearly"`: `extraPayment = extraVal` a cada 12 meses.

### Retorno

```typescript
{
  normalMonths: number;      // Prazo normal em meses
  normalInterest: number;    // Total de juros pagos no cenário normal
  normalTotal: number;       // Total pago (principal + juros) no cenário normal
  amortMonths: number;       // Prazo com amortização extra
  amortInterest: number;     // Total de juros com amortização extra
  amortTotal: number;        // Total pago com amortização extra
  jurosEconomizados: number; // Economia em juros (≥ 0)
  mesesEconomizados: number; // Meses poupados (≥ 0)
}
```

---

## 10. Precisão Numérica

Todos os valores monetários são arredondados com `.toFixed(2)` antes de serem retornados, para evitar problemas de ponto flutuante:

```javascript
valorParcela = parseFloat((valorTotal / parcelas).toFixed(2));
totalGastos = parseFloat(totalGastos.toFixed(2));
```

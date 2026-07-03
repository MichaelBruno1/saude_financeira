# Feature Spec: Financiamentos e Simulador SAC

> **Spec Layer**: Features  
> **ID**: `FEAT-006` + `FEAT-007`  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-06-30

---

## 1. Visão Geral

Esta feature gerencia contratos de crédito de longo prazo (imobiliário, veículo, consórcio) e fornece um simulador de amortização extraordinária que calcula a economia real em juros e meses.

---

## 2. Cadastro de Financiamento

### Campos do Formulário

| Campo           | Tipo     | Obrigatório | Editável após cadastro |
|-----------------|----------|-------------|------------------------|
| Nome/Descrição  | string   | Sim         | ❌ Não                 |
| Valor Total     | number   | Sim         | ❌ Não                 |
| Valor da Parcela| number   | Sim         | ❌ Não                 |
| Total de Parcelas| number  | Sim         | ✅ Sim                 |
| Taxa T.R. (%)   | number   | Sim (≥ 0)   | ✅ Sim                 |
| Mês Início      | 1–12     | Sim         | ❌ Não                 |
| Ano Início      | number   | Sim         | ❌ Não                 |

---

## 3. Exibição na Tabela Mensal

A parcela de um financiamento aparece na tabela mensal de despesas **se e somente se** o mês visualizado estiver dentro do período de vigência:

```
startAbs = ano_inicio * 12 + mes_inicio - 1
viewAbs  = anoSelecionado * 12 + mesSelecionado - 1
index    = viewAbs - startAbs + 1

Ativo SE: 1 <= index <= parcelasTotais
```

**Categoria exibida**: "Financiamento" (sempre).  
**Coluna Parcelas**: `"Parcela X de Y"`.

---

## 4. Tabela de Financiamentos (Aba Dedicada)

A aba "Financiamentos" (mesAtivo = 14) exibe uma tabela com:

| Coluna        | Fonte                                                       |
|---------------|-------------------------------------------------------------|
| Nome          | `financiamento.nome`                                       |
| Progresso     | `"Parcela X de Y"` com X calculado por indexação absoluta  |
| Valor Total   | `financiamento.valorTotal` em BRL                          |
| Valor Parcela | `financiamento.valorParcela` em BRL                        |
| T.R.          | `financiamento.taxaTR`%                                    |
| Previsão Fim  | `mes_inicio + parcelasTotais - 1` convertido para Mês/Ano  |
| Ações         | Botão Editar (apenas T.R. e parcelas) + Botão Excluir      |

---

## 5. Simulador de Amortização SAC

### Objetivo
Calcular a economia de juros e meses ao realizar amortizações extraordinárias além da parcela mensal normal.

### Inputs do Simulador

| Campo               | Descrição                                       |
|---------------------|-------------------------------------------------|
| Valor Extra         | Quanto pagar a mais (R$)                        |
| Frequência          | `"mensal"` ou `"anual"` (na virada de cada 12 meses) |
| Financiamento       | Selecionado da lista de contratos ativos        |

### Algoritmo de Resolução da Taxa Implícita

O sistema usa o método **Newton-Raphson** para encontrar a taxa de juros mensal implícita `r` dado o valor principal `V`, parcela `P` e total de parcelas `N`:

```
Equação do sistema Price:
P = V * r / (1 - (1 + r)^-N)

Iteração Newton-Raphson:
r_next = r - f(r) / f'(r)

f(r)  = P - V * r / (1 - (1+r)^-N)
f'(r) = -V * (1 - (1+r)^-N - N*r*(1+r)^-N) / (1 - (1+r)^-N)²

Tolerância: |r_next - r| < 1e-7
Máx iterações: 200
```

### Taxa Efetiva Mensal

```
taxa_efetiva = taxa_implicita + (taxa_TR / 100)
```

### Cenário Normal (Sem Amortização Extra)

```
Para m = 1 até N:
  J_t = saldo * taxa_efetiva     (juros do mês)
  A_t = parcela - J_t            (amortização = parcela - juros)
  SE A_t <= 0: A_t = 0.01       (salvaguarda)
  totalJuros += J_t
  saldo -= A_t
  SE saldo <= 0: para
```

### Cenário com Amortização Extra

Mesmo algoritmo, somando `valorExtra` à amortização:
- `"mensal"`: aplica todo mês.
- `"anual"`: aplica a cada 12 meses (`m % 12 === 0`).

### Retorno do Simulador

```javascript
{
  normalMonths,      // Meses no cenário normal
  normalInterest,    // Total de juros pagos (normal)
  normalTotal,       // Total pago: principal + juros (normal)
  amortMonths,       // Meses com amortização extra
  amortInterest,     // Total de juros pagos (com extra)
  amortTotal,        // Total pago (com extra)
  jurosEconomizados, // normalInterest - amortInterest
  mesesEconomizados  // normalMonths - amortMonths
}
```

---

## 6. KPIs do Simulador (UI)

| KPI                   | Cálculo                               |
|-----------------------|---------------------------------------|
| Juros Economizados    | `normalInterest - amortInterest`      |
| Meses Economizados    | `normalMonths - amortMonths`          |
| Total Pago (Normal)   | `V + normalInterest`                  |
| Total Pago (Amortizado)| `V + amortInterest`                  |

---

## 7. Integração com Planejador Financeiro

No Planejador Financeiro (aba Relatórios), os financiamentos são **consolidados como "Moradia"** na comparação real vs. planejado:

```
gastos_reais["Moradia"] += gastos_reais["Financiamento"]
gastos_reais["Financiamento"] = 0  // Zera para não contar em duplicata
```

Isso garante que o usuário compare o custo total de moradia (aluguel + financiamento) contra o limite planejado de moradia.

---

## 8. Critérios de Aceite

- `CA-1`: Financiamento cadastrado em Mar/2024 (360x) aparece na tabela de Jul/2026 como "Parcela 40 de 360".
- `CA-2`: Financiamento não gera aba de ano extra no calendário multi-anual.
- `CA-3`: Simulador com amortização mensal de R$ 500 exibe corretamente a redução de prazo.
- `CA-4`: Apenas `parcelasTotais` e `taxaTR` são editáveis pelo usuário após cadastro.
- `CA-5`: Excluir um financiamento remove sua parcela da tabela mensal imediatamente.

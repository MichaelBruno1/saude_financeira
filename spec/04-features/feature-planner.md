# Feature Spec: Planejador Financeiro

> **Spec Layer**: Features  
> **ID**: `FEAT-011`  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-06-30

---

## 1. Visão Geral

O Planejador Financeiro permite ao usuário definir limites percentuais do salário para cada categoria de gastos, baseados em 3 perfis pré-configurados (Conservador, Equilibrado, Agressivo), e compará-los com os gastos reais do período selecionado.

---

## 2. Perfis de Planejamento

### Conservador
Prioriza segurança financeira, menor lazer, maior investimento.

| Categoria              | Limite (%) |
|------------------------|------------|
| Saúde                  | 8          |
| Alimentação            | 18         |
| Moradia                | 30         |
| Lazer                  | 5          |
| Cartão de Crédito      | 8          |
| Serviços por Assinatura| 2          |
| Serviços               | 9          |
| Investimento           | 20         |

### Equilibrado
Balanceia qualidade de vida e investimento.

| Categoria              | Limite (%) |
|------------------------|------------|
| Saúde                  | 7          |
| Alimentação            | 18         |
| Moradia                | 28         |
| Lazer                  | 10         |
| Cartão de Crédito      | 10         |
| Serviços por Assinatura| 2          |
| Serviços               | 10         |
| Investimento           | 15         |

### Agressivo
Máximo investimento, menor consumo.

| Categoria              | Limite (%) |
|------------------------|------------|
| Saúde                  | 6          |
| Alimentação            | 17         |
| Moradia                | 25         |
| Lazer                  | 7          |
| Cartão de Crédito      | 8          |
| Serviços por Assinatura| 2          |
| Serviços               | 10         |
| Investimento           | 25         |

---

## 3. Lógica de Distribuição Automática para Investimento

Ao salvar os limites do planejador:

```
sobra = 100 - soma_de_todos_os_limites
planejamento[metodo]["Investimento"] += sobra
```

Isso garante que **"Investimento" absorve automaticamente** qualquer percentual não alocado, sem que o usuário precise calcular manualmente.

---

## 4. Comparação Planejado vs. Real

A tabela comparativa exibe:

| Coluna                 | Fonte                                        |
|------------------------|----------------------------------------------|
| Categoria              | Chave de `state.categorias`                  |
| Limite Planejado       | `planejamento[metodo][categoria]` em %       |
| Gasto Real (R$)        | `calculateMonthlySummary().gastosPorCategoria` |
| Gasto Real (%)         | `gasto / salario * 100`                       |
| Status                 | Lógica abaixo                                 |

### Lógica de Status por Categoria

**Categoria normal** (Saúde, Alimentação, Moradia, Lazer, etc.):

| Condição                        | Status      | Badge     |
|---------------------------------|-------------|-----------|
| Gasto real ≤ limite planejado   | OK          | 🟢 Verde  |
| Gasto real > limite planejado   | Atenção     | 🔴 Vermelho |

**Categoria Investimento** (invertida):

| Condição                        | Status      | Badge     |
|---------------------------------|-------------|-----------|
| Gasto real > limite             | Excelente   | 🩵 Ciano  |
| Gasto real == limite            | OK          | 🟢 Verde  |
| Gasto real < limite             | Ruim        | 🔴 Vermelho |

### Consolidação de Financiamentos como Moradia

```javascript
realPorCategoria["Moradia"] += realPorCategoria["Financiamento"];
// "Financiamento" fica zerado na comparação visual
```

---

## 5. Gráfico Donut do Planejador

Exibe a distribuição percentual recomendada com as mesmas cores das categorias do usuário:

- Categorias com `0%` **não aparecem** no gráfico (filtradas antes de renderizar).
- Tooltip: `"Categoria: X%"`.

---

## 6. Editor de Limites (Aba Configurações)

Permite ao usuário personalizar os percentuais por método:

- Campos numéricos editáveis para cada categoria (exceto "Financiamento" que não é editável).
- Cálculo dinâmico do total em tempo real: `soma + "% de X% para Investimento"`.
- Mensagem especial quando total = 100%: `"Orçamento completo! ✓"`.
- Botão "Salvar Porcentagens" chama `State.atualizarPlanejamento()`.
- Validação: soma > 100% bloqueia o save com mensagem de erro.

---

## 7. Critérios de Aceite

- `CA-1`: Ao selecionar "Conservador", o gráfico Donut exibe a distribuição conservadora.
- `CA-2`: Ao editar e salvar limites, a tabela comparativa atualiza imediatamente.
- `CA-3`: O saldo residual é sempre alocado para "Investimento" automaticamente.
- `CA-4`: Gastos de "Financiamento" somam ao bloco "Moradia" na comparação real.
- `CA-5`: Investimento com gasto acima da meta exibe badge "Excelente" em ciano.
- `CA-6`: Tentativa de salvar com soma > 100% exibe erro e bloqueia a gravação.
- `CA-7`: Categoria "Financiamento" não aparece no editor de limites (está oculta).

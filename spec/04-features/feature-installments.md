# Feature Spec: Parcelamento de Cartão e Recorrência

> **Spec Layer**: Features  
> **ID**: `FEAT-004` + `FEAT-005`  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-06-30

---

## 1. Visão Geral

Esta feature especifica como a aplicação distribui automaticamente despesas de **cartão de crédito parceladas** e **despesas recorrentes** ao longo dos meses e anos.

---

## 2. Tipos de Despesa

| Tipo              | `categoria`           | `parcelas` | `recorrente` | Comportamento                            |
|-------------------|-----------------------|------------|--------------|------------------------------------------|
| Simples           | qualquer (≠ Cartão)   | 1          | false        | Aparece apenas no `mes_inicio/ano_inicio` |
| Recorrente        | qualquer              | qualquer   | **true**     | Aparece em todos os meses do `mes_inicio` ao Dez do mesmo ano |
| Parcelada         | **Cartão de Crédito** | > 1        | false        | Distribui em N meses consecutivos a partir de `mes_inicio/ano_inicio` |

---

## 3. Regra de Parcelamento (Cartão de Crédito)

### Fórmula

```
valorParcela = valorTotal / parcelas   (arredondado em 2 casas decimais)

startAbs = ano_inicio * 12 + mes_inicio - 1
targetAbs = anoSelecionado * 12 + mesSelecionado - 1
index = targetAbs - startAbs + 1

Parcela ativa SE: 1 <= index <= parcelas
```

### Exemplos

**Compra de R$ 1.200 em 12x — Novembro/2025**

| Mês Visualizado | startAbs | targetAbs | index | Ativo? | Valor    |
|-----------------|----------|-----------|-------|--------|----------|
| Nov/2025        | 24310    | 24310     | 1     | ✅ Sim  | R$ 100  |
| Dez/2025        | 24310    | 24311     | 2     | ✅ Sim  | R$ 100  |
| Jan/2026        | 24310    | 24312     | 3     | ✅ Sim  | R$ 100  |
| Out/2026        | 24310    | 24321     | 12    | ✅ Sim  | R$ 100  |
| Nov/2026        | 24310    | 24322     | 13    | ❌ Não  | —       |

---

## 4. Regra de Recorrência

```
Ativa SE: anoSelecionado === ano_inicio
          E mesSelecionado >= mes_inicio
          E mesSelecionado <= 12
```

### Exemplos

**Netflix R$ 39,90 — Recorrente desde Março/2026**

| Mês Visualizado | Ativo? | Valor     |
|-----------------|--------|-----------|
| Jan/2026        | ❌ Não  | —        |
| Fev/2026        | ❌ Não  | —        |
| Mar/2026        | ✅ Sim  | R$ 39,90 |
| Jun/2026        | ✅ Sim  | R$ 39,90 |
| Dez/2026        | ✅ Sim  | R$ 39,90 |
| Jan/2027        | ❌ Não  | —        |

> **Nota**: Despesas recorrentes se encerram em Dezembro do mesmo ano. Para continuar em anos seguintes, o usuário deve recadastrar a despesa.

---

## 5. Exibição na Tabela

| Tipo      | Coluna "Parcelas" exibida        |
|-----------|----------------------------------|
| Simples   | `—`                              |
| Recorrente| `Recorrente`                     |
| Parcelada | `Parcela X de Y`                 |
| Financiamento | `Parcela X de Y`             |

---

## 6. Campos do Formulário de Despesa

| Campo          | Obrigatório | Visível quando              | Padrão               |
|----------------|-------------|------------------------------|----------------------|
| Descrição      | Sim         | Sempre                       | —                    |
| Valor Total    | Sim         | Sempre                       | —                    |
| Categoria      | Sim         | Sempre                       | Primeiro item        |
| Mês Início     | Sim         | Sempre (herdado da aba ativa)| Mês ativo            |
| Ano Início     | Sim         | Sempre (herdado da aba ativa)| Ano ativo            |
| Nº de Parcelas | Sim         | Apenas se categoria = Cartão | 1                    |
| Recorrente     | Não         | Sempre                       | Não                  |

---

## 7. Critérios de Aceite Completos

- `CA-1`: Compra de 12x em Nov exibe parcelas de Nov até Out do ano seguinte.
- `CA-2`: Compra de 3x em Nov exibe parcelas em Nov, Dez, Jan (ano seguinte).
- `CA-3`: Despesa recorrente em Mar aparece em Mar, Abr, Mai, ..., Dez (mesmo ano).
- `CA-4`: Despesa recorrente **não** aparece em anos subsequentes.
- `CA-5`: Despesa simples aparece apenas no mês e ano de início.
- `CA-6`: Ao excluir uma despesa, ela desaparece de todos os meses onde estava ativa.
- `CA-7`: O KPI "Total Gasto" e "Saldo Disponível" reflete as parcelas do mês ativo.

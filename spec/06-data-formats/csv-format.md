# Especificação do Formato CSV — Saúde Financeira

> **Spec Layer**: Data Formats  
> **Versão**: 1.1.2 (v0.9.0+)  
> **Última Atualização**: 2026-06-30

---

## 1. Identificação do Formato

| Atributo      | Valor                                       |
|---------------|---------------------------------------------|
| Extensão      | `.csv`                                      |
| Encoding      | UTF-8                                       |
| Delimitador   | Vírgula (`,`) — auto-detecta ponto e vírgula (`;`) na importação |
| Quebra de linha | `\n` (LF) na exportação; aceita `\r\n` na importação |
| Primeira linha | Cabeçalho obrigatório                      |
| Aspas         | Campos com texto usam aspas duplas; aspas internas são escapadas como `""` |

---

## 2. Cabeçalho (Obrigatório)

```csv
perfil,salario_base,tipo_registro,descricao,valor,categoria,mes_inicio,ano_inicio,parcelas,recorrente,valor_parcela,taxa_tr
```

---

## 3. Definição das Colunas

| Coluna          | Tipo     | Obrigatório | Descrição                                                     |
|-----------------|----------|-------------|---------------------------------------------------------------|
| `perfil`        | string   | ✅ Sim      | Nome do perfil. Envolvido em aspas duplas.                   |
| `salario_base`  | decimal  | ✅ Sim      | Salário base mensal em BRL. Ex: `5000.00`                   |
| `tipo_registro` | string   | ❌ Não      | `"despesa"` ou `"financiamento"`. Default: `"despesa"`      |
| `descricao`     | string   | ❌ Não      | Texto descritivo. Envolvido em aspas duplas.                 |
| `valor`         | decimal  | ❌ Não      | Valor total em BRL. Para despesa = total; para financiamento = principal. |
| `categoria`     | string   | ❌ Não      | Nome da categoria. Envolvido em aspas duplas. Default: `"Outros"` |
| `mes_inicio`    | integer  | ❌ Não      | Mês de início: 1–12. Default: `1`                           |
| `ano_inicio`    | integer  | ❌ Não      | Ano de início. Default: ano atual                           |
| `parcelas`      | integer  | ❌ Não      | Número de parcelas. Default: `1`                            |
| `recorrente`    | string   | ❌ Não      | `"sim"` ou `"nao"`. Default: `"nao"`                       |
| `valor_parcela` | decimal  | ❌ Não      | Usado apenas para `tipo_registro = financiamento`. Valor da parcela mensal. |
| `taxa_tr`       | decimal  | ❌ Não      | Usado apenas para `tipo_registro = financiamento`. Taxa referencial em %. Ex: `0.3500` |

---

## 4. Linhas por Tipo de Registro

### 4.1. Linha de Despesa Normal

```csv
"Principal",5000.00,despesa,"Aluguel",1200.00,"Moradia",1,2026,1,nao,,
```

- `tipo_registro`: `despesa`
- `valor_parcela` e `taxa_tr`: vazios (colunas em branco)

### 4.2. Linha de Despesa Parcelada (Cartão)

```csv
"Principal",5000.00,despesa,"iPhone 16",5999.00,"Cartão de Crédito",3,2026,12,nao,,
```

- `parcelas`: `12` (12 vezes)
- `mes_inicio`: `3` (Março)

### 4.3. Linha de Despesa Recorrente

```csv
"Principal",5000.00,despesa,"Netflix",39.90,"Serviços por Assinatura",1,2026,1,sim,,
```

- `recorrente`: `sim`

### 4.4. Linha de Financiamento

```csv
"Principal",5000.00,financiamento,"Apartamento Centro",280000.00,"Financiamento",3,2024,360,nao,2100.50,0.3500
```

- `tipo_registro`: `financiamento`
- `descricao`: nome do contrato
- `valor`: valor total financiado (principal)
- `valor_parcela`: valor mensal da parcela
- `taxa_tr`: taxa referencial em % (4 casas decimais)

### 4.5. Perfil Vazio (sem despesas nem financiamentos)

```csv
"Secundário",3500.00,despesa,"",0.00,"",1,2026,1,nao,,
```

Exportado para preservar o perfil mesmo sem dados. Ignorado na importação pois `valor = 0`.

---

## 5. Exemplo Completo de Arquivo

```csv
perfil,salario_base,tipo_registro,descricao,valor,categoria,mes_inicio,ano_inicio,parcelas,recorrente,valor_parcela,taxa_tr
"Principal",5000.00,despesa,"Aluguel",1200.00,"Moradia",1,2026,1,nao,,
"Principal",5000.00,despesa,"Supermercado",600.00,"Alimentação",1,2026,1,sim,,
"Principal",5000.00,despesa,"iPhone 16",5999.00,"Cartão de Crédito",3,2026,12,nao,,
"Principal",5000.00,despesa,"Plano de Saúde",350.00,"Saúde",1,2026,1,sim,,
"Principal",5000.00,financiamento,"Apartamento Centro",280000.00,"Financiamento",3,2024,360,nao,2100.50,0.3500
```

---

## 6. Regras de Parsing (Importação)

1. **Detecção automática do delimitador**: vírgula tem prioridade; ponto e vírgula é usado se a primeira linha não contiver vírgulas.
2. **Colunas obrigatórias**: se `perfil` ou `salario_base` estiver ausente no cabeçalho, a importação falha com erro.
3. **Linhas com colunas insuficientes**: ignoradas com aviso no console.
4. **Linhas com `perfil` vazio**: ignoradas com aviso no console.
5. **Linhas com `valor = 0`**: ignoradas (considera que é perfil vazio exportado para preservação).
6. **`tipo_registro = financiamento`**: requer `valor_parcela > 0` ou calcula como `valor / parcelas`.
7. **Aspas duplas em campos**: `""` dentro de campo aspado é interpretado como `"`.

---

## 7. Histórico de Versões do Formato

| Versão | Colunas adicionadas                              |
|--------|--------------------------------------------------|
| v0.2.0 | `perfil, salario_base, descricao, valor, categoria, mes_inicio, parcelas` |
| v0.7.0 | `+ ano_inicio, recorrente`                       |
| v0.9.0 | `+ tipo_registro, valor_parcela, taxa_tr`        |

**Retrocompatibilidade**: Arquivos de versões anteriores são importados com fallbacks para os campos ausentes. A coluna de índice `tipo_registro` no formato atual é a terceira.

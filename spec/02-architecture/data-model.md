# Modelo de Dados — Saúde Financeira

> **Spec Layer**: Architecture  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-07-02

---

## 1. Visão Geral

O estado da aplicação é um **objeto JavaScript plano** mantido em memória RAM durante a sessão e serializado como JSON no `localStorage` ao final de cada mutação. Não existe banco de dados relacional; as relações são implementadas via chave de texto (`perfil: String`).

---

## 2. Diagrama de Entidades e Relacionamentos

```
Perfil (1) ────────── (N) Despesa
   │
   └───────────────── (N) Financiamento
```

---

## 3. Estrutura Completa do Estado (`_state`)

```typescript
interface AppState {
  // Lista de perfis cadastrados
  perfis: Perfil[];

  // Nome do perfil atualmente selecionado (null se nenhum)
  perfilAtivo: string | null;

  // Todas as despesas de todos os perfis (filtradas na UI por perfil)
  despesas: Despesa[];

  // Aba de mês selecionada (1-12 = meses, 13 = Relatórios, 14 = Financiamentos, 15 = Configurações)
  mesAtivo: number;

  // Ano selecionado (ex: 2026)
  anoAtivo: number;

  // Todos os financiamentos de todos os perfis
  financiamentos: Financiamento[];

  // Mapa de nome da categoria → cor hexadecimal
  categorias: Record<string, string>;

  // Tema atual da interface
  theme: "dark" | "light";

  // Perfis de planejamento financeiro
  planejamento: {
    Conservador: PlanejamentoMetodo;
    Equilibrado: PlanejamentoMetodo;
    Agressivo: PlanejamentoMetodo;
  };
}
```

---

## 4. Entidade: `Perfil`

```typescript
interface Perfil {
  nome: string;    // Identificador único (PK lógica). Case-sensitive após trim().
  salario: number; // Salário base mensal em BRL. Mínimo: 0.
}
```

**Regras**:
- `nome` é a chave primária lógica — não existem dois perfis com o mesmo nome.
- `salario` é o valor bruto mensal. O motor calcula saldo com base nele.
- A relação com `Despesa` e `Financiamento` é feita via `d.perfil === p.nome`.

**Exemplo**:
```json
{ "nome": "Principal", "salario": 5000.00 }
```

---

## 5. Entidade: `Despesa`

```typescript
interface Despesa {
  id: string;          // Identificador único (gerado via Date.now() + random). PK real.
  perfil: string;      // FK → Perfil.nome
  descricao: string;   // Texto livre descritivo da despesa.
  valor: number;       // Valor TOTAL da despesa em BRL.
  categoria: string;   // Nome da categoria (deve existir em state.categorias ou "Outros").
  mes_inicio: number;  // Mês de início: 1 (Jan) a 12 (Dez).
  ano_inicio: number;  // Ano de início: ex. 2026.
  parcelas: number;    // Número de parcelas. 1 = gasto único. Usado apenas para "Cartão de Crédito".
  recorrente: boolean; // Se true: repete em todos os meses de mes_inicio até Dez do mesmo ano.
}
```

**Regras de Negócio**:
- Para `categoria !== "Cartão de Crédito"` e `parcelas > 1`: as parcelas são ignoradas; a despesa aparece apenas em `mes_inicio` do `ano_inicio`.
- Para `categoria === "Cartão de Crédito"` e `parcelas > 1`: o motor distribui `valor / parcelas` em cada mês subsequente usando indexação absoluta.
- `recorrente === true` e `categoria === "Cartão de Crédito"` ao mesmo tempo é tecnicamente incoerente; o campo `recorrente` tem precedência no motor.
- O campo `id` é gerado como `Date.now().toString(36) + Math.random().toString(36).substr(2, 5)`.

**Exemplo**:
```json
{
  "id": "lq7zxk8ab2f",
  "perfil": "Principal",
  "descricao": "Netflix",
  "valor": 39.90,
  "categoria": "Serviços por Assinatura",
  "mes_inicio": 1,
  "ano_inicio": 2026,
  "parcelas": 1,
  "recorrente": true
}
```

---

## 6. Entidade: `Financiamento`

```typescript
interface Financiamento {
  id: string;            // Identificador único. PK real.
  perfil: string;        // FK → Perfil.nome
  nome: string;          // Nome/descrição do contrato (ex: "Apartamento Centro").
  valorTotal: number;    // Valor total financiado (principal) em BRL.
  valorParcela: number;  // Valor da parcela mensal em BRL (incluindo juros do contrato original).
  parcelasTotais: number;// Número total de parcelas do contrato.
  taxaTR: number;        // Taxa referencial (T.R.) em percentual (ex: 0.5 = 0.5% ao mês).
  mes_inicio: number;    // Mês de início do contrato: 1–12.
  ano_inicio: number;    // Ano de início do contrato.
}
```

**Regras de Negócio**:
- O motor calcula a parcela vigente no mês visualizado via indexação absoluta: `(ano * 12 + mes - 1)`.
- Apenas `parcelasTotais` e `taxaTR` são editáveis após o cadastro.
- A parcela de financiamento é sempre incluída na categoria "Financiamento" nos sumários mensais.
- No Planejador Financeiro, financiamentos são consolidados como "Moradia" na comparação planejado vs. real.

**Exemplo**:
```json
{
  "id": "m3k9pq2rz7n",
  "perfil": "Principal",
  "nome": "Financiamento Imobiliário",
  "valorTotal": 280000.00,
  "valorParcela": 2100.50,
  "parcelasTotais": 360,
  "taxaTR": 0.35,
  "mes_inicio": 3,
  "ano_inicio": 2024
}
```

---

## 7. Entidade: `Categorias`

```typescript
type Categorias = Record<string, string>; // { nomeDaCategoria: "#HEX" }
```

**Categorias Padrão (inicializadas em `state.js`)**:

| Nome                   | Cor Padrão  | Tailwind Equivalente |
|------------------------|-------------|----------------------|
| `Saúde`                | `#10b981`   | emerald-500          |
| `Alimentação`          | `#0ea5e9`   | sky-500              |
| `Moradia`              | `#6366f1`   | indigo-500           |
| `Cartão de Crédito`    | `#f59e0b`   | amber-500            |
| `Lazer`                | `#f43f5e`   | rose-500             |
| `Serviços por Assinatura` | `#8b5cf6` | violet-500          |
| `Serviços`             | `#14b8a6`   | teal-500             |
| `Financiamento`        | `#d946ef`   | fuchsia-500          |
| `Outros`               | `#64748b`   | slate-500            |
| `Investimento`         | `#eab308`   | yellow-500           |

**Regras**:
- O usuário pode adicionar novas categorias (nome único).
- O usuário pode alterar a cor de qualquer categoria.
- Categorias customizadas recebem `0%` em todos os perfis de planejamento automaticamente.

---

## 8. Entidade: `Planejamento`

```typescript
type PlanejamentoMetodo = Record<string, number>; // { categoriaNome: percentual }

interface Planejamento {
  Conservador: PlanejamentoMetodo;
  Equilibrado: PlanejamentoMetodo;
  Agressivo: PlanejamentoMetodo;
}
```

**Valores Padrão (% do salário)**:

| Categoria              | Conservador | Equilibrado | Agressivo |
|------------------------|-------------|-------------|-----------|
| Saúde                  | 8           | 7           | 6         |
| Alimentação            | 18          | 18          | 17        |
| Moradia                | 30          | 28          | 25        |
| Lazer                  | 5           | 10          | 7         |
| Cartão de Crédito      | 8           | 10          | 8         |
| Serviços por Assinatura| 2           | 2           | 2         |
| Serviços               | 9           | 10          | 10        |
| Investimento           | 20          | 15          | 25        |
| Financiamento          | 0           | 0           | 0         |
| Outros                 | 0           | 0           | 0         |
| **Total**              | **100%**    | **100%**   | **100%**  |

**Regras**:
- A soma dos percentuais nunca pode ultrapassar 100%.
- O campo "Investimento" é automaticamente preenchido com a sobra: `100 - soma_das_demais`.

---

## 9. Serialização no `localStorage`

O estado completo é serializado como JSON e armazenado na chave `saude_financeira_db`:

```javascript
// Escrita
localStorage.setItem("saude_financeira_db", JSON.stringify(state));

// Leitura
const raw = localStorage.getItem("saude_financeira_db");
const state = JSON.parse(raw);
```

**Validação ao carregar**:
```javascript
if (parsed && Array.isArray(parsed.perfis) && Array.isArray(parsed.despesas)) {
  // Estado válido
}
```

> ⚠️ O `localStorage` tem limite de ~5MB por origem. Com uso intenso (muitas despesas), pode ser necessário implementar compressão ou limpeza periódica no futuro.

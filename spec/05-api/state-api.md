# Referência da API Pública — `window.App.State`

> **Spec Layer**: API Reference  
> **Arquivo**: [`js/state.js`](file:///c:/projetos/saude_financeira/js/state.js)  
> **Versão**: 1.1.2

---

## Visão Rápida

```javascript
const state = window.App.State;

// Ler estado
const snapshot = state.getState();

// Reagir a mudanças
const unsubscribe = state.subscribe((newState) => {
  console.log("Estado atualizado:", newState);
});

// Perfis
state.adicionarPerfil("Trabalho", 8000);
state.selecionarPerfil("Trabalho");
state.atualizarSalario(8500);
state.removerPerfil("Trabalho");

// Navegação
state.selecionarMes(3);     // Março
state.selecionarAno(2026);

// Despesas
const despesa = state.adicionarDespesa("Aluguel", 1200, "Moradia", 1, 1, false, 2026);
state.atualizarDespesa(despesa.id, "Aluguel novo", 1300, "Moradia", 1, 1, false, 2026);
state.removerDespesa(despesa.id);

// Financiamentos
const fin = state.adicionarFinanciamento("Apartamento", 280000, 2100, 360, 0.35, 3, 2024);
state.atualizarFinanciamento(fin.id, 360, 0.40);
state.removerFinanciamento(fin.id);

// Categorias
state.adicionarCategoria("Pets", "#ff6b6b");
state.atualizarCorCategoria("Pets", "#ee5a24");

// Configurações
state.toggleTheme();
state.atualizarPlanejamento("Conservador", { "Alimentação": 20, "Moradia": 30 });

// Importação via CSV
state.importarPerfilCSV({ perfis, despesas, financiamentos });
state.loadState(completeStateObject);
```

---

## Referência Detalhada

### `subscribe(callback)` → `Function (unsubscribe)`

```javascript
const unsub = App.State.subscribe((state) => {
  // state é uma cópia imutável
});

unsub(); // Remove o observer
```

---

### `getState()` → `AppState`

Retorna cópia profunda do estado. **Não muta** o estado interno.

```javascript
const { perfis, perfilAtivo, despesas, financiamentos, categorias, theme, planejamento } = App.State.getState();
```

---

### `adicionarPerfil(nome, salario)` → `{ nome, salario }`

```javascript
// Sucesso
App.State.adicionarPerfil("João", 4500);

// Erros possíveis
// Error: "O nome do perfil não pode ser vazio."
// Error: "O perfil 'João' já existe."
```

---

### `adicionarDespesa(descricao, valor, categoria, mes_inicio, parcelas, recorrente, ano_inicio)` → `Despesa`

```javascript
// Despesa simples
App.State.adicionarDespesa("Energia", 180.50, "Serviços", 5, 1, false, 2026);

// Despesa parcelada (12x no cartão)
App.State.adicionarDespesa("Notebook", 4800, "Cartão de Crédito", 6, 12, false, 2026);

// Despesa recorrente
App.State.adicionarDespesa("Academia", 89.90, "Saúde", 1, 1, true, 2026);
```

---

### `adicionarFinanciamento(nome, valorTotal, valorParcela, parcelasTotais, taxaTR, mesInicio, anoInicio)` → `Financiamento`

```javascript
App.State.adicionarFinanciamento(
  "Casa Própria",  // nome
  350000,          // valorTotal
  2400,            // valorParcela (R$/mês)
  360,             // parcelasTotais (30 anos)
  0.35,            // taxaTR (% ao mês)
  1,               // mesInicio (Janeiro)
  2025             // anoInicio
);
```

---

### `atualizarPlanejamento(metodo, limites)` → `Boolean`

```javascript
// Define limites (% do salário) para o método Equilibrado
App.State.atualizarPlanejamento("Equilibrado", {
  "Alimentação": 20,
  "Moradia": 30,
  "Lazer": 8,
  "Cartão de Crédito": 10,
  "Saúde": 7,
  "Serviços por Assinatura": 2,
  "Serviços": 8
  // "Investimento" recebe automaticamente: 100 - 85 = 15%
});
```

---

### `importarPerfilCSV(importedData)` → `void`

```javascript
const parsed = App.Storage.parseFromCSV(csvText);
App.State.importarPerfilCSV(parsed);
```

---

## Estrutura do Objeto `AppState`

```typescript
{
  perfis: Array<{ nome: string; salario: number }>;
  perfilAtivo: string | null;
  despesas: Array<{
    id: string;
    perfil: string;
    descricao: string;
    valor: number;
    categoria: string;
    mes_inicio: number;  // 1–12
    ano_inicio: number;
    parcelas: number;
    recorrente: boolean;
  }>;
  mesAtivo: number;    // 1–15
  anoAtivo: number;
  financiamentos: Array<{
    id: string;
    perfil: string;
    nome: string;
    valorTotal: number;
    valorParcela: number;
    parcelasTotais: number;
    taxaTR: number;
    mes_inicio: number;
    ano_inicio: number;
  }>;
  categorias: Record<string, string>;  // { "Saúde": "#10b981" }
  theme: "dark" | "light";
  planejamento: {
    Conservador: Record<string, number>;
    Equilibrado: Record<string, number>;
    Agressivo: Record<string, number>;
  };
}
```

---

## Tabela de Erros

| Método                   | Condição                          | Erro Lançado                                   |
|--------------------------|-----------------------------------|------------------------------------------------|
| `adicionarPerfil`        | nome vazio                        | `"O nome do perfil não pode ser vazio."`       |
| `adicionarPerfil`        | nome duplicado                    | `"O perfil 'X' já existe."`                   |
| `removerPerfil`          | nome não encontrado               | `"Perfil não encontrado."`                    |
| `selecionarPerfil`       | nome não encontrado               | `"Perfil não encontrado."`                    |
| `atualizarSalario`       | sem perfil ativo                  | `"Nenhum perfil ativo para atualizar salário."` |
| `adicionarDespesa`       | sem perfil ativo                  | `"Não há perfil ativo para lançar a despesa."` |
| `adicionarDespesa`       | descrição vazia                   | `"A descrição da despesa não pode ser vazia."` |
| `removerDespesa`         | id não encontrado                 | `"Despesa não encontrada."`                   |
| `atualizarDespesa`       | id não encontrado                 | `"Despesa não encontrada."`                   |
| `adicionarFinanciamento` | sem perfil ativo                  | `"Crie um perfil antes de adicionar financiamentos."` |
| `adicionarFinanciamento` | nome vazio                        | `"O nome do financiamento não pode ser vazio."` |
| `adicionarFinanciamento` | valores inválidos                 | Diversas mensagens de range                    |
| `atualizarFinanciamento` | id não encontrado                 | `"Financiamento não encontrado."`             |
| `removerFinanciamento`   | id não encontrado                 | `"Financiamento não encontrado."`             |
| `adicionarCategoria`     | nome vazio                        | `"O nome da categoria não pode estar em branco."` |
| `adicionarCategoria`     | categoria duplicada               | `"Esta categoria já está cadastrada."`        |
| `adicionarCategoria`     | cor inválida                      | `"Cor inválida. Use o formato hexadecimal (#RRGGBB)."` |
| `atualizarCorCategoria`  | categoria não encontrada          | `"Categoria não encontrada."`                 |
| `atualizarPlanejamento`  | método inválido                   | `"Método de planejamento inválido."`          |
| `atualizarPlanejamento`  | soma > 100%                       | `"A soma das porcentagens não pode ultrapassar 100%."`|
| `selecionarMes`          | fora do range 1–15                | `"Mês inválido. Deve ser entre 1 e 15."`     |

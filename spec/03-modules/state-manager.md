# Spec do Módulo: State Manager (`state.js`)

> **Spec Layer**: Modules  
> **Arquivo**: [`js/state.js`](file:///c:/projetos/saude_financeira/js/state.js)  
> **Namespace**: `window.App.State`  
> **Versão**: 1.1.2

---

## 1. Responsabilidade

O `State Manager` é o **núcleo imutável da arquitetura**. Ele é o único guardião da verdade sobre os dados da aplicação. Toda mutação de dados deve passar por ele.

> **Princípio**: O `state.js` não tem dependência de nenhum outro módulo da aplicação.

---

## 2. Padrões Implementados

- **Module Pattern (IIFE)**: Encapsula o estado privado `_state` e os listeners `_listeners`.
- **Observer Pattern**: Permite que outros módulos se inscrevam para receber atualizações.
- **Store Pattern**: Único ponto de verdade; mutações validadas antes de aplicadas.

---

## 3. Estado Interno (`_state`)

```javascript
const _state = {
  perfis: [],          // Array<{ nome: string, salario: number }>
  perfilAtivo: null,   // string | null
  despesas: [],        // Array<Despesa>
  mesAtivo: 1,         // number (1–15)
  anoAtivo: 2026,      // number
  financiamentos: [],  // Array<Financiamento>
  categorias: { ... }, // Record<string, string> (hex colors)
  theme: "dark",       // "dark" | "light"
  planejamento: { ... }// Record<string, Record<string, number>>
};
```

---

## 4. Mecanismo de Notificação

```javascript
function notify() {
  const stateCopy = JSON.parse(JSON.stringify(_state)); // Cópia imutável
  _listeners.forEach(callback => {
    try { callback(stateCopy); }
    catch (err) { console.error("Erro ao executar listener de estado:", err); }
  });
}
```

**Importante**: Observers recebem uma **cópia profunda** do estado — mutações nos dados recebidos não afetam o estado interno.

---

## 5. Geração de IDs Únicos

```javascript
const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
// Exemplo: "lqk2p7xm4n9"
```

Esse padrão garante IDs únicos sem necessidade de UUID library.

---

## 6. Regras de Validação por Método

| Método                   | Campo             | Regra                                      |
|--------------------------|-------------------|--------------------------------------------|
| `adicionarPerfil`        | `nome`            | Não vazio, unique case-insensitive         |
| `adicionarDespesa`       | `descricao`       | Não vazia                                  |
| `adicionarDespesa`       | `mes_inicio`      | Clamp 1–12                                 |
| `adicionarDespesa`       | `parcelas`        | Min 1                                      |
| `adicionarFinanciamento` | `valorTotal`      | > 0                                        |
| `adicionarFinanciamento` | `valorParcela`    | > 0                                        |
| `adicionarFinanciamento` | `parcelasTotais`  | > 0                                        |
| `adicionarFinanciamento` | `taxaTR`          | ≥ 0                                        |
| `adicionarCategoria`     | `cor`             | Formato `#RRGGBB` (regex validado)         |
| `atualizarPlanejamento`  | `soma_total`      | ≤ 100%                                     |
| `selecionarMes`          | `mes`             | 1–15 (int)                                 |

---

## 7. Comportamento de `loadState`

Ao carregar dados do `localStorage`, o `loadState` realiza **migração defensiva**:

- Arrays ausentes são inicializados como `[]`.
- Strings são sanitizadas com `.trim()`.
- Números são convertidos com `parseFloat()` ou `parseInt()` com fallback para 0.
- `categorias` ausentes são substituídas pelas padrão.
- `planejamento` ausente é substituído pelo padrão com 3 perfis.
- Novas categorias são adicionadas ao planejamento com 0% se não existirem.

---

## 8. Regras Especiais do Planejamento

- Ao salvar um novo planejamento, o saldo residual (`100 - soma`) é automaticamente adicionado à categoria "Investimento".
- Ao adicionar uma nova categoria via `adicionarCategoria()`, ela é inserida com `0%` nos 3 métodos de planejamento.

---

## 9. Casos de Uso Cobertos

| Caso de Uso                                       | Método            |
|---------------------------------------------------|-------------------|
| Criar perfil novo                                 | `adicionarPerfil` |
| Excluir perfil e seus dados                       | `removerPerfil`   |
| Trocar perfil ativo                               | `selecionarPerfil`|
| Alterar salário do perfil ativo                   | `atualizarSalario`|
| Navegar por mês                                   | `selecionarMes`   |
| Navegar por ano                                   | `selecionarAno`   |
| Registrar despesa (simples, parcelada, recorrente)| `adicionarDespesa`|
| Editar despesa existente                          | `atualizarDespesa`|
| Deletar despesa                                   | `removerDespesa`  |
| Criar financiamento                               | `adicionarFinanciamento` |
| Editar TR e prazo de financiamento                | `atualizarFinanciamento` |
| Excluir financiamento                             | `removerFinanciamento`   |
| Criar categoria customizada                       | `adicionarCategoria`     |
| Atualizar cor de categoria                        | `atualizarCorCategoria`  |
| Trocar tema claro/escuro                          | `toggleTheme`            |
| Salvar limites do planejador                      | `atualizarPlanejamento`  |
| Importar perfil via CSV (incremental)             | `importarPerfilCSV`      |
| Carregar estado do localStorage                   | `loadState`              |
| Obter estado atual (leitura)                      | `getState`               |
| Registrar observer                                | `subscribe`              |

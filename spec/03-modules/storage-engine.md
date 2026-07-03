# Spec do Módulo: Storage Engine (`storage.js`)

> **Spec Layer**: Modules  
> **Arquivo**: [`js/storage.js`](file:///c:/projetos/saude_financeira/js/storage.js)  
> **Namespace**: `window.App.Storage`  
> **Chave localStorage**: `saude_financeira_db`  
> **Versão**: 1.1.2

---

## 1. Responsabilidade

O `Storage Engine` é responsável por toda a comunicação da aplicação com o mundo externo à memória RAM:

1. **Persistência local**: leitura e escrita no `localStorage` do navegador.
2. **Exportação**: serialização do estado para CSV e download do arquivo.
3. **Importação**: leitura de arquivo CSV físico e parsing para objeto de estado.

> **Princípio**: O `storage.js` não tem dependência de nenhum outro módulo da aplicação. Recebe e retorna objetos JavaScript planos.

---

## 2. Constante de Armazenamento

```javascript
const LOCAL_STORAGE_KEY = "saude_financeira_db";
```

---

## 3. `saveToLocalStorage(data: Object) → Boolean`

### Comportamento
1. Serializa `data` com `JSON.stringify(data)`.
2. Grava na chave `saude_financeira_db` via `localStorage.setItem()`.

### Retorno
- `true`: gravação bem-sucedida.
- `false`: falha (ex: localStorage cheio ou desabilitado).

### Erros
Erros são capturados silenciosamente e logados no console. Nunca lança exceção.

---

## 4. `loadFromLocalStorage() → Object | null`

### Comportamento
1. Lê a chave `saude_financeira_db` via `localStorage.getItem()`.
2. Desserializa com `JSON.parse()`.
3. Valida a estrutura básica: `parsed.perfis` e `parsed.despesas` devem ser arrays.

### Retorno
- Objeto de estado se válido.
- `null` se ausente, corrompido ou com estrutura inválida.

---

## 5. `convertToCSV(data: Object, targetPerfilName?: String) → String`

### Cabeçalho CSV
```
perfil,salario_base,tipo_registro,descricao,valor,categoria,mes_inicio,ano_inicio,parcelas,recorrente,valor_parcela,taxa_tr
```

### Algoritmo de Serialização

```
1. Determinar perfil alvo (targetPerfilName ou data.perfilAtivo)
2. Para cada DESPESA do perfil:
   tipo_registro = "despesa"
   valor_parcela = ""
   taxa_tr = ""
3. Para cada FINANCIAMENTO do perfil:
   tipo_registro = "financiamento"
   descricao = financiamento.nome
   valor = financiamento.valorTotal
   categoria = "Financiamento"
   valor_parcela = financiamento.valorParcela
   taxa_tr = financiamento.taxaTR (4 casas decimais)
4. SE perfil não tem despesas NEM financiamentos:
   Exportar linha vazia para preservar o perfil (com descricao="" e valor=0)
```

### Escaping de Strings
Strings de `perfil`, `descricao` e `categoria` são envoltas em aspas duplas com escape de aspas internas:

```javascript
const perfilEscaped = `"${nome.replace(/"/g, '""')}"`;
```

---

## 6. `parseFromCSV(csvText: String) → Object`

### Detecção Automática de Delimitador
```javascript
const delimiter = firstLine.includes(";") ? ";" : ",";
```

### Colunas Obrigatórias
- `perfil`
- `salario_base`

### Colunas Opcionais (com fallback defensivo)
| Coluna          | Fallback         |
|-----------------|------------------|
| `tipo_registro` | `"despesa"`      |
| `descricao`     | `""`             |
| `valor`         | `0`              |
| `categoria`     | `"Outros"`       |
| `mes_inicio`    | `1`              |
| `ano_inicio`    | `new Date().getFullYear()` |
| `parcelas`      | `1`              |
| `recorrente`    | `false`          |
| `valor_parcela` | `valor / parcelas` (fallback inteligente) |
| `taxa_tr`       | `0`              |

### Algoritmo de Parse

```
1. Dividir texto por linhas (\r?\n)
2. Remover linhas vazias
3. Detectar delimitador (vírgula ou ponto e vírgula)
4. Parsear cabeçalho → mapear posições de colunas
5. Para cada linha de dados:
   a. Parsear valores com parseCSVLine() (suporta aspas)
   b. Registrar/atualizar perfil no Map<nome, salario>
   c. SE tipo_registro === "financiamento" E valor > 0: adicionar a parsedFinanciamentos
   d. SE tipo_registro === "despesa" E valor > 0: adicionar a parsedDespesas
6. Reconstruir array de perfis a partir do Map
7. Retornar { perfis, perfilAtivo: perfis[0].nome, despesas, financiamentos }
```

### Função Auxiliar: `parseCSVLine(line, delimiter)`

Parser robusto que suporta:
- Campos entre aspas duplas.
- Aspas escapadas (`""` dentro de campo aspado = `"`).
- Delimitadores dentro de campos aspados (não quebram a linha).

---

## 7. `exportAsCSVFile(data: Object, targetPerfilName?: String) → Boolean`

### Comportamento
1. Chama `convertToCSV()` para obter a string.
2. Cria um `Blob` com `type: "text/csv;charset=utf-8;"`.
3. Cria um `<a>` temporário com `href = URL.createObjectURL(blob)`.
4. Define `download = "saude_financeira_perfil_{nome}_{timestamp}.csv"`.
5. Simula um clique no link e revoga a URL em seguida.

### Retorno
- `true`: download iniciado com sucesso.
- `false`: falha (capturada e logada no console).

---

## 8. Retrocompatibilidade CSV

O parser é resiliente a arquivos de versões anteriores que não possuam as colunas novas:

| Versão | Colunas Adicionadas            |
|--------|-------------------------------|
| v0.7.0 | `ano_inicio`, `recorrente`    |
| v0.9.0 | `tipo_registro`, `valor_parcela`, `taxa_tr` |

Colunas ausentes são tratadas com os valores padrão listados na seção 6.

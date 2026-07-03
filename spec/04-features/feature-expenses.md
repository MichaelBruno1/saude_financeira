# Feature Spec: CRUD de Despesas

> **Spec Layer**: Features  
> **ID**: `FEAT-003`  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-06-30

---

## 1. Visão Geral

Operações de criação, leitura, atualização e exclusão de despesas do perfil ativo.

---

## 2. Campos da Despesa

| Campo       | Tipo     | Obrigatório | Padrão              | Validação              |
|-------------|----------|-------------|---------------------|------------------------|
| Descrição   | string   | ✅ Sim      | —                   | Não vazia              |
| Valor Total | decimal  | ✅ Sim      | —                   | > 0                    |
| Categoria   | string   | ✅ Sim      | Primeiro do dropdown| Deve existir no estado |
| Mês Início  | integer  | ✅ Sim      | Mês ativo           | 1–12                   |
| Ano Início  | integer  | ✅ Sim      | Ano ativo           | Válido                 |
| Parcelas    | integer  | Condicional | 1                   | ≥ 1; visível apenas se Cartão |
| Recorrente  | boolean  | Não         | false               | —                      |

---

## 3. Fluxo de Criação

```
1. Usuário clica em "Adicionar Gasto" (botão alinhado às abas de mês)
2. Modal de despesa é exibido com valores padrão herdados da aba ativa
3. Usuário preenche os campos
4. SE categoria = "Cartão de Crédito": campo de parcelas aparece
5. Usuário confirma
6. UI valida os campos (descrição, valor)
7. UI chama State.adicionarDespesa(...)
8. State cria despesa com ID único e notifica
9. Modal fecha, tabela atualiza, KPIs recalculam
```

---

## 4. Fluxo de Edição

```
1. Usuário clica em "Editar" em uma linha da tabela
2. Modal reabre com os campos preenchidos com os dados atuais
3. Usuário modifica e confirma
4. UI chama State.atualizarDespesa(id, ...)
5. Estado atualizado, tabela re-renderiza
```

---

## 5. Fluxo de Exclusão

```
1. Usuário clica em "Excluir" em uma linha
2. State.removerDespesa(id) é chamado
3. Despesa removida do estado em todos os meses onde aparecia
4. Tabela e KPIs re-renderizados instantaneamente
```

---

## 6. Critérios de Aceite

- `CA-1`: Campo "Parcelas" aparece somente quando categoria = "Cartão de Crédito".
- `CA-2`: Despesa criada aparece imediatamente na tabela do mês ativo.
- `CA-3`: Ao editar, o modal exibe os valores atuais da despesa.
- `CA-4`: Exclusão remove a despesa de todos os meses afetados.
- `CA-5`: Valor monetário tem máscara de formatação BRL em tempo real.
- `CA-6`: Formulário é resetado após cada cadastro bem-sucedido.

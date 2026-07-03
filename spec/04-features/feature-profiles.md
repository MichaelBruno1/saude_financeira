# Feature Spec: Gerenciamento de Perfis

> **Spec Layer**: Features  
> **ID**: `FEAT-001`  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-06-30

---

## 1. Visão Geral

O sistema suporta múltiplos perfis independentes, cada um com seu próprio salário base, conjunto de despesas e financiamentos. Isso permite gerenciar finanças de contextos diferentes (ex: pessoal, MEI, família).

---

## 2. Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| `RN-001` | O nome do perfil é a chave primária — não pode haver dois perfis com o mesmo nome (case-insensitive). |
| `RN-002` | O nome é higienizado com `.trim()` antes de salvar. |
| `RN-003` | Ao criar um novo perfil, ele é automaticamente selecionado como ativo. |
| `RN-004` | Ao remover um perfil, todas as suas despesas e financiamentos são removidos em cascata. |
| `RN-005` | O salário mínimo é 0 (sem limite máximo). |
| `RN-006` | Ao remover o perfil ativo, o primeiro perfil restante é selecionado automaticamente. |

---

## 3. Fluxo de Criação de Perfil

```
1. Usuário clica em "Novo Perfil" na sidebar
2. Modal de criação é exibido com campos: Nome e Salário
3. Usuário preenche e confirma
4. UI valida: nome não vazio
5. UI chama State.adicionarPerfil(nome, salario)
6. State valida unicidade e cria o perfil
7. State notifica observers → UI atualiza → Storage salva
```

---

## 4. Critérios de Aceite

- `CA-1`: Criar perfil com nome válido o seleciona automaticamente.
- `CA-2`: Tentar criar perfil com nome duplicado exibe mensagem de erro.
- `CA-3`: Remover perfil exclui todas as suas despesas e financiamentos.
- `CA-4`: Trocar de perfil re-renderiza toda a interface com os dados do novo perfil.
- `CA-5`: Salário editado no header é persistido imediatamente no localStorage.
- `CA-6`: O nome do perfil ativo é exibido no seletor da sidebar com destaque visual.

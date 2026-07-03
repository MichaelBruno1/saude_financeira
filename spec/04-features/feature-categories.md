# Feature Spec: Categorias Customizadas e Temas

> **Spec Layer**: Features  
> **ID**: `FEAT-012` + `FEAT-013` + `FEAT-014`  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-06-30

---

## 1. Visão Geral

A aba de Configurações (mesAtivo = 15) permite ao usuário personalizar a aplicação: criar novas categorias de gastos, alterar cores das categorias existentes e alternar entre Modo Claro e Modo Escuro.

---

## 2. Categorias Customizadas

### 2.1. Criação de Categoria

**Campos**:
- Nome da categoria (obrigatório, único)
- Cor (seletor `<input type="color">`, formato `#RRGGBB`)

**Efeitos ao criar**:
1. Categoria adicionada ao estado (`state.categorias`).
2. Categoria aparece no dropdown de seleção ao cadastrar despesas.
3. Categoria adicionada com `0%` em todos os perfis de planejamento.
4. Cor refletida nos gráficos na próxima renderização.

### 2.2. Alteração de Cor

- Grade visual de todas as categorias com `<input type="color">` individual.
- Mudança de cor é aplicada em tempo real (ao sair do campo).
- Cor atualizada em gráficos, badges e barras de progresso.

---

## 3. Modo Claro / Modo Escuro

| Aspecto               | Modo Escuro (padrão)     | Modo Claro                |
|-----------------------|--------------------------|---------------------------|
| Background body       | `slate-950`              | `slate-100` (#f1f5f9)     |
| Sidebar               | `slate-900`              | `slate-50` (#f8fafc)      |
| Cards/Panels          | `slate-900`              | Branco                    |
| Texto primário        | Branco/`slate-100`       | `slate-900`               |
| Texto secundário      | `slate-400`              | `slate-600`               |
| Bordas                | `slate-700/800`          | `slate-200`               |
| Inputs                | `slate-800`              | `slate-50`                |
| Transição             | `0.25s ease`             | `0.25s ease`              |

**Implementação**: A classe `theme-light` é adicionada/removida do `<body>`. O CSS em `style.css` sobrescreve os estilos Tailwind com `!important` para garantir precedência.

**Persistência**: O tema é salvo em `state.theme` e persistido no localStorage.

---

## 4. Critérios de Aceite

- `CA-1`: Nova categoria criada aparece imediatamente no dropdown de despesas.
- `CA-2`: Alterar cor de categoria atualiza gráficos em tempo real.
- `CA-3`: Não é possível criar categoria com nome duplicado.
- `CA-4`: Alternância de tema é instantânea (sem recarregar página).
- `CA-5`: Tema escolhido persiste após fechar e reabrir o navegador.
- `CA-6`: Todos os elementos da interface (tabelas, modais, inputs, KPIs) respeitam o tema ativo.

# Dívidas Técnicas — Saúde Financeira

> **Spec Layer**: Quality  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-07-02

---

## Introdução

Este documento registra as dívidas técnicas conhecidas do projeto, priorizadas por impacto e esforço de resolução. Uma dívida técnica é uma decisão consciente de implementar uma solução sub-ótima no curto prazo, com a intenção de refatorar no futuro.

---

## TD-001: Módulo `ui.js` Monolítico

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Média                                                            |
| **Tipo**    | Manutenibilidade                                                 |
| **Desde**   | v0.2.0                                                           |

### Descrição
O arquivo `ui.js` acumula ~75KB de código e gerencia todos os aspectos de interface: tabelas, modais, relatórios, financiamentos, configurações e análise com IA. Isso viola o Princípio da Responsabilidade Única (SRP).

### Impacto
- Dificuldade de encontrar funções específicas.
- Alto risco de regressão ao modificar qualquer parte.
- Impossibilidade de testar componentes de UI de forma isolada.

### Solução Proposta
Dividir em módulos menores:
- `ui-expenses.js` — tabela e modal de despesas
- `ui-reports.js` — aba de relatórios e gráficos
- `ui-financing.js` — aba de financiamentos e simulador
- `ui-config.js` — aba de configurações
- `ui-core.js` — init, render, KPIs, modals base

### Esforço Estimado: Alto (requer refatoração estrutural)

---

## TD-002: Re-renderização Total a Cada Mutação

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Baixa (atual) / Média (com > 500 despesas)                      |
| **Tipo**    | Performance                                                      |
| **Desde**   | v0.2.0                                                           |

### Descrição
A cada mutação de estado, o método `render(state)` re-renderiza **toda** a interface, inclusive partes que não foram afetadas pela mudança.

### Impacto
- Com poucos dados: imperceptível (< 10ms).
- Com muitos dados (centenas de despesas de vários anos): pode causar lag perceptível.

### Solução Proposta
Implementar renderização seletiva:
```javascript
render(state, changedKey) {
  if (changedKey === "theme") { applyTheme(state); return; }
  if (changedKey === "despesas") { renderTabela(state); renderKPIs(state); return; }
  // ...
}
```

### Esforço Estimado: Médio

---

## TD-003: Ausência de Testes de Integração e E2E

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Média                                                            |
| **Tipo**    | Confiabilidade                                                   |
| **Desde**   | v0.1.0                                                           |

### Descrição
O projeto não possui testes de integração (DOM + State) nem testes E2E (Playwright/Cypress). Os testes existentes (Vitest) cobrem apenas lógica pura do `engine.js`.

### Impacto
- Regressões visuais e de comportamento podem passar despercebidas.
- Mudanças no `ui.js` são validadas apenas manualmente.

### Solução Proposta
1. Configurar Vitest com JSDOM para testes de integração.
2. Adicionar Playwright para testes E2E críticos (adicionar despesa, exportar CSV).

### Esforço Estimado: Alto (requer setup e JSDOM para IIFE)

---

## TD-004: Tailwind CSS via CDN em Produção

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Baixa                                                            |
| **Tipo**    | Performance / Boas Práticas                                      |
| **Desde**   | v0.1.0                                                           |

### Descrição
O Tailwind CSS é carregado via CDN e interpretado em runtime no navegador, gerando todas as classes possíveis. Para produção, o recomendado é usar o CLI do Tailwind para gerar apenas as classes utilizadas (purge/tree-shaking).

### Impacto
- Overhead de ~350KB de CSS em runtime (vs. ~10KB purgado).
- Impacto em conexões lentas.
- Não recomendado para projetos comerciais.

### Solução Proposta
Manter CDN como comportamento padrão (compatível com `file:///`). Se houver necessidade de otimizar, adicionar um script de build separado que gere o CSS purgado sem quebrar o modo `file:///`.

### Esforço Estimado: Baixo (opcional)

---

## TD-005: LocalStorage como Único Backup

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Média                                                            |
| **Tipo**    | Confiabilidade de Dados                                          |
| **Desde**   | v0.2.0                                                           |
| **Status**  | Resolvido (v1.1.3)                                               |

### Descrição
O único mecanismo de persistência automática é o `localStorage`. Se o usuário limpar os dados do navegador, todos os dados são perdidos sem aviso.

### Impacto
- Perda total de dados financeiros históricos do usuário.
- Sem mecanismo de recuperação integrado.

### Resolução (v1.1.3)
- Adicionado banner de aviso dinâmico na aplicação que avisa o usuário se ele possuir dados ativos e não realizar um backup (exportação CSV) há mais de 15 dias.
- O campo `ultimoBackup` foi adicionado ao estado central e é atualizado toda vez que uma exportação CSV é concluída com sucesso.
- O backup principal por CSV foi devidamente documentado no `README.md` do projeto.

---

## TD-006: IDs de Elementos DOM Hardcoded no `ui.js`

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Baixa                                                            |
| **Tipo**    | Manutenibilidade                                                 |
| **Desde**   | v0.3.0                                                           |

### Descrição
O `ui.js` referencia dezenas de IDs de elementos DOM como strings literais espalhadas pelo código. Renomear um ID no HTML requer busca manual no `ui.js`.

### Impacto
- Erros silenciosos se um ID for renomeado ou removido.
- Dificuldade de refatorar o HTML.

### Solução Proposta
Centralizar todos os IDs em um objeto de configuração:
```javascript
const DOM_IDS = {
  BTN_ADD_EXPENSE: "btn-add-expense",
  EXPENSE_MODAL: "expense-modal",
  // ...
};
```

### Esforço Estimado: Baixo

---

## Resumo

| ID      | Dívida                                      | Severity | Esforço |
|---------|---------------------------------------------|----------|---------|
| TD-001  | `ui.js` monolítico                          | Média    | Alto    |
| TD-002  | Re-renderização total                       | Baixa/Média | Médio |
| TD-003  | Sem testes de integração/E2E               | Média    | Alto    |
| TD-004  | Tailwind via CDN em produção               | Baixa    | Baixo   |
| TD-005  | LocalStorage como único backup             | Média    | Resolvido (v1.1.3) |
| TD-006  | IDs DOM hardcoded                          | Baixa    | Baixo   |

# Restrições do Sistema — Saúde Financeira

> **Spec Layer**: Overview  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-07-02

---

## 1. Restrições de Negócio

| ID      | Restrição                                                                                  | Impacto              |
|---------|--------------------------------------------------------------------------------------------|----------------------|
| `RB-01` | Nenhum dado do usuário pode ser transmitido para servidores externos sem consentimento explícito. | Arquitetura offline-first |
| `RB-02` | A aplicação deve funcionar sem necessidade de instalação ou criação de conta.              | Distribuição como `index.html` |
| `RB-03` | O produto deve ser gratuito e de código aberto.                                            | Licença MIT          |
| `RB-04` | Nenhuma etapa de build é permitida para o modo de produção.                                | Sem bundler/transpiler |

---

## 2. Restrições Técnicas

| ID      | Restrição                                                                                  | Justificativa           |
|---------|--------------------------------------------------------------------------------------------|-------------------------|
| `RT-01` | Sem frameworks JavaScript no client-side (sem React, Vue, Angular, Svelte, etc.).         | Portabilidade e zero build |
| `RT-02` | Dependências externas limitadas a Tailwind CSS e Chart.js, ambas via CDN.                  | Sem etapa de instalação |
| `RT-03` | Todo o estado da aplicação deve residir em memória RAM durante a sessão e no `localStorage` entre sessões. | Privacidade e offline |
| `RT-04` | A aplicação deve ser compatível com protocolo `file:///` (acesso direto ao arquivo HTML).  | Usabilidade sem servidor |
| `RT-05` | Módulos JavaScript devem usar o padrão IIFE (sem `import`/`export` ES Modules) por compatibilidade com `file:///`. | Evitar erros CORS |
| `RT-06` | A ordem de carregamento dos scripts no `index.html` é estritamente dependente (não podem ser reordenados). | Namespaces globais |
| `RT-07` | Não é permitido uso de cookies, IndexedDB, WebSQL ou qualquer outro mecanismo de persistência além do `localStorage`. | Controle e previsibilidade |

---

## 3. Restrições de Segurança

| ID      | Restrição                                                                                  | Implementação           |
|---------|--------------------------------------------------------------------------------------------|-------------------------|
| `RS-01` | Nenhuma chamada de rede deve ser feita com dados financeiros, exceto para a LLM local configurada pelo próprio usuário. | Verificado em `ui.js` |
| `RS-02` | Strings de texto de usuário (nomes de perfil, descrições) devem ser escaping antes de ser inseridas no CSV. | `storage.js: convertToCSV()` |
| `RS-03` | A configuração da LLM (`apiUrl`, `apiKey`, `model`) não deve ser commitada no repositório. | `llm_config.js` no `.gitignore` |
| `RS-04` | Nenhum dado deve ser lido de parâmetros de URL, cookies ou cabeçalhos HTTP.               | Arquitetura estática    |

---

## 4. Restrições de Compatibilidade

| ID      | Restrição                                                           | Detalhe                          |
|---------|---------------------------------------------------------------------|----------------------------------|
| `RC-01` | Suporte obrigatório: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+. | Uso de ES2022 e APIs modernas   |
| `RC-02` | Dispositivos móveis: layout deve ser funcional (não quebrado) em viewport de 375px de largura. | Tailwind responsive |
| `RC-03` | O `localStorage` da chave `saude_financeira_db` deve manter compatibilidade retroativa. | `loadState()` faz migração defensiva |

---

## 5. Restrições de Performance

| ID      | Restrição                                                           | Meta                             |
|---------|---------------------------------------------------------------------|----------------------------------|
| `RP-01` | Re-renderização completa da UI após mutação de estado deve ser imperceptível ao usuário. | < 100ms                    |
| `RP-02` | Parsing de um arquivo CSV com até 1000 linhas deve ser instantâneo. | < 200ms                    |
| `RP-03` | Cálculo de sumário mensal com até 500 despesas deve ser síncrono sem travar a UI. | < 50ms                   |

---

## 6. Restrições de Manutenibilidade

| ID      | Restrição                                                           | Detalhe                          |
|---------|---------------------------------------------------------------------|----------------------------------|
| `RM-01` | Cada módulo JS deve ter responsabilidade única e documentada.       | Violações devem ser reportadas   |
| `RM-02` | O linter ESLint deve passar sem erros antes de qualquer merge.     | `npm run lint`                   |
| `RM-03` | Funções do `engine.js` (lógica pura) devem ter cobertura de testes unitários com Vitest. | `npm run test`      |
| `RM-04` | Nenhum comentário de debug ou `console.log` de desenvolvimento deve ser deixado no código de produção. | Revisão pré-release |

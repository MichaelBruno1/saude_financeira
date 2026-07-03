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
| **Status**  | Resolvido (v1.1.3)                                               |

### Descrição
A cada mutação de estado, o método `render(state)` re-renderiza **toda** a interface, inclusive partes que não foram afetadas pela mudança.

### Impacto
- Com poucos dados: imperceptível (< 10ms).
- Com muitos dados (centenas de despesas de vários anos): pode causar lag perceptível.

### Resolução (v1.1.3)
- Implementada a renderização seletiva/condicional na UI.
- O State Manager (`js/state.js`) agora emite o nome da propriedade alterada (`changedKey`) ao disparar a notificação para os inscritos.
- O método `render(state, changedKey)` no `js/ui.js` analisa o `changedKey` e renderiza apenas os blocos correspondentes da interface (ex: alterando apenas o tema do body e configs ao mudar de tema, ou renderizando apenas a tabela de gastos ao atualizar despesas), otimizando consideravelmente a performance em grandes bases de dados.

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
| **Status**  | Resolvido (v1.1.3)                                               |

### Descrição
O Tailwind CSS é carregado via CDN e interpretado em runtime no navegador, gerando todas as classes possíveis. Para produção, o recomendado é usar o CLI do Tailwind para gerar apenas as classes utilizadas (purge/tree-shaking).

### Impacto
- Overhead de ~350KB de CSS em runtime (vs. ~10KB purgado).
- Impacto em conexões lentas.
- Não recomendado para projetos comerciais.

### Resolução (v1.1.3)
- Adicionado suporte nativo à compilação local do Tailwind CSS v4 usando `@tailwindcss/cli`.
- Criado o arquivo de entrada `css/app.css` e o script `npm run build:css` para gerar o bundle otimizado e minificado `css/tailwind.min.css`.
- O modo padrão por CDN é mantido para manter compatibilidade imediata com execuções locais via protocolo `file:///`, porém o build otimizado está totalmente disponível e configurado para deploy em produção.

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
| **Desde**   | v0.3.0 |
| **Status**  | Resolvido (v1.1.3)                                               |

### Descrição
O `ui.js` referencia dezenas de IDs de elementos DOM como strings literais espalhadas pelo código. Renomear um ID no HTML requer busca manual no `ui.js`.

### Impacto
- Erros silenciosos se um ID for renomeado ou removido.
- Dificuldade de refatorar o HTML.

### Resolução (v1.1.3)
- Centralizados todos os 109 IDs de elementos DOM utilizados no `js/ui.js` dentro de um objeto de configuração `DOM_IDS` declarado no topo do módulo IIFE.
- Todas as chamadas de `document.getElementById` foram alteradas para referenciar a chave correspondente em `DOM_IDS` (ex: `document.getElementById(DOM_IDS.SIDEBAR_PROFILE_SELECT)`), facilitando futuras manutenções e renomeações de IDs.

---

## TD-007: Recorrências de Despesas Limitadas ao Ano de Início

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Alta                                                             |
| **Tipo**    | Correção Funcional / Lógica                                      |
| **Desde**   | v0.2.0                                                           |
| **Status**  | Resolvido (v1.1.4)                                               |

### Descrição
No arquivo `js/engine.js`, o método `getInstallmentInfo` possui uma limitação lógica que restringe as despesas marcadas como `recorrente: true` apenas ao ano fiscal de início (`S_year`) e até o mês 12.

### Impacto
- Despesas recorrentes (ex: assinaturas, mensalidades) não são replicadas nos anos subsequentes ao ano de início.
- Projeções de longo prazo e transição de ano ativo perdem dados importantes de custo recorrente.

### Resolução (v1.1.4)
- Corrigida a lógica da função `getInstallmentInfo` no `js/engine.js` para permitir a repetição em qualquer mês e ano ativo posterior à data de início da despesa recorrente.

---

## TD-008: LLM local hardcoded em `llm_config.js`

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Média                                                            |
| **Tipo**    | Usabilidade / Manutenibilidade                                   |
| **Desde**   | v1.1.2                                                           |
| **Status**  | Resolvido (v1.1.5)                                               |

### Descrição
As configurações de URL do servidor da LLM local (LM Studio/Ollama) e o nome do modelo de inteligência artificial estão definidos de forma rígida em `llm_config.js`.

### Impacto
- Para trocar o modelo ou apontar para um provedor externo (como OpenAI ou Anthropic), o usuário precisa editar o código-fonte manualmente.
- Dificuldade para usuários não técnicos utilizarem a funcionalidade com sua infraestrutura local.

### Resolução (v1.1.5)
- Adicionado formulário de configuração da inteligência artificial na aba de Configurações do sistema.
- Permite salvar a URL base, a chave de API e o modelo diretamente no estado reativo central (LocalStorage).
- O arquivo `llm_config.js` é utilizado de forma transparente apenas como fallback inicial caso não haja configuração personalizada.

---

## TD-009: Falta de validação e OCR no processador de PDFs

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Média                                                            |
| **Tipo**    | Confiabilidade / UX                                              |
| **Desde**   | v1.1.3                                                           |

### Descrição
O processador de fatura de PDF extrai texto de forma textual direta. Se o usuário carregar um PDF digitalizado/escaneado (imagem pura) ou um arquivo sem texto decodificável, o texto extraído será vazio, enviando um prompt inválido à LLM.

### Impacto
- Erro geral e confuso da LLM ou retorno de array vazio sem explicação para o usuário.
- Falta de feedback imediato de que o PDF inserido é inválido ou incompatível.

### Solução Proposta
Adicionar uma validação no método `processPdfFile` que conta a quantidade de caracteres extraídos e exibe um alerta claro recomendando PDFs nativos e explicando que arquivos escaneados/imagem não possuem suporte a OCR nativo na aplicação frontend.

### Esforço Estimado: Baixo

---

## TD-010: Dependência externa de bibliotecas via CDN

| Atributo    | Valor                                                            |
|-------------|------------------------------------------------------------------|
| **Severity**| Baixa                                                            |
| **Tipo**    | Confiabilidade / Offline-first                                   |
| **Desde**   | v0.1.0                                                           |

### Descrição
A aplicação depende de servidores externos CDN para carregar bibliotecas como `Chart.js`, `pdf.js` e a fonte `Outfit` do Google Fonts.

### Impacto
- Se o usuário abrir o arquivo `index.html` pela primeira vez totalmente offline e sem cache prévio, os gráficos e o processador de PDF não funcionarão e a fonte padrão do navegador será renderizada.

### Solução Proposta
Baixar e hospedar as bibliotecas (`chart.js`, `pdf.min.js`, `pdf.worker.min.js`) e fontes localmente na pasta `public/` ou `js/vendor/` do projeto, removendo conexões de rede CDN externas obrigatórias.

### Esforço Estimado: Baixo

---

## Resumo

| ID      | Dívida                                      | Severity | Esforço |
|---------|---------------------------------------------|----------|---------|
| TD-001  | `ui.js` monolítico                          | Média    | Alto    |
| TD-002  | Re-renderização total                       | Baixa/Média | Resolvido (v1.1.3) |
| TD-003  | Sem testes de integração/E2E               | Média    | Alto    |
| TD-004  | Tailwind via CDN em produção               | Baixa    | Resolvido (v1.1.3) |
| TD-005  | LocalStorage como único backup             | Média    | Resolvido (v1.1.3) |
| TD-006  | IDs DOM hardcoded                          | Baixa    | Resolvido (v1.1.3) |
| TD-007  | Recorrências limitadas ao ano de início     | Alta     | Resolvido (v1.1.4) |
| TD-008  | Configuração LLM hardcoded                  | Média    | Resolvido (v1.1.5) |
| TD-009  | Falta de validação e OCR no PDF             | Média    | Baixo   |
| TD-010  | Dependência de bibliotecas via CDN          | Baixa    | Baixo   |
